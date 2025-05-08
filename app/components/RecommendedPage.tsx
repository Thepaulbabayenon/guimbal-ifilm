"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { Logo } from "./Logo";
import { TextLoop } from "@/components/ui/text-loop";
import PlayVideoModal from "./PlayVideoModal";
import { useUser } from "@/app/auth/nextjs/useUser";

// Import the correct FilmSlider component - make sure to use the same one as HomePage
import FilmSliderWrapper from "@/app/components/FilmComponents/FilmsliderWrapper";

// Types
interface RecommendedFilm {
  id: number;
  title: string;
  imageUrl: string;
  releaseYear: number;
  duration: number;
  averageRating: number | null;
  category?: string;
  overview?: string;
  trailerUrl?: string;
  videoSource?: string;
  ageRating?: number;
}

interface RecommendationGroup {
  reason: string;
  films: RecommendedFilm[];
  isAIEnhanced?: boolean;
  isCustomCategory?: boolean;
}

// Film type expected by PlayVideoModal - ensure this matches what the component expects
interface Film {
  id: number;
  title: string;
  imageUrl?: string;
  overview: string;
  trailerUrl: string;
  videoSource: string;
  releaseYear: number;
  ageRating?: number;
  duration: number;
  ratings: number | null;
  category: string;
}

