"use client"; // Necessary for using hooks like useState, useEffect, useUser

import { useEffect, useState } from "react";
import { useUser } from "@/app/auth/nextjs/useUser";
import { useRecommendations, RecommendationCategory } from "@/hooks/useRecommendations"; // Assuming this hook exists and fetches categorized recommendations
import FilmLayout from "@/app/components/FilmComponents/FilmLayout"; // The component to display film grids/lists
import { Logo } from "@/app/components/Logo"; // Assuming a Logo component exists
import { Film as FilmIcon } from "lucide-react"; // Using lucide-react for icons

// If you want recommendations to potentially be different on each load
// (though useRecommendations hook likely handles caching/fetching logic)
export const dynamic = "force-dynamic";

const RecommendedPage = () => {
  const { user, isAuthenticated, isLoading: isAuthLoading } = useUser(); // Use alias for clarity if needed
  const [userId, setUserId] = useState<string | null>(null);

  // Effect to set userId when authentication is confirmed
  useEffect(() => {
    console.log("🔐 Auth status:", { isAuthenticated, isAuthLoading, userId: user?.id });
    if (!isAuthLoading && isAuthenticated && user?.id) {
      console.log("👤 Setting userId:", user.id);
      setUserId(user.id);
    } else if (!isAuthLoading && !isAuthenticated) {
      // Clear userId if user logs out
      setUserId(null);
    }
  }, [isAuthenticated, isAuthLoading, user]);

  // Fetch recommendations using the custom hook, only when userId is available
  // The hook handles its own loading and error states for the recommendation fetching process
  const { recommendations, loading: recommendationsLoading, error: recommendationsError } = useRecommendations(userId);

  // --- Render Loading State ---
  // Show loading if authentication is still loading OR if recommendations are loading
  if (isAuthLoading || (userId && recommendationsLoading)) {
    return (
      <div className="bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen flex flex-col items-center justify-center text-white">
        <Logo />
        <div className="mt-12 text-center">
          <div className="relative w-16 h-16 mx-auto mb-6">
            <div className="absolute top-0 left-0 w-full h-full border-4 border-purple-500/30 rounded-full"></div>
            <div className="absolute top-0 left-0 w-full h-full border-t-4 border-purple-500 rounded-full animate-spin"></div>
          </div>
          <p className="text-xl font-medium text-gray-200 mb-2">
            {isAuthLoading ? "Checking authentication..." : "Curating your recommendations..."}
          </p>
          <p className="text-gray-400">
            {isAuthLoading ? "Please wait." : "Analyzing your watch history to find films you'll love."}
          </p>
        </div>
      </div>
    );
  }

  // --- Render Authentication Required State ---
  if (!isAuthenticated && !isAuthLoading) {
    return (
      <div className="bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen p-6 flex flex-col items-center justify-center">
        <Logo />
        <div className="max-w-md w-full mx-auto mt-12 bg-gray-800/50 backdrop-blur-sm p-8 rounded-xl border border-gray-700 shadow-xl">
          <div className="flex items-center justify-center w-16 h-16 bg-gray-700 rounded-full mx-auto mb-6">
            <FilmIcon size={28} className="text-purple-400" />
          </div>
          <h2 className="text-2xl font-bold mb-4 text-center text-white">Sign in Required</h2>
          <p className="text-gray-300 text-center mb-8">Please log in to see personalized film recommendations tailored to your taste.</p>
          {/* Ideally, this button would trigger your sign-in flow */}
          <button
             onClick={() => { /* Add your sign-in logic here, e.g., redirect */ window.location.href = '/auth/login'; }}
             className="w-full py-3 bg-purple-600 hover:bg-purple-500 transition-colors rounded-lg font-medium text-white"
          >
            Sign In
          </button>
        </div>
      </div>
    );
  }

  // --- Render Error State (for fetching recommendations) ---
  if (recommendationsError) {
    return (
      <div className="bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen p-6">
        <Logo />
        <div className="max-w-md mx-auto mt-12 bg-red-900/20 border border-red-800/50 p-8 rounded-xl backdrop-blur-sm">
          <h2 className="text-xl font-bold mb-4 text-red-200">Unable to Load Recommendations</h2>
          <p className="text-red-100/80 mb-6">{recommendationsError}</p> {/* Display the specific error */}
          <button
            className="w-full py-2 bg-red-700 hover:bg-red-600 transition-colors px-4 rounded-lg font-medium text-white"
            onClick={() => window.location.reload()} // Simple retry mechanism
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // --- Render Recommendations ---
  // Ensure user is authenticated and userId is set before proceeding
  if (!userId) {
     // This case should ideally be covered by the loading/auth checks, but added for robustness
     return (
        <div className="bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen flex items-center justify-center text-white">
            Unexpected state. Please refresh.
        </div>
     );
  }

  return (
    <div className="bg-gradient-to-b from-gray-900 to-gray-800 min-h-screen text-white">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Logo />
          {user && ( // Display user info only if user object exists
            <div className="bg-gray-800/60 px-4 py-2 rounded-full flex items-center">
              <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center text-sm font-bold mr-2">
                {/* Use first letter of name or email, fallback to 'U' */}
                {user.name?.charAt(0) || user.email?.charAt(0)?.toUpperCase() || "U"}
              </div>
              <span className="text-gray-300 text-sm">{user.name || user.email || "User"}</span>
            </div>
          )}
        </div>

        {/* Page Title */}
        <div className="mb-12">
          <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
            Your Personalized Recommendations
          </h1>
          <p className="text-gray-400">Curated films based on your watch history and preferences</p>
        </div>

        {/* Recommendations Sections */}
        {/* Check if recommendations is an array and has content */}
        {Array.isArray(recommendations) && recommendations.length > 0 ? (
          <div className="space-y-16 pb-16">
            {recommendations.map((category: RecommendationCategory, categoryIndex: number) => (
              <div key={categoryIndex} className="mb-12">
                 {/* Category Header */}
                <div className="mb-6">
                  <div className="flex items-center mb-2">
                    <h2 className="text-2xl font-bold text-white">
                      {category.reason || `Recommended For You ${categoryIndex + 1}`} {/* Fallback title */}
                    </h2>
                    {category.isAIEnhanced && (
                      <span className="ml-3 text-xs font-medium bg-purple-700/70 backdrop-blur-sm px-3 py-1 rounded-full border border-purple-500/30">
                        AI Enhanced
                      </span>
                    )}
                  </div>
                  <p className="text-gray-400 text-sm">
                    {category.isAIEnhanced
                      ? "Recommendations powered by our advanced AI to match your taste profile"
                      : "Films selected based on your watch history"}
                  </p>
                </div>

                {/* Film Layout for the Category */}
                {/* Glass card effect for each section */}
                <div className="bg-gray-800/30 backdrop-blur-sm rounded-xl border border-gray-700/50 p-4">
                  <FilmLayout
                    title="" // Title is handled above the layout for categories
                    films={category.films || []} // Pass the films for this specific category
                    // Loading/Error for the *layout itself* are false/null because the parent handles the *data fetching* state.
                    // The layout component might have internal loading states for images etc., but not for the film data itself here.
                    loading={false}
                    error={null}
                    userId={userId} // Pass the user ID for potential actions within FilmLayout (like watchlist buttons)
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
           // --- Render No Recommendations State ---
          <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 p-8 rounded-xl text-center max-w-lg mx-auto shadow-xl">
            <div className="w-20 h-20 bg-gray-700/70 rounded-full flex items-center justify-center mx-auto mb-6">
              <FilmIcon size={36} className="text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold mb-4 text-white">No Recommendations Yet</h2>
            <p className="text-gray-300 mb-8 max-w-md mx-auto">
              We need to learn more about your taste. Watch and rate more films to receive personalized recommendations.
            </p>
            {/* Link to a discovery page or home page */}
            <button
              onClick={() => { /* Add navigation logic, e.g., router.push('/') */ window.location.href = '/'; }}
              className="bg-purple-600 hover:bg-purple-500 transition-colors px-6 py-3 rounded-lg font-medium text-white"
            >
              Discover Films
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecommendedPage;