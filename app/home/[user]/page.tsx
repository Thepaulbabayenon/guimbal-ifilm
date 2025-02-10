"use client"; // Ensure this is present if using Next.js 13 with the app directory

import { useState, useEffect } from "react";
import { getRecommendedFilms } from "@/app/api/getFilms"; // Assuming you have a function for recommended films
import { FilmCard } from "@/app/components/FilmComponents/FilmCard";
import Image from "next/image";
import { Logo } from "@/app/components/Logo"; // Adjust the import path
import { useUser, useClerk } from "@clerk/nextjs"; // Clerk hooks

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
  const { isLoaded, isSignedIn, user } = useUser(); // Access Clerk's user data
  const { signOut } = useClerk(); // Access Clerk's signOut function

  const [userData, setUserData] = useState<any>(null); // Store user data
  const [recommendedFilms, setRecommendedFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Ensure that hooks are called unconditionally.
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      const fetchUserData = async () => {
        try {
          const email = user.emailAddresses[0]?.emailAddress; // Get email from user object
          if (!email) {
            setError("No email provided.");
            setLoading(false);
            return;
          }

          // Log the email and the request URL for debugging
          console.log("Fetching data for user email:", email);

          // Fetch user data using the email
          const response = await fetch(`/api/getUserData?email=${encodeURIComponent(email)}`);
          const data = await response.json();
          
          // Log the response to debug
          console.log("Fetched user data:", data);

          if (response.ok) {
            setUserData(data);
          } else {
            setError(data.error || "Failed to fetch user data");
          }
        } catch (err) {
          setError("Error fetching user data");
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchUserData();
    } else {
      setLoading(false);
      setError("User not signed in.");
    }
  }, [isLoaded, isSignedIn, user]); // No conditional hooks here

  useEffect(() => {
    if (userData && userData.userId) {
      const fetchRecommendedFilms = async () => {
        try {
          setLoading(true);
          const films = await getRecommendedFilms(userData.userId);
          setRecommendedFilms(films);
        } catch (err) {
          setError("Error fetching recommended films");
          console.error(err);
        } finally {
          setLoading(false);
        }
      };

      fetchRecommendedFilms();
    }
  }, [userData]); // Only re-run when `userData` changes

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  if (!userData) {
    return (
      <div className="profile-container mb-20">
        <h1 className="text-gray-400 text-4xl font-bold">Profile Not Found</h1>
        <p>User data could not be fetched. Please try again later.</p>
      </div>
    );
  }

  const { user: profile, watchlist = [], top10 = [], favorites = [] } = userData;

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

      <div className="flex flex-col items-center justify-center mt-10 px-5 sm:px-0">
        <div className="flex items-center space-x-4">
          <Image
            src={profile.image || "/default-profile.png"}
            alt="Profile Image"
            width={100}
            height={100}
            className="rounded-full"
            loading="lazy"
          />
          <div>
            <h1 className="text-gray-400 text-4xl font-bold">{profile.name || "Anonymous"}</h1>
            <p className="text-gray-600">{user?.emailAddresses[0]?.emailAddress}</p>
          </div>
        </div>

        {/* Watchlist */}
        <h2 className="text-2xl font-semibold mt-10">Your Watchlist</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {renderFilmCards(watchlist, { watchList: true })}
        </div>

        {/* Recommended Films */}
        <h2 className="text-2xl font-semibold mt-10">Recommended Films</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {renderFilmCards(recommendedFilms)}
        </div>
      </div>
    </div>
  );
}
