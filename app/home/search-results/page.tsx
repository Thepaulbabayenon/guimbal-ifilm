// app/search-results/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation"; // To get search params from the URL
import { MovieCard } from "@/app/components/MovieCard"; // Import your MovieCard component
import PlayVideoModal from "@/app/components/PlayVideoModal";
import axios from "axios";

const SearchResults = () => {
  const searchParams = useSearchParams(); // Get search params from the URL
  const query = searchParams.get("query") || ""; // Default to empty string if no query
  const [movies, setMovies] = useState<any[]>([]); // State to store fetched movies
  const [error, setError] = useState<string | null>(null); // State to handle errors
  const [selectedMovie, setSelectedMovie] = useState<any | null>(null); // Store selected movie for PlayVideoModal
  const [isModalOpen, setIsModalOpen] = useState(false); // State to manage modal visibility

  // Fetch movies based on the search query
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await axios.get(`/api/search-movies?query=${query}`);
        if (response.data) {
          setMovies(response.data);
        } else {
          setMovies([]);
        }
      } catch (err) {
        setError("Error fetching movies.");
        console.error(err);
      }
    };

    if (query) {
      fetchMovies();
    }
  }, [query]);

  // Handle movie card click to open the modal
  const handleMovieClick = (movie: any) => {
    setSelectedMovie(movie); // Store the clicked movie
    setIsModalOpen(true); // Open the modal
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Search Results for "{query}"</h1>

      {/* Display error message */}
      {error && <p className="text-red-500">{error}</p>}

      {/* Display movies if available */}
      {movies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {movies.map((movie: any) => (
            <div key={movie.id} className="relative">
              <MovieCard
                movieId={movie.id}
                overview={movie.overview}
                title={movie.title}
                watchList={movie.watchList}
                youtubeUrl={movie.youtubeUrl}
                year={movie.year}
                age={movie.age}
                time={movie.time}
                initialRatings={movie.initialRatings}
              />
              <div
                onClick={() => handleMovieClick(movie)}
                className="absolute inset-0 bg-black opacity-50 flex justify-center items-center cursor-pointer"
              >
                <span className="text-white">Play Video</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No movies found.</p>
      )}

      {/* Movie Video Modal */}
      {selectedMovie && (
        <PlayVideoModal
          youtubeUrl={selectedMovie.youtubeUrl}
          title={selectedMovie.title}
          overview={selectedMovie.overview}
          state={isModalOpen}
          changeState={setIsModalOpen}
          age={selectedMovie.age}
          duration={selectedMovie.time}
          release={selectedMovie.year}
          ratings={selectedMovie.initialRatings}
          setUserRating={() => {}}
        />
      )}
    </div>
  );
};

export default SearchResults;
