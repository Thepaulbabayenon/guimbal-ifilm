"use client";
export const dynamic = "force-dynamic"; // Forces the API to run on every request

import { useState, useEffect } from "react";
import FilmEditModal from "@/app/components/VideoUpload/FilmEditModal";

interface Film {
  id: number;
  title: string;
  ageRating: number;
  duration: number;
  overview: string;
  release: string;
  category: string;
  producer: string;
  director: string;
  coDirector: string;
  studio: string;
  imageString?: string;
  videoSource?: string;
  trailer?: string;
}

export default function AdminEditPage() {
  const [films, setFilms] = useState<Film[]>([]);
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFilms = async () => {
      try {
        const response = await fetch("/api/admin/films");
        const data = await response.json();
        
        console.log("Fetched films:", data);
        
        if (Array.isArray(data)) {
          setFilms(data);
        } else {
          throw new Error("Invalid data format received");
        }
      } catch (error) {
        console.error("Error fetching films:", error);
        setError("Failed to load films. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    fetchFilms();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Select a Film to Edit</h1>

      {loading ? (
        <p>Loading films...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : films.length === 0 ? (
        <p>No films available.</p>
      ) : (
        <select
          onChange={(e) => {
            const film = films.find((f) => f.id === Number(e.target.value));
            setSelectedFilm(film || null);
          }}
          className="w-full p-2 border rounded mb-4 text-black"
        >
          <option value="">Select a Film</option>
          {films.map((film) => (
            <option key={film.id} value={film.id}>
              {film.title}
            </option>
          ))}
        </select>
      )}

      {selectedFilm && (
        <FilmEditModal
          film={selectedFilm}
          onClose={() => setSelectedFilm(null)}
        />
      )}
    </div>
  );
}
