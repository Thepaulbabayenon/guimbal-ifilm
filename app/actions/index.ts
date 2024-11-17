// /actions/index.ts

import axios from 'axios';

interface AddToWatchlistData {
  filmId: number;
  pathname: string;
}

interface DeleteFromWatchlistData {
  watchlistId: string;
}

interface UserRatingData {
  userId: string;  // Assuming user ID is a string
  filmId: number;
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

// Function to delete a film from the watchlist
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

// Function to save/update a user's rating for a film
export const saveUserRating = async (data: UserRatingData) => {
  try {
    const response = await axios.post(
      `/api/films/${data.filmId}/user-rating`,
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

// Function to fetch the average rating of a film
export const fetchAverageRating = async (filmId: number) => {
  try {
    const response = await axios.get(`/api/films/${filmId}/average-rating`);
    return response.data as AverageRatingResponse; // Ensure we return the correct type
  } catch (error) {
    throw error;
  }
};
