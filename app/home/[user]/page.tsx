"use client";

import { useState, useEffect } from "react";
import { db } from "@/app/db/drizzle";
import { film, watchLists } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { useUser } from "@clerk/nextjs";
import FilmLayout from "@/app/components/FilmComponents/FilmLayout";
import PlayVideoModal from "@/app/components/PlayVideoModal";
import { Logo } from "@/app/components/Logo";
import UserProfileDropdown from "@/app/components/ProfileComponents/UserProfileDropdown";
import axios from "axios";

// Define Film type
interface Film {
  id: number;
  title: string;
  overview: string;
  watchList: boolean;
  trailerUrl: string;
  year: number;
  age: number;
  time: number;
  initialRatings: number;
  category: string;
  imageString: string;
}

// Function to fetch watchlist directly from the database
async function fetchWatchlist(userId: string) {
  try {
    return await db
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
        ratings: film.averageRating,
      })
      .from(film)
      .leftJoin(watchLists, eq(film.id, watchLists.filmId))
      .where(eq(watchLists.userId, userId));
  } catch (error) {
    console.error("Error fetching watchlist:", error);
    throw new Error("Failed to fetch watchlist.");
  }
}

export default function UserHome() {
  const { user, isLoaded } = useUser();
  const [watchlist, setWatchlist] = useState<Film[]>([]);
  const [top10Films, setTop10Films] = useState<Film[]>([]);
  const [recommendedFilms, setRecommendedFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [profile, setProfile] = useState({
    id: "",
    name: "",
    email: "",
    imageUrl: "",
    isAdmin: false,
  });

  useEffect(() => {
    if (isLoaded && user) {
      setProfile({
        id: user.id,
        name: user.fullName || "Unnamed User",
        email: user.primaryEmailAddress?.emailAddress || "",
        imageUrl: user.imageUrl || "/default-avatar.png",
        isAdmin: Boolean(user.publicMetadata?.isAdmin),
      });

      loadFilms();
    }
  }, [isLoaded, user]);

  

  const loadFilms = async () => {
    if (!user?.id) {
      console.error("User ID is missing, skipping DB queries.");
      return;
    }
  
    console.log("Fetching watchlist for user:", user.id);
  
    try {
      setLoading(true);
  
      // Fetch the watchlist directly from the database
      const watchlistData = await fetchWatchlist(user.id);
  
      // Map the fetched data to match the Film interface
      const formattedWatchlist: Film[] = watchlistData.map((film) => ({
        id: film.id,
        title: film.title,
        overview: film.overview,
        watchList: film.watchListId !== null,
        trailerUrl: film.trailer,
        year: film.release,
        age: film.age,
        time: film.duration,
        initialRatings: film.ratings ?? 0,
        category: film.category,
        imageString: film.imageString,
      }));
  
      setWatchlist(formattedWatchlist);
  
      // Fetch Top 10 Films from DB
      const top10Res = await db.select().from(film).limit(10);
      setTop10Films(
        top10Res.map((film) => ({
          id: film.id,
          title: film.title,
          overview: film.overview,
          watchList: false,
          trailerUrl: film.trailer || "",
          year: film.release || 0,
          age: film.age,
          time: film.duration || 0,
          initialRatings: film.averageRating ?? 0,
          category: film.category,
          imageString: film.imageString,
        }))
      );
  
      // Fetch recommended films from API (Fix: Pass userId)
      const recommendedRes = await axios.get(`/api/recommendations`, {
        params: { userId: user.id }, // ✅ Add userId query parameter
      });
  
      setRecommendedFilms(
        recommendedRes.data.map((film: any) => ({
          id: film.id,
          title: film.title,
          overview: film.overview,
          watchList: false,
          trailerUrl: film.trailer || "",
          year: film.release || 0,
          age: film.age,
          time: film.duration || 0,
          initialRatings: film.averageRating ?? 0,
          category: film.category,
          imageString: film.imageString,
        }))
      );
    } catch (err) {
      setError("An error occurred while loading films.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  
  

  const handleUpdateProfile = (updatedUser: { name: string; imageUrl?: string }) => {
    setProfile((prev) => ({ ...prev, ...updatedUser }));
  };

  const openModal = (film: Film) => {
    setSelectedFilm(film);
    setModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-black text-white p-6">
      <Logo />

      {/* Profile Section */}
      {isLoaded && user && (
        <div className="flex flex-col items-center mb-10">
          <UserProfileDropdown user={profile} onUpdate={handleUpdateProfile} />
        </div>
      )}

      {/* Watchlist Section */}
      <FilmLayout title="Your Watchlist" films={watchlist} loading={loading} error={error} />

      {/* Top 10 Films */}
      <FilmLayout title="Top 10 Films" films={top10Films} loading={loading} error={error} />

      {/* Recommended Films */}
      <FilmLayout title="Recommended For You" films={recommendedFilms} loading={loading} error={error} />

      {/* Play Video Modal */}
      {selectedFilm && (
        <PlayVideoModal
          title={selectedFilm.title}
          overview={selectedFilm.overview}
          trailerUrl={selectedFilm.trailerUrl}
          state={modalOpen}
          changeState={setModalOpen}
          release={selectedFilm.year}
          age={selectedFilm.age}
          duration={selectedFilm.time}
          ratings={selectedFilm.initialRatings}
          userId={user?.id || ""}
          filmId={selectedFilm.id}
          category={selectedFilm.category}
          setUserRating={() => {}}
        />
      )}
    </div>
  );
}
