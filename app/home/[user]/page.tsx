"use client";

import { useState, useEffect } from "react";
import { getRecommendedFilms } from "@/app/api/getFilms";
import { FilmCard } from "@/app/components/FilmComponents/FilmCard";
import Image from "next/image";
import { Logo } from "@/app/components/Logo";
import { useUser, useClerk } from "@clerk/nextjs";

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

export default function Profile() {
  const { isLoaded, isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  const [userData, setUserData] = useState<any>(null);
  const [recommendedFilms, setRecommendedFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded || !isSignedIn || !user) {
      setError("User not signed in.");
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        const email = user.emailAddresses[0]?.emailAddress;
        if (!email) throw new Error("No email found");

        const response = await fetch(`/api/getUserData?email=${encodeURIComponent(email)}`);
        const data = await response.json();

        if (!response.ok) throw new Error(data.error || "Failed to fetch user data");

        setUserData(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [isLoaded, isSignedIn, user]);

  useEffect(() => {
    if (!userData?.userId) return;

    const fetchRecommendedFilms = async () => {
      try {
        setLoading(true);
        const films = await getRecommendedFilms(userData.userId);
        setRecommendedFilms(films);
      } catch (err) {
        setError("Error fetching recommended films");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedFilms();
  }, [userData]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-white">
        <p>Loading...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        <p>{error}</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-center">
        <h1 className="text-gray-400 text-4xl font-bold">Profile Not Found</h1>
        <p>User data could not be fetched. Please try again later.</p>
      </div>
    );
  }

  const { user: profile, watchlist = [], top10 = [], favorites = [] } = userData;

  const renderFilmCards = (films: Film[], options: { watchList?: boolean } = {}) =>
    films.length ? (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
        {films.map((film) => (
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
        ))}
      </div>
    ) : (
      <p className="text-gray-500">No films available.</p>
    );

  return (
    <div className="min-h-screen bg-black text-white px-6 py-10">
      <Logo />

      <div className="flex flex-col items-center justify-center mt-10 px-5 sm:px-0">
        <div className="flex items-center space-x-4">
          <Image
            src={profile.image || "/default-profile.png"}
            alt="Profile Image"
            width={100}
            height={100}
            className="rounded-full border-2 border-gray-600"
            priority
          />
          <div>
            <h1 className="text-gray-400 text-4xl font-bold">{profile.name || "Anonymous"}</h1>
            <p className="text-gray-600">{user?.emailAddresses[0]?.emailAddress}</p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mt-10">Your Watchlist</h2>
        {renderFilmCards(watchlist, { watchList: true })}

        <h2 className="text-2xl font-semibold mt-10">Recommended Films</h2>
        {renderFilmCards(recommendedFilms)}

        <button
          onClick={() => signOut()}
          className="mt-6 px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-800 transition-all"
        >
          Sign Out
        </button>
      </div>
    </div>
  );
}
