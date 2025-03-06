"use client";
import { useState, useEffect } from "react";
import axios from "axios";

interface FilmPosterCardProps {
  filmId: number;
  initialTitle: string;
  className?: string;
}

export function FilmPosterCard({
  filmId,
  initialTitle,
  className
}: FilmPosterCardProps) {
  const [posterUrl, setPosterUrl] = useState<string | null>(null);
  const [title, setTitle] = useState(initialTitle);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFilmDetails = async () => {
      try {
        const response = await axios.get(`/api/films/${filmId}/poster`);
        
        if (response.data && response.data.posterUrl) {
          setPosterUrl(response.data.posterUrl);
        }

        // If the title from the API differs from initial title, update it
        if (response.data && response.data.title) {
          setTitle(response.data.title);
        }

        setLoading(false);
      } catch (error) {
        console.error("Error fetching film poster:", error);
        setLoading(false);
      }
    };

    fetchFilmDetails();
  }, [filmId]);

  if (loading) {
    return (
      <div className={`w-full h-80 bg-gray-300 animate-pulse rounded-lg ${className || ''}`}>
        <div className="w-full h-full flex items-center justify-center text-gray-500">
          Loading Poster...
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className || ''}`}>
      {posterUrl ? (
        <img 
          src={posterUrl} 
          alt={title} 
          className="w-full h-full object-cover rounded-lg"
        />
      ) : (
        <div className="w-full h-full bg-gray-200 rounded-lg flex items-center justify-center">
          <p className="text-gray-500">No Poster Available</p>
        </div>
      )}
      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 p-2 rounded-b-lg">
        <h2 className="text-white text-lg font-semibold line-clamp-1">{title}</h2>
      </div>
    </div>
  );
}