'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '@clerk/clerk-react'; // Import Clerk's useUser hook
import FilmLayout from '@/app/components/FilmComponents/FilmLayout'; // Import FilmLayout

// Define the Film interface with the required properties
interface Film {
  id: number;
  title: string;
  overview: string;
  watchList: boolean;
  trailerUrl: string;
  year: number;
  age: number;
  time: number; // Duration in minutes
  initialRatings: number;
  category: string; // Add category here to pass to FilmCard
  imageString: string; // Include the imageString field for the Film thumbnail
}

// Fetch the recommended films for a given user
async function fetchRecommendedFilms(userId: string): Promise<Film[]> {
  try {
    const response = await axios.get(`/api/recommendations?userId=${userId}`);
    if (response.status !== 200 || !response.data) {
      throw new Error('Invalid response');
    }
    return response.data; // Expected format is an array of films
  } catch (error) {
    console.error('Error fetching recommended films:', error);
    throw error;
  }
}

const RecommendedPage = () => {
  // Get the current user's data from Clerk
  const { user, isLoaded, isSignedIn } = useUser();
  
  // Initialize state to hold film data with correct type
  const [films, setFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState<boolean>(true); // Loading state
  const [error, setError] = useState<string | null>(null); // Error state

  useEffect(() => {
    // Make sure the user is loaded and signed in before making the API call
    if (isLoaded && isSignedIn && user) {
      const fetchData = async () => {
        try {
          const data = await fetchRecommendedFilms(user.id); // Use Clerk's user ID
          setFilms(data); // Set the recommended films
          setLoading(false); // Set loading to false after data is fetched
        } catch (error) {
          setError('Failed to load recommended films'); // Set error state if there's an issue
          setLoading(false); // Set loading to false even on error
        }
      };

      fetchData();
    }
  }, [isLoaded, isSignedIn, user]); // Fetch data once the user is available

  // Display loading spinner while data is being fetched
  if (loading) {
    return (
      <div className="text-center text-white mt-6">
        <div className="spinner-border animate-spin border-t-4 border-blue-500 rounded-full w-12 h-12"></div>
      </div>
    );
  }

  // Display error message if something goes wrong
  if (error) {
    return <div className="text-center text-red-500 mt-4">{error}</div>;
  }

  return (
    // Use FilmLayout for displaying the films
    <FilmLayout
      title="Recommended Films"
      films={films}
      loading={loading}
      error={error}
    />
  );
};

export default RecommendedPage;
