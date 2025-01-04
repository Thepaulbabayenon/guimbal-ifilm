"use client";

import { useState, useEffect } from "react";
import axios from "axios";
import { FilmCard } from "@/app/components/FilmCard"; // Ensure correct path
import PlayVideoModal from "../PlayVideoModal";

export default function SearchResultsPage() {
  const [query, setQuery] = useState<string>(""); // Search query
  const [films, setFilms] = useState<any[]>([]); // Store film results
  const [selectedFilm, setSelectedFilm] = useState<any | null>(null);
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

  // Fetch films based on the debounced query
  useEffect(() => {
    if (debouncedQuery.trim()) {
      fetchFilms(debouncedQuery, pagination.currentPage);
    }
  }, [debouncedQuery, pagination.currentPage]);

  const fetchFilms = async (searchQuery: string, page: number) => {
    try {
      setLoading(true);
      const response = await axios.get("/api/films/search", {
        params: {
          query: searchQuery,
          page: page,
        },
      });
      setFilms(response.data.films);
      setPagination(response.data.pagination);
      setError(null); // Clear any previous errors
    } catch (err) {
      setError("Failed to fetch films.");
      setFilms([]);
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
          placeholder="Search for a film..."
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
        {films.map((film) => (
           <FilmCard
           key={film.id}
           filmId={film.id}
           title={film.title}
           overview={film.overview}
           watchList={film.watchList}
           youtubeUrl={film.youtubeUrl}
           year={film.year}
           age={film.age}
           time={film.duration}
           initialRatings={film.ratings}
           category={film.category}
           onClick={() => setSelectedFilm(film)} // Set the selected film on click
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
        youtubeUrl={selectedFilm?.youtubeUrl || ""}
        key={pagination.currentPage}
        title={selectedFilm?.title || ""}
        overview={selectedFilm?.overview || ""}
        state={open}
        changeState={setOpen}
        age={selectedFilm?.age || 0}
        duration={selectedFilm?.duration || 0}
        release={selectedFilm?.release || 0}
        ratings={selectedFilm?.ratings || 0}
        setUserRating={() => {}}
        category={selectedFilm?.category || ""} // Pass category here
      />
    </div>
  );
}
