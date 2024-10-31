// /actions/index.ts

import axios from 'axios';

interface AddToWatchlistData {
  movieId: number;
  pathname: string;
}

interface DeleteFromWatchlistData {
  watchlistId: string;
}

interface UserRatingData {
  userId: string;  // Assuming user ID is a string
  movieId: number;
  rating: number;  // User's rating
}

interface AverageRatingResponse {
  averageRating: number;
}

// Function to add a movie to the watchlist
export const addToWatchlist = async (data: AddToWatchlistData) => {
  try {
    const response = await axios.post('/api/watchlist/add', data, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Function to delete a movie from the watchlist
export const deleteFromWatchlist = async (data: DeleteFromWatchlistData) => {
  try {
    const response = await axios.post('/api/watchlist/delete', data, {
      headers: { 'Content-Type': 'application/json' },
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Function to save/update a user's rating for a movie
export const saveUserRating = async (data: UserRatingData) => {
  try {
    const response = await axios.post(
      `/api/movies/${data.movieId}/user-rating`,
      {
        userId: data.userId,
        rating: data.rating,
      },
      {
        headers: { 'Content-Type': 'application/json' },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Function to fetch the average rating of a movie
export const fetchAverageRating = async (movieId: number) => {
  try {
    const response = await axios.get(`/api/movies/${movieId}/average-rating`);
    return response.data as AverageRatingResponse; // Ensure we return the correct type
  } catch (error) {
    throw error;
  }
};
