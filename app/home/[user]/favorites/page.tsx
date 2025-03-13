'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import FilmLayout from '@/app/components/FilmComponents/FilmLayout';
import { useAuth } from '@/app/auth/nextjs/useUser';
import { Film } from '@/types/film';
import { Logo } from '@/app/components/Logo';


export default function UserFavoritesPage() {
  const [films, setFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated, isLoading } = useAuth();
  const params = useParams();
  const urlUsername = params.user as string;
  
  useEffect(() => {
    if (isLoading) return;
    
    const fetchFavorites = async () => {
      try {
        if (!user || !user.id) {
          setError("User information is unavailable");
          setLoading(false);
          return;
        }
        
        // Log user info
        console.log("Current user:", user);
        console.log("URL username:", urlUsername);
        
        // 1. Get watchlist items
        const watchlistResponse = await axios.get(`/api/watchlist`, {
          params: { userId: user.id },
        });
        
      
      
        
        console.log("Watchlist API response:", watchlistResponse.data);
        
        // Handle empty watchlist
        const watchlistItems = watchlistResponse.data.watchlist || [];
        console.log("Watchlist items:", watchlistItems);
        
        if (watchlistItems.length === 0) {
          console.log("No items in watchlist");
          setFilms([]);
          setLoading(false);
          return;
        }
        
      
        let filmIds: number[] = [];
        
        if (Array.isArray(watchlistItems)) {
          // Check if the response contains objects with filmId property
          if (watchlistItems[0] && typeof watchlistItems[0].filmId !== 'undefined') {
            filmIds = watchlistItems.map(item => item.filmId);
          } else if (typeof watchlistItems[0] === 'number') {
            filmIds = watchlistItems;
          }
        }
        
        console.log("Film IDs extracted:", filmIds);
        
        if (filmIds.length === 0) {
          console.log("No film IDs could be extracted");
          setFilms([]);
          setLoading(false);
          return;
        }
        
        // 3. Fetch film details
        const filmsResponse = await axios.get(`/api/films`, {
          params: { ids: filmIds.join(',') },
        });
        
        console.log("Films API response:", filmsResponse.data);
    
        
        // 4. Handle different response formats
        let fetchedFilms: Film[] = [];
        
        if (filmsResponse.data.rows && Array.isArray(filmsResponse.data.rows)) {
          fetchedFilms = filmsResponse.data.rows;
        } else if (filmsResponse.data.films && Array.isArray(filmsResponse.data.films)) {
          fetchedFilms = filmsResponse.data.films;
        } else if (filmsResponse.data.results && Array.isArray(filmsResponse.data.results)) {
          fetchedFilms = filmsResponse.data.results;
        } else if (Array.isArray(filmsResponse.data)) {
          fetchedFilms = filmsResponse.data;
        }
        
        console.log("Processed films:", fetchedFilms);
        setFilms(fetchedFilms);
        setLoading(false);
      } catch (err) {
        console.error("❌ Error fetching watchlist:", err);
        setError("Failed to load favorite films");
        setLoading(false);
      }
    };
    
    fetchFavorites();
  }, [urlUsername, user, isLoading]);

  // Determine if viewing own favorites
  const isOwnFavorites = !isLoading && user && (
    (user.name && decodeURIComponent(urlUsername).toLowerCase() === user.name.toLowerCase()) || 
    (user.email && decodeURIComponent(urlUsername).toLowerCase() === user.email.toLowerCase())
  );
  
  // UI messages
  const pageTitle = isOwnFavorites 
    ? 'My Favorites' 
    : `${decodeURIComponent(urlUsername)}'s Favorites`;

  const emptyMessage = isOwnFavorites
    ? "You haven't added any films to your favorites yet."
    : `${decodeURIComponent(urlUsername)} hasn't added any films to their favorites yet.`;

  return (
    <div className="container mx-auto">
     <Logo />
      
      {/* Loading state */}
      {loading && (
        <div className="text-center py-20">
          <p>Loading your favorites...</p>
        </div>
      )}
      
      {/* Empty state */}
      {!loading && !error && films.length === 0 && (
        <div className="text-center py-20">
          <h2 className="text-2xl font-bold mb-4">{emptyMessage}</h2>
          {isOwnFavorites && (
            <p className="text-gray-400">
              Browse films and click the heart icon to add them to your favorites.
            </p>
          )}
        </div>
      )}
      
      {/* Film grid */}
      {films.length > 0 && (
        <FilmLayout
          title={pageTitle}
          films={films}
          loading={loading}
          error={error}
          userId={user?.id}
        />
      )}
      
      {/* Error state */}
      {error && !loading && (
        <div className="text-center py-20">
          <div className="text-red-500 text-xl">{error}</div>
          {!isAuthenticated && (
            <p className="mt-4 text-gray-400">
              You may need to sign in to view this content.
            </p>
          )}
        </div>
      )}
    </div>
  );
}