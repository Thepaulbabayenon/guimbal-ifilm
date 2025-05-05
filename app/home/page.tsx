"use client";

import { useEffect, useState, memo, useCallback, lazy, Suspense, ReactElement, useRef } from "react";
import { useUser } from "@/app/auth/nextjs/useUser";
import { AccessDenied } from "@/app/components/AccessDenied";
import HomePageSkeleton from "@/app/components/HomepageSkeleton";

// Import small, critical UI components directly
import { TextLoop } from "@/components/ui/text-loop";

// Strategically chunk larger components
const FilmVideo = lazy(() => 
  import(/* webpackChunkName: "film-video" */ "../components/FilmComponents/FilmVideo")
);

// Critical path components - import directly but with smaller bundle splits
const RecentlyAdded = lazy(() => 
  import(/* webpackChunkName: "recently-added" */ "../components/RecentlyAdded")
);

const FilmSlider = lazy(() => 
  import(/* webpackChunkName: "film-slider" */ "@/app/components/FilmComponents/DynamicFilmSlider")
);

const RecommendationSection = lazy(() => 
  import(/* webpackChunkName: "recommendations" */ "@/app/components/RecommendationSection")
);

// FilmSliderWrapper is likely a wrapper for FilmSlider, so we can import it directly
import FilmSliderWrapper from "@/app/components/FilmComponents/FilmsliderWrapper";

// Interface definitions
interface LazySectionProps {
  children: ReactElement;
  title: string;
  altTitles?: string[];
  importance: 'high' | 'medium' | 'low';
  height?: string;
  shouldAnimate?: boolean;
}

interface FilmCategory {
  id: string;
  title: string;
  displayTitles: string[]; 
  categoryFilter?: string;
  limit: number;
  height: string;
  importance: 'high' | 'medium' | 'low';
}

// Define Film interface to match RecommendationSection's Film interface
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

// Update interface to match RecommendationSection's expected input
interface RecommendationGroup {
  reason: string;
  films: Film[];
  isAIEnhanced?: boolean;
  isCustomCategory?: boolean;
}

// Create a custom hook for recommendations that returns the expected types
const useRecommendations = (userId: string | null) => {
  const [recommendations, setRecommendations] = useState<RecommendationGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    // Fetch recommendations
    const fetchRecommendations = async () => {
      try {
        // Implementation of fetching recommendations
        // For example:
        // const response = await fetch(`/api/recommendations?userId=${userId}`);
        // const data = await response.json();
        // Placeholder: Mock recommendation data with proper structure
        setRecommendations([
          {
            reason: "Based on your viewing history",
            films: [],
            isAIEnhanced: true
          }
        ]);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
        setLoading(false);
      }
    };

    fetchRecommendations();
  }, [userId]);

  return { recommendations, loading, error };
};

// Extended Navigator interface to include deviceMemory
interface ExtendedNavigator extends Navigator {
  deviceMemory?: number;
}

// Optimized loading placeholder
const LoadingPlaceholder = memo(({ height }: { height: string }) => (
  <div 
    className="bg-gray-800/20 rounded" 
    style={{ 
      height,
      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
    }} 
  />
));

LoadingPlaceholder.displayName = "LoadingPlaceholder";

// Define the pulse animation only once
const GlobalStyles = () => (
  <style jsx global>{`
    @keyframes pulse {
      0%, 100% {
        opacity: 0.5;
      }
      50% {
        opacity: 0.8;
      }
    }
  `}</style>
);

