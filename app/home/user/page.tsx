import { auth } from "@clerk/nextjs/server";
import { getUserData } from "@/app/api/getUser"; // Ensure the import path is correct
import Image from "next/image";
import { FilmCard } from "@/app/components/FilmCard"; // Ensure the import path is correct
import { Logo } from "@/app/components/Logo";

export default async function Profile() {
  try {
    const { userId }: { userId: string | null } = auth();
    if (!userId) {
      throw new Error("User not logged in");
    }

    const userData = await getUserData(userId);

    if (!userData || !userData.user) {
      return (
        <div className="recently-added-container mb-20">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-gray-400 text-4xl font-bold underline mt-10 px-5 sm:px-0 pt-9">
              Profile Not Found
            </h1>
            <p>User data could not be fetched. Please try again later.</p>
          </div>
        </div>
      );
    }

    const { user, watchlist, top10, favorites } = userData;

    return (
      <div className="recently-added-container mb-20">
        <div className="top-0 left-0 pt-1">
          <Logo />
        </div>
        <div className="flex flex-col items-center justify-center mt-10 px-5 sm:px-0">
          <div className="flex items-center space-x-4">
            <Image
              src={user.image || "/default-profile.png"}
              alt="Profile Image"
              width={100}
              height={100}
              className="rounded-full"
            />
            <div>
              <h1 className="text-gray-400 text-4xl font-bold">{user.name}</h1>
              <p className="text-gray-600">{user.email}</p>
            </div>
          </div>

          {/* Watchlist */}
          <div className="mt-10">
            <h2 className="text-gray-400 text-3xl font-bold">Your Watchlist</h2>
            {watchlist.length === 0 ? (
              <p>No films in your watchlist.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-6 gap-6">
                {watchlist.map((film) => (
                  <FilmCard
                    key={film.id}
                    age={film.age}
                    filmId={film.id}
                    overview={film.overview}
                    time={film.duration}
                    title={film.title}
                    watchListId={film.watchListId?.toString() ?? ''}
                    watchList={Boolean(film.watchListId)}
                    year={film.release}
                    youtubeUrl={film.youtubeString}
                    initialRatings={0} // Use initialRatings instead of ratings
                  />
                ))}
              </div>
            )}
          </div>

          {/* Top 10 Films */}
          <div className="mt-10">
            <h2 className="text-gray-400 text-3xl font-bold mb-6">Top 10 Films</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {top10.map((film) => (
                <div key={film.id} className="relative group">
                  <FilmCard
                    age={film.age}
                    filmId={film.id}
                    overview={film.overview}
                    time={film.duration}
                    title={film.title}
                    watchListId="" // Empty watchListId for top 10 films
                    watchList={false} // Top 10 films won't be in watchlist
                    year={film.release}
                    youtubeUrl={film.imageString} // Assuming imageString is the correct property
                    initialRatings={0} // Use initialRatings instead of ratings
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-70 transition-opacity duration-300 flex items-center justify-center text-center text-white p-4">
                    <p className="text-lg font-semibold">{film.title}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Favorites */}
          <div className="mt-10">
            <h2 className="text-gray-400 text-3xl font-bold">Favorites</h2>
            {favorites.length === 0 ? (
              <p>No favorites found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-6 gap-6">
                {favorites.map((film) => (
                  <FilmCard
                    key={film.id}
                    age={film.age}
                    filmId={film.id}
                    overview={film.overview}
                    time={film.duration}
                    title={film.title}
                    watchListId="" // Empty watchListId for favorites
                    watchList={false} // Favorites won't be in watchlist
                    year={film.release}
                    youtubeUrl={film.imageString} // Assuming imageString is the correct property
                    initialRatings={0} // Use initialRatings instead of ratings
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching profile data:", error);
    return (
      <div className="recently-added-container mb-20">
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-gray-400 text-4xl font-bold underline mt-10 px-5 sm:px-0 pt-9">
            Profile Error
          </h1>
          <p>There was an error loading your profile. Please try again later.</p>
        </div>
      </div>
    );
  }
}
