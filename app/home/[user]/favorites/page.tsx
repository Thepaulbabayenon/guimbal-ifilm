'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import axios from 'axios';
import FilmLayout from '@/app/components/FilmComponents/FilmLayout';
import { useAuth } from '@/app/auth/nextjs/useUser';
import { Film } from '@/types/film';

/**
 * User Favorites Page Component
 * Displays films that a user has added to their favorites/watchlist
 */
export default function UserFavoritesPage() {
  const [films, setFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user, isAuthenticated, isLoading } = useAuth();
  const params = useParams();
  const username = params.user as string;
  
  // Determine if viewing own favorites or another user's
  const isOwnFavorites = user?.name === decodeURIComponent(username) || user?.email === decodeURIComponent(username);

  // Fetch user's favorite films
  useEffect(() => {
    if (isLoading) return;
    
    const fetchFavorites = async () => {
      try {
        if (!user || !user.id) {
          setError("User information is unavailable");
          setLoading(false);
          return;
        }
      
        const response = await axios.get(`/api/watchlist`, {
          params: { userId: user.id },
        });
        console.log("Full response structure:", JSON.stringify(response.data));
        
        // Update the films state with the response data
        setFilms(response.data.films || response.data.watchlist || response.data || []);
        setLoading(false);
      } catch (err) {
        console.error("❌ Error fetching watchlist:", err);
        setError("Failed to load favorite films");
        setLoading(false);
      }
    };
    
    fetchFavorites();
  }, [username, user, isLoading]);

  // Loading state while authentication is being checked
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="spinner-border animate-spin border-t-4 border-blue-500 rounded-full w-12 h-12"></div>
      </div>
    );
  }

  // Title changes based on whose favorites are being viewed
  const pageTitle = isOwnFavorites 
    ? 'My Favorites' 
    : `${decodeURIComponent(username)}'s Favorites`;

  // Additional message when no favorites found
  const emptyMessage = isOwnFavorites
    ? "You haven't added any films to your favorites yet."
    : `${decodeURIComponent(username)} hasn't added any films to their favorites yet.`;

  return (
    <div className="container mx-auto">
      {/* Empty state for no favorites */}
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
      
      {/* Display films using the FilmLayout component */}
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