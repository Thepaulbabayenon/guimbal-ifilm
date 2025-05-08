'use client';
import { useState, useEffect, useRef } from "react";
import { db } from "@/app/db/drizzle";
import { film } from "@/app/db/schema";
import { desc } from "drizzle-orm";
import FilmButtons from "./FilmButtons";
import { useUser } from "@/app/auth/nextjs/useUser";

interface Film {
  id: number;
  imageUrl: string;
  title: string;
  ageRating: number;
  duration: number;
  overview: string;
  releaseYear: number;
  videoSource: string;
  category: string;
  trailerUrl: string;
  createdAt: Date;
  rank: number | null;
}

// Props interface for FilmButtons component
interface FilmButtonsProps {
  ageRating: number;
  duration: number;
  id: number;
  overview: string;
  releaseYear: number;
  title: string;
  trailerUrl: string;
  category: string;
  isMuted: boolean;
  toggleMute: () => void;
  userRatings: Record<number, number>;
  averageRatings: Record<number, number>;
  setUserRating: (rating: number) => void;
  markAsWatched: (userId: string, filmId: number) => void;
  userId: string;
  isMobile?: boolean; // Added isMobile property as optional
}

// Add a props interface for the FilmVideo component itself
interface FilmVideoProps {
  isMobile?: boolean;
}

// Function to fetch recommended films
async function getRecommendedFilm(): Promise<Film | null> {
  try {
    const recommendedFilms = await db
      .select()
      .from(film)
      .orderBy(desc(film.rank))
      .limit(10);

    if (recommendedFilms.length === 0) {
      throw new Error("No films available.");
    }

    const randomIndex = Math.floor(Math.random() * recommendedFilms.length);
    return recommendedFilms[randomIndex];
  } catch (error) {
    console.error("Failed to fetch recommended films:", error);
    return null;
  }
}

export default function FilmVideo({ isMobile }: FilmVideoProps) {
  const { user } = useUser();  
  const [data, setData] = useState<Film | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const userRatings = { [1]: 4 };  
  const averageRatings = { [1]: 4.5 };  
  const setUserRating = (rating: number) => {
    console.log("User rating set to:", rating);
  };
  const markAsWatched = (userId: string, filmId: number) => {
    console.log("User", userId, "marked film", filmId, "as watched.");
  };
  const userId = user?.id || "";  

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const filmData = await getRecommendedFilm();
        if (!filmData) {
          setError("No films available at the moment.");
        } else {
          setData(filmData);
          setError(null);
        }
      } catch (err) {
        setError("Failed to load featured film.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    setIsMuted((prev) => !prev);
  };

  // Professional loading state
  if (loading) {
    return (
      <div className="h-[55vh] lg:h-[60vh] w-full relative overflow-hidden bg-black">
        {/* Background shimmer effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 animate-pulse"></div>
        
        {/* Vertical gradient overlay */}
        <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black"></div>
        
        {/* Content skeleton loader */}
        <div className="absolute bottom-24 left-8 md:left-12 lg:left-16 w-[90%] lg:w-[40%]">
          {/* Title skeleton */}
          <div className="h-12 w-3/4 bg-gray-700 rounded-lg mb-6 animate-pulse"></div>
          
          {/* Description skeleton lines */}
          <div className="space-y-3">
            <div className="h-4 bg-gray-700 rounded w-full animate-pulse"></div>
            <div className="h-4 bg-gray-700 rounded w-5/6 animate-pulse"></div>
            <div className="h-4 bg-gray-700 rounded w-4/6 animate-pulse"></div>
          </div>
          
          {/* Buttons skeleton */}
          <div className="flex gap-x-3 mt-8">
            <div className="h-10 w-24 bg-gray-700 rounded-full animate-pulse"></div>
            <div className="h-10 w-24 bg-gray-700 rounded-full animate-pulse"></div>
            <div className="h-10 w-10 bg-gray-700 rounded-full animate-pulse"></div>
          </div>
        </div>
        
        {/* Loading indicator */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="w-16 h-16 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin mb-4"></div>
          <p className="text-gray-300 text-lg font-medium">Loading featured film...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className="h-[55vh] lg:h-[60vh] w-full flex flex-col justify-center items-center bg-gray-900">
        <svg 
          className="w-16 h-16 text-gray-500 mb-4" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24" 
          xmlns="http://www.w3.org/2000/svg"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
          />
        </svg>
        <p className="text-white text-xl font-medium">{error || "No films available at the moment."}</p>
        <button 
          className="mt-6 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  // Mobile-optimized dimensions and layout
  const videoHeight = isMobile ? "h-[80vh]" : "h-[100vh]";
  const contentWidth = isMobile ? "w-full" : "w-[90%] lg:w-[40%]";

  return (
    <div className="h-[55vh] lg:h-[60vh] w-full flex justify-start items-center">
      <video
        ref={videoRef}
        poster={data.imageUrl}
        autoPlay
        muted={isMuted}
        loop
        src={data.trailerUrl}
        className={`w-full absolute top-0 left-0 ${videoHeight} object-cover -z-10 brightness-[45%]`}
      ></video>
      <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black"></div>
      <div className={`absolute ${contentWidth} mx-auto`}>
        <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-bold" style={{ opacity: 0.85 }}>
          {data.title}
        </h1>
        <p className="text-white text-lg mt-5 line-clamp-3" style={{ opacity: 0.75 }}>
          {data.overview}
        </p>
        <div className="flex gap-x-3 mt-4">
          <FilmButtons
            ageRating={data.ageRating}
            duration={data.duration}
            id={data.id}
            overview={data.overview}
            releaseYear={data.releaseYear}
            title={data.title}
            trailerUrl={data.trailerUrl}
            key={data.id}
            category={data.category}
            isMuted={isMuted}
            toggleMute={toggleMute}
            userRatings={userRatings}  
            averageRatings={averageRatings}  
            setUserRating={setUserRating}
            markAsWatched={markAsWatched}
            userId={userId}
            isMobile={isMobile} 
          />
        </div>
      </div>
    </div>
  );
}