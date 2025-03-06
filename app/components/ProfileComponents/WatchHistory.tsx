"use client"; // Ensure it's a Client Component

import { useEffect, useState } from "react";
import { db } from "@/app/db/drizzle";
import { eq } from "drizzle-orm";
import { watchedFilms, film } from "@/app/db/schema";
import { useAuth } from "@/app/auth/nextjs/useUser"; // Import useAuth hook

type WatchHistoryEntry = {
  filmId: number;
  currentTimestamp: number | null;
  film: {
    imageString: string;
    title: string;
    duration: number;
  };
};

export default function WatchHistory() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [history, setHistory] = useState<WatchHistoryEntry[]>([]);

  useEffect(() => {
    async function fetchHistory() {
      if (!user || !isAuthenticated) return;

      try {
        const response = await fetch(`/api/watch-history?userId=${user.id}`);
        if (!response.ok) throw new Error("Failed to fetch watch history");

        const data: WatchHistoryEntry[] = await response.json();
        setHistory(data);
      } catch (error) {
        console.error("Error fetching watch history:", error);
      }
    }

    fetchHistory();
  }, [user, isAuthenticated]);

  if (isLoading) return <p>Loading...</p>;
  if (!isAuthenticated) return <p>Please sign in to view your watch history.</p>;

  return (
    <section>
      <h2>Watch History</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {history.map((entry) => (
          <div key={entry.filmId} className="relative">
            <img
              src={entry.film.imageString || "/default-image.jpg"}
              alt={entry.film.title}
              className="rounded-lg"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2">
              <p className="text-sm truncate">{entry.film.title}</p>
              <progress
                value={entry.currentTimestamp ?? 0}
                max={entry.film.duration ?? 0}
                className="w-full"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
