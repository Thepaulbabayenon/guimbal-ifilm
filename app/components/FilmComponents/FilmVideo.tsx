'use client';
import { useState, useEffect, useRef } from "react";
import { db } from "@/app/db/drizzle";
import { film } from "@/app/db/schema";
import { desc } from "drizzle-orm";
import FilmButtons from "./FilmButtons";
import LoadingState from "../loading"; // Import the loading state component

interface Film {
  id: number;
  imageString: string;
  title: string;
  age: number;
  duration: number;
  overview: string;
  release: number;
  videoSource: string;
  category: string;
  trailer: string;
  createdAt: Date;
  rank: number;
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
  const [data, setData] = useState<Film | null>(null);
  const [isMuted, setIsMuted] = useState(true);
  const [isLoading, setIsLoading] = useState(true); // State to handle loading
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const userRatings = { [1]: 4 };  // Example: Assuming the film ID is 1
  const averageRatings = { [1]: 4.5 };  // Example: Assuming the film ID is 1
  const setUserRating = (rating: number) => {
    console.log("User rating set to:", rating);
  };
  const markAsWatched = (userId: string, filmId: number) => {
    console.log("User", userId, "marked film", filmId, "as watched.");
  };
  const userId = "user123";  // Example user ID

  useEffect(() => {
    const fetchData = async () => {
      const filmData = await getRecommendedFilm();
      setData(filmData);
      setIsLoading(false); // End loading state when data is fetched
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
    return <LoadingState />; // Display loading state while fetching data
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
        poster={data.imageString}
        autoPlay
        muted={isMuted}
        loop
        src={data.videoSource}
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
            age={data.age}
            duration={data.duration}
            id={data.id}
            overview={data.overview}
            releaseDate={data.release}
            title={data.title}
            trailerUrl={data.trailer}
            key={data.id}
            category={data.category}
            isMuted={isMuted}
            toggleMute={toggleMute}
            userRatings={userRatings}  // Pass the updated ratings
            averageRatings={averageRatings}  // Pass the updated ratings
            setUserRating={setUserRating}
            markAsWatched={markAsWatched}
            userId={userId}  // Pass the user ID
          />
        </div>
      </div>
    </div>
  );
}


