import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FaStar } from "react-icons/fa";
import Link from "next/link";
import { db } from "@/db/drizzle"; // Adjust the import according to your project structure
import { film } from "@/db/schema"; // Adjust the import according to your project structure
import { eq } from "drizzle-orm"; // Correctly import the eq function

interface PlayVideoModalProps {
  title: string;
  overview: string;
  youtubeUrl: string;
  state: boolean;
  changeState: (state: boolean) => void;
  release: number;
  age: number;
  duration: number;
  ratings: number;
  category: string; // Assuming category is a string now
  setUserRating: (rating: number) => void;
  userId?: string; // Optional User ID
  filmId?: number; // Optional Film ID
  markAsWatched?: (userId: string, filmId: number) => void; // Optional function
  watchTimerDuration?: number; // Optional watch timer duration in milliseconds
}

export default function PlayVideoModal({
  changeState,
  overview,
  state,
  title,
  youtubeUrl,
  age,
  duration,
  release,
  ratings,
  category, // Using category instead of genre
  setUserRating,
  userId,
  filmId,
  markAsWatched,
  watchTimerDuration = 30000, // Default timer of 30 seconds
}: PlayVideoModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [hasWatched, setHasWatched] = useState(false); // Track if the film is marked as watched
  const [loading, setLoading] = useState(true); // Loading state for iframe
  const [similarMovies, setSimilarMovies] = useState<any[]>([]); // State for similar movies
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const toggleFullscreen = () => {
    if (!isFullscreen && iframeRef.current) {
      iframeRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (isFullscreen && document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const modifiedYoutubeUrl = youtubeUrl.replace("watch?v=", "embed/");

  const handleRatingClick = (rating: number) => {
    setUserRating(rating);
  };

  useEffect(() => {
    // Fetch similar movies based on the current movie's category
    const fetchSimilarMovies = async () => {
      const similarMovies = await db
        .select()
        .from(film)
        .where(eq(film.category, category)) // Correct usage of eq with two arguments
        .limit(5);  // Limit the results to 5
      setSimilarMovies(similarMovies);
    };

    if (category) {
      fetchSimilarMovies();
    }

    if (state && !hasWatched && userId && filmId && markAsWatched) {
      timerRef.current = setTimeout(() => {
        markAsWatched(userId, filmId);
        setHasWatched(true); // Mark as watched locally
      }, watchTimerDuration);
    }

    // Cleanup timer on close or unmount
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [state, hasWatched, markAsWatched, userId, filmId, category, watchTimerDuration]);

  const handleIframeLoad = () => {
    setLoading(false);
    // Automatically go to fullscreen once the iframe has loaded
    if (iframeRef.current) {
      iframeRef.current.requestFullscreen();
      setIsFullscreen(true);
    }
  };

  return (
    <Dialog open={state} onOpenChange={() => changeState(!state)}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="line-clamp-3">{overview}</DialogDescription>
          <div className="flex gap-x-2 items-center">
            <p>{release}</p>
            <p className="border py-0.5 px-1 border-gray-200 rounded">{age}+</p>
            <p className="font-normal text-sm">{duration}h</p>
            <p>⭐ {ratings}</p>
          </div>
        </DialogHeader>

        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="spinner-border animate-spin border-t-4 border-blue-500 rounded-full w-12 h-12"></div>
            </div>
          )}
          <iframe
            ref={iframeRef}
            src={modifiedYoutubeUrl}
            className={`absolute top-0 left-0 w-full h-full ${loading ? "opacity-0" : "opacity-100"}`}
            frameBorder="0"
            allowFullScreen
            title={title}
            loading="lazy"
            onLoad={handleIframeLoad}
          />
        </div>

        <div className="mt-4">
          <h4 className="text-lg font-semibold mb-2">Rate this movie:</h4>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar
                key={star}
                size={24}
                color={(hoverRating || ratings) >= star ? "#FFD700" : "#e4e5e9"}
                onClick={() => handleRatingClick(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="cursor-pointer"
              />
            ))}
          </div>
          {ratings > 0 && (
            <p className="mt-2 text-sm text-gray-600">
              You rated this movie: {ratings} out of 5 stars
            </p>
          )}
        </div>

        <button
          className="absolute top-2 right-2 bg-gray-800 text-white px-2 py-1 rounded-md"
          onClick={toggleFullscreen}
        >
          {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        </button>

        <div className="mt-8">
          <h3 className="text-lg font-semibold">You may also like:</h3>
          <div className="grid grid-cols-2 gap-4 mt-4">
            {similarMovies.map((movie) => (
              <Link
                href={`/films/${movie.id}`} // Adjust URL based on your routing
                key={movie.id}
                className="block p-2 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                <img
                  src={movie.imageString}
                  alt={movie.title}
                  className="w-full h-32 object-cover rounded-md"
                />
                <h4 className="text-sm font-medium mt-2">{movie.title}</h4>
                <p className="text-xs text-gray-500 mt-1">{movie.overview}</p>
              </Link>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
