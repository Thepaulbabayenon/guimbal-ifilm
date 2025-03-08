'use client';

import { useState, useEffect } from "react";
import { Film } from "@/types/film"; // Ensure this path is correct

export function useRecommendations(userId: string | null) {
  const [recommendations, setRecommendations] = useState<Readonly<Film>[]>([]); 
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      console.error("❌ Missing userId in useRecommendations");
      setLoading(false);
      return;
    }

    const fetchRecommendations = async () => {
      try {
        const response = await fetch(`/api/recommendations?userId=${userId}`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data: Readonly<Film>[] = await response.json(); 
        setRecommendations(data);
      } catch (err) {
        setError("Failed to fetch recommendations.");
        console.error("❌ API request error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userId]);

  return { recommendations, loading, error };
}
