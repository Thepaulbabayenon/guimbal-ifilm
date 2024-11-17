// app/api/categories/route.ts
import { db } from '@/db/drizzle'; // Ensure correct import path
import { sql } from 'drizzle-orm';

export async function fetchCategories() {
  // Fetch distinct categories from the database
  const categories = await db.execute<{ category: string }>(
    sql`SELECT DISTINCT "category" FROM movie`
  );
  return categories.rows.map((row) => row.category); // Return an array of categories
}
