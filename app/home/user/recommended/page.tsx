'use client';
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FilmCard } from '@/app/components/FilmCard';

// Define the Film interface with the required properties
interface Film {
  filmId: number;
  title: string;
  overview: string;
  watchList: boolean;
  watchListId?: string;
  youtubeUrl: string;
  year: number;
  age: number;
  time: number; // Duration in minutes
  initialRatings: number;
  category: string; // Add category here to pass to PlayVideoModal
}

async function fetchRecommendedFilms(userId: string) {
    try {
      const response = await axios.get(`/api/recommendations?userId=${userId}`);
      if (response.status !== 200 || !response.data) {
        throw new Error("Invalid response");
      }
      return response.data;
    } catch (error) {
      console.error("Error fetching recommended films:", error);
      throw error;
    }
}

const RecommendedPage = () => {
  // Initialize state to hold film data with correct type
  const [films, setFilms] = useState<Film[]>([]);

  useEffect(() => {
    const userId = "user123"; // Example user ID, replace as needed
    const fetchData = async () => {
      try {
        const data = await fetchRecommendedFilms(userId);
        setFilms(data); // Set the recommended films
      } catch (error) {
        console.error("Error fetching films:", error);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      {films.map((film) => (
        <FilmCard
          key={film.filmId}
          filmId={film.filmId}
          title={film.title}
          overview={film.overview}
          watchList={film.watchList}
          watchListId={film.watchListId}
          youtubeUrl={film.youtubeUrl}
          year={film.year}
          age={film.age}
          time={film.time}
          initialRatings={film.initialRatings}
          category={film.category}
          onClick={() => {}}
        />
      ))}
    </div>
  );
};

export default RecommendedPage;
