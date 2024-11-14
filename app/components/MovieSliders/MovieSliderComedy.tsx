'use client'

import { useEffect, useState } from "react";
import { getComedyMovies } from "@/app/api/getMovies";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import PlayVideoModal from "../PlayVideoModal";
import { FaHeart, FaPlay, FaStar } from 'react-icons/fa';
import Autoplay from "embla-carousel-autoplay";
import axios from "axios";
import { useUser } from "@clerk/nextjs";
import { toast, ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

export function MovieSliderComedy() {
  interface Movie {
    id: number;
    title: string;
    age: number;
    duration: number;
    imageString: string;
    overview: string;
    release: number;
    videoSource?: string;
    category?: string;
    youtubeUrl: string; // Use youtubeUrl in Movie interface
    rank?: number;
  }

  const [movies, setMovies] = useState<Movie[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const { user } = useUser();
  const userId = user?.id;
  const [userRatings, setUserRatings] = useState<{ [key: number]: number }>({});
  const [averageRatings, setAverageRatings] = useState<{ [key: number]: number }>({});
  const [watchlist, setWatchlist] = useState<{ [key: number]: boolean }>({});

  useEffect(() => {
    async function fetchMovies() {
      try {
        const moviesData = await getComedyMovies();
        const formattedMovies: Movie[] = moviesData.map(movie => ({
          id: movie.id,
          title: movie.title,
          age: movie.age,
          duration: movie.duration,
          imageString: movie.imageString,
          overview: movie.overview,
          release: movie.release,
          videoSource: movie.videoSource,
          category: movie.category,
          youtubeUrl: movie.youtubeString, // Map youtubeString to youtubeUrl
          rank: movie.rank,
        }));
        setMovies(formattedMovies);
      } catch (error) {
        console.error("Error fetching movies:", error);
      }
    }
    fetchMovies();
  }, []);

  const handlePlay = (movie: Movie) => {
    setSelectedMovie(movie);
    setModalOpen(true);
  };

  const handleHeart = async (movieId: number) => {
    if (!userId) {
      toast.error("You must be logged in to add to watchlist.");
      return;
    }

    const isInWatchlist = watchlist[movieId];
    try {
      await axios.post('/api/updateWatchlist', {
        userId,
        movieId,
        addToWatchlist: !isInWatchlist,
      });

      setWatchlist(prev => ({ ...prev, [movieId]: !isInWatchlist }));
      toast.success(isInWatchlist ? "Removed from watchlist." : "Added to watchlist.");
    } catch (error) {
      console.error("Error updating watchlist:", error);
      toast.error("Failed to update watchlist.");
    }
  };

  const handleRating = async (movieId: number, rating: number) => {
    if (!userId) {
      toast.error("You must be logged in to rate movies.");
      return;
    }

    try {
      await axios.post('/api/updateRating', { userId, movieId, rating });
      setUserRatings(prev => ({ ...prev, [movieId]: rating }));
      toast.success("Rating updated.");
    } catch (error) {
      console.error("Error updating rating:", error);
      toast.error("Failed to update rating.");
    }
  };

  return (
    <div className="recently-added-container mb-20">
      <ToastContainer />
      <div className="flex justify-center">
        <Carousel 
          plugins={[Autoplay({ delay: 2000 })]}
          opts={{ align: "start", loop: true }}
          className="w-full max-w-4xl"
        >
          <CarouselContent className="flex space-x-4">
            {movies.map((movie) => (
              <CarouselItem key={movie.id} className="flex-none w-64 relative">
                <div className="p-2">
                  <Card>
                    <CardContent className="relative flex items-center justify-center p-2">
                      <img
                        src={movie.imageString}
                        alt={movie.title}
                        className="object-cover w-full h-full transition-transform duration-300 hover:scale-110"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 hover:opacity-100">
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center gap-4">
                          <button
                            onClick={() => handlePlay(movie)}
                            className="text-white text-3xl hover:text-gray-300 transition-transform transform hover:scale-110"
                          >
                            <FaPlay />
                          </button>
                          <button
                            onClick={() => handleHeart(movie.id)}
                            className={`text-3xl ${watchlist[movie.id] ? "text-red-500" : "text-white"} hover:scale-110`}
                          >
                            <FaHeart />
                          </button>
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-50 text-white p-2 text-center">
                        <span className="text-sm font-semibold">{movie.title}</span>
                        <p className="text-xs mt-1">Avg Rating: {averageRatings[movie.id]?.toFixed(2) || "N/A"}/5</p>
                        <div className="flex justify-center mt-2">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button
                              key={star}
                              onClick={() => handleRating(movie.id, star)}
                              className={`text-xl ${userRatings[movie.id] >= star ? "text-yellow-400" : "text-gray-400"}`}
                            >
                              <FaStar />
                            </button>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
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
    youtubeUrl={selectedMovie.youtubeUrl}
    age={selectedMovie.age}
    duration={selectedMovie.duration}
    release={selectedMovie.release}
    ratings={selectedMovie.rank || 0} // Ensure ratings is always a number
    setUserRating={rating => handleRating(selectedMovie.id, rating)}
  />
  )}
    </div>
  );
}
