import { FilmCard } from "@/app/components/FilmCard";
import { db } from "@/db/drizzle";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import { film, watchLists } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Logo } from "@/app/components/Logo";

export const dynamic = "force-dynamic"; // Ensure dynamic rendering

async function getData(userId: string) {
  try {
    const query = db
      .select({
        title: film.title,
        age: film.age,
        duration: film.duration,
        imageString: film.imageString,
        overview: film.overview,
        release: film.release,
        id: film.id,
        trailer: film.trailer,
        watchListId: watchLists.id,
        category: film.category,
      })
      .from(film)
      .leftJoin(watchLists, eq(film.id, watchLists.filmId))
      .where(eq(watchLists.userId, userId));

    return await query;
  } catch (error) {
    console.error("Error fetching data:", error);
    throw new Error("Failed to fetch favorites.");
  }
}

export default async function Favorites() {
  try {
    const user = await currentUser();
    if (!user?.id) {
      return (
        <div className="flex items-center justify-center h-screen text-center">
          <Logo />
          <h1 className="text-2xl font-semibold text-gray-400">
            Please log in to view your favorites.
          </h1>
        </div>
      );
    }

    const data = await getData(user.id);
    const userName = user?.fullName || "User";
    const firstName = userName.split(" ")[0];
    const uniqueFilms = Array.from(
      new Map(data.map((film) => [film.id, { ...film }])).values()
    );

    return (
      <div className="recently-added-container mb-20">
        <div className="items-center justify-center flex">
          <div className="top-0 left-0 pt-1">
            <Logo />
          </div>
          <h1 className="text-gray-400 text-4xl font-bold items-center justify-center mt-10 px-5 sm:px-0 pt-9">
            {firstName.toLowerCase()}'s favorites
          </h1>
        </div>

        {uniqueFilms.length === 0 ? (
          <div className="items-center justify-center flex flex-col">
            <p className="text-gray-400 text-lg">
              No films found in your favorites.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 px-5 sm:px-0 mt-10 gap-6">
            {uniqueFilms.map((film) => (
              <div key={film.id} className="relative h-60">
                <Image
                  src={film.imageString}
                  alt="Film"
                  width={500}
                  height={400}
                  className="rounded-sm absolute w-full h-full object-cover"
                />
                <div className="h-60 relative z-10 w-full transform transition duration-500 hover:scale-125 opacity-0 hover:opacity-100">
                  <div className="bg-gradient-to-b from-transparent via-black/50 to-black z-10 w-full h-full rounded-lg flex items-center justify-center">
                    <Image
                      src={film.imageString}
                      alt="Film"
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
                      category={film.category || "Unknown"}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Error:", error);
    return (
      <div className="flex items-center justify-center h-screen text-center">
        <Logo />
        <h1 className="text-2xl font-semibold text-gray-400">
          Failed to load favorites. Please try again later.
        </h1>
      </div>
    );
  }
}
