"use client";
export const dynamic = "force-dynamic"; // Forces the API to run on every request

import { useState, useEffect } from "react";
import FilmEditModal from "@/app/components/Modal/FilmEditModal";
import { Metadata } from 'next';
import { Search, SortAsc, SortDesc, Film as FilmIcon, Clock, Calendar } from "lucide-react";

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
  imageUrl?: string;
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

  // Get the sort icon based on current sort state
  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? <SortAsc size={16} /> : <SortDesc size={16} />;
  };

  return (
    <div className="bg-gray-50 min-h-screen p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Film Management</h1>
          <p className="text-gray-600">
            Select a film to edit details, update media, or manage settings.
          </p>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            <p className="font-medium">Error</p>
            <p>{error}</p>
          </div>
        ) : films.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded">
            <p>No films available in the database. Use the upload feature to add films.</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md p-6 border border-gray-200">
            {/* Search and filters bar */}
            <div className="mb-6">
              <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4 mb-4">
                <div className="relative flex-grow">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Search size={18} className="text-gray-400" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search films by title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 p-2 border border-gray-300 rounded w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                  />
                </div>
                
                <select
                  onChange={(e) => {
                    const film = films.find((f) => f.id === Number(e.target.value));
                    setSelectedFilm(film || null);
                  }}
                  className="p-2 border border-gray-300 rounded bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900"
                >
                  <option value="">Quick Select Film</option>
                  {films.map((film) => (
                    <option key={film.id} value={film.id}>
                      {film.title}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Sort buttons */}
              <div className="flex flex-wrap gap-2">
                <button 
                  onClick={() => handleSort('title')}
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1
                    ${sortField === 'title' 
                      ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                      : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'}`}
                >
                  <FilmIcon size={16} />
                  Title
                  {getSortIcon('title')}
                </button>
                
                <button 
                  onClick={() => handleSort('duration')}
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1
                    ${sortField === 'duration' 
                      ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                      : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'}`}
                >
                  <Clock size={16} />
                  Duration
                  {getSortIcon('duration')}
                </button>
                
                <button 
                  onClick={() => handleSort('release')}
                  className={`px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1
                    ${sortField === 'release' 
                      ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                      : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'}`}
                >
                  <Calendar size={16} />
                  Release
                  {getSortIcon('release')}
                </button>
              </div>
            </div>

            {/* Results summary */}
            <div className="text-sm text-gray-500 mb-4">
              Showing {filteredFilms.length} {filteredFilms.length === 1 ? 'film' : 'films'}
              {searchTerm && ` matching "${searchTerm}"`}
            </div>

            {/* Film grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {filteredFilms.map((film) => (
                <div 
                  key={film.id} 
                  className={`border rounded-lg overflow-hidden cursor-pointer transition-all duration-200 hover:shadow-lg
                    ${selectedFilm?.id === film.id ? 'ring-2 ring-blue-500 border-blue-500' : 'border-gray-200'}`}
                  onClick={() => setSelectedFilm(film)}
                >
                  <div className="flex h-full">
                    {film.imageUrl ? (
                      <div className="w-1/3 min-w-20">
                        <img 
                          src={film.imageUrl} 
                          alt={film.title}
                          className="h-full w-full object-cover"
                        />
                      </div>
                    ) : (
                      <div className="w-1/3 min-w-20 bg-gray-200 flex items-center justify-center">
                        <FilmIcon size={24} className="text-gray-400" />
                      </div>
                    )}
                    
                    <div className="p-3 flex flex-col justify-between w-2/3">
                      <div>
                        <h3 className="font-medium text-gray-900 mb-1 line-clamp-2">{film.title}</h3>
                        <div className="text-xs text-gray-500 space-y-1">
                          <p className="flex items-center gap-1">
                            <Clock size={12} />
                            {film.duration} min
                          </p>
                          <p className="flex items-center gap-1">
                            <Calendar size={12} />
                            {film.release ? new Date(film.release).getFullYear() : 'N/A'}
                          </p>
                          <p className="italic truncate">{film.category}</p>
                        </div>
                      </div>
                      
                      <div className="mt-2">
                        <button className="text-xs text-blue-600 hover:text-blue-800 font-medium">
                          Edit Details
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* No results message */}
            {filteredFilms.length === 0 && searchTerm && (
              <div className="text-center py-8">
                <p className="text-gray-500">No films found matching "{searchTerm}"</p>
                <button 
                  onClick={() => setSearchTerm("")}
                  className="mt-2 text-blue-600 hover:text-blue-800"
                >
                  Clear search
                </button>
              </div>
            )}
          </div>
        )}

        {/* Edit modal */}
        {selectedFilm && (
          <FilmEditModal
            film={selectedFilm}
            onClose={() => setSelectedFilm(null)}
            allFilms={films}
          />
        )}
        
        {/* Help text */}
        <div className="mt-6 text-center text-sm text-gray-500">
          Need help managing films? Check the <span className="text-blue-600 hover:underline cursor-pointer">administrator guide</span> or 
          contact <span className="text-blue-600 hover:underline cursor-pointer">technical support</span>.
        </div>
      </div>
    </div>
  );
}