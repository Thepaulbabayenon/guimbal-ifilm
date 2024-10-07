import { MovieCard } from "@/app/components/MovieCard";
import { db } from "@/db/drizzle";
import { currentUser } from "@clerk/nextjs/server";
import Image from "next/image";
import { movie, watchLists } from "@/db/schema";
import { eq } from "drizzle-orm";
import { Logo } from "@/app/components/Logo";

async function getData(userId: string) {
  const query = db
    .select({
      title: movie.title,
      age: movie.age,
      duration: movie.duration,
      imageString: movie.imageString,
      overview: movie.overview,
      release: movie.release,
      id: movie.id,
      youtubeString: movie.youtubeString,
      watchListId: watchLists.id, 
    })
    .from(movie)
    .leftJoin(watchLists, eq(movie.id, watchLists.movieId))
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

    const uniqueMovies = Array.from(
      new Map(data.map((movie) => [movie.id, movie])).values()
    );

    if (!uniqueMovies || uniqueMovies.length === 0) {
      return (
        <>
          <div className="items-center justify-center flex flex-col">
            <h1 className="text-gray-400 text-4xl font-bold underline mt-10 px-5 sm:px-0 pt-9">
              {firstName.toLowerCase()}'s favorites
            </h1>
            <p>No movies found in your favorites.</p>
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
            {uniqueMovies.map((movie) => (
              <div key={movie?.id} className="relative h-60">
                <Image
                  src={movie?.imageString as string}
                  alt="Movie"
                  width={500}
                  height={400}
                  className="rounded-sm absolute w-full h-full object-cover"
                />
                <div className="h-60 relative z-10 w-full transform transition duration-500 hover:scale-125 opacity-0 hover:opacity-100">
                  <div className="bg-gradient-to-b from-transparent via-black/50 to-black z-10 w-full h-full rounded-lg flex items-center justify-center">
                    <Image
                      src={movie?.imageString as string}
                      alt="Movie"
                      width={800}
                      height={800}
                      className="absolute w-full h-full -z-10 rounded-lg object-cover"
                    />

                    {movie && (
                      <MovieCard
                        key={movie?.id}
                        age={movie?.age as number}
                        movieId={movie?.id as number}
                        overview={movie?.overview as string}
                        time={movie?.duration as number}
                        title={movie?.title as string}
                        watchListId={movie?.watchListId?.toString() ?? ''}
                        watchList={Boolean(movie?.watchListId)}
                        year={parseInt(movie?.release.toString())}
                        youtubeUrl={movie?.youtubeString as string}
                        ratings={0}
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
