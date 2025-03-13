// app/api/categories/route.ts
import { db } from '@/app/db/drizzle'; 
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
   
    const categories = await db.execute<{ category: string }>(
      sql`SELECT DISTINCT "category" FROM films`
    );
    const categoryList = categories.rows.map((row) => row.category); 

    // Return the response as JSON
    return new Response(JSON.stringify({ categories: categoryList }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch categories' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
