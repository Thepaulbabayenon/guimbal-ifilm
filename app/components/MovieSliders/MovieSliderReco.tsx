'use client';

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import PlayVideoModal from "../PlayVideoModal";
import Autoplay from "embla-carousel-autoplay";
import { Star } from "lucide-react";
import { FaHeart, FaPlay } from "react-icons/fa";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface Movie {
  id: number;
  title: string;
  age: number;
  duration: number;
  imageString: string;
  overview: string;
  release: number;
  videoSource: string;
  category: string;
  youtubeString: string;
  rank: number;
}

interface MovieSliderRecoProps {
  userId: string;
}

async function fetchRecommendedMovies(userId: string) {
  try {
    const response = await axios.get(`/api/recommendations?userId=${userId}`);
    if (response.status !== 200 || !response.data) {
      throw new Error("Invalid response");
    }
    return response.data;
  } catch (error) {
    console.error("Error fetching recommended movies:", error);
    throw error;
  }
}

export function MovieSliderReco({ userId }: MovieSliderRecoProps) {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [watchList, setWatchList] = useState<{ [key: number]: boolean }>({});
  const [userRatings, setUserRatings] = useState<{ [key: number]: number }>({});
  const [averageRatings, setAverageRatings] = useState<{ [key: number]: number }>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  useEffect(() => {
    async function fetchMovies() {
      try {
        const data = await fetchRecommendedMovies(userId);
        setMovies(data);
      } catch (error) {
        console.error("Error fetching recommended movies:", error);
        setMovies([]);
      }
    }

    if (userId) {
      fetchMovies();
    } else {
      console.warn("User ID is required to fetch recommendations.");
      setMovies([]);
    }
  }, [userId]);

  useEffect(() => {
    if (userId && movies.length > 0) {
      async function fetchDataForMovies() {
        const moviePromises = movies.map(async (movie) => {
          try {
            const [userRatingResponse, avgRatingResponse, watchlistResponse] = await Promise.all([
              axios.get(`/api/movies/${movie.id}/user-rating`, { params: { userId } }),
              axios.get(`/api/movies/${movie.id}/average-rating`),
              axios.get(`/api/watchlist/${movie.id}`, { params: { userId } }),
            ]);

            setUserRatings((prev) => ({
              ...prev,
              [movie.id]: userRatingResponse.data.rating || 0,
            }));
            setAverageRatings((prev) => ({
              ...prev,
              [movie.id]: avgRatingResponse.data.averageRating || 0,
            }));
            setWatchList((prev) => ({
              ...prev,
              [movie.id]: watchlistResponse.data.inWatchlist,
            }));
          } catch (error) {
            console.error(`Error fetching data for movie ID ${movie.id}:`, error);
          }
        });

        await Promise.all(moviePromises);
      }
      fetchDataForMovies();
    }
  }, [movies, userId]);

  const handleToggleWatchlist = async (movieId: number) => {
    if (!userId) {
      toast.warn("Please log in to manage your watchlist.");
      return;
    }

    const isInWatchlist = watchList[movieId];
    try {
      if (isInWatchlist) {
        await axios.delete(`/api/watchlist/${movieId}`, { data: { userId } });
        toast.success("Removed from your watchlist.");
      } else {
        await axios.post("/api/watchlist", { movieId, userId });
        toast.success("Added to your watchlist.");
      }
      setWatchList((prev) => ({ ...prev, [movieId]: !isInWatchlist }));
    } catch (error) {
      console.error("Error toggling watchlist:", error);
      toast.error("Failed to update watchlist.");
    }
  };

  const handleRatingClick = async (movieId: number, newRating: number) => {
    if (!userId) {
      toast.warn("Please log in to rate movies.");
      return;
    }

    setUserRatings((prev) => ({ ...prev, [movieId]: newRating }));
    try {
      await axios.post(`/api/movies/${movieId}/user-rating`, { userId, rating: newRating });

      const avgResponse = await axios.get(`/api/movies/${movieId}/average-rating`);
      setAverageRatings((prev) => ({
        ...prev,
        [movieId]: avgResponse.data.averageRating || 0,
      }));

      toast.success("Your rating has been saved!");
    } catch (error) {
      console.error("Error saving rating:", error);
      toast.error("Failed to save your rating.");
    }
  };

  const handlePlay = (movie: Movie) => {
    setSelectedMovie(movie);
    setModalOpen(true);
  };
  console.log("User Ratings:", userRatings);
console.log("Average Ratings:", averageRatings);


  return (
    <div className="recently-added-container mb-20">
      <ToastContainer />
      <div className="flex justify-center">
        <Carousel
          plugins={[Autoplay({ delay: 4000 })]}
          opts={{ align: "start", loop: true }}
          className="w-full max-w-4xl"
        >
          <CarouselContent className="flex space-x-4">
            {movies.length > 0 ? (
              movies.map((movie: Movie) => (
                <CarouselItem key={movie.id} className="flex-none w-64 relative">
                  <Card>
                    <CardContent className="relative p-2">
                      <img
                        src={movie.imageString}
                        alt={movie.title}
                        className="object-cover w-full h-full transition-transform duration-300 hover:scale-110"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 hover:opacity-100 bg-black bg-opacity-50 gap-4">
                        <button onClick={() => handlePlay(movie)} className="text-white text-3xl">
                          <FaPlay />
                        </button>
                        <button
                          onClick={() => handleToggleWatchlist(movie.id)}
                          className="text-white text-3xl"
                        >
                          <FaHeart className={watchList[movie.id] ? "text-red-500" : ""} />
                        </button>
                      </div>
                      <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-50 text-white p-2 text-center">
                        <span className="text-sm font-semibold">{movie.title}</span>
                        <div className="flex items-center justify-center mt-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 cursor-pointer ${
                                userRatings[movie.id] >= star
                                  ? "text-yellow-400"
                                  : "text-gray-400"
                              }`}
                              onClick={() => handleRatingClick(movie.id, star)}
                            />
                          ))}
                        </div>
                        <p className="text-xs mt-1">
                          Avg Rating:{" "}
                          {typeof averageRatings[movie.id] === "number"
                            ? averageRatings[movie.id].toFixed(2)
                            : "N/A"}
                          /5
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                </CarouselItem>
              ))
            ) : (
              <p>Loading movies...</p>
            )}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext />
        </Carousel>
      </div>

      {selectedMovie && (
        <PlayVideoModal
          changeState={setModalOpen}
          overview={selectedMovie.overview}
          state={modalOpen}
          title={selectedMovie.title}
          youtubeUrl={selectedMovie.youtubeString}
          age={selectedMovie.age}
          duration={selectedMovie.duration}
          release={selectedMovie.release}
          ratings={userRatings[selectedMovie.id]}
          setUserRating={(rating: number) => handleRatingClick(selectedMovie.id, rating)}
        />
      )}
    </div>
  );
}
