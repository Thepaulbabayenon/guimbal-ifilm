'use client'

import { useEffect, useState } from "react";
import { getAllMovies } from "../api/getMovies"; // Ensure this API function exists
import { Card, CardContent } from "@/components/ui/card";
import PlayVideoModal from "./PlayVideoModal";
import { FaHeart, FaPlay } from 'react-icons/fa';

export function MovieGrid() {
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

  const [movies, setMovies] = useState<Movie[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  useEffect(() => {
    async function fetchMovies() {
      try {
        const moviesData = await getAllMovies();
        setMovies(moviesData);
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

  const handleHeart = (movieId: number) => {
    console.log(`Heart movie with ID: ${movieId}`);
  };

  return (
    <div className="movie-grid-container grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 p-2">
      {movies.map((movie) => (
        <div key={movie.id} className="relative p-1">
          <Card className="h-40 w-full">
            <CardContent className="relative flex items-center justify-center p-1 h-full">
              <img
                src={movie.imageString}
                alt={movie.title}
                className="object-cover w-full h-full transition-transform duration-200 hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 hover:opacity-100">
                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center gap-3">
                  <button
                    onClick={() => handlePlay(movie)}
                    className="text-white text-lg hover:text-gray-300 transition-transform transform hover:scale-110"
                  >
                    <FaPlay />
                  </button>
                  <button
                    onClick={() => handleHeart(movie.id)}
                    className="text-white text-lg hover:text-red-500 transition-transform transform hover:scale-110"
                  >
                    <FaHeart />
                  </button>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-70 text-white p-1 text-center text-xs font-semibold">
                {movie.title}
              </div>
            </CardContent>
          </Card>
        </div>
      ))}

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
          ratings={selectedMovie.rank}
          setUserRating={() => {}} // Implement this function if needed
        />
      )}
    </div>
  );
}

export default MovieGrid;