// Loading skeleton components
const LoadingSkeleton = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="space-y-12">
        {[1, 2, 3].map((index) => (
          <div key={index} className="space-y-4">
            <div className="h-8 w-64 bg-gray-800 rounded animate-pulse mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
              {Array(6).fill(0).map((_, i) => (
                <div key={i} className="aspect-[2/3] bg-gray-800 rounded-lg animate-pulse" />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Error component
const ErrorDisplay = ({ message }: { message: string }) => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-16 text-center">
      <div className="bg-red-900/20 border border-red-800 rounded-lg p-6 max-w-lg mx-auto">
        <h3 className="text-xl font-semibold text-red-400 mb-2">Unable to load recommendations</h3>
        <p className="text-gray-300">{message}</p>
        <button 
          onClick={() => window.location.reload()}
          className="mt-4 px-4 py-2 bg-red-700 hover:bg-red-600 text-white rounded-md transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
};

// Empty state component
const EmptyState = () => {
  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-16 text-center">
      <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 max-w-lg mx-auto">
        <h3 className="text-xl font-semibold text-gray-200 mb-3">No Recommendations Yet</h3>
        <p className="text-gray-400">
          Start watching and rating films to get personalized recommendations tailored to your taste.
        </p>
      </div>
    </div>
  );
};

// Main component
const RecommendedPage = () => {
  const { user, isAuthenticated, isLoading: authLoading } = useUser();
  const [recommendationGroups, setRecommendationGroups] = useState<RecommendationGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [refreshTimestamp, setRefreshTimestamp] = useState<number | null>(null);
  
  // State for video modal
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [userRating, setUserRating] = useState<number>(0);
  const [showingTrailer, setShowingTrailer] = useState(true);
  const [hasRefreshedRatings, setHasRefreshedRatings] = useState(false);
    
  // Simple mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
  // Function to fetch recommendations
  const fetchRecommendations = async (refresh = false) => {
    if (!isAuthenticated || !user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Use the correct endpoint with userId in the path
      const url = `/api/recommendations/${user.id}`;
      
      const response = await axios.get(url);
      const data = response.data;
      
      if (data && Array.isArray(data)) {
        setRecommendationGroups(data);
        setRefreshTimestamp(Date.now());
      } else {
        setRecommendationGroups([]);
        setError("Recommendations data is invalid");
      }
    } catch (err) {
      console.error("Error fetching recommendations:", err);
      setError(
        err instanceof Error ? err.message : "Failed to load recommendations"
      );
      setRecommendationGroups([]);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch recommendations when user authentication state changes
  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      fetchRecommendations();
    } else if (!authLoading && !isAuthenticated) {
      setIsLoading(false);
    }
  }, [isAuthenticated, user?.id, authLoading]);
  
  // Handler for opening the video modal
  const handleFilmClick = (film: RecommendedFilm) => {
    // Convert RecommendedFilm to the Film type expected by PlayVideoModal
    const convertedFilm: Film = {
      id: film.id,
      title: film.title,
      imageUrl: film.imageUrl,
      overview: film.overview || "",
      trailerUrl: film.trailerUrl || "",
      videoSource: film.videoSource || "",
      releaseYear: film.releaseYear,
      ageRating: film.ageRating,
      duration: film.duration,
      ratings: film.averageRating,
      category: film.category || "",
    };
    
    setSelectedFilm(convertedFilm);
    setShowingTrailer(true); // Reset to trailer view when opening new film
    setUserRating(0); // Reset rating for new film selection
    setIsVideoModalOpen(true);
    setHasRefreshedRatings(false);
  };

  // Handler for closing the video modal
  const handleCloseVideoModal = () => {
    setIsVideoModalOpen(false);
  };

  // Function to toggle between trailer and full movie
  const toggleVideoSource = () => {
    setShowingTrailer(!showingTrailer);
  };

  // Function to mark film as watched (if implemented in backend)
  const markAsWatched = async (userId: string, filmId: number) => {
    try {
      await axios.post(`/api/films/${filmId}/watched-films`, { 
        userId, 
        filmId, 
        watchedDuration: 60 
      });
      console.log("Film marked as watched");
      // You could update local state here if needed
    } catch (error) {
      console.error("Error marking film as watched:", error);
    }
  };

  // Function to refresh ratings after user rates a film
  const refreshRating = async (filmId?: number) => {
    if (!filmId) return;
    
    try {
      // Refresh the average rating for the specific film
      const avgResponse = await axios.get(`/api/films/${filmId}/average-rating`);
      
      if (avgResponse.data && avgResponse.data.averageRating !== undefined) {
        // Update the film's rating in our local state
        setRecommendationGroups(prevGroups => 
          prevGroups.map(group => ({
            ...group,
            films: group.films.map(film => 
              film.id === filmId
                ? { ...film, averageRating: avgResponse.data.averageRating }
                : film
            )
          }))
        );
        
        setHasRefreshedRatings(true);
      }
    } catch (error) {
      console.error("Error refreshing rating:", error);
    }
  };

  // Show loading skeleton during initial load
  if (authLoading || isLoading) {
    return <LoadingSkeleton />;
  }

  // Show authentication required message
  if (!isAuthenticated) {
    return (
      <div className="w-full max-w-7xl mx-auto px-4 py-16 text-center">
        <Logo />
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 max-w-lg mx-auto">
          <h3 className="text-xl font-semibold text-gray-200 mb-3">
            Authentication Required
          </h3>
          <p className="text-gray-400">
            Please log in to view your personalized recommendations.
          </p>
        </div>
      </div>
    );
  }

  // Show error message if there was an error
  if (error) {
    return <ErrorDisplay message={error} />;
  }

  // Show empty state if no recommendations
  if (!recommendationGroups || recommendationGroups.length === 0) {
    return <EmptyState />;
  }

  // Render recommendations
  return (
    <div className="pt-12 sm:pt-16 lg:pt-20 pb-6 sm:pb-10 px-3 sm:px-4 md:px-6 lg:px-8">
      <Logo />
      <div className="mb-8">
        <h1 className={isMobile ? "text-xl font-bold text-gray-400 mb-2" : "text-2xl sm:text-3xl font-bold text-gray-400 mb-3 sm:mb-4 md:mb-6"}>
          {!isMobile ? (
            <TextLoop interval={5}>
              <span>RECOMMENDED FOR YOU</span>
              <span>PICKS FOR YOU</span>
            </TextLoop>
          ) : (
            <span>RECOMMENDED FOR YOU</span>
          )}
        </h1>
        <p className="text-gray-400">
          Personalized recommendations based on your watching history and preferences
        </p>
        
        {refreshTimestamp && (
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-300 border border-green-700">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Last updated: {new Date(refreshTimestamp).toLocaleTimeString()}
            </div>
          </div>
        )}
      </div>

      <motion.div 
        className="space-y-8 md:space-y-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {recommendationGroups.map((group, index) => (
          <div key={index} className="recommendation-group mt-4 sm:mt-6">
            <h1 className={isMobile ? "text-xl font-bold text-gray-400 mb-2" : "text-2xl sm:text-3xl font-bold text-gray-400 mb-3 sm:mb-4 md:mb-6"}>
              {!isMobile && group.reason ? (
                <TextLoop interval={5}>
                  <span>{group.reason.toUpperCase()}</span>
                  <span>JUST FOR YOU</span>
                </TextLoop>
              ) : (
                <span>{group.reason.toUpperCase()}</span>
              )}
            </h1>
            
            {/* Use FilmSliderWrapper instead of FilmSlider directly to match HomePage */}
            <FilmSliderWrapper
              title={group.reason}
              films={group.films}
              onFilmClick={handleFilmClick}
              isMobile={isMobile}
              limit={isMobile ? Math.min(6, group.films.length) : group.films.length}
            />
          </div>
        ))}
      </motion.div>

      {/* Refresh button */}
      <div className="mt-10 flex justify-center">
        <button
          onClick={() => fetchRecommendations(true)}
          disabled={isLoading}
          className="px-4 py-2 bg-gray-800 hover:bg-gray-700 text-white rounded-md transition-colors flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <svg 
            className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24" 
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>{isLoading ? "Refreshing..." : "Refresh Recommendations"}</span>
        </button>
      </div>
      
      {/* VideoModal Component - with proper Film type and all required props */}
      {selectedFilm && (
        <PlayVideoModal
          // Modal state
          state={isVideoModalOpen}
          changeState={setIsVideoModalOpen}
          
          film={selectedFilm}
          
          // User data and actions
          userId={user?.id}
          filmId={selectedFilm.id}
          userRating={userRating}
          setUserRating={setUserRating}
          markAsWatched={markAsWatched}
          watchTimerDuration={30000} 
          
          toggleVideoSource={toggleVideoSource}
          showingTrailer={showingTrailer}
          
          // Rating refresh functionality
          refreshRating={refreshRating}
        />
      )}
    </div>
  );
};

export default RecommendedPage;