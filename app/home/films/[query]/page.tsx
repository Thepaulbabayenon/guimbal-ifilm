'use client';
import { useSearchParams } from "next/navigation"; 
import { useState, useEffect } from "react";
import FilmLayout from "@/app/components/FilmLayout"; // Import the FilmLayout
import FilmDetails from "@/app/components/FilmDetails"; // Import the new FilmDetails component

interface Film {
  id: number;
  title: string;
  overview: string;
  watchList: boolean;
  trailerUrl: string;
  year: number;
  age: number;
  time: number;
  initialRatings: number;
  category: string;
  imageString: string;
  producer: string;
  director: string;
  coDirector: string;
  studio: string;
  averageRating: number | null;
}

export default function SearchResultsPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get('query');
  const [films, setFilms] = useState<Film[]>([]);  // Films typed as Film[]
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);  // Error typed as string | null

  useEffect(() => {
    const fetchFilms = async () => {
      if (!query || query.trim() === "") return;

      setLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/films/search?query=${query}`);
        if (!response.ok) {
          throw new Error("Failed to fetch search results.");
        }

        const data = await response.json();
        setFilms(data.films || []);
      } catch (error) {
        setError("Error fetching search results.");
      } finally {
        setLoading(false);
      }
    };

    fetchFilms();
  }, [query]);

  return (
    <div className="search-results-page min-h-screen flex flex-col justify-center items-center px-5 sm:px-0">
      <h1 className="text-gray-800 text-4xl font-bold mt-10">
        Search Results for "{query}"
      </h1>

      {loading && (
        <div className="text-center text-white mt-6">
          <div className="spinner-border animate-spin border-t-4 border-blue-500 rounded-full w-12 h-12"></div>
        </div>
      )}

      {error && <div className="text-center text-red-500 mt-4">{error}</div>}

      {/* Film Grid - Display films with FilmCard on the left and FilmDetails on the right */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-6 mt-10 w-full max-w-7xl">
        {films.map((film) => (
          <div key={film.id} className="flex gap-6 mt-6 w-full">
            {/* Left Side: FilmCard */}
            <div className="flex w-full md:w-1/2 aspect-square">
              <FilmLayout
                title={film.title}
                films={[film]}  // Pass a single film in an array for FilmLayout
                loading={false}  // Since we already have the film data
                error={null}  // No error here
              />
            </div>

            {/* Right Side: FilmDetails Component */}
            <div className="flex w-full md:w-1/2">
              <FilmDetails
                title={film.title}
                overview={film.overview}
                producer={film.producer}
                director={film.director}
                coDirector={film.coDirector}
                studio={film.studio}
                averageRating={film.averageRating}
                trailerUrl={film.trailerUrl}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
