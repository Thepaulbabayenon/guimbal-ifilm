'use client';

import { useEffect, useState } from 'react';
import FilmLayout from '@/app/components/FilmComponents/FilmLayout';
import { Film } from '@/types/film';

// This function is imported but defined in your provided code
import { getAllFilms } from '@/app/api/getFilms';

export default function AllFilmsPage() {
  const [films, setFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchFilms() {
      try {
        setLoading(true);
        const allFilmsData = await getAllFilms();
        
        // Map the data to match the Film interface exactly
        const mappedFilms: Film[] = allFilmsData.map(film => ({
          id: film.id,
          title: film.title,
          overview: film.overview,
          watchList: film.watchList,
          trailerUrl: film.trailerUrl,
          year: film.year,
          age: film.age,
          time: film.time,
          initialRatings: film.initialRatings,
          category: film.category,
          imageUrl: film.imageString, // Map imageString to imageUrl
          averageRating: null // Provide default for averageRating
        }));
        
        setFilms(mappedFilms);
        setError(null);
      } catch (err) {
        console.error('Error fetching films:', err);
        setError('Failed to load films. Please try again later.');
      } finally {
        setLoading(false);
      }
    }

    fetchFilms();
  }, []);

  return (
    <main className="max-w-screen-2xl mx-auto">
      <div className="pb-10">
        <FilmLayout 
          title="All Films" 
          films={films} 
          loading={loading} 
          error={error}
        />
      </div>
    </main>
  );
}