// Simplified and performance-optimized LazySection
const LazySection = memo(({ 
  children, 
  title, 
  altTitles = [], 
  importance, 
  height = "200px",
  shouldAnimate = false
}: LazySectionProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const allTitles = [title, ...altTitles];
  
  // Calculate loading parameters based on importance
  const rootMargin = {
    high: "400px", // Load high priority content sooner
    medium: "200px",
    low: "50px" // Load low priority content just before it's needed
  }[importance];
  
  useEffect(() => {
    if (!sectionRef.current) return;

    // Use native browser IntersectionObserver API for better performance
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          // Use setTimeout with 0ms to defer rendering to the next event loop
          // This prevents UI jank when multiple sections come into view
          setTimeout(() => {
            setIsVisible(true);
          }, importance === 'high' ? 0 : importance === 'medium' ? 50 : 100);
          
          observer.disconnect();
        }
      },
      { 
        rootMargin,
        threshold: 0.1
      }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [isVisible, importance, rootMargin]);

  return (
    <div 
      ref={sectionRef} 
      className="mt-6 section-container" 
      style={{ minHeight: height }}
    >
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-400 mb-3 sm:mb-4 md:mb-6">
        {shouldAnimate && allTitles.length > 1 ? (
          <TextLoop interval={importance === 'high' ? 3 : 5}>
            {allTitles.map((text, i) => (
              <span key={`${title}-${i}`}>{text}</span>
            ))}
          </TextLoop>
        ) : (
          <span>{allTitles[0]}</span>
        )}
      </h1>
    
      {isVisible ? (
        <Suspense fallback={<LoadingPlaceholder height={height} />}>
          {children}
        </Suspense>
      ) : (
        <LoadingPlaceholder height={height} />
      )}
    </div>
  );
});

LazySection.displayName = "LazySection";

// Predefined film categories with importance levels for staggered loading
const filmCategories: FilmCategory[] = [
  { id: "popular", title: "POPULAR FILMS", displayTitles: ["POPULAR FILMS", "TRENDING NOW", "MUST WATCH"], categoryFilter: undefined, limit: 10, height: "240px", importance: 'high' },
  { id: "comedy", title: "COMEDY FILMS", displayTitles: ["COMEDY FILMS", "LAUGH OUT LOUD", "FUNNY FLICKS"], categoryFilter: "comedy", limit: 8, height: "240px", importance: 'medium' },
  { id: "drama", title: "DRAMA FILMS", displayTitles: ["DRAMA FILMS", "CRITICALLY ACCLAIMED", "EMOTIONAL JOURNEYS"], categoryFilter: "drama", limit: 8, height: "240px", importance: 'medium' },
  { id: "folklore", title: "FOLKLORE FILMS", displayTitles: ["FOLKLORE FILMS", "LOCAL LEGENDS", "CULTURAL STORIES"], categoryFilter: "folklore", limit: 8, height: "240px", importance: 'low' },
  { id: "horror", title: "HORROR FILMS", displayTitles: ["HORROR FILMS", "THRILLS & CHILLS", "SCARY NIGHTS"], categoryFilter: "horror", limit: 8, height: "240px", importance: 'low' },
  { id: "romance", title: "ROMANCE FILMS", displayTitles: ["ROMANCE FILMS", "LOVE STORIES", "HEARTFELT MOVIES"], categoryFilter: "romance", limit: 8, height: "240px", importance: 'low' },
];

// Memoized film slider component with optimized props
const MemoizedFilmSlider = memo(({ title, categoryFilter, limit }: { 
  title: string, 
  categoryFilter?: string, 
  limit: number 
}) => (
  <FilmSlider
    title={title}
    categoryFilter={categoryFilter}
    limit={limit}
  />
));

MemoizedFilmSlider.displayName = "MemoizedFilmSlider";

