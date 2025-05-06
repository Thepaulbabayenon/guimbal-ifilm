"use client";

import { useEffect, useState, memo, ReactNode, FC, ReactElement } from "react";
import { useUser } from "@/app/auth/nextjs/useUser";
import { AccessDenied } from "@/app/components/AccessDenied";
import HomePageSkeleton from "@/app/components/HomepageSkeleton";

// Import components directly to reduce code splitting overhead
import { TextLoop } from "@/components/ui/text-loop";
import FilmVideo from "../components/FilmComponents/FilmVideo";
import RecentlyAdded from "../components/RecentlyAdded";
import FilmSlider from "@/app/components/FilmComponents/DynamicFilmSlider";
import RecommendationSection from "@/app/components/RecommendationSection";
import FilmSliderWrapper from "@/app/components/FilmComponents/FilmsliderWrapper";

// Define interfaces for type safety
interface LoadingPlaceholderProps {
  height?: string;
}

interface FilmSectionProps {
  title: string;
  children: ReactNode;
  height?: string;
}

interface FilmSliderProps {
  title: string;
  categoryFilter?: string;
  limit: number;
}

interface FilmCategory {
  id: string;
  title: string;
  categoryFilter?: string;
  limit: number;
}

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

// Simple Loading Placeholder
const LoadingPlaceholder: FC<LoadingPlaceholderProps> = memo(({ height = "200px" }) => (
  <div 
    className="bg-gray-800/20 rounded animate-pulse" 
    style={{ height }}
  />
));

LoadingPlaceholder.displayName = "LoadingPlaceholder";

// Simplified film categories with reduced options
const filmCategories: FilmCategory[] = [
  { id: "popular", title: "POPULAR FILMS", categoryFilter: undefined, limit: 10 },
  { id: "comedy", title: "COMEDY FILMS", categoryFilter: "comedy", limit: 8 },
  { id: "drama", title: "DRAMA FILMS", categoryFilter: "drama", limit: 8 },
  { id: "folklore", title: "FOLKLORE FILMS", categoryFilter: "folklore", limit: 8 },
  { id: "horror", title: "HORROR FILMS", categoryFilter: "horror", limit: 8 },
  { id: "romance", title: "ROMANCE FILMS", categoryFilter: "romance", limit: 8 },
];

// Simplified recommendations hook with proper typing
const useRecommendations = (userId: string | null) => {
  const [recommendations, setRecommendations] = useState<RecommendationGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchRecommendations = async () => {
      try {
        // Mock recommendation data
        setRecommendations([{
          reason: "Based on your viewing history",
          films: [],
          isAIEnhanced: true
        }]);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userId]);

  return { recommendations, loading, error };
};

// Memoized section component with proper typing
const FilmSection: FC<FilmSectionProps> = memo(({ title, children, height = "240px" }) => (
  <div className="mt-6 section-container" style={{ minHeight: height }}>
    <h1 className="text-2xl sm:text-3xl font-bold text-gray-400 mb-4">{title}</h1>
    {children}
  </div>
));

FilmSection.displayName = "FilmSection";

// Memoized film slider with proper typing
const MemoizedFilmSlider: FC<FilmSliderProps> = memo(({ title, categoryFilter, limit }) => (
  <FilmSlider
    title={title}
    categoryFilter={categoryFilter}
    limit={limit}
  />
));

MemoizedFilmSlider.displayName = "MemoizedFilmSlider";

// Main HomePage component - simplified
const HomePage: FC = () => {
  const { user, isAuthenticated, isLoading } = useUser();
  const { recommendations, loading: recommendationsLoading, error: recommendationsError } = 
    useRecommendations(user?.id || null);

  // Show skeleton while auth is loading
  if (isLoading) {
    return <HomePageSkeleton />;
  }

  // Handle not authenticated state
  if (!isAuthenticated) {
    return <AccessDenied />;
  }

  return (
    <div className="pt-16 lg:pt-20 pb-10 px-4 md:px-6 lg:px-8">
      {/* Hero Video Section */}
      <div className="mb-6 md:mb-8 lg:mb-10 min-h-[300px]">
        <FilmVideo />
      </div>  

      {/* Recently Added Section */}
      <FilmSection title="RECENTLY ADDED">
        <RecentlyAdded />
      </FilmSection>

      {/* Recommendations Section */}
      <FilmSection title="RECOMMENDED FOR YOU">
        <RecommendationSection
          recommendations={recommendations}
          loading={recommendationsLoading}
          error={recommendationsError}
          FilmSliderComponent={FilmSliderWrapper}
        />
      </FilmSection>

      {/* Film Categories */}
      {filmCategories.map((category) => (
        <FilmSection key={category.id} title={category.title}>
          <MemoizedFilmSlider
            title={category.title}
            categoryFilter={category.categoryFilter}
            limit={category.limit}
          />
        </FilmSection>
      ))}
    </div>
  );
};

export default memo(HomePage);