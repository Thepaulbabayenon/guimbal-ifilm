'use client';

export const dynamic = "force-dynamic";


import { useRecommendations } from "@/hooks/useRecommendations";
import { useUser } from "@clerk/nextjs"; // Import Clerk's useUser
import { useEffect, useState } from "react";

const RecommendationsPage = () => {
  const { user, isLoaded } = useUser(); // Get user from Clerk
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (isLoaded && user?.id) {
      setUserId(user.id);
    }
  }, [isLoaded, user]);

  // Only call useRecommendations if userId is available
  const { recommendations, loading } = useRecommendations(userId ?? ""); // Use empty string as fallback

  if (!isLoaded) {
    return <p className="text-white p-6">Loading user...</p>;
  }

  if (!userId) {
    return <p className="text-white p-6">Please log in to see recommendations.</p>;
  }

  return (
    <div className="p-6 text-white bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">Recommended Movies</h1>
      {loading ? (
        <p>Loading recommendations...</p>
      ) : (
        <ul>
          {Array.isArray(recommendations) && recommendations.length > 0 ? (
            recommendations.map((rec) => (
              <li key={rec.id} className="p-4 bg-gray-800 rounded-lg mb-2">
                <h3 className="font-bold">{rec.title}</h3>
                <p className="text-gray-400">{rec.genre}</p>
                <p>{rec.description}</p>
              </li>
            ))
          ) : (
            <p>No recommendations found.</p>
          )}
        </ul>
      )}
    </div>
  );
};

export default RecommendationsPage;
