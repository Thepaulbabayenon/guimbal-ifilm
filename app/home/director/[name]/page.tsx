// app/home/director/[name]/page.tsx
'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { db } from '@/app/db/drizzle';
import { film } from '@/app/db/schema';
import { eq, sql } from 'drizzle-orm';

// Define types for our data structures
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

const DirectorPage = () => {
  const params = useParams();
  const directorName = decodeURIComponent(params.name as string);
  
  const [films, setFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<string>('releaseYear');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    async function fetchFilms() {
      if (!directorName) return;
      
      setLoading(true);
      setError(null);
      
      try {
        // Get films by the specified director
        const directorMovies = await db.query.film.findMany({
          where: eq(film.director, directorName),
          orderBy: [
            sortBy === 'releaseYear' 
              ? sortOrder === 'desc' ? sql`release_year DESC` : sql`release_year ASC`
              : sortBy === 'averageRating'
                ? sortOrder === 'desc' ? sql`average_rating DESC NULLS LAST` : sql`average_rating ASC NULLS LAST`
                : sortBy === 'title'
                  ? sortOrder === 'desc' ? sql`title DESC` : sql`title ASC`
                  : sql`release_year DESC`
          ],
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
        
        setFilms(typedFilms);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching films:', err);
        setError('Failed to load films. Please try again later.');
        setLoading(false);
      }
    }

    fetchFilms();
  }, [directorName, sortBy, sortOrder]);

  const handleSortChange = (field: string) => {
    if (sortBy === field) {
      // Toggle order if same field
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, set default order
      setSortBy(field);
      setSortOrder('desc');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 pt-32">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <Link href="/home" className="text-blue-400 hover:text-blue-300 flex items-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
            </svg>
            Back to Home
          </Link>
          <h1 className="text-3xl font-bold text-white">Films by {directorName}</h1>
          <p className="text-gray-400 mt-2">{films.length} films found</p>
        </div>
        
        <div className="mt-4 md:mt-0 flex items-center space-x-2">
          <span className="text-gray-400">Sort by:</span>
          <div className="flex space-x-2">
            <button 
              onClick={() => handleSortChange('releaseYear')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                sortBy === 'releaseYear' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Year {sortBy === 'releaseYear' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
            <button 
              onClick={() => handleSortChange('title')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                sortBy === 'title' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Title {sortBy === 'title' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
            <button 
              onClick={() => handleSortChange('averageRating')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                sortBy === 'averageRating' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              Rating {sortBy === 'averageRating' && (sortOrder === 'desc' ? '↓' : '↑')}
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="animate-pulse flex flex-col space-y-2">
              <div className="h-64 bg-gray-700 rounded"></div>
              <div className="h-6 bg-gray-700 rounded w-3/4"></div>
              <div className="h-4 bg-gray-700 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      ) : error ? (
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
      ) : films.length === 0 ? (
        <div className="text-center py-16">
          <h2 className="text-2xl font-bold text-white mb-4">No Films Found</h2>
          <p className="text-gray-400 mb-6">We couldn't find any films directed by {directorName}.</p>
          <Link href="/home" className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium">
            Return to Home
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {films.map((film) => (
            <Link key={film.id} href={`/home/films/${film.id}`} className="group">
              <div className="bg-gray-800 rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20 hover:scale-105">
                <div className="relative h-64 w-full">
                  <Image
                    src={film.imageUrl || '/api/placeholder/400/320'}
                    alt={film.title}
                    className="object-cover"
                    fill
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-white text-lg">{film.title}</h3>
                  <div className="text-sm text-gray-400 mt-1">{film.releaseYear}</div>
                  
                  <div className="mt-2 flex justify-between items-center">
                    {film.averageRating ? (
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-yellow-500" viewBox="0 0 20 20" fill="currentColor">
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                        <span className="ml-1 text-sm text-gray-300">{film.averageRating.toFixed(1)}</span>
                      </div>
                    ) : (
                      <span className="text-sm text-gray-500">Not rated</span>
                    )}
                    
                    <div className="text-xs text-gray-500">
                      {Math.floor(film.duration / 60)}h {film.duration % 60}m
                    </div>
                  </div>
                  
                  {film.category && (
                    <div className="mt-3">
                      <span className="px-2 py-1 bg-gray-700 rounded-full text-xs text-gray-300">
                        {film.category}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default DirectorPage;