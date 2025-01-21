import { auth } from "@clerk/nextjs/server";
import { getUserData } from "@/app/api/getUser"; // Adjust the import path as needed
import Image from "next/image";
import { FilmCard } from "@/app/components/FilmCard"; // Adjust the import path as needed
import { Logo } from "@/app/components/Logo";

// Ensure dynamic rendering
export const dynamic = "force-dynamic";

// Define types for the user and film objects
interface User {
  name: string | null;
  email: string;
  image?: string | null;
}

interface Film {
  id: number;
  title: string;
  overview: string;
  duration: number;
  release: number;
  category?: string;
  imageString?: string;
  trailer?: string;
  age: number;
  watchListId?: string | null;
}

interface UserData {
  user: User;
  watchlist: Film[];
  top10: Film[];
  favorites: Film[];
}

export default async function Profile() {
  try {
    // Authenticate the user
    const { userId }: { userId: string | null } = auth();
    if (!userId) {
      throw new Error("User not logged in");
    }

    // Fetch user data
    const userData: UserData | null = await getUserData(userId);

    if (!userData || !userData.user) {
      return (
        <div className="profile-container mb-20">
          <div className="flex flex-col items-center justify-center">
            <h1 className="text-gray-400 text-4xl font-bold underline mt-10 px-5 sm:px-0">
              Profile Not Found
            </h1>
            <p>User data could not be fetched. Please try again later.</p>
          </div>
        </div>
      );
    }

    const { user, watchlist = [], top10 = [], favorites = [] } = userData;

    // Render Film Cards Helper
    const renderFilmCards = (films: Film[], options: { watchList?: boolean } = {}) =>
      films.map((film) => (
        <FilmCard
          key={film.id}
          age={film.age}
          filmId={film.id}
          overview={film.overview}
          time={film.duration}
          title={film.title}
          watchListId={options.watchList ? film.watchListId?.toString() ?? "" : ""}
          watchList={options.watchList || false}
          year={film.release}
          trailerUrl={film.trailer || film.imageString || ""}
          initialRatings={0}
          category={film.category || "Unknown"}
        />
      ));

    return (
      <div className="profile-container mb-20">
        <div className="top-0 left-0 pt-1">
          <Logo />
        </div>

        {/* Profile Info */}
        <div className="flex flex-col items-center justify-center mt-10 px-5 sm:px-0">
          <div className="flex items-center space-x-4">
            <Image
              src={user.image || "/default-profile.png"}
              alt="Profile Image"
              width={100}
              height={100}
              className="rounded-full"
              loading="lazy"
            />
            <div>
              <h1 className="text-gray-400 text-4xl font-bold">{user.name || "Anonymous"}</h1>
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
                {renderFilmCards(watchlist, { watchList: true })}
              </div>
            )}
          </div>

          {/* Top 10 Films */}
          <div className="mt-10">
            <h2 className="text-gray-400 text-3xl font-bold mb-6">Top 10 Films</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {renderFilmCards(top10)}
            </div>
          </div>

          {/* Favorites */}
          <div className="mt-10">
            <h2 className="text-gray-400 text-3xl font-bold">Favorites</h2>
            {favorites.length === 0 ? (
              <p>No favorites found.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-6 gap-6">
                {renderFilmCards(favorites)}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching profile data:", error);
    return (
      <div className="profile-container mb-20">
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-gray-400 text-4xl font-bold underline mt-10 px-5 sm:px-0">
            Profile Error
          </h1>
          <p>There was an error loading your profile. Please try again later.</p>
        </div>
      </div>
    );
  }
}
