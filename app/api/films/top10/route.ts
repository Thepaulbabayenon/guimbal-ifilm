import { NextResponse } from "next/server";
import { db } from "@/app/db/drizzle";
import { film } from "@/app/db/schema";
import { desc } from "drizzle-orm"; 

export async function GET() {
  const top10Movies = await db
  .select()
  .from(film)
  .orderBy(desc(film.averageRating))
  .limit(10);


  return NextResponse.json(top10Movies);
}
