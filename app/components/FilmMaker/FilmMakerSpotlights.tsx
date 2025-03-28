import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { db } from '@/app/db/drizzle'; 
import { film, users } from '@/app/db/schema'; 
import { eq, sql, and, isNotNull, ne } from 'drizzle-orm';

// Define types for our data structures
interface Director {
  director: string;
  film_count: number;
}

interface Film {
  id: number;
  title: string;
  overview: string;
  releaseYear: number;
  ageRating: number;
  averageRating: number | null;
  category: string;
  duration: number;
  trailerUrl: string;
  imageUrl: string;
  videoSource: string;
  director: string;
  uploader: {
    name: string;
    image: string | null
  } | null;
}

const FilmmakersSpotlight = () => {

  const [directors, setDirectors] = useState<Director[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedDirector, setSelectedDirector] = useState<string | null>(null);
  const [directorFilms, setDirectorFilms] = useState<Film[]>([]);
  const [loadingFilms, setLoadingFilms] = useState(false);

  useEffect(() => {
    async function fetchDirectors() {
      try {

        const results = await db.execute(
          sql`SELECT director, COUNT(*) as film_count 
              FROM films 
              WHERE director IS NOT NULL AND director != '' 
              GROUP BY director 
              ORDER BY film_count DESC 
              LIMIT 10`
        );
        
        if (results && results.rows && results.rows.length > 0) {
          // Properly convert the results to Director[] type
          const directorData = results.rows.map(row => ({
            director: String(row.director),
            film_count: Number(row.film_count)
          }));
          
          setDirectors(directorData);
          
          if (directorData.length > 0) {
            setSelectedDirector(directorData[0].director);
          }
        }
        setLoading(false);
      } catch (err) {
        console.error('Error fetching directors:', err);
        setError('Failed to load filmmaker data');
        setLoading(false);
      }
    }

    fetchDirectors();
  }, []);

  useEffect(() => {
    async function fetchDirectorFilms() {
      setLoadingFilms(true);
      try {
    
        if (selectedDirector === null) {
          setDirectorFilms([]);
          setLoadingFilms(false);
          return;
        }
        
    
        const directorMovies = await db.query.film.findMany({
          where: eq(film.director, selectedDirector!),
          orderBy: [sql`release_year DESC`],
          with: {
            uploader: {
              columns: {
                name: true,
                image: true
              }
            }
          }
        });
        
        // Convert the results to the Film type
        const typedFilms: Film[] = directorMovies.map(movie => ({
          id: movie.id,
          title: movie.title,
          overview: movie.overview,
          releaseYear: movie.releaseYear,
          ageRating: movie.ageRating,
          averageRating: movie.averageRating,
          category: movie.category,
          duration: movie.duration,
          trailerUrl: movie.trailerUrl,
          imageUrl: movie.imageUrl,
          videoSource: movie.videoSource,
          director: movie.director || '',
          uploader: movie.uploader
        }));
        
        setDirectorFilms(typedFilms);
        setLoadingFilms(false);
      } catch (err) {
        console.error('Error fetching director films:', err);
        setLoadingFilms(false);
      }
    }

    fetchDirectorFilms();
  }, [selectedDirector]);

  if (loading) {
    return (
      <div className="p-6 bg-gray-800 rounded-lg shadow-lg">
        <div className="animate-pulse flex flex-col space-y-4">
          <div className="h-8 bg-gray-700 rounded w-3/4"></div>
          <div className="flex space-x-4 overflow-x-auto py-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-10 bg-gray-700 rounded w-32 flex-shrink-0"></div>
            ))}
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex flex-col space-y-2">
                <div className="h-40 bg-gray-700 rounded"></div>
                <div className="h-6 bg-gray-700 rounded w-3/4"></div>
                <div className="h-4 bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-900/20 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold text-white mb-2">Something went wrong</h2>
        <p className="text-red-200">{error}</p>
        <button 
          className="mt-4 px-4 py-2 bg-red-800 hover:bg-red-700 rounded text-white" 
          onClick={() => window.location.reload()}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-900 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold text-white mb-4">Filmmakers Spotlight</h2>
      
      {/* Director Selection */}
      <div className="flex space-x-2 overflow-x-auto py-2 mb-6 scrollbar-hide">
        {directors.map((dir) => (
          <button
            key={dir.director}
            onClick={() => setSelectedDirector(dir.director)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap
              ${selectedDirector === dir.director
                ? 'bg-blue-600 text-white'
                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
          >
            {dir.director} ({dir.film_count})
          </button>
        ))}
      </div>

      {loadingFilms ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse flex flex-col space-y-2">
              <div className="h-40 bg-gray-700 rounded"></div>
              <div className="h-6 bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : (
        <>
          {directorFilms.length > 0 ? (
            <div className="space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-white">Films by {selectedDirector}</h3>
                <Link 
                  href={`/search?director=${encodeURIComponent(selectedDirector || '')}`}
                  className="text-blue-400 hover:text-blue-300 text-sm"
                >
                  View all
                </Link>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {directorFilms.map((film) => (
                  <Link key={film.id} href={`/home/films/${film.id}`} className="group">
                    <div className="bg-gray-800 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 hover:scale-105">
                      <div className="relative h-48 w-full">
                        <Image
                          src={film.imageUrl || '/api/placeholder/400/320'}
                          alt={film.title}
                          className="object-cover"
                          fill
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                      </div>
                      <div className="p-3">
                        <h4 className="font-medium text-white truncate">{film.title}</h4>
                        <div className="text-sm text-gray-400 mt-1">{film.releaseYear}</div>
                        <div className="flex items-center mt-2">
                          {film.averageRating && (
                            <div className="flex items-center">
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                              <span className="ml-1 text-sm text-gray-400">{film.averageRating.toFixed(1)}</span>
                            </div>
                          )}
                          
                          <div className="ml-auto flex items-center text-xs text-gray-500">
                            <span>{Math.floor(film.duration / 60)}h {Math.floor(film.duration % 60)}m</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-400">No films found for {selectedDirector}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default FilmmakersSpotlight;