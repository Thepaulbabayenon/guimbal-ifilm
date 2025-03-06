"use client";

import { useState, useEffect } from "react";
import { db } from "@/app/db/drizzle";
import { film, watchLists } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { useUser } from "@/app/auth/nextjs/useUser";
import FilmLayout from "@/app/components/FilmComponents/FilmLayout";
import PlayVideoModal from "@/app/components/PlayVideoModal";
import { Logo } from "@/app/components/Logo";
import UserProfileDropdown from "@/app/components/ProfileComponents/UserProfileDropdown";
import axios from "axios";
import { Film } from "@/types/film";


// Interface for user profile
interface UserProfile {
  id: string;
  name: string;
  email: string; 
  image: string;
  isAdmin: boolean;
}

// Function to fetch watchlist directly from the database
async function fetchWatchlist(userId: string) {
  try {
    return await db
      .select({
        title: film.title,
        ageRating: film.ageRating,
        duration: film.duration,
        imageUrl: film.imageUrl,
        overview: film.overview,
        releaseYear: film.releaseYear,
        id: film.id,
        trailerUrl: film.trailerUrl,
        watchListId: watchLists.userId,
        category: film.category,
        averageRating: film.averageRating,
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
  // Correct property name: isLoaded -> isAuthenticated
  const { user, isLoading, isAuthenticated } = useUser();
  const [watchlist, setWatchlist] = useState<Film[]>([]);
  const [top10Films, setTop10Films] = useState<Film[]>([]);
  const [recommendedFilms, setRecommendedFilms] = useState<Film[]>([]);  
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null);
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [profile, setProfile] = useState<UserProfile>({
    id: "",
    name: "",
    email: "",
    image: "",
    isAdmin: false,
  });

  useEffect(() => {
    if (!isLoading && user) {
      setProfile({
        id: user.id,
        name: user.name || "Unnamed User",
        email: user.email || "",
        image: user.imageUrl || "/default-avatar.png",
        isAdmin: Boolean(user.role),
      });
  
      loadFilms();
    }
  }, [isLoading, user]);

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
        trailerUrl: film.trailerUrl || "",
        year: film.releaseYear,
        age: Number(film.ageRating) || 0,
        time: film.duration,
        initialRatings: film.averageRating ?? 0,
        category: film.category,
        imageUrl: film.imageUrl,
        producer: "", 
        director: "",
        coDirector: "",
        studio: "",
        averageRating: film.averageRating ?? null, 
      }));
      
  
      setWatchlist(formattedWatchlist);
  
      // Fetch Top 10 Films from DB
     // Fetch Top 10 Films from DB
const top10Res = await db.select().from(film).limit(10);
setTop10Films(
  top10Res.map((film) => ({
    id: film.id,
    title: film.title,
    overview: film.overview,
    watchList: false,
    trailerUrl: film.trailerUrl || "",
    year: film.releaseYear || 0, // Use 'year' instead of 'releaseYear'
    age: Number(film.ageRating) || 0, // Use 'age' instead of 'ageRating'
    time: film.duration || 0, // Use 'time' for duration
    initialRatings: film.averageRating ?? 0,
    category: film.category,
    imageUrl: film.imageUrl,
    producer: "",
    director: "",
    coDirector: "",
    studio: "",
    averageRating: film.averageRating ?? 0,
  }))
);
  
      // Fetch recommended films from API
      // Fetch recommended films from API
const recommendedRes = await axios.get(`/api/recommendations`, {
  params: { userId: user.id },
});

setRecommendedFilms(
  recommendedRes.data.map((film: any) => ({
    id: film.id,
    title: film.title,
    overview: film.overview,
    watchList: false,
    trailerUrl: film.trailer || "",
    year: film.release || 0, // Use 'year'
    age: film.age || 0,
    time: film.duration || 0,
    initialRatings: film.averageRating ?? 0,
    category: film.category,
    imageString: film.imageString || film.imageUrl || "",
    // Add missing properties
    producer: film.producer || "",
    director: film.director || "",
    coDirector: film.coDirector || "",
    studio: film.studio || "",
  }))
);
  
      setRecommendedFilms(
        recommendedRes.data.map((film: any) => ({
          id: film.id,
          title: film.title,
          overview: film.overview,
          watchList: false,
          trailerUrl: film.trailer || "",
          releaseYear: film.release || 0,
          ageRating: film.age || 0,
          duration: film.duration || 0,
          averageRating: film.averageRating ?? 0,
          category: film.category,
          imageUrl: film.imageString || film.imageUrl || "",
          // Add properties to match the expected Film type
          year: film.release || 0,
          age: film.age || 0,
          time: film.duration || 0,
          initialRatings: film.averageRating ?? 0,
          imageString: film.imageString || film.imageUrl || "",
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
      {/* Change isLoaded to isAuthenticated */}
      {isAuthenticated && user && (
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
    ratings={selectedFilm.averageRating ?? 0}
    userId={user?.id || ""}
    filmId={selectedFilm.id}
    category={selectedFilm.category}
    setUserRating={() => {}}
  />
)}
    </div>
  );
}