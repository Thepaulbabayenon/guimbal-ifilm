import { db } from "@/app/db/drizzle";
import { film } from "@/app/db/schema";
import { desc } from "drizzle-orm";
import RecentlyClient from "@/app/components/RecentlyClient";

// Ensure dynamic rendering
export const dynamic = "force-dynamic";


// Fetch film data
async function getData() {
  try {
    const result = await db
      .select()
      .from(film)
      .orderBy(desc(film.createdAt))
      .limit(8);

    return result.map((f) => ({
      ...f,
      ageRating: f.ageRating.toString(), 
    }));
  } catch (error) {
    console.error("Error fetching data from database:", error);
    return null; 
  }
}


export default async function Recently() {
  const films = await getData();

  return <RecentlyClient films={films} />;
}
