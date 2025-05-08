'use client';

import { useState, useEffect, useCallback } from "react";
import { Film } from "@/types/film";

// Define the recommendation category type for better type safety
export interface RecommendationCategory {
  reason: string;
  films: Film[];
  isAIEnhanced?: boolean;
  isCustomCategory?: boolean;
}

/**
 * Custom hook to fetch and manage film recommendations
 * 
 * @param userId - The user ID to fetch recommendations for
 * @param options - Optional configuration
 * @returns Recommendation data, loading state, error state, and refresh function
 */
export function useRecommendations(
  userId: string | null, 
  options = { useAI: false, autoRefresh: false, useProxy: true }
) {
  const [recommendations, setRecommendations] = useState<RecommendationCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchTime, setLastFetchTime] = useState<number | null>(null);

  // Memoize the fetch function to avoid recreation on each render
  const fetchRecommendations = useCallback(async (
    userIdParam: string | null,
    forceRefresh = false
  ) => {
    // Don't attempt to fetch if userId is empty
    if (!userIdParam) {
      console.log("⚠️ No userId provided to useRecommendations hook");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);
    
    console.log(`🔍 Fetching recommendations for userId: ${userIdParam}`);
    try {
      // Build URL with query parameters
      const params = new URLSearchParams({
        userId: userIdParam,
        ...(options.useAI ? { useAI: 'true' } : {}),
        ...(forceRefresh ? { refresh: 'true' } : {})
      });
      
      let url = `/api/recommendations?${params.toString()}`;
      
      // For external APIs that might have CORS issues, use the proxy
      if (options.useProxy && url.includes('extensions.aitopia.ai')) {
        // Create a proxy URL that forwards to the external API
        const encodedTargetUrl = encodeURIComponent(url);
        url = `/api/proxy?url=${encodedTargetUrl}`;
      }
      
      console.log(`📡 Request URL: ${url}`);
      
      const response = await fetch(url, {
        // Add cache control headers to prevent browsers from caching responses
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0'
        }
      });
      
      console.log(`📥 Response status: ${response.status}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Properly handle the response data structure
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
      
      // Update last fetch time
      setLastFetchTime(Date.now());
    } catch (err) {
      console.error("❌ API request error:", err);
      setError(`Failed to fetch recommendations: ${err instanceof Error ? err.message : 'Unknown error'}`);
      setRecommendations([]); // Ensure recommendations is always an array
    } finally {
      setLoading(false);
    }
  }, [options.useAI, options.useProxy]);

  // Function to refresh recommendations
  const refreshRecommendations = useCallback(() => {
    if (userId) {
      fetchRecommendations(userId, true);
    }
  }, [userId, fetchRecommendations]);

  // Handle auto-refresh (if enabled)
  useEffect(() => {
    if (!options.autoRefresh || !userId) return;
    
    // Auto-refresh every 30 minutes
    const refreshInterval = 30 * 60 * 1000;
    const intervalId = setInterval(() => {
      // Only refresh if recommendations are stale or empty
      if (!lastFetchTime || (Date.now() - lastFetchTime) > refreshInterval) {
        fetchRecommendations(userId, false);
      }
    }, refreshInterval);
    
    return () => clearInterval(intervalId);
  }, [options.autoRefresh, userId, lastFetchTime, fetchRecommendations]);

  // Fetch recommendations when userId changes
  useEffect(() => {
    if (userId) {
      console.log("🔄 userId changed, fetching new recommendations");
      fetchRecommendations(userId, false);
    } else {
      // Reset state when userId is null
      setLoading(false);
      setRecommendations([]);
      setError(null);
      setLastFetchTime(null);
    }
  }, [userId, fetchRecommendations]);

  // Add a CORS error handler that uses the proxy as fallback
  useEffect(() => {
    const originalFetch = window.fetch;
    
    // Override the fetch method to catch CORS errors
    window.fetch = async function(...args) {
      try {
        return await originalFetch.apply(this, args);
      } catch (err) {
        if (err instanceof TypeError && err.message.includes('CORS')) {
          console.error('🔒 CORS error detected:', err);
          
          // If this is related to our recommendations and proxy is enabled
          if (options.useProxy && args[0] && args[0].toString().includes('/api/recommendations')) {
            console.log('⚠️ Attempting to use proxy as fallback');
            
            // Extract the URL and create a proxy URL
            const url = args[0].toString();
            const encodedUrl = encodeURIComponent(url);
            const proxyUrl = `/api/proxy?url=${encodedUrl}`;
            
            // Try the request again through the proxy
            const proxyArgs = [...args];
            proxyArgs[0] = proxyUrl;
            
            try {
              return await originalFetch.apply(this, [proxyArgs[0] as RequestInfo, proxyArgs[1] as RequestInit | undefined]);
            } catch (proxyErr) {
              console.error('❌ Proxy fallback failed:', proxyErr);
              setError('Connection error: Unable to connect to recommendations service even with proxy');
              throw proxyErr;
            }
          } else {
         
            if (args[0] && args[0].toString().includes('/api/recommendations')) {
              setError('CORS error: Unable to connect to recommendations service');
            }
            throw err;
          }
        }
        throw err;
      }
    };
    
    // Restore original fetch on cleanup
    return () => {
      window.fetch = originalFetch;
    };
  }, [options.useProxy]);

  return { 
    recommendations, 
    loading, 
    error, 
    refreshRecommendations,
    lastFetchTime
  };
}