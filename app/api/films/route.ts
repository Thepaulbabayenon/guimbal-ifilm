import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db/drizzle";
import { film } from "@/app/db/schema"; 
import { eq, sql, and, desc, inArray, ilike, SQL } from "drizzle-orm";
import NodeCache from "node-cache";

// Create a server-side cache with TTL settings
// stdTTL is 60 seconds, checkperiod is 120 seconds
const cache = new NodeCache({ stdTTL: 60, checkperiod: 120 });

export type Film = {
  id: number;
  imageUrl: string;
  title: string;
  ageRating: number;
  duration: number;
  overview: string;
  releaseYear: number;
  videoSource: string;
  category: string;
  trailerUrl: string;
  createdAt: string;
  updatedAt: string;
  producer: string;
  director: string;
  coDirector: string;
  studio: string;
  rank: number;
  averageRating: number | null;
};

// Type for query results which might be partial films when using field selection
export type FilmQueryResult = Partial<Film> & { id: number };

/**
 * GET /api/films - Fetches films based on filters.
 */
export async function GET(req: NextRequest) {
  const startTime = performance.now();
  
  try {
    // Extract query parameters
    const { searchParams } = req.nextUrl;
    const title = searchParams.get("title");
    const year = searchParams.get("year");
    const rating = searchParams.get("rating");
    const category = searchParams.get("category");
    const limitParam = searchParams.get("limit");
    const limit = limitParam ? parseInt(limitParam, 10) : 10;
    const ids = searchParams.get("ids");
    const fieldsList = searchParams.get("fields")?.split(',') || null;

    // Create a cache key based on normalized query parameters
    const cacheKey = `films:${title ?? ""}:${year ?? ""}:${rating ?? ""}:${category ?? ""}:${limit}:${ids ?? ""}:${fieldsList?.join(',') ?? "all"}`;
    
    // Try to get data from cache first
    let filmsData = cache.get<FilmQueryResult[]>(cacheKey);
    
    if (filmsData === undefined) {
      // Cache miss - query the database
      const conditions: SQL[] = [];

      // Add filter conditions
      if (title) conditions.push(ilike(film.title, `%${title}%`));
      if (year) conditions.push(eq(film.releaseYear, parseInt(year, 10)));
      if (rating) conditions.push(eq(film.rank, parseInt(rating, 10)));
      if (category) conditions.push(eq(film.category, category));

      // Handle multiple IDs filter
      if (ids) {
        const filmIds = ids.split(',')
          .map(id => parseInt(id.trim(), 10))
          .filter(id => !isNaN(id));
          
        if (filmIds.length > 0) {
          conditions.push(inArray(film.id, filmIds));
        }
      }

      // Construct query based on field selection
      let query;
      if (fieldsList && fieldsList.length > 0) {
        const selectObj: Record<string, any> = {};
        
        // Add requested fields to select object
        fieldsList.forEach(fieldName => {
          if (fieldName in film) {
            // @ts-ignore - Dynamic field access
            selectObj[fieldName] = film[fieldName];
          }
        });
        
        // Ensure ID is always included
        if (!('id' in selectObj)) {
          selectObj['id'] = film.id;
        }
        
        query = db
          .select(selectObj)
          .from(film)
          .where(conditions.length > 0 ? and(...conditions) : undefined)
          .orderBy(desc(film.rank))
          .limit(limit);
      } else {
        query = db
          .select()
          .from(film)
          .where(conditions.length > 0 ? and(...conditions) : undefined)
          .orderBy(desc(film.rank))
          .limit(limit);
      }
      
      // Execute query with prepared statements
      const queryResults = await query.execute();
      filmsData = queryResults as FilmQueryResult[];
      
      // Store in cache
      cache.set(cacheKey, filmsData);
    }

    // Calculate response time for monitoring
    const responseTime = performance.now() - startTime;
    console.log(`GET /api/films response time: ${responseTime.toFixed(2)}ms, cache: ${filmsData !== undefined ? "hit" : "miss"}`);

    return NextResponse.json({ rows: filmsData }, {
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=300',
        'X-Response-Time': responseTime.toFixed(2)
      }
    });
  } catch (error) {
    const responseTime = performance.now() - startTime;
    console.error(`Error fetching films (${responseTime.toFixed(2)}ms):`, error);
    
    // Don't expose full error details to client
    return NextResponse.json({ 
      message: 'Error fetching films',
      error: error instanceof Error ? error.message : 'Unknown error' 
    }, { 
      status: 500,
      headers: {
        'X-Response-Time': responseTime.toFixed(2)
      }
    });
  }
}

/**
 * POST /api/films - Fetches a single film by ID.
 */
export async function POST(req: NextRequest) {
  const startTime = performance.now();
  
  try {
    let body;
    try {
      body = await req.json();
    } catch (error) {
      return NextResponse.json({ message: "Invalid JSON in request body" }, { status: 400 });
    }
    
    const { id, fields: fieldsList } = body;

    if (!id || isNaN(Number(id))) {
      return NextResponse.json({ message: "Invalid or missing film ID" }, { status: 400 });
    }

    // Create a cache key for this specific film request
    const cacheKey = `film:${id}:${fieldsList ? fieldsList.join(',') : 'all'}`;
    
    // Try to get data from cache first
    let filmData = cache.get<FilmQueryResult[]>(cacheKey);
    
    if (filmData === undefined) {
      // Cache miss - query the database
      let query;
      
      if (fieldsList && fieldsList.length > 0) {
        const selectObj: Record<string, any> = {};
        
        fieldsList.forEach((fieldName: string) => {
          if (fieldName in film) {
            // @ts-ignore - Dynamic field access
            selectObj[fieldName] = film[fieldName];
          }
        });
        
        // Ensure ID is always included
        if (!('id' in selectObj)) {
          selectObj['id'] = film.id;
        }
        
        query = db
          .select(selectObj)
          .from(film)
          .where(eq(film.id, parseInt(id, 10)))
          .limit(1);
      } else {
        query = db
          .select()
          .from(film)
          .where(eq(film.id, parseInt(id, 10)))
          .limit(1);
      }

      const queryResults = await query.execute();
      filmData = queryResults as FilmQueryResult[];
      
      // Store in cache with longer TTL for individual films
      if (filmData.length > 0) {
        cache.set(cacheKey, filmData, 300); // 5 minutes TTL
      }
    }

    // filmData might be undefined here if it wasn't found in cache
    // and we need to handle that case explicitly
    if (!filmData || filmData.length === 0) {
      const responseTime = performance.now() - startTime;
      return NextResponse.json({ 
        message: "Film not found" 
      }, { 
        status: 404,
        headers: {
          'X-Response-Time': responseTime.toFixed(2)
        }
      });
    }

    const responseTime = performance.now() - startTime;
    console.log(`POST /api/films response time: ${responseTime.toFixed(2)}ms, cache: ${filmData !== undefined ? "hit" : "miss"}`);

    return NextResponse.json({ rows: filmData }, {
      headers: {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=600',
        'X-Response-Time': responseTime.toFixed(2)
      }
    });
  } catch (error) {
    const responseTime = performance.now() - startTime;
    console.error(`Error fetching film by ID (${responseTime.toFixed(2)}ms):`, error);
    
    // Don't expose full error details to client
    return NextResponse.json({ 
      message: 'Error fetching film by ID',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500,
      headers: {
        'X-Response-Time': responseTime.toFixed(2)
      }
    });
  }
}