"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/app/auth/nextjs/useUser";
import { db } from "@/app/db/drizzle";
import { and, eq, sql } from "drizzle-orm";
import { film, userRatings, watchLists } from "@/app/db/schema";
import FilmLayout from "@/app/components/FilmComponents/FilmLayout";

interface Film {
  id: number;
  overview: string;
  title: string;
  watchList: boolean;
  imageUrl: string;
  trailerUrl: string;
  ageRating: number;
  duration: number;
  category: string;
  averageRating: number;
  releaseYear: number; 
  time: number; 
  initialRatings: number; 
}




async function getData(userId: string): Promise<Film[]> {
  try {
    const userFilms = await db
      .select({
        id: film.id,
        overview: film.overview,
        title: film.title,
        watchList: sql<boolean>`COALESCE(${watchLists.userId} IS NOT NULL, FALSE)`.as("watchList"),
        imageUrl: film.imageUrl,
        trailerUrl: film.trailerUrl,
        ageRating: film.ageRating,
        releaseYear: film.releaseYear,
        duration: film.duration,
        category: film.category,
        averageRating: sql<number>`AVG(${userRatings.rating})`.as("averageRating"),
      })
      .from(film)
      .leftJoin(
        watchLists,
        and(eq(watchLists.filmId, film.id), eq(watchLists.userId, userId))
      )
      .leftJoin(userRatings, eq(userRatings.filmId, film.id))
      .groupBy(film.id, watchLists.userId) 
      .orderBy(sql<number>`AVG(${userRatings.rating}) DESC`)
      .limit(4);

    return userFilms.map(f => ({
      ...f,
      year: f.releaseYear, 
      time: f.duration, 
      initialRatings: f.averageRating || 0, 
    }));
  } catch (error) {
    console.error("Database error:", error);
    return [];
  }
}


export default function RecentlyAdded() {
  
  const { user, isAuthenticated, isLoading } = useUser();
  const [films, setFilms] = useState<Film[]>([]);

  useEffect(() => {
    if (user && isAuthenticated) {
      getData(user.id).then(setFilms);
    }
  }, [user, isAuthenticated]);

  if (isLoading) return <p>Loading...</p>;
  if (!isAuthenticated) return <p>Please sign in to view recently added films.</p>;

  return (
    <FilmLayout
      title=""
      films={films}
      loading={isLoading}
      error={films.length === 0 ? "No films found" : null}
      userId={user?.id}
    />
  );
}