// Main HomePage component
const HomePage = () => {
  const { user, isAuthenticated, isLoading } = useUser();
  const [pageLoading, setPageLoading] = useState(true);
  const [shouldAnimateTitles, setShouldAnimateTitles] = useState(true);
  const isMobile = useRef(typeof window !== 'undefined' && window.innerWidth < 768);
  
  // Handle recommendations data with error handling
  const { 
    recommendations, 
    loading: recommendationsLoading, 
    error: recommendationsError
  } = useRecommendations(user?.id || null);

  // Performance monitoring 
  useEffect(() => {
    // Simple performance monitoring for production debugging
    const startTime = performance.now();
    
    return () => {
      // Log total render time when component unmounts
      const totalTime = performance.now() - startTime;
      console.debug(`HomePage render time: ${Math.round(totalTime)}ms`);
    };
  }, []);

  // Optimize animations for lower-end devices
  useEffect(() => {
    // Check if device might struggle with animations
    const checkPerformance = () => {
      // If on mobile or memory constrained device, disable animations
      const nav = navigator as ExtendedNavigator;
      if (nav.deviceMemory && nav.deviceMemory < 4) {
        setShouldAnimateTitles(false);
      }
      
      // Check for reduced motion preference
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        setShouldAnimateTitles(false);
      }
    };
    
    // Run performance check
    checkPerformance();
  }, []);

  // Optimized resize handler with proper debouncing
  useEffect(() => {
    let resizeTimer: ReturnType<typeof setTimeout>;
    
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        isMobile.current = window.innerWidth < 768;
      }, 100); // 100ms debounce
    };
    
    window.addEventListener('resize', handleResize, { passive: true });
    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(resizeTimer);
    };
  }, []);

  // Use requestIdleCallback for non-critical initialization
  useEffect(() => {
    const finishLoading = () => {
      setPageLoading(false);
    };

    if (!isLoading) {
      if (typeof requestIdleCallback !== 'undefined') {
        requestIdleCallback(finishLoading);
      } else {
        // Fallback for browsers that don't support requestIdleCallback
        setTimeout(finishLoading, 0);
      }
    }
  }, [isLoading]);

  // Handle auth loading state
  if (isLoading || pageLoading) {
    return <HomePageSkeleton />;
  }

  // Handle not authenticated state
  if (!isAuthenticated) {
    return <AccessDenied />;
  }

  return (
    <>
      <GlobalStyles />
      <div className="pt-16 lg:pt-20 pb-10 px-4 md:px-6 lg:px-8">
        {/* Hero Video Section */}
        <div className="mb-6 md:mb-8 lg:mb-10 min-h-[300px]"> 
          <Suspense 
            fallback={
              <div className="relative w-full h-[300px] md:h-[400px] rounded-xl bg-gray-800/40 overflow-hidden" style={{
                animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
              }}>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full bg-gray-700/50 flex items-center justify-center">
                    <svg 
                      className="w-8 h-8 text-gray-500" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24" 
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" 
                      />
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                      />
                    </svg>
                  </div>
                </div>
              </div>
            }
          >
            <FilmVideo />
          </Suspense>
        </div>  

        {/* Recently Added Section - High priority content */}
        <LazySection 
          title="RECENTLY ADDED" 
          altTitles={["FRESH FINDS", "NEW ARRIVALS"]} 
          importance="high"
          height="280px"
          shouldAnimate={shouldAnimateTitles}
        >
          <RecentlyAdded />
        </LazySection>

        {/* Personalized Recommendations Section */}
        {isAuthenticated && (
          <LazySection
            title="RECOMMENDED FOR YOU"
            altTitles={["PICKS FOR YOU", "BASED ON YOUR TASTES"]}
            importance="high"
            height="280px"
            shouldAnimate={shouldAnimateTitles}
          >
            <RecommendationSection
              recommendations={recommendations}
              loading={recommendationsLoading}
              error={recommendationsError}
              FilmSliderComponent={FilmSliderWrapper}
            />
          </LazySection>
        )}

        {/* Film Categories with staggered loading */}
        {filmCategories.map((category) => (
          <LazySection
            key={category.id}
            title={category.title}
            altTitles={category.displayTitles.slice(1)}
            importance={category.importance}
            height={category.height}
            shouldAnimate={shouldAnimateTitles && category.importance === 'high'}
          >
            <MemoizedFilmSlider
              title={category.title}
              categoryFilter={category.categoryFilter}
              limit={category.limit}
            />
          </LazySection>
        ))}
      </div>
    </>
  );
};

export default memo(HomePage);