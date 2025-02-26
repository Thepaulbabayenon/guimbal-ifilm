'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react';
import FilmLayout from '@/app/components/FilmComponents/FilmLayout';
import { Logo } from '@/app/components/Logo';
import { AlertCircle } from 'lucide-react';

// Define typed interfaces for better type safety
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
}

interface RecommendationSection {
  reason: string;
  films: Film[];
}

/**
 * Fetches film recommendations for a specific user
 * @param userId - The ID of the user to fetch recommendations for
 * @returns Promise containing recommendation sections
 */
async function fetchRecommendedFilms(userId: string): Promise<RecommendationSection[]> {
  try {
    const response = await axios.get<RecommendationSection[]>(`/api/recommendations`, {
      params: { userId },
      timeout: 10000, // 10 second timeout
    });
    
    if (!Array.isArray(response.data)) {
      console.error('API returned invalid format:', response.data);
      return [];
    }

    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error(`API error (${error.code || 'unknown'}): ${error.message}`);
      
      if (error.response) {
        console.error(`Status: ${error.response.status}, Data:`, error.response.data);
      }
    } else {
      console.error('Error fetching recommended films:', error);
    }
    throw error;
  }
}

// Skeleton loader with proper animation
const FilmSkeleton: React.FC = () => (
  <div className="bg-gray-800/40 animate-pulse rounded-lg overflow-hidden w-48 h-72 flex-shrink-0">
    <div className="bg-gray-700/60 h-40 w-full"></div>
    <div className="p-3 space-y-2">
      <div className="h-4 bg-gray-600/60 rounded w-3/4"></div>
      <div className="h-3 bg-gray-600/60 rounded w-1/2"></div>
      <div className="h-3 bg-gray-600/60 rounded w-2/3"></div>
    </div>
  </div>
);

// Skeleton section with labeled props
interface SkeletonSectionProps {
  title: string;
  count?: number;
}

const SkeletonSection: React.FC<SkeletonSectionProps> = ({ title, count = 6 }) => (
  <div className="mb-8">
    <h2 className="text-xl font-semibold mb-3">{title}</h2>
    <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide">
      {Array(count).fill(null).map((_, index) => (
        <FilmSkeleton key={index} />
      ))}
    </div>
  </div>
);

// Empty state component
const EmptyState: React.FC = () => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="bg-gray-800/50 p-6 rounded-lg max-w-md">
      <h3 className="text-xl font-medium mb-2">No Recommendations Yet</h3>
      <p className="text-gray-400 mb-4">
        Watch more films to get personalized recommendations based on your viewing history.
      </p>
    </div>
  </div>
);

// Error component with retry functionality
interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ message, onRetry }) => (
  <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
    <div className="bg-red-900/20 border border-red-800/40 p-6 rounded-lg max-w-md">
      <AlertCircle className="h-10 w-10 text-red-500 mx-auto mb-3" />
      <h3 className="text-xl font-medium mb-2">Unable to Load Recommendations</h3>
      <p className="text-gray-300 mb-4">{message}</p>
      <button 
        onClick={onRetry}
        className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-md transition-colors"
      >
        Try Again
      </button>
    </div>
  </div>
);

/**
 * RecommendedPage component that displays film recommendations for the signed-in user
 */
const RecommendedPage: React.FC = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const [recommendations, setRecommendations] = useState<RecommendationSection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Function to fetch data that can be called for initial load and retries
 // In fetchData function within RecommendedPage component
const fetchData = async () => {
  if (!isLoaded || !isSignedIn || !user) return;
  
  setLoading(true);
  setError(null);
  
  try {
    const data = await fetchRecommendedFilms(user.id);
    setRecommendations(data);
  } catch (error) {
    let errorMessage = 'Failed to load recommended films';
    
    if (axios.isAxiosError(error)) {
      if (error.code === 'ECONNABORTED') {
        errorMessage = 'Request timed out. Please check your connection and try again.';
      } else if (error.response?.status === 404) {
        errorMessage = 'Recommendation service not found.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Authentication error. Please sign in again.';
      } else if (error.response?.status && error.response.status >= 500) {
        errorMessage = 'Server error. Our team has been notified.';
      }
    }
    
    setError(errorMessage);
  } finally {
    setLoading(false);
  }
};

  // Effect to load data when user is authenticated
  useEffect(() => {
    if (isLoaded && isSignedIn && user) {
      fetchData();
    } else if (isLoaded && !isSignedIn) {
      setLoading(false);
      setError('Please sign in to view recommendations');
    }
  }, [isLoaded, isSignedIn, user]);

  // Loading state
  if (loading) {
    return (
      <div className="text-white px-6 max-w-screen-2xl mx-auto py-6 text-center justify-center">
        <Logo />
        <h1 className="text-3xl font-bold mb-6 items-center">Recommended for {user?.firstName}</h1>

        {/* Skeleton sections with descriptive titles */}
        <SkeletonSection title="Based on Your Recent Watches" />
        <SkeletonSection title="Popular in Your Favorite Genres" />
        <SkeletonSection title="Because You Saved" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="text-white px-6 max-w-screen-2xl mx-auto py-6 text-center justify-center">
        <Logo />
        <h1 className="text-3xl font-bold mb-6 text-center justify-center">Recommended for {user?.firstName}</h1>
        <ErrorState message={error} onRetry={fetchData} />
      </div>
    );
  }

  // Empty state
  if (recommendations.length === 0) {
    return (
      <div className="text-white px-6 max-w-screen-2xl mx-auto py-6 text-center justify-center">
        <Logo />
        <h1 className="text-3xl font-bold mb-6">Recommended for {user?.firstName}</h1>
        <EmptyState />
      </div>
    );
  }

  // Content state
  return (
    <div className="text-white px-6 max-w-screen-2xl mx-auto py-6 text-center justify-center">
      <Logo />
      <h1 className="text-3xl font-bold mb-6">Recommended for {user?.firstName}</h1>

      {recommendations.map((section, index) => (
        <div key={index} className="mb-10">
          <FilmLayout 
            title={section.reason}
            films={section.films}
            loading={false}
            error={null}
          />
        </div>
      ))}
    </div>
  );
};

export default RecommendedPage;