"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/app/auth/nextjs/useUser";
import { db } from "@/app/db/drizzle";
import { and, eq, sql } from "drizzle-orm";
import { film, userRatings, watchLists } from "@/app/db/schema";
import FilmLayout from "@/app/components/FilmComponents/FilmLayout";
import { Film } from "@/types/film"; 

async function getData(userId: string): Promise<Film[]> {
  try {
    console.log("Fetching films for user:", userId);
    
    const userFilms = await db
      .select({
        id: film.id,
        overview: film.overview,
        title: film.title,
        watchList: sql<boolean>`COALESCE(${watchLists.userId} IS NOT NULL, FALSE)`.as("watchList"),
        imageUrl: film.imageUrl,
        videoSource: film.videoSource,
        ageRating: film.ageRating,
        releaseYear: film.releaseYear,
        duration: film.duration,
        category: film.category,
        trailerUrl: film.trailerUrl,
        averageRating: sql<number>`COALESCE(AVG(${userRatings.rating}), 0)`.as("averageRating"),
      })
      .from(film)
      .leftJoin(
        watchLists,
        and(eq(watchLists.filmId, film.id), eq(watchLists.userId, userId))
      )
      .leftJoin(userRatings, eq(userRatings.filmId, film.id))
      .groupBy(film.id, watchLists.userId, film.imageUrl, film.trailerUrl, film.videoSource, film.ageRating, film.releaseYear, film.duration, film.category)
      .orderBy(sql`RANDOM()`)
      .limit(4);

    console.log("Films fetched from DB:", userFilms);
    
    
    const transformedFilms: Film[] = userFilms.map(f => ({
      id: f.id,
      overview: f.overview,
      title: f.title,
      watchList: f.watchList,
      imageUrl: f.imageUrl,
      videoSource: f.videoSource,
      ageRating: f.ageRating,
      releaseYear: f.releaseYear,
      time: f.duration,
      category: f.category || "Uncategorized",
      initialRatings: f.averageRating || 0,
      averageRating: f.averageRating || 0,
      trailerUrl: f.trailerUrl || ""
    }));
    
    console.log("Transformed films:", transformedFilms);
    return transformedFilms;
  } catch (error) {
    console.error("Database error:", error);
    return [];
  }
}

export default function RecentlyAdded() {
  const { user, isAuthenticated, isLoading } = useUser();
  const [films, setFilms] = useState<Film[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Handle mobile detection
  useEffect(() => {
    const checkForMobile = () => {
      setIsMobile(window.innerWidth < 768); // Common breakpoint for mobile
    };
    
    // Initial check
    checkForMobile();
    
    // Add event listener for window resize
    window.addEventListener('resize', checkForMobile);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', checkForMobile);
    };
  }, []);

  useEffect(() => {
    async function fetchFilms() {
      if (user && isAuthenticated) {
        try {
          setLoading(true);
          setError(null);
          const fetchedFilms = await getData(user.id);
          
          if (fetchedFilms.length === 0) {
            setError("No films found in your recently added list.");
          }
          
          // Check if image URLs are valid
          const validatedFilms = fetchedFilms.map(film => {
           
            if (!film.imageUrl || film.imageUrl.trim() === '') {
              return {
                ...film,
                imageUrl: '/default-placeholder.png' 
              };
            }
            return film;
          });
          
          setFilms(validatedFilms);
        } catch (err) {
          console.error("Error fetching films:", err);
          setError("Failed to load films. Please try again later.");
        } finally {
          setLoading(false);
        }
      } else if (!isLoading && !isAuthenticated) {
        setError("Please sign in to view recently added films.");
        setLoading(false);
      }
    }

    fetchFilms();
  }, [user, isAuthenticated, isLoading]);

  return (
    <FilmLayout
      title=""
      films={films}
      loading={loading}
      error={error}
      userId={user?.id}
      isMobile={isMobile}
    />
  );
}