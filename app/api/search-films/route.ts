import { NextRequest, NextResponse } from "next/server"; 
import { db } from "@/app/db/drizzle"; 
import { sql } from "drizzle-orm";

const sanitizeQuery = (query: string): string => {
  return query.trim().replace(/[^\w\s]/gi, "");
};

interface Film {
  id: number;
  title: string;
  releaseYear: number;
  // Add other properties as needed
}

interface FilmRecommendation {
  id: number;
  title: string;
  releaseYear: number;
}

// Helper function to safely convert raw DB rows to our typed interface
function mapToFilmRecommendations(rows: Record<string, unknown>[]): FilmRecommendation[] {
  return rows.map(row => ({
    id: Number(row.id || 0),
    title: String(row.title || ''),
    releaseYear: Number(row.releaseYear || 0)
  }));
}

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const query = searchParams.get("query");
  const year = searchParams.get("year");
  const category = searchParams.get("category");
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "10";

  if ((!query || typeof query !== "string" || query.trim().length === 0) && 
      (!year || typeof year !== "string" || year.trim().length === 0)) {
    return NextResponse.json({ message: "Query or year parameter required." }, { status: 400 });
  }

  const sanitizedQuery = query ? sanitizeQuery(query) : "";
  const sanitizedYear = year ? sanitizeQuery(year) : "";

  const pageNumber = Math.max(Number(page), 1);
  const pageSize = Math.min(Math.max(Number(limit), 1), 50); // Max limit of 50 to prevent overload

  try {
    let results: Film[];
    let totalResultsQuery;

    // Main search logic
    if (year) {
      results = await db.query.film.findMany({
        where: (film: any, { eq }: { eq: Function }) => 
          eq(film.releaseYear, parseInt(sanitizedYear)),
        limit: pageSize,
        offset: (pageNumber - 1) * pageSize,
      });

      totalResultsQuery = await db.execute(
        sql`SELECT COUNT(*) AS total FROM film WHERE releaseYear = ${parseInt(sanitizedYear)}`
      );
    } else {
      results = await db.query.film.findMany({
        where: (film: any, { ilike }: { ilike: Function }) =>
          ilike(film.title, `%${sanitizedQuery}%`),
        limit: pageSize,
        offset: (pageNumber - 1) * pageSize,
      });

      totalResultsQuery = await db.execute(
        sql`SELECT COUNT(*) AS total FROM film WHERE LOWER(title) LIKE ${`%${sanitizedQuery.toLowerCase()}%`}`
      );
    }

    const totalResults = Number(totalResultsQuery.rows[0]?.total || 0);

    // Generate recommendations based on the query
    let recommendations: FilmRecommendation[] = [];
    
    if (results.length > 0) {
      // If we have results, find movies with similar genre or from same decade
      const firstResult = results[0];
      
      // Get genre information for the first result
      const genreInfo = await db.execute(
        sql`SELECT g.name FROM film f 
            JOIN film_genre fg ON f.id = fg.film_id 
            JOIN genre g ON fg.genre_id = g.id 
            WHERE f.id = ${firstResult.id}`
      );
      
      // If we have genre information, get films with the same genre
      if (genreInfo.rows.length > 0) {
        const mainGenre = genreInfo.rows[0].name;
        
        const genreRecommendations = await db.execute(
          sql`SELECT DISTINCT f.id, f.title, f.releaseYear 
              FROM film f 
              JOIN film_genre fg ON f.id = fg.film_id 
              JOIN genre g ON fg.genre_id = g.id 
              WHERE g.name = ${mainGenre} 
              AND f.id <> ${firstResult.id} 
              ORDER BY f.popularity DESC 
              LIMIT 5`
        );
        
        recommendations = mapToFilmRecommendations(genreRecommendations.rows);
      } else {
        // If no genre info, get films from same decade
        const decade = Math.floor(firstResult.releaseYear / 10) * 10;
        const endDecade = decade + 9;
        
        const decadeRecommendations = await db.execute(
          sql`SELECT id, title, releaseYear 
              FROM film 
              WHERE releaseYear BETWEEN ${decade} AND ${endDecade}
              AND id <> ${firstResult.id}
              ORDER BY popularity DESC 
              LIMIT 5`
        );
        
        recommendations = mapToFilmRecommendations(decadeRecommendations.rows);
      }
    } else if (sanitizedQuery) {
      // If no direct results but we have a query, try finding popular films with partial match
      const fuzzyRecommendations = await db.execute(
        sql`SELECT id, title, releaseYear 
            FROM film 
            WHERE LOWER(title) LIKE ${`%${sanitizedQuery.substr(0, 3).toLowerCase()}%`}
            ORDER BY popularity DESC 
            LIMIT 5`
      );
      
      recommendations = mapToFilmRecommendations(fuzzyRecommendations.rows);
    }

    return NextResponse.json({
      films: results,
      recommendations: recommendations,
      pagination: {
        currentPage: pageNumber,
        totalResults: totalResults,
        totalPages: Math.ceil(totalResults / pageSize),
      },
    });
  } catch (error) {
    console.error("Error fetching films:", error);
    return NextResponse.json({ message: "Internal server error." }, { status: 500 });
  }
}