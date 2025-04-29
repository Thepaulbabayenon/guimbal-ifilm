'use client';

import { useState, useEffect } from "react";
import { Film } from "@/types/film";

// Define the recommendation category type
export interface RecommendationCategory {
  reason: string;
  films: Film[];
  isAIEnhanced?: boolean;
  isCustomCategory?: boolean;
}

export function useRecommendations(userId: string | null) {
  const [recommendations, setRecommendations] = useState<RecommendationCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRecommendations = async (userIdParam: string | null) => {
    // Don't attempt to fetch if userId is empty
    if (!userIdParam || userIdParam === "") {
      console.log("⚠️ No userId provided to useRecommendations hook");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    console.log(`🔍 Fetching recommendations for userId: ${userIdParam}`);
    try {
      const url = `/api/recommendations?userId=${userIdParam}`;
      console.log(`📡 Request URL: ${url}`);
      
      const response = await fetch(url);
      console.log(`📥 Response status: ${response.status}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log(`📦 Received data:`, data);
      
      // Check if recommendations property exists in the response
      if (data.recommendations && Array.isArray(data.recommendations)) {
        console.log(`✅ Successfully loaded ${data.recommendations.length} recommendation categories`);
        setRecommendations(data.recommendations);
      } else if (Array.isArray(data)) {
        console.log(`✅ Successfully loaded ${data.length} recommendation categories`);
        setRecommendations(data);
      } else {
        console.error("❌ Expected array of recommendations but got:", typeof data);
        setError("Received malformed data from server");
        setRecommendations([]);
      }
    } catch (err) {
      console.error("❌ API request error:", err);
      setError(`Failed to fetch recommendations: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  };

  // Function to refresh recommendations
  const refreshRecommendations = () => {
    fetchRecommendations(userId);
  };

  useEffect(() => {
    fetchRecommendations(userId);
  }, [userId]);

  return { recommendations, loading, error, refreshRecommendations };
}