'use client';

export const dynamic = "force-dynamic";

import { useRecommendations, RecommendationCategory } from "@/hooks/useRecommendations";
import { useUser } from "@/app/auth/nextjs/useUser";
import { useEffect, useState } from "react";
import FilmLayout from "@/app/components/FilmComponents/FilmLayout";

const RecommendationsPage = () => {
  const { user, isAuthenticated } = useUser();
  const [userId, setUserId] = useState<string | null>(null);

  // Debug user authentication
  useEffect(() => {
    console.log("🔐 Auth status:", { isAuthenticated, userId: user?.id });
    
    if (isAuthenticated && user?.id) {
      console.log("👤 Setting userId:", user.id);
      setUserId(user.id);
    }
  }, [isAuthenticated, user]);

  // Only call useRecommendations if userId is available
  const { recommendations, loading, error } = useRecommendations(userId);

  // Render loading state
  if (loading) {
    return (
      <div className="p-6 text-white bg-gray-900 min-h-screen flex justify-center items-center">
        <div className="text-center">
          <p className="text-xl mb-2">Loading recommendations...</p>
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white mx-auto"></div>
        </div>
      </div>
    );
  }

  // Render authentication state
  if (!isAuthenticated) {
    return (
      <div className="p-6 text-white bg-gray-900 min-h-screen">
        <div className="max-w-md mx-auto bg-gray-800 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Authentication Required</h2>
          <p>Please log in to see your personalized film recommendations.</p>
        </div>
      </div>
    );
  }

  // Render error state
  if (error) {
    return (
      <div className="p-6 text-white bg-gray-900 min-h-screen">
        <div className="max-w-md mx-auto bg-red-900/50 p-6 rounded-lg">
          <h2 className="text-xl font-bold mb-4">Error Loading Recommendations</h2>
          <p>{error}</p>
          <button 
            className="mt-4 bg-red-700 hover:bg-red-600 px-4 py-2 rounded"
            onClick={() => window.location.reload()}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white bg-gray-900 min-h-screen">
      <div className="p-6">
        <h1 className="text-2xl font-bold mb-6">Recommended Films for You</h1>
      </div>
      
      {Array.isArray(recommendations) && recommendations.length > 0 ? (
        <div className="space-y-16">
          {recommendations.map((category: RecommendationCategory, categoryIndex: number) => (
            <div key={categoryIndex} className="mb-8">
              <div className="px-6">
                <h2 className="text-xl font-bold mb-4">
                  {category.reason}
                  {category.isAIEnhanced && (
                    <span className="ml-2 text-sm bg-purple-700 px-2 py-1 rounded">AI Enhanced</span>
                  )}
                </h2>
              </div>
              
              {/* Use FilmLayout component here instead of the custom grid */}
              <FilmLayout
                title="" 
                films={category.films || []}
                loading={false}  
                error={null}
                userId={userId || undefined}
                isMobile={false}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-800 p-8 rounded-lg text-center max-w-md mx-auto">
          <h2 className="text-xl font-bold mb-4">No Recommendations Yet</h2>
          <p className="mb-4">
            Watch more films to get personalized recommendations based on your viewing history.
          </p>
          <button className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded">
            Explore Films
          </button>
        </div>
      )}
    </div>
  );
};

export default RecommendationsPage;