"use client";

export const dynamic = "force-dynamic"; 

import { useEffect, useState } from "react";

interface Film {
  id: string;
  title: string;
  releaseYear?: number;
  duration?: number;
}

type SortField = "title" | "releaseYear" | "duration";
type SortOrder = "asc" | "desc";

export default function AdminDeletePage() {
  const [films, setFilms] = useState<Film[]>([]);
  const [selectedFilmId, setSelectedFilmId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [sortField, setSortField] = useState<SortField>("title");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");

  // Define fetchFilms outside useEffect so it can be reused
  const fetchFilms = async () => {
    try {
      const timestamp = new Date().getTime();
      const response = await fetch(`/api/admin/films?t=${timestamp}`, {
        cache: 'no-store',
  headers: {
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache'
  }
      });
      if (!response.ok) throw new Error("Failed to fetch films");
      const data = await response.json();
      setFilms(data);
    } catch (error) {
      console.error("Error fetching films:", error);
      setMessage({ text: "Failed to load films. Please try again.", type: "error" });
    }
  };

  useEffect(() => {
    fetchFilms();
  }, []);

  // Handle delete request
  const handleDelete = async () => {
    if (!selectedFilmId) return;

    const confirmDelete = window.confirm("Are you sure you want to delete this film?");
    if (!confirmDelete) return;

    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch(`/api/admin/films/delete`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: selectedFilmId }),
      });

      if (!response.ok) throw new Error("Failed to delete film");

      // Refresh the film list after deletion
      await fetchFilms();
      setSelectedFilmId(null);

      setMessage({ text: "Film deleted successfully!", type: "success" });
    } catch (error) {
      console.error("Error deleting film:", error);
      setMessage({ text: "Failed to delete film. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Handle sorting change
  const handleSortChange = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
  };

  // Get sorted films
  const getSortedFilms = () => {
    return [...films].sort((a, b) => {
      if (sortField === "title") {
        return sortOrder === "asc" 
          ? a.title.localeCompare(b.title)
          : b.title.localeCompare(a.title);
      } else if (sortField === "releaseYear") {
        const yearA = a.releaseYear || 0;
        const yearB = b.releaseYear || 0;
        return sortOrder === "asc" ? yearA - yearB : yearB - yearA;
      } else if (sortField === "duration") {
        const durationA = a.duration || 0;
        const durationB = b.duration || 0;
        return sortOrder === "asc" ? durationA - durationB : durationB - durationA;
      }
      return 0;
    });
  };

  const sortedFilms = getSortedFilms();

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md text-black">
      <h1 className="text-2xl font-bold mb-4">Delete Film</h1>

      {/* Sorting Controls */}
      <div className="mb-4">
        <label className="block font-semibold text-black mb-2">Sort By:</label>
        <div className="flex flex-wrap gap-2">
          <button
            className={`px-3 py-1 rounded ${
              sortField === "title" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
            }`}
            onClick={() => handleSortChange("title")}
          >
            Title {sortField === "title" && (sortOrder === "asc" ? "↑" : "↓")}
          </button>
          <button
            className={`px-3 py-1 rounded ${
              sortField === "releaseYear" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
            }`}
            onClick={() => handleSortChange("releaseYear")}
          >
            Release Year {sortField === "releaseYear" && (sortOrder === "asc" ? "↑" : "↓")}
          </button>
          <button
            className={`px-3 py-1 rounded ${
              sortField === "duration" ? "bg-blue-500 text-white" : "bg-gray-200 text-black"
            }`}
            onClick={() => handleSortChange("duration")}
          >
            Duration {sortField === "duration" && (sortOrder === "asc" ? "↑" : "↓")}
          </button>
        </div>
      </div>

      {/* Film Selection Dropdown */}
      <label className="block font-semibold text-black">Select a Film:</label>
      <select
        className="w-full p-2 border rounded mb-4 text-black"
        onChange={(e) => setSelectedFilmId(e.target.value)}
        value={selectedFilmId || ""}
      >
        <option value="" disabled>
          -- Choose a film to delete --
        </option>
        {sortedFilms.length > 0 ? (
          sortedFilms.map((film) => (
            <option key={film.id} value={film.id} className="text-black">
              {film.title}
            </option>
          ))
        ) : (
          <option disabled>No films available</option>
        )}
      </select>

      {/* Delete Button */}
      <button
        className={`w-full text-black font-semibold py-2 rounded ${
          !selectedFilmId || loading ? "bg-gray-400 cursor-not-allowed" : "bg-red-500 hover:bg-red-600"
        }`}
        onClick={handleDelete}
        disabled={!selectedFilmId || loading}
      >
        {loading ? "Deleting..." : "Delete Film"}
      </button>

      {/* Feedback Message */}
      {message && (
        <p
          className={`mt-2 font-semibold ${
            message.type === "success" ? "text-green-600" : "text-red-600"
          }`}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}