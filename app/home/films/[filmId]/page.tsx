"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import FilmLayout from "@/app/components/FilmComponents/FilmLayout";
import FilmDetails from "@/app/components/FilmComponents/FilmDetails";
import PlayVideoModal from "@/app/components/PlayVideoModal";
import type { Film } from "@/types/film";

export default function FilmQueryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const query = searchParams.get("query"); // Get search query if it exists

  console.log("Params object:", params);
  
  // ✅ Ensure filmId is correctly extracted and a string
  const filmId = params?.filmId ? String(params.filmId) : null;
  console.log("Extracted filmId:", filmId);

  const [films, setFilms] = useState<Film[]>([]);
  const [film, setFilm] = useState<Film | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false); // ✅ Control PlayVideoModal state

  useEffect(() => {
    console.log("Film ID from URL:", filmId);
    console.log("Search Query:", query);

    const fetchData = async () => {
      try {
        setLoading(true);

        if (query) {
          // ✅ Search API
          console.log("Fetching search results...");
          const response = await fetch(`/api/films/search?query=${query}`);
          if (!response.ok) throw new Error("Failed to fetch search results.");
          const data = await response.json();
          console.log("Search Results:", data);

          setFilms(
            data.films.map((film: Film) => ({
              ...film,
              watchList: film.watchList ?? false,
            }))
          );          
        } else if (filmId) {
          // ✅ Film details API
          console.log(`Fetching details for filmId: ${filmId}`);
          const response = await fetch(`/api/films/${filmId}`);
          if (!response.ok) throw new Error("Failed to fetch film details.");
          const data = await response.json();
          console.log("Fetched Film Data:", data);
          setFilms(
            data.films.map((film: Film) => ({
              ...film,
              watchList: film.watchList ?? false,
              producer: film.producer ?? "Unknown",
              director: film.director ?? "Unknown",
              coDirector: film.coDirector ?? "N/A",
              studio: film.studio ?? "Unknown",
            }))
          );        
        }
      } catch (err) {
        console.error("API Fetch Error:", err);
        setError("Error fetching data.");
      } finally {
        setLoading(false);
      }
    };

    if (query || filmId) {
      fetchData();
    } else {
      console.error("❌ No valid filmId or search query.");
      setLoading(false);
    }
  }, [query, filmId]);

  if (loading) return <div className="text-center text-gray-800 mt-10">Loading...</div>;
  if (error) return <div className="text-center text-red-500 mt-10">{error}</div>;

  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-5 sm:px-0">
      {query ? (
        <>
          <h1 className="text-gray-800 text-4xl font-bold mt-10">
            Search Results for "{query}"
          </h1>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6 mt-10 w-full max-w-7xl">
            {films.map((film) => (
              <div key={film.id} className="flex gap-6 mt-6 w-full">
                <div className="flex w-full md:w-1/2 aspect-square">
                  <FilmLayout title={film.title} films={[film]} loading={false} error={null} />
                </div>
                <div className="flex w-full md:w-1/2">
                <FilmDetails
                  filmId={film.id}
                  title={film.title}
                  overview={film.overview}
                  producer={film.producer ?? "Unknown"} // ✅ Ensure a string is always passed
                  director={film.director ?? "Unknown"}
                  coDirector={film.coDirector ?? "N/A"}
                  studio={film.studio ?? "Unknown"}
                  averageRating={film.averageRating}
                  trailerUrl={film.trailerUrl ?? ""} // ✅ Ensure an empty string is used instead of undefined
                />
                </div>
              </div>
            ))}
          </div>
        </>
      ) : film ? (
        <>
          <h1 className="text-4xl font-bold text-gray-800">{film.title}</h1>
          <img src={film.imageUrl} alt={film.title} className="mt-6 rounded-lg w-full max-w-lg" />
          <p className="mt-4 text-gray-700">{film.overview}</p>
          <div className="mt-4">
            <p><strong>Director:</strong> {film.director}</p>
            <p><strong>Producer:</strong> {film.producer}</p>
            <p><strong>Studio:</strong> {film.studio}</p>
            <p><strong>Release Year:</strong> {film.releaseYear}</p>
            <p><strong>Rating:</strong> {film.averageRating ?? "N/A"}</p>
          </div>

          {/* ✅ Play Trailer Button */}
          {film.trailerUrl && (
            <button 
              onClick={() => setOpen(true)} 
              className="mt-6 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Watch Trailer
            </button>
          )}

          {/* ✅ PlayVideoModal Implementation */}
          <PlayVideoModal
      trailerUrl={film.trailerUrl ?? ""}
      key={filmId}
      title={film.title}
      overview={film.overview}
      state={open}
      changeState={setOpen}
      ageRating={film.ageRating ?? 0} 
      duration={film.duration ?? 0}
      releaseYear={film.releaseYear}
      ratings={film.averageRating ?? 0} 
      setUserRating={() => {}}
      userId={""} 
      filmId={film.id ? Number(film.id) : 0} 
      markAsWatched={() => {}} 
      category={film.category || "Uncategorized"} 
    />
        </>
      ) : (
        <div className="text-center text-gray-800 mt-10">No films found.</div>
      )}
    </div>
  );
}
