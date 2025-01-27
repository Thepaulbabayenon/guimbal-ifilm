"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { CiStar, CiPlay1, CiHeart } from "react-icons/ci";
import PlayVideoModal from "../PlayVideoModal";
import { usePathname } from "next/navigation";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { Spinner } from "react-bootstrap";

interface FilmCardProps {
  filmId: number;
  overview: string;
  title: string;
  watchList: boolean;
  watchListId?: string;
  trailerUrl: string;
  year: number;
  age: number;
  time: number;
  initialRatings: number;
  category: string;
}

export function FilmCard({
  filmId,
  overview,
  title,
  watchList: initialWatchList,
  watchListId,
  trailerUrl,
  year,
  age,
  time,
  initialRatings,
  category,
}: FilmCardProps) {
  const { user } = useUser();
  const userId = user?.id;

  const [open, setOpen] = useState(false);
  const [watchList, setWatchList] = useState(initialWatchList);
  const [userRating, setUserRating] = useState<number>(0);
  const [averageRating, setAverageRating] = useState<number>(initialRatings);
  const [isSavingWatchlist, setIsSavingWatchlist] = useState(false);
  const [isSavingRating, setIsSavingRating] = useState(false);
  const [loading, setLoading] = useState(true); // State for overall loading
  const pathName = usePathname();

  // Fetch current watchlist state when the component mounts
  useEffect(() => {
    if (!userId) return;

    const checkIfInWatchlist = async () => {
      try {
        const response = await axios.get(`/api/watchlist`, {
          params: { userId, filmId },
        });

        // Check if the filmId exists in the watchlist
        if (response.data?.isInWatchlist) {
          setWatchList(true); // Set watchlist state to true if the film is in the watchlist
        } else {
          setWatchList(false); // Set watchlist state to false if the film is not in the watchlist
        }
      } catch (error) {
        console.error("Error fetching watchlist data:", error);
      }
    };

    checkIfInWatchlist();
  }, [userId, filmId]);

  // Function to mark a film as watched
  const markAsWatched = async (userId: string, filmId: number) => {
    try {
      if (!userId) {
        console.error("User ID is not available.");
        return;
      }

      await axios.post(`/api/films/${filmId}/watchedFilms`, { userId, filmId }, { headers: { "Content-Type": "application/json" } });
      console.log(`Film ${filmId} marked as watched for user ${userId}`);
    } catch (error) {
      console.error("Error marking film as watched:", error);
    }
  };

  // Fetch user rating and average rating when the component mounts
  useEffect(() => {
    if (!userId) return;

    const fetchRatings = async () => {
      try {
        const response = await axios.get(`/api/films/${filmId}/user-rating`, { params: { userId } });

        if (response.data && response.data.rating !== undefined) {
          setUserRating(response.data.rating);
        }

        const avgResponse = await axios.get(`/api/films/${filmId}/average-rating`);
        if (avgResponse.data && avgResponse.data.averageRating !== undefined) {
          setAverageRating(avgResponse.data.averageRating);
        } else {
          setAverageRating(initialRatings);
        }

        setLoading(false); // Set loading to false once data is fetched
      } catch (error) {
        console.error("Error fetching ratings from the database:", error);
        setAverageRating(initialRatings);
        setLoading(false); // Set loading to false even in case of error
      }
    };

    fetchRatings();
  }, [filmId, initialRatings, userId]);

  // Save user rating to the database when it changes
  useEffect(() => {
    if (!userId || userRating === 0) return;

    const saveUserRating = async () => {
      try {
        setIsSavingRating(true);
        await axios.post(`/api/films/${filmId}/user-rating`, { userId, rating: userRating }, { headers: { "Content-Type": "application/json" } });

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

  // Handle watchlist toggle
  const handleToggleWatchlist = async (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
  
    if (!userId) {
      alert("Please log in to manage your watchlist.");
      return;
    }
  
    console.log("Toggling watchlist for user:", userId, "FilmId:", filmId, "Current pathname:", pathName);
  
    setIsSavingWatchlist(true); // Set saving state to true
  
    try {
      if (watchList) {
        // If already in the watchlist, delete it
        if (watchListId) {
          console.log("Deleting from watchlist...");
          await axios.delete(`/api/watchlist/${watchListId}?userId=${userId}`);
          setWatchList(false); // Remove from watchlist
        } else {
          console.error("No watchListId available to delete");
        }
      } else {
        // If not in the watchlist, add it
        console.log("Adding to watchlist...");
        await axios.post("/api/watchlist", {
          filmId,
          pathname: pathName,
          userId,
        });
        setWatchList(true); // Add to watchlist
      }
    } catch (error) {
      console.error("Error toggling watchlist:", error);
      setWatchList((prev) => !prev); // Revert to the previous state in case of error
    } finally {
      console.log("Toggling finished. Resetting isSavingWatchlist to false.");
      setIsSavingWatchlist(false); // Reset the saving state
    }
  };
  

  // Handle rating click
  const handleRatingClick = async (newRating: number) => {
    if (isSavingRating) {
      return;
    }

    if (!userId) {
      alert("Please log in to rate films.");
      return;
    }

    setUserRating(newRating);

    try {
      setIsSavingRating(true);
      await axios.post(`/api/films/${filmId}/user-rating`, { userId, rating: newRating }, { headers: { "Content-Type": "application/json" } });

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

  // Ensure averageRating is a valid number before calling toFixed
  const safeAverageRating = typeof averageRating === "number" && !isNaN(averageRating) ? averageRating : NaN;

  return (
    <>
      {/* Play Button */}
      <button
        onClick={() => setOpen(true)}
        className="-mt-14 play-button" // Add a specific class for hover effect
      >
        <CiPlay1 className="h-20 w-20 transition-colors duration-300 hover:text-red-500" /> {/* Apply hover color change */}
      </button>

      {/* Watchlist Button */}
      <div className="right-5 top-5 absolute z-50 pointer-events-auto">
      <Button
  variant="outline"
  size="icon"
  onClick={handleToggleWatchlist}
  disabled={isSavingWatchlist || loading}
>
  {isSavingWatchlist ? <Spinner /> : <CiHeart className={`w-4 h-4 ${watchList ? "text-red-500" : ""}`} />}
</Button>

            </div>

      {/* Film Details */}
      <div className="p-5 absolute bottom-0 left-0">
        {loading ? (
          // Skeleton loader for the film card content
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
        ) : (
          <>
            <h1 className="font-bold text-lg line-clamp-1">{title}</h1>
            <div className="flex gap-x-2 items-center">
              <span className="text-sm">{year}</span>
              <span className="text-sm">{age}+ • {time} min</span>
            </div>

            {/* Rating */}
            <div className="flex gap-x-2">
              {Array.from({ length: 5 }).map((_, index) => (
                <CiStar
                  key={index}
                  className={`w-4 h-4 ${
                    safeAverageRating >= index + 1 ? "text-yellow-400" : "text-gray-400"
                  }`}
                />
              ))}
              <span className="text-sm">{safeAverageRating.toFixed(1)}</span>
            </div>
          </>
        )}
      </div>
      {/* PlayVideoModal */}
      <PlayVideoModal
        key={filmId}
        title={title}
        overview={overview}
        trailerUrl={trailerUrl}
        state={open}
        changeState={setOpen}
        age={age}
        duration={time}
        release={year}
        ratings={userRating}
        setUserRating={setUserRating}
        userId={userId || ""}
        filmId={filmId}
        markAsWatched={markAsWatched}
        category={category}
      />
    </>
  );
}
