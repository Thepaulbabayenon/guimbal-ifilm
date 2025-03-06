import { NextRequest, NextResponse } from "next/server"; 
import { db } from "@/app/db/drizzle"; 
import { sql } from "drizzle-orm";


const sanitizeQuery = (query: string): string => {
  return query.trim().replace(/[^\w\s]/gi, "");
};


interface Film {
  id: number;
  title: string;
  release: number;
}


export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl;
  const query = searchParams.get("query");
  const page = searchParams.get("page") || "1";
  const limit = searchParams.get("limit") || "10";

  if (!query || typeof query !== "string" || query.trim().length === 0) {
    return NextResponse.json({ message: "Query parameter cannot be empty or invalid." }, { status: 400 });
  }

  const sanitizedQuery = sanitizeQuery(query);

  const pageNumber = Math.max(Number(page), 1);
  const pageSize = Math.min(Math.max(Number(limit), 1), 50); // Max limit of 50 to prevent overload

  try {
  
    const results = await db.query.film.findMany({
      where: (film: any, { ilike }: { ilike: Function }) =>
        ilike(film.title, `%${sanitizedQuery}%`),
      limit: pageSize,
      offset: (pageNumber - 1) * pageSize,
    });

  
    const totalResultsQuery = await db.execute(
      sql`SELECT COUNT(*) AS total FROM film WHERE LOWER(title) LIKE ${`%${sanitizedQuery.toLowerCase()}%`}`
    );

    const totalResults = Number(totalResultsQuery.rows[0]?.total || 0);

    return NextResponse.json({
      films: results,
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
