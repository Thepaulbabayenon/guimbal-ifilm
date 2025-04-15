// src/app/movielib/page.tsx
"use client";

import React, { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";
import { Search, ListFilter } from 'lucide-react';

// Import the Film type from the API route definition (or define it identically)
// Assuming the API route file exports this type or you define it here/globally
export type Film = {
  id: number;
  imageUrl: string;
  title: string;
  ageRating: number;
  duration: number;
  overview: string;
  releaseYear: number;
  videoSource: string; // Added based on API type
  category: string;
  trailerUrl: string; // Added based on API type
  createdAt?: string; // Optional based on API type
  updatedAt?: string; // Optional based on API type
  producer?: string; // Optional based on API type
  director?: string; // Optional based on API type
  coDirector?: string; // Optional based on API type
  studio?: string; // Optional based on API type
  rank?: number; // Optional based on API type
  averageRating: number | null; // Adjusted to match API type
};

// --- Actual API Fetching ---
const API_BASE_URL = "/api/films"; // Adjust if your API route is different

// Define the fields needed for the movie library cards to optimize the API call
const REQUIRED_FIELDS = [
  "id",
  "title",
  "imageUrl",
  "releaseYear",
  "category",
  "averageRating",
  // Add 'rank' if you use it directly for display, otherwise API default sort uses it
  // 'rank'
].join(',');

async function fetchFilms(filters: {
  searchQuery: string;
  category: string;
  limit: number;
}): Promise<Film[]> {
  const params = new URLSearchParams();
  params.append("limit", filters.limit.toString());
  params.append("fields", REQUIRED_FIELDS); // Request only necessary fields

  if (filters.searchQuery) {
    params.append("title", filters.searchQuery); // API uses 'title' for search
  }
  if (filters.category && filters.category !== "all") {
    params.append("category", filters.category);
  }
  // Note: API doesn't support year or rating filters via GET in the provided code
  // Note: API doesn't support custom sorting via GET param, only default rank desc.

  const url = `${API_BASE_URL}?${params.toString()}`;
  console.log("Fetching films from:", url);

  try {
    const response = await fetch(url, {
      // Optional: Add cache control if needed, though API sets headers too
      // cache: 'no-store', // Use this to bypass client-side fetch cache if needed
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ message: "Failed to parse error response" }));
      console.error("API Error Response:", errorData);
      throw new Error(`API Error (${response.status}): ${errorData.message || response.statusText}`);
    }

    const data = await response.json();

    // API returns { rows: Film[] }
    if (!data || !Array.isArray(data.rows)) {
        console.error("Unexpected API response format:", data);
        throw new Error("Invalid data format received from API.");
    }

    return data.rows as Film[]; // Assuming API returns objects matching the Film type for the requested fields

  } catch (error) {
    console.error("Failed to fetch films:", error);
    // Re-throw the error to be caught by the component's error handling
    throw error;
  }
}
// --- End API Fetching ---

// Hardcode categories for filter dropdown. Ideally, fetch these from an API endpoint.
const HARDCODED_CATEGORIES = [
  "all",
  "Short Film",
  "Documentary",
  "Festival Entry",
  "Student Project",
  "Animation",
  // Add any other relevant categories from your data
];

