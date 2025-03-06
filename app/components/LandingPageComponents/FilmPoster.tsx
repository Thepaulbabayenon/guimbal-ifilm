'use client';
import { useState, useEffect } from "react";
import { db } from "@/app/db/drizzle";
import { film } from "@/app/db/schema";
import { desc } from "drizzle-orm";
import Image from "next/image";

interface Film {
  id: number;
  imageUrl: string;
  title: string;
}

async function getRandomFilmPoster(): Promise<Film | null> {
  try {
    const filmPosters = await db
      .select({
        id: film.id,
        imageUrl: film.imageUrl,
        title: film.title
      })
      .from(film)
      .orderBy(desc(film.rank))
      .limit(20);

    if (filmPosters.length === 0) {
      throw new Error("No film posters available.");
    }

    const randomIndex = Math.floor(Math.random() * filmPosters.length);
    return filmPosters[randomIndex];
  } catch (error) {
    console.error("Failed to fetch film posters:", error);
    return null;
  }
}
export default function FilmPoster() {
  const [poster, setPoster] = useState<Film | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchPoster = async () => {
      const filmPoster = await getRandomFilmPoster();
      setPoster(filmPoster);
      setIsLoading(false);
    };

    fetchPoster();
  }, []);

  if (isLoading) {
    return (
      <div className="fixed inset-0 flex justify-center items-center">
        <div className="animate-pulse bg-gray-300 w-full h-full"></div>
      </div>
    );
  }

  if (!poster) {
    return (
      <div className="fixed inset-0 flex justify-center items-center">
        <p className="text-white text-xl">No posters available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="fixed inset-0">
      <Image 
        src={poster.imageUrl} 
        alt={`Poster for ${poster.title}`}
        fill
        priority
        className="absolute top-0 left-0 w-full h-full object-cover brightness-[45%]"
      />
    </div>
  );
}