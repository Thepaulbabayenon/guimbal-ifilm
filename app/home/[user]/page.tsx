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
import FilmSliderWrapper from "@/app/components/FilmComponents/FilmsliderWrapper";
import { Film } from "@/types/film";

// Interface for user profile
interface UserProfile {
  id: string;
  name: string;
  email: string; 
  image: string;
  isAdmin: boolean;
}

// FilmSliderWrapper expects this interface
interface ComponentFilm {
  id: number;
  title: string;
  imageUrl: string;
  releaseYear: number;
  duration: number; // Note: This is 'duration', not 'time'
  averageRating: number | null;
  category?: string;
  overview?: string;
  watchList?: boolean;
  trailerUrl?: string;
  ageRating?: number;
  initialRatings?: number;
  videoSource?: string;
  producer?: string; 
  director?: string;
  coDirector?: string;
  studio?: string;
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
        videoSource: film.videoSource,
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
  const [recommendedFilms, setRecommendedFilms] = useState<ComponentFilm[]>([]);  // Changed type to ComponentFilm[]  
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
        image: user.image || "/default-avatar.svg",
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
        releaseYear: film.releaseYear,
        ageRating: Number(film.ageRating) || 0,
        time: film.duration,
        initialRatings: film.averageRating ?? 0,
        category: film.category,
        imageUrl: film.imageUrl,
        producer: "", 
        director: "",
        coDirector: "",
        studio: "",
        averageRating: film.averageRating ?? null,
        videoSource: film.videoSource,
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
          trailerUrl: film.trailerUrl || "",
          releaseYear: film.releaseYear || 0,
          ageRating: Number(film.ageRating) || 0,
          time: film.duration || 0,
          initialRatings: film.averageRating ?? 0,
          category: film.category,
          imageUrl: film.imageUrl,
          producer: "",
          director: "",
          coDirector: "",
          studio: "",
          averageRating: film.averageRating ?? 0,
          videoSource: film.videoSource,
        }))
      );
  
      // Fetch recommended films from API
      const recommendedRes = await axios.get(`/api/recommendations`, {
        params: { userId: user.id },
      });

      // Map API response to ComponentFilm interface with correct property names
      setRecommendedFilms(
        recommendedRes.data.map((film: any) => ({
          id: film.id,
          title: film.title,
          overview: film.overview,
          watchList: false,
          trailerUrl: film.trailer || "",
          releaseYear: film.release || 0,
          ageRating: film.age || 0,
          duration: film.duration || 0, // Changed from 'time' to 'duration'
          initialRatings: film.averageRating ?? 0,
          category: film.category || "Uncategorized",
          imageUrl: film.imageString || film.imageUrl || "",
          producer: film.producer || "",
          director: film.director || "",
          coDirector: film.coDirector || "",
          studio: film.studio || "",
          averageRating: film.averageRating ?? 0,
          videoSource: film.videoSource,
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

  return (
    <div className="min-h-screen bg-black text-white p-6 pt-40">
      <Logo />

      {/* Profile Section */}
      {isAuthenticated && user && (
        <div className="flex flex-col items-center mb-10 pt-20">
          <UserProfileDropdown user={profile} onUpdate={handleUpdateProfile} />
        </div>
      )}

      {/* Watchlist Section */}
      <FilmLayout title="Your Watchlist" films={watchlist} loading={loading} error={error} isMobile={false}/>

      {/* Top 10 Films */}
      <FilmLayout title="Top 10 Films" films={top10Films} loading={loading} error={error} isMobile={false} />

      {/* Recommended Films - Now using FilmSliderWrapper like in HomePage */}
      {recommendedFilms.length > 0 && (
        <div className="mt-6 pt-20">
          <h1 className="text-3xl font-bold text-gray-400 pt-20">RECOMMENDED FOR YOU</h1>
          <FilmSliderWrapper title="Recommended For You" films={recommendedFilms} />
        </div>
      )}

      {/* Play Video Modal */}
      {selectedFilm && (
        <PlayVideoModal
          title={selectedFilm.title}
          overview={selectedFilm.overview}
          trailerUrl={selectedFilm.trailerUrl}
          videoSource={selectedFilm.videoSource}
          state={modalOpen}
          changeState={setModalOpen}
          releaseYear={selectedFilm.releaseYear} 
          ageRating={selectedFilm.ageRating} 
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