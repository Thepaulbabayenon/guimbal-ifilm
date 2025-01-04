// app/api/categories/route.ts
import { db } from '@/db/drizzle'; // Ensure correct import path
import { sql } from 'drizzle-orm';

export async function GET() {
  try {
    // Fetch distinct categories from the database
    const categories = await db.execute<{ category: string }>(
      sql`SELECT DISTINCT "category" FROM film`
    );
    const categoryList = categories.rows.map((row) => row.category); // Return an array of categories

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
