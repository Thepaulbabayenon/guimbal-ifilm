'use client';
import { useState, useEffect, useRef, useCallback } from "react";
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
  isMobile?: boolean;
}

// Add a props interface for the FilmVideo component itself
interface FilmVideoProps {
  isMobile?: boolean;
}

// Define a proper NetworkConnection interface to fix the type errors
interface NetworkConnection {
  effectiveType: string;
  addEventListener: (type: string, listener: EventListener) => void;
  removeEventListener: (type: string, listener: EventListener) => void;
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
  const [networkType, setNetworkType] = useState<string>("unknown");
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [shouldPlayVideo, setShouldPlayVideo] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const videoContainerRef = useRef<HTMLDivElement | null>(null);

  const userRatings = { [1]: 4 };  
  const averageRatings = { [1]: 4.5 };  
  const setUserRating = (rating: number) => {
    console.log("User rating set to:", rating);
  };
  const markAsWatched = (userId: string, filmId: number) => {
    console.log("User", userId, "marked film", filmId, "as watched.");
  };
  const userId = user?.id || "";

  // Detect network conditions
  useEffect(() => {
    // Get initial connection type
    if ('connection' in navigator) {
      const nav = navigator as Navigator & { connection: NetworkConnection };
      setNetworkType(nav.connection?.effectiveType || "unknown");
      
      // Listen for changes
      const connectionAPI = nav.connection;
      const updateNetworkStatus = () => {
        setNetworkType(connectionAPI.effectiveType || "unknown");
      };
      
      if (connectionAPI) {
        connectionAPI.addEventListener('change', updateNetworkStatus);
        return () => connectionAPI.removeEventListener('change', updateNetworkStatus);
      }
    }
  }, []);

  // Video playback strategy based on network and viewport visibility
  const startVideoPlayback = useCallback(() => {
    if (videoRef.current && !shouldPlayVideo) {
      setShouldPlayVideo(true);
      
      // Only play video if viewport is visible and network isn't slow
      if (networkType !== "slow-2g" && networkType !== "2g") {
        videoRef.current.play().catch(err => console.log("Auto-play prevented:", err));
      }
    }
  }, [networkType, shouldPlayVideo]);

  // Intersection Observer for lazy loading
  useEffect(() => {
    if (!videoContainerRef.current || !data) return;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          startVideoPlayback();
        } else if (videoRef.current) {
          // Pause when not visible to save resources
          videoRef.current.pause();
        }
      });
    }, { threshold: 0.25 });
    
    observer.observe(videoContainerRef.current);
    
    return () => {
      observer.disconnect();
    };
  }, [data, startVideoPlayback]);

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

  // Choose video quality based on network conditions
  const getVideoQuality = () => {
    if (!data) return "";
    
    // This assumes you have different quality sources available
    // In a real implementation, you would have different URLs for different qualities
    switch(networkType) {
      case 'slow-2g':
      case '2g':
        return data.imageUrl; // Just show poster image on very slow connections
      case '3g':
        return data.trailerUrl; // Assume this is a lower quality version
      default:
        return data.trailerUrl;
    }
  };

  // Optimized loading state for mobile
  if (loading) {
    return (
      <div className="h-[55vh] lg:h-[60vh] w-full relative overflow-hidden bg-black">
        {/* Simplified loading state for mobile */}
        <div className="absolute inset-0 bg-gray-900"></div>
        
        {/* Minimal loading indicator */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="w-10 h-10 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin mb-3"></div>
          <p className="text-gray-300 text-base font-medium">Loading...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !data) {
    return (
      <div className="h-[50vh] lg:h-[60vh] w-full flex flex-col justify-center items-center bg-gray-900">
        <svg 
          className="w-12 h-12 text-gray-500 mb-3" 
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
        <p className="text-white text-lg font-medium">{error || "No films available."}</p>
        <button 
          className="mt-4 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full transition-colors"
          onClick={() => window.location.reload()}
        >
          Retry
        </button>
      </div>
    );
  }

  // Adjust dimensions based on device
  const videoHeight = isMobile ? "h-[50vh]" : "h-[60vh]";
  const contentWidth = isMobile ? "w-[95%]" : "w-[90%] lg:w-[40%]";
  const titleSize = isMobile ? "text-3xl" : "text-4xl md:text-5xl lg:text-6xl";
  const overviewLines = isMobile ? "line-clamp-2" : "line-clamp-3";
  const overviewSize = isMobile ? "text-base" : "text-lg";

  return (
    <div 
      ref={videoContainerRef}
      className={`${videoHeight} w-full relative overflow-hidden flex justify-start items-center`}
    >
      {/* Optimized poster image that appears immediately */}
      <div 
        className={`w-full absolute top-0 left-0 ${videoHeight} bg-cover bg-center -z-20`} 
        style={{ backgroundImage: `url(${data.imageUrl})`, filter: 'brightness(45%)' }}
      />
      
      {/* Conditionally render video based on network */}
      {networkType !== "slow-2g" && (
        <video
          ref={videoRef}
          poster={data.imageUrl}
          preload={isMobile ? "metadata" : "auto"}
          muted={isMuted}
          loop
          playsInline
          className={`w-full absolute top-0 left-0 ${videoHeight} object-cover -z-10 brightness-[45%] ${isVideoLoaded ? 'opacity-100' : 'opacity-0'} transition-opacity duration-300`}
          onCanPlay={() => setIsVideoLoaded(true)}
          onLoadedData={() => setIsVideoLoaded(true)}
        >
          <source src={getVideoQuality()} type="video/mp4" />
        </video>
      )}
      
      {/* Gradient overlay */}
      <div className="absolute bottom-0 left-0 w-full h-full bg-gradient-to-b from-transparent to-black"></div>
      
      {/* Content */}
      <div className={`absolute bottom-6 md:bottom-10 left-4 md:left-8 ${contentWidth}`}>
        <h1 className={`text-white ${titleSize} font-bold`} style={{ opacity: 0.9 }}>
          {data.title}
        </h1>
        <p className={`text-white ${overviewSize} mt-2 md:mt-4 ${overviewLines}`} style={{ opacity: 0.8 }}>
          {data.overview}
        </p>
        <div className="flex flex-wrap gap-2 md:gap-x-3 mt-3 md:mt-4">
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
      
      {/* Connection quality indicator for low bandwidth */}
      {(networkType === "slow-2g" || networkType === "2g") && (
        <div className="absolute top-2 right-2 bg-black bg-opacity-60 px-2 py-1 rounded text-xs text-yellow-400 flex items-center">
          <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z"/>
          </svg>
          Low bandwidth mode
        </div>
      )}
    </div>
  );
}