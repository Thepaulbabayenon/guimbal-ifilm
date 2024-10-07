"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, PlayCircle, Star } from "lucide-react";
import PlayVideoModal from "./PlayVideoModal";
import { usePathname } from "next/navigation";
import axios from "axios";
import { useUser } from "@clerk/nextjs";

interface MovieCardProps {
  movieId: number;
  overview: string;
  title: string;
  watchList: boolean;
  watchListId?: string;
  youtubeUrl: string;
  year: number;
  age: number;
  time: number;
  ratings: number; // External ratings (initial ratings)
}

export function MovieCard({
  movieId,
  overview,
  title,
  watchList: initialWatchList,
  watchListId,
  youtubeUrl,
  year,
  age,
  time,
  ratings: initialRatings,
}: MovieCardProps) {
  const { user } = useUser();
  const userId = user?.id;

  const [open, setOpen] = useState(false);
  const [watchList, setWatchList] = useState(initialWatchList);
  const [userRating, setUserRating] = useState<number>(initialRatings); // This will be updated based on backend data
  const [isSavingWatchlist, setIsSavingWatchlist] = useState(false); // State to track if we're saving watchlist
  const [isSavingRating, setIsSavingRating] = useState(false); // State to track if we're saving rating
  const pathName = usePathname();

  // Fetch user rating from the backend when the component mounts
  useEffect(() => {
    if (!userId) return; // Exit if user is not authenticated

    const fetchRating = async () => {
      try {
        const response = await axios.get(`/api/movies/${movieId}/user-rating`, {
          params: { userId },
        });
        // If the API returns a valid rating, use it; otherwise, fallback to initialRatings
        if (response.data && response.data.rating !== undefined) {
          setUserRating(response.data.rating);
        } else {
          setUserRating(initialRatings);
        }
      } catch (error) {
        console.error("Error fetching rating from the database:", error);
        setUserRating(initialRatings); // Fallback to initial rating in case of error
      }
    };

    fetchRating();
  }, [movieId, initialRatings, userId]);

  // Save user rating to the userInteractions table when userRating changes
  useEffect(() => {
    if (!userId) return; // Exit if user is not authenticated

    const saveUserInteraction = async () => {
      try {
        setIsSavingRating(true);
        await axios.post(`/api/movies/${movieId}/user-rating`, {
          userId,
          ratings: userRating,
        }, {
          headers: { 'Content-Type': 'application/json' },
        });
      } catch (error) {
        console.error("Error saving user interaction:", error);
      } finally {
        setIsSavingRating(false);
      }
    };

    // Only save if the user rating has changed
    if (userRating !== initialRatings) {
      saveUserInteraction();
    }
  }, [userRating, initialRatings, movieId, userId]);

  // Handle watchlist toggle
  const handleToggleWatchlist = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();

    if (!userId) {
      // Optionally, prompt the user to log in
      alert("Please log in to manage your watchlist.");
      return;
    }

    // Optimistically update UI
    setWatchList((prev) => !prev);
    setIsSavingWatchlist(true);

    try {
      if (watchList) {
        // Remove from watchlist
        await axios.delete(`/api/watchlist/${watchListId}`, {
          data: { userId }, // Some servers require data in DELETE requests
        });
      } else {
        // Add to watchlist
        await axios.post('/api/watchlist', {
          movieId,
          pathname: pathName,
          userId,
        });
      }
    } catch (error) {
      console.error("Error toggling watchlist:", error);
      // Revert watchlist change if there's an error
      setWatchList((prev) => !prev);
      alert("Failed to update watchlist. Please try again.");
    } finally {
      setIsSavingWatchlist(false);
    }
  };

  // Handle rating toggle
  const handleRatingClick = async (newRating: number) => {
    if (isSavingRating) return; // Prevent multiple submissions
    if (!userId) {
      // Optionally, prompt the user to log in
      alert("Please log in to rate movies.");
      return;
    }

    setUserRating(newRating); // Optimistically update the rating

    try {
      setIsSavingRating(true);
      await axios.post(`/api/movies/${movieId}/user-rating`, {
        userId,
        ratings: newRating,
      }, {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error("Error saving user interaction:", error);
      // Optionally revert the rating change if there's an error
      setUserRating(initialRatings);
      alert("Failed to save rating. Please try again.");
    } finally {
      setIsSavingRating(false);
    }
  };

  return (
    <>
      <button onClick={() => setOpen(true)} className="-mt-14">
        <PlayCircle className="h-20 w-20" />
      </button>

      <div className="right-5 top-5 absolute z-10">
        <Button variant="outline" size="icon" onClick={handleToggleWatchlist} disabled={isSavingWatchlist}>
          <Heart className={`w-4 h-4 ${watchList ? "text-red-500" : ""}`} />
        </Button>
      </div>

      <div className="p-5 absolute bottom-0 left-0">
        <h1 className="font-bold text-lg line-clamp-1">{title}</h1>
        <div className="flex gap-x-2 items-center">
          <p className="font-normal text-sm">{year}</p>
          <p className="font-normal border py-0.5 px-1 border-gray-200 rounded text-sm">
            {age}+
          </p>
          <p className="font-normal text-sm">{time}m</p>
          <div className="flex items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <Star
                key={star}
                className={`w-4 h-4 cursor-pointer ${userRating >= star ? "text-yellow-400" : "text-gray-400"}`}
                onClick={() => handleRatingClick(star)}
              />
            ))}
          </div>
        </div>
        <p className="line-clamp-1 text-sm text-gray-200 font-light">
          {overview}
        </p>
      </div>

      <PlayVideoModal
        youtubeUrl={youtubeUrl}
        key={movieId}
        title={title}
        overview={overview}
        state={open}
        changeState={setOpen}
        age={age}
        duration={time}
        release={year}
        ratings={userRating}
        setUserRating={setUserRating}
      />
    </>
  );
}
