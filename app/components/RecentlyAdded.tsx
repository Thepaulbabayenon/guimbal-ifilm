"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { db } from "@/app/db/drizzle";
import { FilmCard } from "./FilmComponents/FilmCard";
import { useUser } from "@/app/auth/nextjs/useUser";
import { and, asc, eq, avg, sql } from "drizzle-orm";
import { film, userRatings, watchLists } from "@/app/db/schema";

// Define a TypeScript interface for the film data
interface FilmData {
  id: number;
  overview: string;
  title: string;
  WatchList?: {
    watchListId?: number;
    userId: string;
    filmId: number;
  } | null; 
  imageString: string;
  trailer: string;
  age: number;
  release: number;
  duration: number;
  category: string;
  averageRating: number | null;
}

// Fetch film data and calculate average ratings
async function getData(userId: string): Promise<FilmData[]> {
  try {
    const userFilms = await db
      .select({
        id: film.id,
        overview: film.overview,
        title: film.title,
        WatchList: {
          watchListId: watchLists.filmId,
          userId: watchLists.userId,
          filmId: watchLists.filmId,
        },
        imageString: film.imageUrl,
        trailer: film.trailerUrl,
        age: film.ageRating,
        release: film.releaseYear,
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
      .groupBy(film.id, watchLists.filmId)
      .orderBy(asc(avg(userRatings.rating)))
      .limit(4);

    return userFilms;
  } catch (error) {
    console.error("Database error:", error);
    return [];
  }
}

export default function RecentlyAdded() {
  const { user, isAuthenticated, isLoading } = useUser(); 
  const [data, setData] = useState<FilmData[]>([]); 

  useEffect(() => {
    if (user && isAuthenticated) {
      getData(user.id).then(setData);
    }
  }, [user, isAuthenticated]);

  if (isLoading) return <p>Loading...</p>;
  if (!isAuthenticated) return <p>Please sign in to view recently added films.</p>;

  return (
    <div className="recently-added-container mb-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-8 gap-6">
        {data.map((film) => (
          <div key={film.id} className="relative h-48">
            <Image
              src={film.imageString}
              alt="film"
              width={500}
              height={400}
              className="rounded-sm absolute w-full h-full object-cover"
            />
            <div className="h-60 relative z-10 w-full transform transition duration-500 hover:scale-125 opacity-0 hover:opacity-100">
              <div className="bg-gradient-to-b from-transparent via-black/50 to-black z-10 w-full h-full rounded-lg flex items-center justify-center border">
                <Image
                  src={film.imageString}
                  alt="Film"
                  width={800}
                  height={800}
                  className="absolute w-full h-full -z-10 rounded-lg object-cover"
                />
                <FilmCard
                  filmId={film.id}
                  overview={film.overview}
                  title={film.title}
                  watchList={!!film.WatchList?.watchListId} 
                  watchListId={film.WatchList?.watchListId?.toString() ?? ""}
                  trailerUrl={film.trailer}
                  age={film.age}
                  time={film.duration}
                  year={film.release}
                  category={film.category}
                  initialRatings={Number(film.averageRating) || 0}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
