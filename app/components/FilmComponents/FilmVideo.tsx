'use client';
import { useState, useEffect, useRef } from "react";
import { db } from "@/app/db/drizzle";
import { film } from "@/app/db/schema";
import { desc } from "drizzle-orm";
import FilmButtons from "./FilmButtons";
import LoadingState from "../loading"; 
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

export default function FilmVideo() {
  const { user } = useUser();  
  const [data, setData] = useState<Film | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true); 
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
      const filmData = await getRecommendedFilm();
      setData(filmData);
      setIsLoading(false); 
    };

    fetchData();
  }, []);

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
    }
    setIsMuted((prev) => !prev);
  };

  if (isLoading) {
    return <LoadingState />; 
  }

  if (!data) {
    return (
      <div className="h-[55vh] lg:h-[60vh] w-full flex justify-center items-center">
        <p className="text-white text-xl">No films available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="h-[55vh] lg:h-[60vh] w-full flex justify-start items-center">
      <video
        ref={videoRef}
        poster={data.imageUrl}
        autoPlay
        muted={isMuted}
        loop
        src={data.trailerUrl}
        className="w-full absolute top-0 left-0 h-[100vh] object-cover -z-10 brightness-[45%]"
      ></video>
      <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black"></div>
      <div className="absolute w-[90%] lg:w-[40%] mx-auto">
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
          />
        </div>
      </div>
    </div>
  );
}


