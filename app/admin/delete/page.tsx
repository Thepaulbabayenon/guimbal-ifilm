"use client";

import { useEffect, useState } from "react";

interface Film {
  id: string;
  title: string;
}

export default function AdminDeletePage() {
  const [films, setFilms] = useState<Film[]>([]);
  const [selectedFilmId, setSelectedFilmId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  // Fetch all films when the page loads
  useEffect(() => {
    async function fetchFilms() {
      try {
        const response = await fetch("/api/admin/films");
        if (!response.ok) throw new Error("Failed to fetch films");
        const data = await response.json();
        setFilms(data);
      } catch (error) {
        console.error("Error fetching films:", error);
        setMessage({ text: "Failed to load films. Please try again.", type: "error" });
      }
    }
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

      // Remove deleted film from state
      setFilms((prev) => prev.filter((film) => film.id !== selectedFilmId));
      setSelectedFilmId(null);

      setMessage({ text: "Film deleted successfully!", type: "success" });
    } catch (error) {
      console.error("Error deleting film:", error);
      setMessage({ text: "Failed to delete film. Please try again.", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-gray-100 rounded-lg shadow-md text-black">
      <h1 className="text-2xl font-bold mb-4">Delete Film</h1>

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
        {films.length > 0 ? (
          films.map((film) => (
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
