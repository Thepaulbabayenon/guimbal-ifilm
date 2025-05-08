"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/app/auth/nextjs/useUser";
import { AccessDenied } from "@/app/components/AccessDenied";
import HomePageSkeleton from "@/app/components/HomepageSkeleton";

// Direct imports of components
import { TextLoop } from "@/components/ui/text-loop";
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
  isCustomCategory?: boolean;
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
    async function fetchRecommendations() {
      if (!user?.id) {
        setRecommendationsLoading(false);
        return;
      }
      
      setRecommendationsLoading(true);
      setRecommendationsError(null);
      
      try {
        // Fetch recommendations from our API endpoint
        const response = await fetch(`/api/recommendations/${user.id}`);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch recommendations: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Process recommendations data
        // Add AI Enhanced flag to recommendations from the hybrid algorithm
        const enhancedRecommendations = data.map((group: RecommendationGroup, index: number) => ({
          ...group,
          // First group is always AI enhanced in our hybrid system
          isAIEnhanced: index === 0,
        }));
        
        setRecommendations(enhancedRecommendations);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        setRecommendationsError(error instanceof Error ? error.message : "Failed to load recommendations");
      } finally {
        setRecommendationsLoading(false);
      }
    }
    
    fetchRecommendations();
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
          {!isMobile ? (
            <TextLoop interval={5}>
              <span>RECENTLY ADDED</span>
              <span>FRESH FINDS</span>
            </TextLoop>
          ) : (
            <span>RECENTLY ADDED</span>
          )}
        </h1>
        <RecentlyAdded />
      </div>
      
      {/* Personalized Recommendations Section */}
      {isAuthenticated && (
        <div className="mt-4 sm:mt-6">
          <h1 className={isMobile ? "text-xl font-bold text-gray-400 mb-2" : "text-2xl sm:text-3xl font-bold text-gray-400 mb-3 sm:mb-4 md:mb-6"}>
            {!isMobile ? (
              <TextLoop interval={5}>
                <span>RECOMMENDED FOR YOU</span>
                <span>PICKS FOR YOU</span>
              </TextLoop>
            ) : (
              <span>RECOMMENDED FOR YOU</span>
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
            {!isMobile && category.displayTitles.length > 1 ? (
              <TextLoop interval={5}>
                {category.displayTitles.map((title, i) => (
                  <span key={`${category.id}-${i}`}>{title}</span>
                ))}
              </TextLoop>
            ) : (
              <span>{category.title}</span>
            )}
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