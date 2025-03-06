import { FilmCard } from "@/app/components/FilmComponents/FilmCard";
import { db } from "@/app/db/drizzle";
import Image from "next/image";
import { film, watchLists } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { Logo } from "@/app/components/Logo";
import { useUser } from "@/app/auth/nextjs/useUser"; // Adjust the import path as needed
import { redirect } from "next/navigation";

async function getData(userId: string) {
  try {
    const query = db
      .select({
        title: film.title,
        age: film.ageRating,
        duration: film.duration,
        imageString: film.imageUrl,
        overview: film.overview,
        release: film.releaseYear,
        id: film.id,
        trailer: film.trailerUrl,
        watchListId: watchLists.userId,
        category: film.category,
        ratings: film.averageRating,
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

function FavoritesContent() {
  const { user, isLoading, isAuthenticated } = useUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen text-center">
        <Logo />
        <h1 className="text-2xl font-semibold text-gray-400">
          Loading...
        </h1>
      </div>
    );
  }

  if (!isAuthenticated) {
    redirect("/sign-in");
  }

  const userName = user?.name || "User";
  const firstName = userName.split(" ")[0];

  // This part would typically involve a client-side data fetching method
  // For now, we'll leave it as a placeholder
  const uniqueFilms: any[] = []; // Replace with actual data fetching logic

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
                    filmId={film.id}
                    title={film.title}
                    watchList={!!film.watchListId}
                    watchListId={film.watchListId ? film.watchListId.toString() : undefined}
                    trailerUrl={film.trailer}
                    year={film.release}
                    age={film.age}
                    time={film.duration}
                    initialRatings={film.ratings ?? 0}
                    overview={film.overview}
                    category={film.category}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function Favorites() {
  return <FavoritesContent />;
}