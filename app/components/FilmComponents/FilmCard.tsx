"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { CiHeart, CiPlay1, CiStar } from "react-icons/ci";
import axios from "axios";
import { AxiosError } from "axios"; 
import { useAuth } from "@/app/auth/nextjs/useUser";

interface FilmCardProps {
  filmId: number;
  overview: string;
  title: string;
  trailerUrl?: string; 
  imageUrl?: string;
  releaseYear: number;
  videoSource?: string;
  ageRating?: number;
  time?: number;
  initialRatings: number;
  category?: string;
  onOpenModal?: (videoSource?: string, trailerUrl?: string) => void;
  onCloseModal?: () => void;
  watchList?: boolean;
}

export function FilmCard({
  filmId,
  overview,
  videoSource,
  title,
  trailerUrl,
  releaseYear,
  ageRating,
  time,
  initialRatings,
  onOpenModal,
  onCloseModal,
}: FilmCardProps) {
  
  const auth = useAuth();
  const userId = auth?.user?.id;
  
  // Component state
  const [open, setOpen] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [watchlistId, setWatchlistId] = useState<string | null>(null);
  const [userRating, setUserRating] = useState<number>(0);
  const [averageRating, setAverageRating] = useState<number>(initialRatings);
  const [isSavingWatchlist, setIsSavingWatchlist] = useState(false);
  const [isSavingRating, setIsSavingRating] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // Use refs to prevent unnecessary re-renders and API calls
  const dataFetchedRef = useRef(false);
  const isMountedRef = useRef(true);
  const saveRatingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Clean up function for component unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      
      if (saveRatingTimeoutRef.current) {
        clearTimeout(saveRatingTimeoutRef.current);
        saveRatingTimeoutRef.current = null;
      }
    };
  }, []);

  // Fetch user data once on component mount with safeguards
  useEffect(() => {
    // Skip if already fetched or no user ID available
    if (dataFetchedRef.current || !userId) {
      if (!userId) setLoading(false);
      return;
    }

    const controller = new AbortController();
    const signal = controller.signal;

    const fetchUserData = async () => {
      try {
        // Use Promise.all with AbortController for cancelability
        const [watchlistResponse, ratingResponse, avgResponse] = await Promise.all([
          axios.get(`/api/films/${filmId}/watchlist`, { 
            params: { userId },
            signal
          }),
          axios.get(`/api/films/${filmId}/user-rating`, { 
            params: { userId },
            signal
          }),
          axios.get(`/api/films/${filmId}/average-rating`, { signal })
        ]);

        // Only update state if component is still mounted
        if (!isMountedRef.current) return;
        
        // Process watchlist data
        if (watchlistResponse.data) {
          setInWatchlist(watchlistResponse.data.inWatchlist);
          setWatchlistId(watchlistResponse.data.watchListId);
        }
        
        // Process user rating
        if (ratingResponse.data && ratingResponse.data.rating !== undefined) {
          setUserRating(ratingResponse.data.rating);
        }

        // Process average rating
        if (avgResponse.data && avgResponse.data.averageRating !== undefined) {
          setAverageRating(avgResponse.data.averageRating);
        } else {
          setAverageRating(initialRatings);
        }
        
        // Mark data as fetched
        dataFetchedRef.current = true;
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error("Error fetching user data:", error);
          if (isMountedRef.current) {
            setAverageRating(initialRatings);
          }
        }
      } finally {
        if (isMountedRef.current) {
          setLoading(false);
        }
      }
    };

    fetchUserData();

    // Clean up function to abort fetch on unmount
    return () => {
      controller.abort();
    };
  }, [filmId, initialRatings, userId]);

  // Mark film as watched - memoized with useCallback to prevent recreating on each render
  const markAsWatched = useCallback(async () => {
    if (!userId || !isMountedRef.current) return;

    try {
      await axios.post(
        `/api/films/${filmId}/watched-films`, 
        { userId, filmId }, 
        { headers: { "Content-Type": "application/json" } }
      );
    } catch (error) {
      console.error("Error marking film as watched:", error);
    }
  }, [userId, filmId]);

  // Save rating with debounce - optimized with useCallback
  const saveRating = useCallback(async (rating: number) => {
    if (!userId || !isMountedRef.current) return;
    
    try {
      setIsSavingRating(true);
      
      // Save user rating
      await axios.post(
        `/api/films/${filmId}/user-rating`, 
        { userId, rating }, 
        { headers: { "Content-Type": "application/json" } }
      );

      // Update average rating only if component is still mounted
      if (isMountedRef.current) {
        const avgResponse = await axios.get(`/api/films/${filmId}/average-rating`);
        if (avgResponse.data && avgResponse.data.averageRating !== undefined) {
          setAverageRating(avgResponse.data.averageRating);
        }
      }
    } catch (error) {
      console.error("Error saving user rating:", error);
    } finally {
      if (isMountedRef.current) {
        setIsSavingRating(false);
      }
    }
  }, [userId, filmId]);

  // Handle rating changes with debounce to prevent excessive API calls
  useEffect(() => {
    if (!userId || userRating === 0) return;

    // Clear any existing timeout
    if (saveRatingTimeoutRef.current) {
      clearTimeout(saveRatingTimeoutRef.current);
    }

    // Set a new timeout to save the rating after a delay
    saveRatingTimeoutRef.current = setTimeout(() => {
      saveRating(userRating);
    }, 500); // 500ms debounce

    // Clean up function
    return () => {
      if (saveRatingTimeoutRef.current) {
        clearTimeout(saveRatingTimeoutRef.current);
      }
    };
  }, [userRating, saveRating, userId]);

  // Toggle watchlist with optimistic UI update
  const handleToggleWatchlist = useCallback(async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation(); // Prevent event bubbling

    if (!userId) {
      alert("Please log in to manage your watchlist.");
      return;
    }

    // Prevent multiple clicks
    if (isSavingWatchlist || !isMountedRef.current) return;
    
    setIsSavingWatchlist(true);
    const previousWatchlistState = inWatchlist;

    try {
      // Optimistic UI update
      setInWatchlist(!previousWatchlistState);

      if (previousWatchlistState) {
        // Remove from watchlist
        await axios.delete(`/api/watchlist/${filmId}`);
        
        // Reset the watchlist ID
        if (isMountedRef.current) {
          setWatchlistId(null);
        }
      } else {
        // Add to watchlist
        await axios.post('/api/watchlist', {
          userId,
          filmId
        });
      }
    } catch (error) {
      // Rollback on error
      if (isMountedRef.current) {
        setInWatchlist(previousWatchlistState);
        
        const axiosError = error as AxiosError;
        console.error("Watchlist error:", axiosError.response?.data || error);
        alert(`Failed: ${(axiosError.response?.data as any)?.error || "Please try again"}`);
      }
    } finally {
      if (isMountedRef.current) {
        setIsSavingWatchlist(false);
      }
    }
  }, [filmId, inWatchlist, isSavingWatchlist, userId]);

  // Handle rating click - prevent actions while saving
  const handleRatingClick = useCallback((newRating: number) => {
    if (isSavingRating || !isMountedRef.current) return;

    if (!userId) {
      alert("Please log in to rate films.");
      return;
    }

    // Update state - the useEffect will handle the API call with debounce
    setUserRating(newRating);
  }, [isSavingRating, userId]);

  // Modal management functions - memoized with useCallback
  const handleOpenModal = useCallback(() => {
    if (!isMountedRef.current) return;
    
    setOpen(true);
    if (userId) markAsWatched();
    
    if (onOpenModal) {
      onOpenModal(videoSource, trailerUrl);
    }
  }, [userId, markAsWatched, onOpenModal, videoSource, trailerUrl]);

  const handleCloseModal = useCallback(() => {
    if (!isMountedRef.current) return;
    
    setOpen(false);
    if (onCloseModal) onCloseModal();
  }, [onCloseModal]);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      // Clean up video playback when component unmounts
      if (open) {
        handleCloseModal();
      }
    };
  }, [open, handleCloseModal]);

  // Format average rating safely
  const safeAverageRating = typeof averageRating === "number" && !isNaN(averageRating) 
    ? averageRating 
    : NaN;

  // Render loading skeleton
  const renderSkeleton = () => (
    <div className="space-y-4">
      <div className="bg-gray-300 animate-pulse w-32 h-6 rounded"></div>
      <div className="flex gap-x-2 items-center">
        <div className="bg-gray-300 animate-pulse w-10 h-4 rounded"></div>
        <div className="bg-gray-300 animate-pulse w-10 h-4 rounded"></div>
        <div className="bg-gray-300 animate-pulse w-10 h-4 rounded"></div>
      </div>
      <div className="flex gap-x-2">
        {Array.from({ length: 5 }).map((_, index) => (
          <CiStar key={index} className="w-4 h-4 text-gray-300 animate-pulse" />
        ))}
      </div>
      <div className="bg-gray-300 animate-pulse w-48 h-4 rounded"></div>
      <div className="bg-gray-300 animate-pulse w-32 h-4 rounded"></div>
    </div>
  );

  // Memoized film details renderer
  const renderFilmDetails = () => (
    <>
      <h1 className="font-bold text-lg line-clamp-1">{title}</h1>
      <div className="flex gap-x-2 items-center">
        <p className="font-normal text-sm">{releaseYear}</p>
        {ageRating && <p className="font-normal border py-0.5 px-1 border-gray-200 rounded text-sm">{ageRating}+</p>}
        {time && <p className="font-normal text-sm">{time}m</p>}
        <div className="flex items-center">
          {[1, 2, 3, 4, 5].map((star) => (
            <CiStar
              key={star}
              className={`w-4 h-4 cursor-pointer ${userRating >= star ? "text-green-400" : "text-gray-400"}`}
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleRatingClick(star);
              }}
            />
          ))}
        </div>
      </div>
      <p className="line-clamp-1 text-sm text-gray-200 font-light">{overview}</p>
      <p className="font-normal text-sm mt-2">
        Average Rating: {isNaN(safeAverageRating) ? "N/A" : safeAverageRating.toFixed(1)} / 5
      </p>
      {videoSource && <p className="font-normal text-xs text-gray-400 mt-1">Source: {videoSource}</p>}
    </>
  );

  return (
    <>
      {/* Play button */}
      <button 
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          handleOpenModal();
        }} 
        className="-mt-14"
        title={videoSource ? `Play ${title} from ${videoSource}` : `Play ${title}`}
      >
        <CiPlay1 className="h-20 w-20 transition-colors duration-300 hover:text-red-500" />
      </button>

      {/* Watchlist Button */}  
      <div className="right-5 top-5 absolute z-10">
        <Button 
          variant="outline" 
          size="icon"
          className="bg-black/50 hover:bg-black/70" 
          onClick={handleToggleWatchlist} 
          disabled={isSavingWatchlist || loading}
        >
          <CiHeart className={`w-6 h-6 ${inWatchlist ? "text-red-500" : "text-white"}`} />
        </Button>
      </div>

      {/* Film Details */}
      <div className="p-5 absolute bottom-0 left-0">
        {loading ? renderSkeleton() : renderFilmDetails()}
      </div>
    </>
  );
}