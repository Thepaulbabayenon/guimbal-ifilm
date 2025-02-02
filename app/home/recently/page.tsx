import { FilmCard } from "@/app/components/FilmComponents/FilmCard";
import { auth } from "@clerk/nextjs/server";
import { db } from "@/app/db/drizzle";
import Image from "next/image";
import { film } from "@/app/db/schema";
import { desc } from "drizzle-orm";

// Ensure dynamic rendering
export const dynamic = "force-dynamic";

// Fetch film data
async function getData() {
  try {
    return await db
      .select()
      .from(film)
      .orderBy(desc(film.createdAt))
      .limit(8);
  } catch (error) {
    console.error("Error fetching data from database:", error);
    throw new Error("Failed to fetch recently added films.");
  }
}

export default async function Recently() {
  try {
    // Authenticate the user
    const { userId }: { userId: string | null } = auth();
    if (!userId) {
      return (
        <div className="flex items-center justify-center h-screen text-center">
          <h1 className="text-gray-400 text-4xl font-bold underline mt-10 px-5 sm:px-0">
            Recently Added Films
          </h1>
          <p className="text-lg text-gray-300 mt-4">
            Please log in to view your films.
          </p>
        </div>
      );
    }

    // Fetch recently added films
    const data = await getData();

    if (!data || data.length === 0) {
      return (
        <div className="flex items-center justify-center h-screen text-center">
          <h1 className="text-gray-400 text-4xl font-bold underline mt-10 px-5 sm:px-0">
            Recently Added Films
          </h1>
          <p className="text-lg text-gray-300 mt-4">
            No films found in the database.
          </p>
        </div>
      );
    }

    return (
      <div className="recently-added-container mb-20">
        <div className="flex items-center justify-center">
          <h1 className="text-gray-400 text-4xl font-bold mt-10 px-5 sm:px-0">
            Recently Added Films
          </h1>
        </div>

        {/* Film Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 px-5 sm:px-0 mt-10 gap-6">
          {data.map((film) => (
            <div key={film.id} className="relative h-60">
              {/* Film Thumbnail */}
              <Image
                src={film.imageString}
                alt={film.title}
                width={500}
                height={400}
                className="rounded-sm absolute w-full h-full object-cover"
              />

              {/* Overlay */}
              <div className="h-60 relative z-10 w-full transform transition duration-500 hover:scale-125 opacity-0 hover:opacity-100">
                <div className="bg-gradient-to-b from-transparent via-black/50 to-black z-10 w-full h-full rounded-lg flex items-center justify-center">
                  <Image
                    src={film.imageString}
                    alt={film.title}
                    width={800}
                    height={800}
                    className="absolute w-full h-full -z-10 rounded-lg object-cover"
                  />
                  <FilmCard
                    key={film.id}
                    age={film.age}
                    filmId={film.id}
                    overview={film.overview}
                    time={film.duration}
                    title={film.title}
                    year={parseInt(film.release.toString())}
                    trailerUrl={film.trailer}
                    initialRatings={0}
                    watchList={false}
                    category={film.category || "Uncategorized"}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error rendering Watchlist page:", error);
    return (
      <div className="flex items-center justify-center h-screen text-center">
        <h1 className="text-gray-400 text-4xl font-bold underline mt-10 px-5 sm:px-0">
          Recently Added Films
        </h1>
        <p className="text-lg text-gray-300 mt-4">
          Something went wrong while fetching the data. Please try again later.
        </p>
      </div>
    );
  }
}
