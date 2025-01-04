"use client";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Heart, PlayCircle, Star } from "lucide-react";
import PlayVideoModal from "./PlayVideoModal";
import { usePathname } from "next/navigation";
import axios from "axios";
import { useUser } from "@clerk/nextjs";

interface FilmCardProps {
  filmId: number;
  overview: string;
  title: string;
  watchList: boolean;
  watchListId?: string;
  youtubeUrl: string;
  year: number;
  age: number;
  time: number;
  initialRatings: number;
  category: string;
  onClick: () => void; // Add onClick prop to FilmCardProps
}

export function FilmCard({
  filmId,
  overview,
  title,
  watchList: initialWatchList,
  watchListId,
  youtubeUrl,
  year,
  age,
  time,
  initialRatings,
  category,
  onClick, // Destructure onClick from props
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

    setWatchList((prev) => !prev);
    setIsSavingWatchlist(true);

    try {
      if (watchList) {
        await axios.delete(`/api/watchlist/${watchListId}`, { data: { userId } });
      } else {
        await axios.post("/api/watchlist", { filmId, pathname: pathName, userId });
      }
    } catch (error) {
      console.error("Error toggling watchlist:", error);
      setWatchList((prev) => !prev);
    } finally {
      setIsSavingWatchlist(false);
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
      <button onClick={onClick} className="-mt-14"> {/* Use the onClick prop here */}
        <PlayCircle className="h-20 w-20" />
      </button>

      <div className="right-5 top-5 absolute z-10">
        <Button variant="outline" size="icon" onClick={handleToggleWatchlist} disabled={isSavingWatchlist || loading}>
          <Heart className={`w-4 h-4 ${watchList ? "text-red-500" : ""}`} />
        </Button>
      </div>

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
                <Star key={index} className="w-4 h-4 text-gray-300 animate-pulse" />
              ))}
            </div>
            <div className="bg-gray-300 animate-pulse w-48 h-4 rounded"></div>
            <div className="bg-gray-300 animate-pulse w-32 h-4 rounded"></div>
          </div>
        ) : (
          <>
            <h1 className="font-bold text-lg line-clamp-1">{title}</h1>
            <div className="flex gap-x-2 items-center">
              <p className="font-normal text-sm">{year}</p>
              <p className="font-normal border py-0.5 px-1 border-gray-200 rounded text-sm">{age}+</p>
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
            <p className="line-clamp-1 text-sm text-gray-200 font-light">{overview}</p>
            <p className="font-normal text-sm mt-2">
              Average Rating: {isNaN(safeAverageRating) ? "N/A" : safeAverageRating.toFixed(2)} / 5
            </p>
          </>
        )}
      </div>

      <PlayVideoModal
        youtubeUrl={youtubeUrl}
        key={filmId}
        title={title}
        overview={overview}
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