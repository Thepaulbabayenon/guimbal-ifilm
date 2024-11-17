"use client";
import { useState, useEffect } from "react";
import axios from "axios";
import { MovieCard } from "@/app/components/MovieCard"; // Ensure correct path
import PlayVideoModal from "../PlayVideoModal";

export default function SearchResultsPage() {
  const [query, setQuery] = useState<string>(""); // Search query
  const [movies, setMovies] = useState<any[]>([]); // Store movie results
  const [loading, setLoading] = useState<boolean>(false); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalResults: 0,
  }); // Pagination state
  const [open, setOpen] = useState(false); // Modal state
  const [debouncedQuery, setDebouncedQuery] = useState<string>(query); // For debounced query

  // Debounce the search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query);
    }, 500); // Delay of 500ms

    return () => clearTimeout(timer); // Clean up previous timer
  }, [query]);

  // Fetch movies based on the debounced query
  useEffect(() => {
    if (debouncedQuery.trim()) {
      fetchMovies(debouncedQuery, pagination.currentPage);
    }
  }, [debouncedQuery, pagination.currentPage]);

  const fetchMovies = async (searchQuery: string, page: number) => {
    try {
      setLoading(true);
      const response = await axios.get("/api/movies/search", {
        params: {
          query: searchQuery,
          page: page,
        },
      });
      setMovies(response.data.movies);
      setPagination(response.data.pagination);
      setError(null); // Clear any previous errors
    } catch (err) {
      setError("Failed to fetch movies.");
      setMovies([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value); // Update query on input change
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({
      ...prev,
      currentPage: newPage,
    }));
  };

  return (
    <div className="container mx-auto p-4">
      <form onSubmit={(e) => e.preventDefault()} className="mb-4">
        <input
          type="text"
          value={query}
          onChange={handleSearchChange}
          placeholder="Search for a movie..."
          className="p-2 border rounded w-full"
        />
        <button
          type="submit"
          className="mt-2 p-2 bg-blue-500 text-white rounded"
          disabled={loading}
        >
          {loading ? "Loading..." : "Search"}
        </button>
      </form>

      {error && <p className="text-red-500">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {movies.map((movie) => (
          <MovieCard
            key={movie.id}
            movieId={movie.id}
            title={movie.title}
            overview={movie.overview}
            watchList={movie.watchList}
            youtubeUrl={movie.youtubeUrl}
            year={movie.year}
            age={movie.age}
            time={movie.duration}
            initialRatings={movie.ratings}
          />
        ))}
      </div>

      {pagination.totalPages > 1 && (
        <div className="mt-4 flex justify-center gap-2">
          <button
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Prev
          </button>
          <p>
            Page {pagination.currentPage} of {pagination.totalPages}
          </p>
          <button
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={pagination.currentPage === pagination.totalPages}
            className="px-4 py-2 border rounded disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}

      <PlayVideoModal
        youtubeUrl=""
        key={pagination.currentPage}
        title=""
        overview=""
        state={open}
        changeState={setOpen}
        age={0}
        duration={0}
        release={0}
        ratings={0}
        setUserRating={() => {}}
      />
    </div>
  );
}
