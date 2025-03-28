"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CiHeart, CiPlay1, CiStar } from "react-icons/ci";
import { usePathname } from "next/navigation";
import axios from "axios";
import { AxiosError } from "axios"; 
import { useAuth } from "@/app/auth/nextjs/useUser";

interface FilmCardProps {
  filmId: number;
  overview: string;
  title: string;
  trailerUrl?: string; 
  releaseYear: number;
  ageRating?: number;
  time?: number;
  initialRatings: number;
  category?: string;
  onOpenModal?: () => void;
  onCloseModal?: () => void;
  watchList?: boolean;
}

export function FilmCard({
  filmId,
  overview,
  title,
  releaseYear,
  ageRating,
  time,
  initialRatings,
  onOpenModal,
  onCloseModal, // Receive the onCloseModal prop
}: FilmCardProps) {
  
  const auth = useAuth();
  const userId = auth?.user?.id;
  const getToken = auth?.getToken;

  // Component state
  const [open, setOpen] = useState(false);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [watchlistId, setWatchlistId] = useState<string | null>(null);
  const [userRating, setUserRating] = useState<number>(0);
  const [averageRating, setAverageRating] = useState<number>(initialRatings);
  const [isSavingWatchlist, setIsSavingWatchlist] = useState(false);
  const [isSavingRating, setIsSavingRating] = useState(false);
  const [loading, setLoading] = useState(true);
  const pathName = usePathname();

  // Fetch watchlist status and user data on component mount
  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        // Fetch watchlist status using the new API endpoint
        const watchlistResponse = await axios.get(`/api/films/${filmId}/watchlist`, { 
          params: { userId } 
        });

        if (watchlistResponse.data) {
          setInWatchlist(watchlistResponse.data.inWatchlist);
          setWatchlistId(watchlistResponse.data.watchListId);
        }
        
        // Fetch user's rating
        const ratingResponse = await axios.get(`/api/films/${filmId}/user-rating`, { 
          params: { userId } 
        });

        if (ratingResponse.data && ratingResponse.data.rating !== undefined) {
          setUserRating(ratingResponse.data.rating);
        }

        // Fetch average rating
        const avgResponse = await axios.get(`/api/films/${filmId}/average-rating`);
        if (avgResponse.data && avgResponse.data.averageRating !== undefined) {
          setAverageRating(avgResponse.data.averageRating);
        } else {
          setAverageRating(initialRatings);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setAverageRating(initialRatings);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [filmId, initialRatings, userId]);

  // Mark film as watched
  const markAsWatched = async (userId: string, filmId: number) => {
    try {
      if (!userId) {
        console.error("User ID is not available.");
        return;
      }

      await axios.post(
        `/api/films/${filmId}/watched-films`, 
        { userId, filmId }, 
        { headers: { "Content-Type": "application/json" } }
      );
      console.log(`Film ${filmId} marked as watched for user ${userId}`);
    } catch (error) {
      console.error("Error marking film as watched:", error);
    }
  };

  // Save user rating when changed
  useEffect(() => {
    if (!userId || userRating === 0) return;

    const saveUserRating = async () => {
      try {
        setIsSavingRating(true);
        
        // Save user rating
        await axios.post(
          `/api/films/${filmId}/user-rating`, 
          { userId, rating: userRating }, 
          { headers: { "Content-Type": "application/json" } }
        );

        // Update average rating
        const avgResponse = await axios.get(`/api/films/${filmId}/average-rating`);
        if (avgResponse.data && avgResponse.data.averageRating !== undefined) {
          setAverageRating(avgResponse.data.averageRating);
        }
      } catch (error) {
        console.error("Error saving user rating:", error);
      } finally {
        setIsSavingRating(false);
      }
    };

    saveUserRating();
  }, [userRating, filmId, userId]);

const handleToggleWatchlist = async (e: React.MouseEvent<HTMLButtonElement>) => {
  e.preventDefault();
  e.stopPropagation(); // Prevent event bubbling

  if (!userId) {
    alert("Please log in to manage your watchlist.");
    return;
  }

  setIsSavingWatchlist(true);
  const previousWatchlistState = inWatchlist;

  try {
    // Optimistic UI update
    setInWatchlist(!previousWatchlistState);

    if (previousWatchlistState) {
      // Remove from watchlist using the filmId directly in the URL
      // This matches your existing route structure
      await axios.delete(`/api/watchlist/${filmId}`);
      
      // Reset the watchlist ID
      setWatchlistId(null);
    } else {
      // Add to watchlist
      const response = await axios.post('/api/watchlist', {
        userId,
        filmId
      });
      
      if (response.data && response.data.success) {
        console.log("Successfully added to watchlist");
      }
    }
  } catch (error) {
    // Rollback on error
    setInWatchlist(previousWatchlistState);
    const axiosError = error as AxiosError;
    
    console.error("Watchlist error:", axiosError.response?.data || error);
    alert(`Failed: ${(axiosError.response?.data as any)?.error || "Please try again"}`);
  } finally {
    setIsSavingWatchlist(false);
  }
};

  // Handle rating click
  const handleRatingClick = async (newRating: number) => {
    if (isSavingRating) return;

    if (!userId) {
      alert("Please log in to rate films.");
      return;
    }

    // Optimistic UI update
    setUserRating(newRating);

    try {
      setIsSavingRating(true);
      
      // Save the rating
      await axios.post(
        `/api/films/${filmId}/user-rating`, 
        { userId, rating: newRating }, 
        { headers: { "Content-Type": "application/json" } }
      );

      // Update average rating
      const avgResponse = await axios.get(`/api/films/${filmId}/average-rating`);
      if (avgResponse.data && avgResponse.data.averageRating !== undefined) {
        setAverageRating(avgResponse.data.averageRating);
      }
    } catch (error) {
      console.error("Error saving user rating:", error);
    } finally {
      setIsSavingRating(false);
    }
  };

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

  // Render film details
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
              onClick={() => handleRatingClick(star)}
            />
          ))}
        </div>
      </div>
      <p className="line-clamp-1 text-sm text-gray-200 font-light">{overview}</p>
      <p className="font-normal text-sm mt-2">
        Average Rating: {isNaN(safeAverageRating) ? "N/A" : safeAverageRating.toFixed(2)} / 5
      </p>
    </>
  );

  // Handle modal state changes
  const handleOpenModal = () => {
    setOpen(true);
    if (userId) markAsWatched(userId, filmId);
    if (onOpenModal) onOpenModal();
  };

  const handleCloseModal = () => {
    setOpen(false);
    if (onCloseModal) onCloseModal(); // Call the onCloseModal prop function
  };

  // Make this component aware of modal close events
  useEffect(() => {
    // This effect manages the modal open state
    return () => {
      // Clean up video playback when component unmounts
      if (open) {
        handleCloseModal();
      }
    };
  }, []);

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