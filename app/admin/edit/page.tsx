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

// Define sorting types
type SortField = 'title' | 'duration' | 'release';
type SortDirection = 'asc' | 'desc';

export default function AdminEditPage() {
  const [films, setFilms] = useState<Film[]>([]);
  const [filteredFilms, setFilteredFilms] = useState<Film[]>([]);
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Sorting state
  const [sortField, setSortField] = useState<SortField>('title');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  useEffect(() => {
    const fetchFilms = async () => {
      try {
        const response = await fetch("/api/admin/films");
        const data = await response.json();
        
        console.log("Fetched films:", data);
        
        if (Array.isArray(data)) {
          setFilms(data);
          sortFilms(data, 'title', 'asc');
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

  // Function to sort films
  const sortFilms = (filmsToSort: Film[], field: SortField, direction: SortDirection) => {
    const sorted = [...filmsToSort].sort((a, b) => {
      if (field === 'title') {
        return direction === 'asc' 
          ? a.title.localeCompare(b.title) 
          : b.title.localeCompare(a.title);
      } else if (field === 'duration') {
        return direction === 'asc' 
          ? a.duration - b.duration 
          : b.duration - a.duration;
      } else {
        const yearA = a.release ? new Date(a.release).getFullYear() : 0;
        const yearB = b.release ? new Date(b.release).getFullYear() : 0;
        return direction === 'asc' ? yearA - yearB : yearB - yearA;
      }
    });
    
    setFilteredFilms(sorted);
  };

  // Handle sorting when sort button is clicked
  const handleSort = (field: SortField) => {
    const newDirection = sortField === field && sortDirection === 'asc' ? 'desc' : 'asc';
    setSortField(field);
    setSortDirection(newDirection);
    
    // Apply filter and sort
    const filmsToSort = searchTerm 
      ? films.filter(film => film.title.toLowerCase().includes(searchTerm.toLowerCase()))
      : films;
    
    sortFilms(filmsToSort, field, newDirection);
  };

  // Handle search input change
  useEffect(() => {
    const filtered = searchTerm
      ? films.filter(film => film.title.toLowerCase().includes(searchTerm.toLowerCase()))
      : films;
    
    sortFilms(filtered, sortField, sortDirection);
  }, [searchTerm, films]);

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
        <div>
          {/* Search and sorting controls */}
          <div className="mb-4">
            <div className="flex mb-2">
              <input
                type="text"
                placeholder="Search by title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="p-2 border rounded flex-grow text-black"
              />
            </div>
            
            <div className="flex space-x-2">
              <button 
                onClick={() => handleSort('title')}
                className={`px-3 py-1 rounded text-sm ${sortField === 'title' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
                Title {sortField === 'title' && (sortDirection === 'asc' ? '↑' : '↓')}
              </button>
              <button 
                onClick={() => handleSort('duration')}
                className={`px-3 py-1 rounded text-sm ${sortField === 'duration' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
                Duration {sortField === 'duration' && (sortDirection === 'asc' ? '↑' : '↓')}
              </button>
              <button 
                onClick={() => handleSort('release')}
                className={`px-3 py-1 rounded text-sm ${sortField === 'release' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-black'}`}>
                Release Year {sortField === 'release' && (sortDirection === 'asc' ? '↑' : '↓')}
              </button>
            </div>
          </div>

             {/* Dropdown as an alternative selection method */}
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

          {/* Film Display */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6 text-white">
            {filteredFilms.map((film) => (
              <div 
                key={film.id} 
                className="border rounded p-3 hover:bg-gray-100 cursor-pointer text-white"
                onClick={() => setSelectedFilm(film)}
              >
                <div className="flex items-center">
                  {film.imageString && (
                    <img src={film.imageString} alt={film.title} className="w-12 h-16 object-cover mr-3" />
                  )}
                  <div>
                    <h3 className="font-semibold">{film.title}</h3>
                    <div className="text-xs text-gray-600">
                      <p>{film.duration} min • {film.release ? new Date(film.release).getFullYear() : 'N/A'}</p>
                      <p>{film.category}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedFilm && (
        <FilmEditModal
          film={selectedFilm}
          onClose={() => setSelectedFilm(null)}
          allFilms={films}
        />
      )}
    </div>
  );
}