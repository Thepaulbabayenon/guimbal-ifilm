"use client"; // Ensure this is a Client Component

import { useEffect, useState } from "react";
import { useAuth } from "@/app/auth/nextjs/useUser";
import { db } from "@/app/db/drizzle";
import { eq } from "drizzle-orm";
import { userRatings, film } from "@/app/db/schema";

type UserRatingEntry = {
  filmId: number;
  rating: number;
  timestamp: Date;
  film: {
    title: string;
  };
};

export default function UserRatings() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const [ratings, setRatings] = useState<UserRatingEntry[]>([]);

  useEffect(() => {
    async function fetchRatings() {
      if (!user || !isAuthenticated) return;

      try {
        const response = await fetch(`/api/user-ratings?userId=${user.id}`);
        if (!response.ok) throw new Error("Failed to fetch ratings");

        const data: UserRatingEntry[] = await response.json();
        setRatings(data);
      } catch (error) {
        console.error("Error fetching user ratings:", error);
      }
    }

    fetchRatings();
  }, [user, isAuthenticated]);

  if (isLoading) return <p>Loading...</p>;
  if (!isAuthenticated) return <p>Please sign in to view your ratings.</p>;

  return (
    <section>
      <h2>Your Ratings</h2>
      <div className="space-y-4">
        {ratings.map((rating) => (
          <div key={rating.filmId} className="rating-item">
            <h3>{rating.film.title}</h3>
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < rating.rating ? "filled" : ""}>
                  ★
                </span>
              ))}
            </div>
            <time className="text-sm text-muted">
              {rating.timestamp.toLocaleDateString()}
            </time>
          </div>
        ))}
      </div>
    </section>
  );
}
