"use client";

import React, { useEffect, useState } from "react";
import FilmSlider from "@/app/components/FilmComponents/DynamicFilmSlider";
import { useUser } from "@/app/auth/nextjs/useUser";
import axios from "axios";
import { motion } from "framer-motion";
import { Logo } from "./Logo";

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
}

interface RecommendationGroup {
  reason: string;
  films: RecommendedFilm[];
  isAIEnhanced?: boolean;
  isCustomCategory?: boolean;
}

interface RecommendationResponse {
  recommendations: RecommendationGroup[];
  meta: {
    cached: boolean;
    processingTime: number;
    aiEnhanced: boolean;
  };
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
  const [meta, setMeta] = useState<RecommendationResponse["meta"] | null>(null);
  
  // Function to fetch recommendations
  const fetchRecommendations = async (refresh = false) => {
    if (!isAuthenticated || !user?.id) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Use AI-enhanced recommendations if available
      const useAI = true;
      // Add refresh parameter if needed
      const url = `/api/recommendations?userId=${user.id}&useAI=${useAI}${refresh ? '&refresh=true' : ''}`;
      
      const response = await axios.get<RecommendationResponse>(url);
      const data = response.data;
      
      if (data.recommendations && Array.isArray(data.recommendations)) {
        setRecommendationGroups(data.recommendations);
        setMeta(data.meta);
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
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
        <Logo />
      <div className="mb-8">
        <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">
          Recommended For You
        </h1>
        <p className="text-gray-400">
          Personalized recommendations based on your watching history and preferences
        </p>
        
        <div className="flex flex-wrap items-center gap-2 mt-2">
          {meta && meta.aiEnhanced && (
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-900/30 text-blue-300 border border-blue-700">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              AI-Enhanced
            </div>
          )}
          
          {meta?.cached && (
            <div className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-green-900/30 text-green-300 border border-green-700">
              <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              Cached ({meta.processingTime}ms)
            </div>
          )}
        </div>
      </div>

      <motion.div 
        className="space-y-8 md:space-y-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        {recommendationGroups.map((group, index) => (
          <div key={index} className="recommendation-group">
            <FilmSlider
              title={group.reason || "Recommended Films"}
              filmsData={group.films}
              limit={group.films.length}
            />
            
            {group.isAIEnhanced && (
              <div className="mt-1 flex justify-end">
                <span className="text-xs text-blue-400 italic">
                  AI-curated selection
                </span>
              </div>
            )}
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
    </div>
  );
};

export default RecommendedPage;