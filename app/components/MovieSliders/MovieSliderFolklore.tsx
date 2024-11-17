'use client'

import { useEffect, useState } from "react";
import { getFolkloreMovies } from "@/app/api/getMovies"; // Ensure this API function exists
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import PlayVideoModal from "../PlayVideoModal";
import Autoplay from "embla-carousel-autoplay";
import { useUser } from "@clerk/nextjs";
import { Star } from "lucide-react";
import { FaHeart, FaPlay } from 'react-icons/fa';
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

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
  rank: number; // External rating
}

export function MovieSliderFolklore() {
  const { user } = useUser();
  const userId = user?.id;

  const [movies, setMovies] = useState<Movie[]>([]);
  const [watchList, setWatchList] = useState<{ [key: number]: boolean }>({});
  const [userRatings, setUserRatings] = useState<{ [key: number]: number }>({});
  const [averageRatings, setAverageRatings] = useState<{ [key: number]: number }>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  useEffect(() => {
    fetchMovies();
  }, []);

  useEffect(() => {
    if (userId) {
      movies.forEach(movie => {
        fetchUserAndAverageRating(movie.id);
        fetchWatchlistStatus(movie.id);
      });
    }
  }, [userId, movies]);

  const fetchMovies = async () => {
    try {
      const moviesData = await getFolkloreMovies();
      setMovies(moviesData);
    } catch (error) {
      console.error("Error fetching movies:", error);
    }
  };

  // Fetch user rating and average rating
  const fetchUserAndAverageRating = async (movieId: number) => {
    try {
      const userResponse = await axios.get(`/api/movies/${movieId}/user-rating`, { params: { userId } });
      setUserRatings(prev => ({ ...prev, [movieId]: userResponse.data.rating || 0 }));

      const avgResponse = await axios.get(`/api/movies/${movieId}/average-rating`);
      setAverageRatings(prev => ({ ...prev, [movieId]: avgResponse.data.averageRating || 0 }));
    } catch (error) {
      console.error("Error fetching ratings:", error);
    }
  };

  // Fetch watchlist status
  const fetchWatchlistStatus = async (movieId: number) => {
    try {
      const response = await axios.get(`/api/watchlist/${movieId}`, { params: { userId } });
      setWatchList(prev => ({ ...prev, [movieId]: response.data.inWatchlist }));
    } catch (error) {
      console.error("Error fetching watchlist status:", error);
    }
  };

  // Handle adding/removing from watchlist
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
      setWatchList(prev => ({ ...prev, [movieId]: !isInWatchlist }));
    } catch (error) {
      console.error("Error toggling watchlist:", error);
      toast.error("Failed to update watchlist.");
    }
  };

  // Handle rating click
  const handleRatingClick = async (movieId: number, newRating: number) => {
    if (!userId) {
      toast.warn("Please log in to rate movies.");
      return;
    }

    setUserRatings(prev => ({ ...prev, [movieId]: newRating }));
    try {
      await axios.post(`/api/movies/${movieId}/user-rating`, { userId, rating: newRating });

      // Update average rating
      const avgResponse = await axios.get(`/api/movies/${movieId}/average-rating`);
      setAverageRatings(prev => ({ ...prev, [movieId]: avgResponse.data.averageRating || 0 }));

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
            {movies.map(movie => (
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
                      <button onClick={() => handleToggleWatchlist(movie.id)} className="text-white text-3xl">
                        <FaHeart className={watchList[movie.id] ? "text-red-500" : ""} />
                      </button>
                    </div>
                    <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-50 text-white p-2 text-center">
                      <span className="text-sm font-semibold">{movie.title}</span>
                      <div className="flex items-center justify-center mt-2">
                        {[1, 2, 3, 4, 5].map(star => (
                          <Star
                            key={star}
                            className={`w-4 h-4 cursor-pointer ${userRatings[movie.id] >= star ? "text-yellow-400" : "text-gray-400"}`}
                            onClick={() => handleRatingClick(movie.id, star)}
                          />
                        ))}
                      </div>
                      <p className="text-xs mt-1">
                        Avg Rating: {typeof averageRatings[movie.id] === "number" ? averageRatings[movie.id].toFixed(2) : "N/A"}/5
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
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