const MovieLibPage = () => {
  const [films, setFilms] = useState<Film[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("rank_desc"); // Default sort matches API, or choose another client default e.g., "newest"
  const [showFilters, setShowFilters] = useState(false);

  // Define fetch limit - How many films to request initially
  // Since API doesn't support pagination offset, we fetch a larger batch for client-side sorting
  const FETCH_LIMIT = 100; // Adjust as needed based on performance

  // Fetch films function wrapped in useCallback
  const loadFilms = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Fetch films based on search and category (API sorts by rank default)
      let fetchedFilms = await fetchFilms({
        searchQuery,
        category: selectedCategory,
        limit: FETCH_LIMIT,
      });

      // --- Client-Side Sorting ---
      // Apply sorting based on the 'sortBy' state *after* fetching
      // This is a workaround because the GET API doesn't accept a sort parameter.
      switch (sortBy) {
        case "newest":
          fetchedFilms.sort((a, b) => b.releaseYear - a.releaseYear);
          break;
        case "oldest":
          fetchedFilms.sort((a, b) => a.releaseYear - b.releaseYear);
          break;
        case "rating":
          // Handle null ratings (e.g., treat null as 0 or lowest)
          fetchedFilms.sort((a, b) => (b.averageRating ?? 0) - (a.averageRating ?? 0));
          break;
        case "title_asc":
          fetchedFilms.sort((a, b) => a.title.localeCompare(b.title));
          break;
        case "title_desc":
          fetchedFilms.sort((a, b) => b.title.localeCompare(a.title));
          break;
        case "rank_desc": // Default API sort (no client-side sort needed if fetched this way)
        default:
          // Films are likely already sorted by rank descending from the API
          break;
      }

      setFilms(fetchedFilms);

    } catch (err) {
      console.error("Caught error in loadFilms:", err);
      setError(err instanceof Error ? err.message : "Could not load films. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedCategory, sortBy]); // Dependencies for useCallback


  // Fetch films when filters change
  useEffect(() => {
    // Use a debounce mechanism if desired, especially for search input
    const debounceTimer = setTimeout(() => {
        loadFilms();
    }, 300); // 300ms debounce

    return () => clearTimeout(debounceTimer); // Cleanup timer
  }, [loadFilms]); // Depend on the memoized loadFilms function


  // Handlers remain the same
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCategoryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedCategory(e.target.value);
  };

   const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSortBy(e.target.value);
    // Note: Sorting is applied client-side in the `loadFilms` function
  };

  return (
    <div className="bg-neutral-950 min-h-screen text-white">
      <div className="max-w-screen-xl mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold mb-6 text-center md:text-left">
          Explore the Guimbal iFilm Society Library
        </h1>

        {/* --- Filter and Search Bar --- */}
        <div className="mb-8 p-4 bg-neutral-900 rounded-lg shadow-md">
           <div className="flex flex-col md:flex-row gap-4 items-center">
             {/* Search Input */}
             <div className="relative flex-grow w-full md:w-auto">
               <input
                 type="text"
                 placeholder="Search films by title..." // API only searches title currently
                 value={searchQuery}
                 onChange={handleSearchChange}
                 className="w-full pl-10 pr-4 py-2 rounded-md bg-neutral-800 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder-gray-400"
               />
               <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
             </div>

             {/* Mobile Filter Toggle */}
             <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md w-full"
             >
                <ListFilter size={20} />
                <span>{showFilters ? 'Hide Filters' : 'Show Filters'}</span>
             </button>

              {/* Desktop Filters / Mobile Filter Panel */}
             <div className={`flex-col md:flex-row md:flex items-center gap-4 w-full md:w-auto ${showFilters ? 'flex mt-4 md:mt-0' : 'hidden'}`}>
                {/* Category Filter */}
                <div className="w-full md:w-auto">
                  <label htmlFor="category-filter" className="sr-only">Filter by Category</label>
                  <select
                    id="category-filter"
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                    className="w-full px-4 py-2 rounded-md bg-neutral-800 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white appearance-none capitalize"
                    style={{ minWidth: '150px' }}
                  >
                    {HARDCODED_CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>
                        {cat === 'all' ? 'All Categories' : cat}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sort By Filter */}
                 <div className="w-full md:w-auto">
                  <label htmlFor="sort-filter" className="sr-only">Sort By</label>
                  <select
                    id="sort-filter"
                    value={sortBy}
                    onChange={handleSortChange}
                    className="w-full px-4 py-2 rounded-md bg-neutral-800 border border-neutral-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-white appearance-none"
                     style={{ minWidth: '150px' }}
                  >
                    <option value="rank_desc">Default (Rank)</option> {/* Reflect API default */}
                    <option value="newest">Newest First</option>
                    <option value="oldest">Oldest First</option>
                    <option value="rating">Highest Rated</option>
                    <option value="title_asc">Title (A-Z)</option>
                    <option value="title_desc">Title (Z-A)</option>
                  </select>
                </div>
             </div>
          </div>
        </div>

        {/* --- Film Grid --- */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="text-center text-red-500 bg-red-900/30 p-4 rounded-md">
            <p>Error loading films:</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : films.length > 0 ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
            {films.map((film) => (
              // Ensure film.id is unique and suitable as a key
              <Link key={film.id} href={`/home/films/${film.id}`} passHref>
                <div className="bg-neutral-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl hover:scale-105 transition-transform duration-200 ease-in-out cursor-pointer group flex flex-col h-full">
                  <div className="relative aspect-video w-full bg-neutral-700"> {/* Added bg color for loading state */}
                    {film.imageUrl ? (
                      <Image
                        src={film.imageUrl}
                        alt={`Poster for ${film.title}`}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
                        style={{ objectFit: "cover" }}
                        className="group-hover:opacity-80 transition-opacity"
                        // Consider adding onError handler for broken images
                        onError={(e) => { e.currentTarget.src = '/default-placeholder.png'; }} // Fallback image
                      />
                    ) : (
                       <div className="flex items-center justify-center h-full text-neutral-500">No Image</div>
                    )}
                  </div>
                  <div className="p-3 flex flex-col flex-grow">
                    <h3 className="text-sm md:text-base font-semibold text-white truncate mb-1" title={film.title}>
                      {film.title || "Untitled Film"} {/* Add fallback */}
                    </h3>
                    <p className="text-xs text-gray-400 mb-2">
                      {film.releaseYear || "Unknown Year"} • {film.category || "Uncategorized"}
                      {/* Check for null/undefined averageRating */}
                      {(film.averageRating !== null && film.averageRating !== undefined) && ` • ★ ${film.averageRating.toFixed(1)}`}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-16">
            <p className="text-lg mb-2">No films found matching your criteria.</p>
            <p>Try adjusting your search or filters.</p>
          </div>
        )}

        {/* --- Pagination (Placeholder) --- */}
        {/* Add real pagination controls when API supports offset/page */}
        {films.length >= FETCH_LIMIT && (
             <div className="mt-12 text-center text-gray-500">
                <p>Showing first {FETCH_LIMIT} results. Full pagination coming soon!</p>
             </div>
        )}
      </div>
    </div>
  );
};

export default MovieLibPage;