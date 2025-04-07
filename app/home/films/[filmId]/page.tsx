"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import FilmLayout from "@/app/components/FilmComponents/FilmLayout";
import FilmDetails from "@/app/components/FilmComponents/FilmDetails";
import PlayVideoModal from "@/app/components/PlayVideoModal";
import type { Film } from "@/types/film";
import { Loader2 } from "lucide-react";

export default function FilmQueryPage() {
  const params = useParams();
  const searchParams = useSearchParams();
  const query = searchParams.get("query");

  // Extract filmId safely and convert to string
  const filmId = params?.filmId ? String(params.filmId) : null;
  
  const [films, setFilms] = useState<Film[]>([]);
  const [film, setFilm] = useState<Film | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [recommendations, setRecommendations] = useState<Film[]>([]);

  // Helper function to normalize film data
  const normalizeFilmData = (filmData: any): Film => ({
    ...filmData,
    watchList: filmData.watchList ?? false,
    producer: filmData.producer ?? "Unknown",
    director: filmData.director ?? "Unknown",
    coDirector: filmData.coDirector ?? "N/A",
    studio: filmData.studio ?? "Unknown",
    trailerUrl: filmData.trailerUrl ?? "",
    averageRating: filmData.averageRating ?? 0,
    ageRating: filmData.ageRating ?? 0,
    duration: filmData.duration ?? 0,
    category: filmData.category || "Uncategorized"
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
    
        if (query) {
          // Search API
          const response = await fetch(`/api/films/search?query=${encodeURIComponent(query)}`);
          if (!response.ok) throw new Error(`Failed to fetch search results. Status: ${response.status}`);
          
          const data = await response.json();
          
          if (data?.films && Array.isArray(data.films)) {
            setFilms(data.films.map(normalizeFilmData));
            
            // Set recommendations if available
            if (data?.recommendations && Array.isArray(data.recommendations)) {
              setRecommendations(data.recommendations.map(normalizeFilmData));
            }
          } else {
            setFilms([]);
            setError("No results found for your search");
          }      
        } else if (filmId) {
          // Film details API
          const response = await fetch(`/api/films/${filmId}`);
          if (!response.ok) throw new Error(`Failed to fetch film details. Status: ${response.status}`);
          
          const data = await response.json();
          
          if (data?.film) {
            const normalizedFilm = normalizeFilmData(data.film);
            setFilm(normalizedFilm);
            setFilms([normalizedFilm]);
            
            // Fetch recommendations for this film
            try {
              const recResponse = await fetch(`/api/films/recommendations?filmId=${filmId}`);
              if (recResponse.ok) {
                const recData = await recResponse.json();
                if (recData?.recommendations && Array.isArray(recData.recommendations)) {
                  setRecommendations(recData.recommendations.map(normalizeFilmData));
                }
              }
            } catch (recError) {
              console.error("Error fetching recommendations:", recError);
              // Don't set main error - recommendations are not critical
            }
          } else if (data?.films && Array.isArray(data.films) && data.films.length > 0) {
            const normalizedFilms = data.films.map(normalizeFilmData);
            setFilms(normalizedFilms);
            setFilm(normalizedFilms[0]);
          } else {
            setError("Film not found");
          }
        }
      } catch (err) {
        console.error("API Fetch Error:", err);
        setError(err instanceof Error ? err.message : "Error fetching data");
      } finally {
        setLoading(false);
      }
    };  

    if (query || filmId) {
      fetchData();
    } else {
      setLoading(false);
      setError("No film ID or search query provided");
    }
  }, [query, filmId]);

  const LoadingState = () => (
    <div className="flex flex-col items-center justify-center h-64 w-full">
      <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      <p className="mt-4 text-gray-600 font-medium">Loading film data...</p>
    </div>
  );

  const ErrorState = () => (
    <div className="flex flex-col items-center justify-center mt-10 p-6 bg-red-50 border border-red-200 rounded-lg">
      <div className="text-red-500 font-bold text-xl mb-2">Error</div>
      <div className="text-gray-700">{error}</div>
      <button 
        onClick={() => window.location.href = '/films'} 
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Return to Films
      </button>
    </div>
  );

  const SearchResultsView = () => (
    <>
      <h1 className="text-gray-800 text-4xl font-bold mt-10">
        Search Results for "{query}"
      </h1>

      {films.length === 0 ? (
        <div className="text-center text-gray-800 mt-10 p-6 bg-gray-50 rounded-lg">
          <p className="text-xl">No films found matching "{query}"</p>
          <p className="mt-2">Try searching with different keywords</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10 w-full max-w-7xl">
          {films.map((film) => (
            <div key={film.id} className="flex flex-col md:flex-row gap-6 p-4 bg-white rounded-lg shadow-md">
              <div className="w-full md:w-1/2">
                <FilmLayout title={film.title} films={[film]} loading={false} error={null} />
              </div>
              <div className="w-full md:w-1/2">
                <FilmDetails
                  filmId={film.id}
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
      )}

      {recommendations.length > 0 && (
        <div className="mt-16 w-full max-w-7xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">You might also like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {recommendations.map((rec) => (
              <a 
                key={rec.id} 
                href={`/films/${rec.id}`} 
                className="block hover:opacity-90 transition-opacity"
              >
                <div className="aspect-[2/3] relative rounded-lg overflow-hidden">
                  <img 
                    src={rec.imageUrl || "/placeholder-poster.jpg"} 
                    alt={rec.title} 
                    className="object-cover w-full h-full"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                    <h3 className="text-white font-medium text-sm md:text-base">{rec.title}</h3>
                    <p className="text-gray-300 text-xs">{rec.releaseYear}</p>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </>
  );

  const FilmDetailView = () => (
    film ? (
      <div className="w-full max-w-6xl mb-16">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Left column - Film poster */}
          <div className="w-full md:w-1/3">
            <div className="sticky top-8">
              <img 
                src={film.imageUrl || "/placeholder-poster.jpg"} 
                alt={film.title} 
                className="rounded-lg w-full shadow-lg"
              />
              
              {film.trailerUrl && (
                <button 
                  onClick={() => setOpen(true)} 
                  className="mt-4 w-full px-4 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  Watch Trailer
                </button>
              )}
            </div>
          </div>
          
          {/* Right column - Film details */}
          <div className="w-full md:w-2/3">
            <h1 className="text-4xl font-bold text-gray-800">{film.title}</h1>
            
            <div className="flex flex-wrap gap-4 mt-3 mb-6">
              <span className="inline-block bg-gray-100 px-3 py-1 rounded-full text-sm">{film.releaseYear}</span>
              {(film.duration ?? 0) > 0 && (
                <span className="inline-block bg-gray-100 px-3 py-1 rounded-full text-sm">
                  {Math.floor((film.duration ?? 0) / 60)}h {(film.duration ?? 0) % 60}m
                </span>
              )}
              {film.category && (
                <span className="inline-block bg-gray-100 px-3 py-1 rounded-full text-sm">{film.category}</span>
              )}
              {(film.ageRating ?? 0) > 0 && (
                <span className="inline-block bg-gray-100 px-3 py-1 rounded-full text-sm">
                  {film.ageRating}+
                </span>
              )}
            </div>
            
            <div className="mb-6">
              <div className="flex items-center mb-2">
                <div className="text-2xl font-bold text-yellow-500 mr-2">
                  {film.averageRating ? film.averageRating.toFixed(1) : "N/A"}
                </div>
                {(film.averageRating ?? 0) > 0 && (
                  <div className="flex">
                    {[...Array(5)].map((_, i) => (
                      <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill={i < Math.round((film.averageRating ?? 0) / 2) ? "currentColor" : "none"} 
                        stroke="currentColor" className="w-5 h-5 text-yellow-500">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                      </svg>
                    ))}
                  </div>
                )}
              </div>
            </div>
            
            <div className="prose max-w-none mb-8">
              <h3 className="text-xl font-semibold mb-2">Overview</h3>
              <p className="text-gray-700">{film.overview}</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4 mb-8">
              <div>
                <h3 className="text-xl font-semibold mb-2">Details</h3>
                <table className="w-full">
                  <tbody>
                    <tr>
                      <td className="py-2 pr-4 text-gray-600 font-medium">Director</td>
                      <td className="py-2">{film.director}</td>
                    </tr>
                    {film.coDirector !== "N/A" && (
                      <tr>
                        <td className="py-2 pr-4 text-gray-600 font-medium">Co-Director</td>
                        <td className="py-2">{film.coDirector}</td>
                      </tr>
                    )}
                    <tr>
                      <td className="py-2 pr-4 text-gray-600 font-medium">Producer</td>
                      <td className="py-2">{film.producer}</td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-4 text-gray-600 font-medium">Studio</td>
                      <td className="py-2">{film.studio}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        
        {recommendations.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Similar Films</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {recommendations.map((rec) => (
                <a 
                  key={rec.id} 
                  href={`/films/${rec.id}`} 
                  className="block hover:opacity-90 transition-opacity"
                >
                  <div className="aspect-[2/3] relative rounded-lg overflow-hidden">
                    <img 
                      src={rec.imageUrl || "/placeholder-poster.jpg"} 
                      alt={rec.title} 
                      className="object-cover w-full h-full"
                    />
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-4">
                      <h3 className="text-white font-medium text-sm md:text-base">{rec.title}</h3>
                      <p className="text-gray-300 text-xs">{rec.releaseYear}</p>
                    </div>
                  </div>
                </a>
              ))}
            </div>
          </div>
        )}
        
        {/* PlayVideoModal Implementation */}
        <PlayVideoModal
          trailerUrl={film.trailerUrl}
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
          filmId={Number(film.id) || 0} 
          markAsWatched={() => {}} 
          category={film.category} 
        />
      </div>
    ) : (
      <div className="text-center text-gray-800 mt-10">Film not found.</div>
    )
  );

  if (loading) return <LoadingState />;
  if (error) return <ErrorState />;

  return (
    <div className="min-h-screen flex flex-col items-center px-4 sm:px-6 lg:px-8 py-8">
      {query ? <SearchResultsView /> : <FilmDetailView />}
    </div>
  );
}