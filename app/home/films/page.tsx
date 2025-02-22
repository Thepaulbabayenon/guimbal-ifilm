"use client";

import { useEffect, useState } from "react";
import { getAllFilms } from "@/app/api/getFilms";
import FilmLayout from "@/app/components/FilmComponents/FilmLayout";

interface Film {
  watchList: boolean;
  trailerUrl: string;
  year: number;
  time: number;
  initialRatings: number;
  id: number;
  title: string;
  age: number;
  duration: number;
  imageString: string;
  overview: string;
  release: number;
  videoSource: string;
  category: string;
  trailer: string;
  rank: number;
}

export default function AllFilms() {
  const [films, setFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // Use null for better handling

  useEffect(() => {
    async function fetchFilms() {
      try {
        const data: Film[] = await getAllFilms();
        if (data.length === 0) {
          setFilms([]);
          setError("No films found.");
        } else {
          setFilms(data);
          setError(null); // Reset error if films exist
        }
      } catch (error) {
        console.error("Error fetching films:", error);
        setError("Failed to fetch films.");
      } finally {
        setLoading(false);
      }
    }

    fetchFilms();
  }, []);

  return <FilmLayout 
  title="All Films" 
  films={films} 
  loading={loading} 
  error={error} 
  />;
}
