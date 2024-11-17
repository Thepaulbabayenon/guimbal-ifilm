import { FilmCard } from "@/app/components/FilmCard";
import { db } from "@/db/drizzle";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import { film, watchLists } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Logo } from "@/app/components/Logo";

async function getData(userId: string) {
  const query = db
    .select({
      title: film.title,
      age: film.age,
      duration: film.duration,
      imageString: film.imageString,
      overview: film.overview,
      release: film.release,
      id: film.id,
      youtubeString: film.youtubeString,
      watchListId: watchLists.id,
    })
    .from(film)
    .leftJoin(watchLists, eq(film.id, watchLists.filmId)) // updated from filmId to filmId
    .where(eq(watchLists.userId, userId));

  try {
    const data = await query;
    console.log('Data from query:', data);
    return data;
  } catch (error) {
    console.error('Error fetching data:', error);
    throw error;
  }
}

export default async function Favorites() {
  try {
    const user = await currentUser();
    if (!user?.id) {
      return (
        <div>
          <h1>Please log in to view your favorites</h1>
        </div>
      );
    }

    const data = await getData(user.id);
    
    const userName = user?.fullName || 'User';
    const firstName = userName.split(' ')[0];

    const uniqueFilms = Array.from(
      new Map(data.map((film) => [film.id, film])).values() // updated from film to film
    );

    if (!uniqueFilms || uniqueFilms.length === 0) {
      return (
        <>
          <div className="items-center justify-center flex flex-col">
            <h1 className="text-gray-400 text-4xl font-bold underline mt-10 px-5 sm:px-0 pt-9">
              {firstName.toLowerCase()}'s favorites
            </h1>
            <p>No films found in your favorites.</p> {/* Updated "films" to "films" */}
          </div>
        </>
      );
    }

    return (
      <>
        <div className="recently-added-container mb-20">
          <div className="items-center justify-center flex">
            <div className="top-0 left-0 pt-1">
              <Logo />
            </div>
            <h1 className="text-gray-400 text-4xl font-bold items-center justify-center mt-10 px-5 sm:px-0 pt-9">
              {firstName.toLowerCase()}'s favorites
            </h1>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 px-5 sm:px-0 mt-10 gap-6">
            {uniqueFilms.map((film) => ( // updated from film to film
              <div key={film?.id} className="relative h-60">
                <Image
                  src={film?.imageString as string}
                  alt="Film"
                  width={500}
                  height={400}
                  className="rounded-sm absolute w-full h-full object-cover"
                />
                <div className="h-60 relative z-10 w-full transform transition duration-500 hover:scale-125 opacity-0 hover:opacity-100">
                  <div className="bg-gradient-to-b from-transparent via-black/50 to-black z-10 w-full h-full rounded-lg flex items-center justify-center">
                    <Image
                      src={film?.imageString as string}
                      alt="Film"
                      width={800}
                      height={800}
                      className="absolute w-full h-full -z-10 rounded-lg object-cover"
                    />

                    {film && (
                      <FilmCard
                        key={film?.id}
                        age={film?.age as number}
                        filmId={film?.id as number} // "filmId" instead of "filmId"
                        overview={film?.overview as string}
                        time={film?.duration as number}
                        title={film?.title as string}
                        watchListId={film?.watchListId?.toString() ?? ''}
                        watchList={Boolean(film?.watchListId)}
                        year={parseInt(film?.release.toString())}
                        youtubeUrl={film?.youtubeString as string}
                        initialRatings={2}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  } catch (error) {
    console.error("Error fetching watchlist data:", error);
    return (
      <>
        <h1 className="text-white text-4xl font-bold underline mt-10 px-5 sm:px-0">
          Your favorites
        </h1>
        <p>Error fetching favorites data. Please try again later.</p>
      </>
    );
  }
}
