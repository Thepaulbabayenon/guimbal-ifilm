import { useState, useEffect, useRef } from "react";  // Import hooks here
import { db } from "@/db/drizzle";
import { film } from "@/db/schema"; // Ensure this import is correct
import { desc } from "drizzle-orm"; // Correct sorting utility
import FilmButtons from "./FilmButtons";

// Define Film interface to match the shape of the data
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
  youtubeString: string;
  createdAt: Date;
  rank: number;
}

// Function to fetch recommended films
async function getRecommendedFilm(): Promise<Film | null> {
  try {
    const recommendedFilms = await db
      .select()
      .from(film)
      .orderBy(desc(film.rank)) // Correct column reference
      .limit(10);

    if (recommendedFilms.length === 0) {
      throw new Error("No films available.");
    }

    // Select a random film from the top 10
    const randomIndex = Math.floor(Math.random() * recommendedFilms.length);
    return recommendedFilms[randomIndex];
  } catch (error) {
    console.error("Failed to fetch recommended films:", error);
    return null;
  }
}

export default function FilmVideo() {
  const [data, setData] = useState<Film | null>(null);  // Type the state as Film or null
  const [isMuted, setIsMuted] = useState(true); // Mute state for video
  const videoRef = useRef<HTMLVideoElement | null>(null); // Reference to video element

  useEffect(() => {
    // Fetch film data when the component mounts
    const fetchData = async () => {
      const filmData = await getRecommendedFilm();
      setData(filmData);  // Set the fetched film data
    };

    fetchData();  // Call the async function to fetch data
  }, []);  // Empty dependency array ensures it runs once on mount

  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted; // Toggle mute on video
    }
    setIsMuted((prev) => !prev); // Update the mute state
  };

  // If no data is available, show a fallback UI
  if (!data) {
    return (
      <div className="h-[55vh] lg:h-[60vh] w-full flex justify-center items-center">
        <p className="text-white text-xl">No films available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="h-[55vh] lg:h-[60vh] w-full flex justify-start items-center">
      {/* Video element */}
      <video
        ref={videoRef}
        poster={data.imageString}
        autoPlay
        muted={isMuted}
        loop
        src={data.videoSource}
        className="w-full absolute top-0 left-0 h-[60vh] object-cover -z-10 brightness-[60%]"
      ></video>

      <div className="absolute w-[90%] lg:w-[40%] mx-auto">
        <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-bold">{data.title}</h1>
        <p className="text-white text-lg mt-5 line-clamp-3">{data.overview}</p>
        <div className="flex gap-x-3 mt-4">
          <FilmButtons
            age={data.age}
            duration={data.duration}
            id={data.id}
            overview={data.overview}
            releaseDate={data.release}
            title={data.title}
            youtubeUrl={data.youtubeString}
            key={data.id}
            category={data.category}
            isMuted={isMuted} // Pass mute state
            toggleMute={toggleMute} // Pass toggle mute function
          />
        </div>
      </div>
    </div>
  );
}
