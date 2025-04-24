"use client";

export const dynamic = "force-dynamic"; 

import { useEffect, useState } from "react";
import { Trash2, AlertCircle, ArrowUp, ArrowDown, Film, Check } from "lucide-react";
import SortButton from "../components/SortButton";

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
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Define fetchFilms outside useEffect so it can be reused
  const fetchFilms = async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFilms();
  }, []);

  // Handle delete confirmation
  const openDeleteModal = () => {
    if (!selectedFilmId) return;
    setIsModalOpen(true);
  };

  // Handle delete request
  const handleDelete = async () => {
    if (!selectedFilmId) return;

    setLoading(true);
    setMessage(null);
    setIsModalOpen(false);

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
      
      // Auto-dismiss success message after 5 seconds
      setTimeout(() => {
        setMessage(null);
      }, 5000);
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
  const selectedFilm = films.find(film => film.id === selectedFilmId);

  return (
    <div className="max-w-4xl mx-auto p-8 bg-white rounded-lg shadow-lg">
      <div className="flex items-center mb-6 border-b pb-4">
        <Film className="text-blue-600 mr-3" size={28} />
        <h1 className="text-2xl font-bold text-gray-800">Film Management</h1>
      </div>

      {/* Message Banner */}
      {message && (
        <div className={`mb-6 p-4 rounded-md flex items-center ${
          message.type === "success" ? "bg-green-50 border border-green-200" : "bg-red-50 border border-red-200"
        }`}>
          {message.type === "success" ? (
            <Check className="text-green-500 mr-2" size={20} />
          ) : (
            <AlertCircle className="text-red-500 mr-2" size={20} />
          )}
          <p className={`font-medium ${
            message.type === "success" ? "text-green-700" : "text-red-700"
          }`}>
            {message.text}
          </p>
        </div>
      )}

      <div className="bg-gray-50 p-6 rounded-lg mb-6">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Delete Film</h2>

        {/* Film Selection Card */}
        <div className="mb-6">
          <label className="block text-gray-700 font-medium mb-2">Select a Film to Delete:</label>
          <div className="relative">
            <select
              className="w-full p-3 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none text-gray-700"
              onChange={(e) => setSelectedFilmId(e.target.value)}
              value={selectedFilmId || ""}
              disabled={loading}
            >
              <option value="" disabled>
                -- Choose a film to delete --
              </option>
              {sortedFilms.length > 0 ? (
                sortedFilms.map((film) => (
                  <option key={film.id} value={film.id}>
                    {film.title} {film.releaseYear ? `(${film.releaseYear})` : ""}
                  </option>
                ))
              ) : (
                <option disabled>No films available</option>
              )}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <svg className="h-4 w-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>

        {/* Film Details Preview (if selected) */}
        {selectedFilm && (
          <div className="bg-white p-4 rounded-md border border-gray-200 mb-6">
            <h3 className="font-medium text-gray-800 mb-2">Selected Film Details:</h3>
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div className="text-gray-600">Title:</div>
              <div className="font-medium">{selectedFilm.title}</div>
              {selectedFilm.releaseYear && (
                <>
                  <div className="text-gray-600">Release Year:</div>
                  <div>{selectedFilm.releaseYear}</div>
                </>
              )}
              {selectedFilm.duration && (
                <>
                  <div className="text-gray-600">Duration:</div>
                  <div>{selectedFilm.duration} minutes</div>
                </>
              )}
            </div>
          </div>
        )}

        {/* Delete Button */}
        <button
          className={`w-full py-3 px-4 rounded-md flex items-center justify-center font-medium transition-colors ${
            !selectedFilmId || loading
              ? "bg-gray-200 text-gray-500 cursor-not-allowed"
              : "bg-red-600 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          }`}
          onClick={openDeleteModal}
          disabled={!selectedFilmId || loading}
        >
          <Trash2 className="mr-2" size={18} />
          {loading ? "Processing..." : "Delete Selected Film"}
        </button>
      </div>

      {/* Sorting Controls */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-xl font-semibold text-gray-700 mb-4">Sort Film List</h2>
        <div className="flex flex-wrap gap-3">
          <SortButton 
            active={sortField === "title"}
            order={sortField === "title" ? sortOrder : null} 
            onClick={() => handleSortChange("title")}
            label="Title"
          />
          <SortButton 
            active={sortField === "releaseYear"}
            order={sortField === "releaseYear" ? sortOrder : null} 
            onClick={() => handleSortChange("releaseYear")}
            label="Release Year"
          />
          <SortButton 
            active={sortField === "duration"}
            order={sortField === "duration" ? sortOrder : null} 
            onClick={() => handleSortChange("duration")}
            label="Duration"
          />
        </div>
      </div>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-800 mb-2">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete "{selectedFilm?.title}"? This action cannot be undone.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-md transition-colors"
                onClick={() => setIsModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

