"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/app/auth/nextjs/useUser";
import { AccessDenied } from "@/app/components/AccessDenied";
import HomePageSkeleton from "@/app/components/HomepageSkeleton";

// Direct imports of components
import FilmSliderWrapper from "@/app/components/FilmComponents/FilmsliderWrapper";
import FilmVideo from "../components/FilmComponents/FilmVideo";
import RecentlyAdded from "../components/RecentlyAdded";
import FilmSlider from "@/app/components/FilmComponents/DynamicFilmSlider";
import RecommendationSection from "@/app/components/RecommendationSection";

// Interface definitions
interface Film {
  id: number;
  imageUrl: string;
  title: string;
  ageRating?: number;
  duration: number;
  overview?: string;
  releaseYear: number;
  videoSource?: string;
  category?: string;
  trailerUrl?: string;
  averageRating: number | null;
  inWatchlist?: boolean;
  watchlistId?: string | null;
}

interface RecommendationGroup {
  reason: string;
  films: Film[];
  isAIEnhanced?: boolean;
}

// Film categories data
const filmCategories = [
  { id: "popular", title: "POPULAR FILMS", displayTitles: ["POPULAR FILMS", "TRENDING NOW"], categoryFilter: undefined, limit: 10 },
  { id: "comedy", title: "COMEDY FILMS", displayTitles: ["COMEDY FILMS", "LAUGH OUT LOUD"], categoryFilter: "comedy", limit: 8 },
  { id: "drama", title: "DRAMA FILMS", displayTitles: ["DRAMA FILMS", "CRITICALLY ACCLAIMED"], categoryFilter: "drama", limit: 8 },
  { id: "folklore", title: "FOLKLORE FILMS", displayTitles: ["FOLKLORE FILMS"], categoryFilter: "folklore", limit: 8 },
  { id: "horror", title: "HORROR FILMS", displayTitles: ["HORROR FILMS"], categoryFilter: "horror", limit: 8 },
  { id: "romance", title: "ROMANCE FILMS", displayTitles: ["ROMANCE FILMS"], categoryFilter: "romance", limit: 8 },
];

// Main HomePage component
const HomePage = () => {
  const { user, isAuthenticated, isLoading } = useUser();
  const [recommendations, setRecommendations] = useState<RecommendationGroup[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(true);
  const [recommendationsError, setRecommendationsError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  
  // Mobile detection
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    
    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);
  
  // Fetch recommendations from API
  useEffect(() => {
    let isMounted = true;
    
    async function fetchRecommendations() {
      if (!user?.id) {
        setRecommendationsLoading(false);
        return;
      }
      
      setRecommendationsLoading(true);
      setRecommendationsError(null);
      
      try {
        // Fetch recommendations from our API endpoint with a timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout
        
        const response = await fetch(`/api/recommendations/${user.id}`, {
          signal: controller.signal
        });
        
        clearTimeout(timeoutId);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch recommendations: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Make sure component is still mounted before updating state
        if (isMounted) {
          // Process recommendations data
          // Mark the first group as AI enhanced (from our hybrid algorithm)
          const enhancedRecommendations = data.map((group: RecommendationGroup, index: number) => ({
            ...group,
            isAIEnhanced: index === 0, // First group is always AI enhanced in our hybrid system
            films: group.films.filter((film: Film) => film && film.id) // Filter out any null/invalid films
          })).filter((group: RecommendationGroup) => group.films.length > 0); // Only include groups with films
          
          setRecommendations(enhancedRecommendations);
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        if (isMounted) {
          if (error instanceof Error && error.name === 'AbortError') {
            setRecommendationsError("Request timed out. Please try again later.");
          } else {
            setRecommendationsError(error instanceof Error ? error.message : "Failed to load recommendations");
          }
        }
      } finally {
        if (isMounted) {
          setRecommendationsLoading(false);
        }
      }
    }
    
    fetchRecommendations();
    
    return () => {
      isMounted = false;
    };
  }, [user?.id]);
  
  // Handle loading state
  if (isLoading) {
    return <HomePageSkeleton isMobile={isMobile} />;
  }
  
  // Handle not authenticated state
  if (!isAuthenticated) {
    return <AccessDenied />;
  }
  
  return (
    <div className="pt-12 sm:pt-16 lg:pt-20 pb-6 sm:pb-10 px-3 sm:px-4 md:px-6 lg:px-8">
      {/* Hero Video Section */}
      <div className="mb-4 sm:mb-6 md:mb-8 lg:mb-10 min-h-[200px] sm:min-h-[300px]">
        <FilmVideo isMobile={isMobile} />
      </div>
      
      {/* Recently Added Section */}
      <div className="mt-4 sm:mt-6">
        <h1 className={isMobile ? "text-xl font-bold text-gray-400 mb-2" : "text-2xl sm:text-3xl font-bold text-gray-400 mb-3 sm:mb-4 md:mb-6"}>
          RECENTLY ADDED
        </h1>
        <RecentlyAdded />
      </div>
      
      {/* Personalized Recommendations Section */}
      {isAuthenticated && recommendations.length > 0 && (
        <div className="mt-4 sm:mt-6">
          <h1 className={isMobile ? "text-xl font-bold text-gray-400 mb-2" : "text-2xl sm:text-3xl font-bold text-gray-400 mb-3 sm:mb-4 md:mb-6"}>
            <span>RECOMMENDED FOR YOU</span>
            {!recommendationsLoading && recommendations.some(group => group.isAIEnhanced) && (
              <span className="ml-2 text-sm text-blue-400 font-normal">AI Enhanced</span>
            )}
          </h1>
          <RecommendationSection
            recommendations={recommendations}
            loading={recommendationsLoading}
            error={recommendationsError}
            FilmSliderComponent={FilmSliderWrapper}
            isMobile={isMobile}
          />
        </div>
      )}
      
      {/* Film Categories */}
      {filmCategories.map((category) => (
        <div key={category.id} className="mt-4 sm:mt-6">
          <h1 className={isMobile ? "text-xl font-bold text-gray-400 mb-2" : "text-2xl sm:text-3xl font-bold text-gray-400 mb-3 sm:mb-4 md:mb-6"}>
            {category.title}
          </h1>
          <FilmSlider
            title={category.title}
            categoryFilter={category.categoryFilter}
            limit={isMobile ? Math.min(category.limit, 6) : category.limit}
            isMobile={isMobile}
          />
        </div>
      ))}
    </div>
  );
};

export default HomePage;