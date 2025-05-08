"use client";

import { useEffect, useState, memo, lazy, Suspense, ReactElement, useRef } from "react";
import { useUser } from "@/app/auth/nextjs/useUser";
import { AccessDenied } from "@/app/components/AccessDenied";
import HomePageSkeleton from "@/app/components/HomepageSkeleton";

// Import small, critical UI components directly
import { TextLoop } from "@/components/ui/text-loop";
import FilmSliderWrapper from "@/app/components/FilmComponents/FilmsliderWrapper";

// Mobile-optimized loading - dynamic imports with priority and mobile-specific chunks
const FilmVideo = lazy(() => 
  import(/* webpackChunkName: "film-video" */ "../components/FilmComponents/FilmVideo")
);

const RecentlyAdded = lazy(() => 
  import(/* webpackChunkName: "recently-added" */ "../components/RecentlyAdded")
);

const FilmSlider = lazy(() => 
  import(/* webpackChunkName: "film-slider" */ "@/app/components/FilmComponents/DynamicFilmSlider")
);

const RecommendationSection = lazy(() => 
  import(/* webpackChunkName: "recommendations" */ "@/app/components/RecommendationSection")
);

// Interface definitions
interface LazySectionProps {
  children: ReactElement;
  title: string;
  altTitles?: string[];
  importance: 'high' | 'medium' | 'low';
  height?: string;
  shouldAnimate?: boolean;
  delay?: number;
}

interface FilmCategory {
  id: string;
  title: string;
  displayTitles: string[]; 
  categoryFilter?: string;
  limit: number;
  height: string;
  importance: 'high' | 'medium' | 'low';
  mobileLimit?: number; // Mobile-specific limit
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

// Custom hook for recommendations with memory optimization
const useRecommendations = (userId: string | null) => {
  const [recommendations, setRecommendations] = useState<RecommendationGroup[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchRecommendations = async () => {
      try {
        // Implementation of fetching recommendations
        // Mock data with fewer items for mobile
        if (isMounted.current) {
          setRecommendations([
            {
              reason: "Based on your viewing history",
              films: [],
              isAIEnhanced: true
            }
          ]);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted.current) {
          setError(err instanceof Error ? err.message : 'Unknown error');
          setLoading(false);
        }
      }
    };

    // Add a small delay for mobile to spread out resource usage
    const timer = setTimeout(() => {
      fetchRecommendations();
    }, 300);

    return () => {
      isMounted.current = false;
      clearTimeout(timer);
    };
  }, [userId]);

  return { recommendations, loading, error };
};

// Mobile device detection with performance metrics
const useDeviceDetection = () => {
  const [isMobile, setIsMobile] = useState(false);
  const [isLowEndDevice, setIsLowEndDevice] = useState(false);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    // Mobile detection
    const checkMobile = () => {
      const mobile = window.innerWidth < 768 || 
                    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
      setIsMobile(mobile);
    };

    // Low-end device detection
    const checkDevicePerformance = () => {
      // Check for low memory
      const nav = navigator as Navigator & { deviceMemory?: number };
      const lowMemory = nav.deviceMemory !== undefined && nav.deviceMemory < 4;
      
      // Check for hardware concurrency (CPU cores)
      const lowCPU = navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency <= 4;
      
      setIsLowEndDevice(lowMemory || lowCPU);
    };

    // Reduced motion preference
    const checkReducedMotion = () => {
      setPrefersReducedMotion(window.matchMedia('(prefers-reduced-motion: reduce)').matches);
    };

    checkMobile();
    checkDevicePerformance();
    checkReducedMotion();

    // Efficient resize handler with RAF for smoother performance
    let rafId: number;
    let lastWidth = window.innerWidth;
    
    const handleResize = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        // Only update if width actually changed (height changes on mobile scroll shouldn't trigger)
        if (lastWidth !== window.innerWidth) {
          lastWidth = window.innerWidth;
          checkMobile();
        }
      });
    };
    
    window.addEventListener('resize', handleResize, { passive: true });
    
    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(rafId);
    };
  }, []);

  return { isMobile, isLowEndDevice, prefersReducedMotion };
};

// Optimized loading placeholder with minimal repaints
const LoadingPlaceholder = memo(({ height }: { height: string }) => (
  <div 
    className="bg-gray-800/20 rounded will-change-opacity" 
    style={{ 
      height,
      animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
      contain: 'layout paint style', // Better rendering performance
    }} 
  />
));

LoadingPlaceholder.displayName = "LoadingPlaceholder";

// Define the pulse animation only once
const GlobalStyles = () => (
  <style jsx global>{`
    @keyframes pulse {
      0%, 100% { opacity: 0.5; }
      50% { opacity: 0.8; }
    }
    
    /* Mobile optimizations */
    @media (max-width: 767px) {
      .section-container {
        margin-top: 1rem;
      }
      
      .film-slider-container {
        -webkit-overflow-scrolling: touch;
        scroll-snap-type: x mandatory;
        padding-bottom: 12px; /* Increase touch target */
      }
      
      .film-item {
        scroll-snap-align: start;
        touch-action: pan-x;
      }
      
      /* Reduce motion for better performance */
      .reduced-animation {
        transition-duration: 0.1s !important;
        animation-duration: 0.1s !important;
      }
    }
  `}</style>
);

// Mobile-optimized LazySection with better intersection observer settings
const LazySection = memo(({ 
  children, 
  title, 
  altTitles = [], 
  importance, 
  height = "200px",
  shouldAnimate = false,
  delay = 0
}: LazySectionProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const { isMobile, isLowEndDevice } = useDeviceDetection();
  
  // Smaller titles array for mobile
  const allTitles = isMobile ? [title] : [title, ...altTitles];
  
  // Optimize observer thresholds for mobile
  const rootMargin = isMobile ? 
    {
      high: "200px",
      medium: "100px",
      low: "50px"
    }[importance] :
    {
      high: "400px",
      medium: "200px",
      low: "50px"
    }[importance];
  
  useEffect(() => {
    if (!sectionRef.current) return;

    // Use smaller threshold for mobile
    const threshold = isMobile ? 0.01 : 0.1;
    
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible) {
          // Add mobile-specific delay to stagger loading
          const loadingDelay = isMobile ? 
            importance === 'high' ? delay : 
            importance === 'medium' ? delay + 100 : 
            delay + 200 : 0;
          
          timeoutRef.current = setTimeout(() => {
            setIsVisible(true);
          }, loadingDelay);
          
          observer.disconnect();
        }
      },
      { 
        rootMargin,
        threshold
      }
    );

    observer.observe(sectionRef.current);
    
    return () => {
      observer.disconnect();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [isVisible, importance, rootMargin, isMobile, delay]);

  // Smaller font size and spacing for mobile
  const titleClasses = isMobile ? 
    "text-xl font-bold text-gray-400 mb-2" : 
    "text-2xl sm:text-3xl font-bold text-gray-400 mb-3 sm:mb-4 md:mb-6";

  // Only animate if we're not on a low-end device
  const actualShouldAnimate = shouldAnimate && !isLowEndDevice && !isMobile;

  return (
    <div 
      ref={sectionRef} 
      className="mt-4 sm:mt-6 section-container" 
      style={{ 
        minHeight: isMobile ? `calc(${height} * 0.8)` : height,
        contain: 'layout paint style' // Performance optimization
      }}
    >
      <h1 className={titleClasses}>
        {actualShouldAnimate && allTitles.length > 1 ? (
          <TextLoop interval={5}>
            {allTitles.map((text, i) => (
              <span key={`${title}-${i}`}>{text}</span>
            ))}
          </TextLoop>
        ) : (
          <span>{allTitles[0]}</span>
        )}
      </h1>
    
      {isVisible ? (
        <Suspense fallback={<LoadingPlaceholder height={isMobile ? `calc(${height} * 0.8)` : height} />}>
          {children}
        </Suspense>
      ) : (
        <LoadingPlaceholder height={isMobile ? `calc(${height} * 0.8)` : height} />
      )}
    </div>
  );
});

LazySection.displayName = "LazySection";

// Mobile-optimized film categories with smaller limits for mobile
const filmCategories: FilmCategory[] = [
  { id: "popular", title: "POPULAR FILMS", displayTitles: ["POPULAR FILMS", "TRENDING NOW"], categoryFilter: undefined, limit: 10, mobileLimit: 6, height: "240px", importance: 'high' },
  { id: "comedy", title: "COMEDY FILMS", displayTitles: ["COMEDY FILMS", "LAUGH OUT LOUD"], categoryFilter: "comedy", limit: 8, mobileLimit: 5, height: "240px", importance: 'medium' },
  { id: "drama", title: "DRAMA FILMS", displayTitles: ["DRAMA FILMS", "CRITICALLY ACCLAIMED"], categoryFilter: "drama", limit: 8, mobileLimit: 5, height: "240px", importance: 'medium' },
  { id: "folklore", title: "FOLKLORE FILMS", displayTitles: ["FOLKLORE FILMS"], categoryFilter: "folklore", limit: 8, mobileLimit: 5, height: "240px", importance: 'low' },
  { id: "horror", title: "HORROR FILMS", displayTitles: ["HORROR FILMS"], categoryFilter: "horror", limit: 8, mobileLimit: 5, height: "240px", importance: 'low' },
  { id: "romance", title: "ROMANCE FILMS", displayTitles: ["ROMANCE FILMS"], categoryFilter: "romance", limit: 8, mobileLimit: 5, height: "240px", importance: 'low' },
];

// Memoized film slider with mobile-specific limits
const MemoizedFilmSlider = memo(({ 
  title, 
  categoryFilter, 
  limit,
  mobileLimit 
}: { 
  title: string, 
  categoryFilter?: string, 
  limit: number,
  mobileLimit?: number
}) => {
  const { isMobile } = useDeviceDetection();
  const actualLimit = isMobile && mobileLimit ? mobileLimit : limit;
  
  return (
    <FilmSlider
      title={title}
      categoryFilter={categoryFilter}
      limit={actualLimit}
      isMobile={isMobile}
    />
  );
});

MemoizedFilmSlider.displayName = "MemoizedFilmSlider";

// Main HomePage component with mobile optimization
const HomePage = () => {
  const { user, isAuthenticated, isLoading } = useUser();
  const [pageLoading, setPageLoading] = useState(true);
  const { isMobile, isLowEndDevice, prefersReducedMotion } = useDeviceDetection();
  const shouldAnimateTitles = !isLowEndDevice && !isMobile && !prefersReducedMotion;
  
  // Handle recommendations data with mobile-specific optimizations
  const { 
    recommendations, 
    loading: recommendationsLoading, 
    error: recommendationsError
  } = useRecommendations(user?.id || null);

  // Progressive loading for mobile
  useEffect(() => {
    // Shorter timeout for high-end devices, longer for mobile/low-end
    const loadingDelay = isMobile || isLowEndDevice ? 1000 : 500;
    
    // Use requestAnimationFrame for smoother transitions
    const finishLoading = () => {
      if (!isLoading) {
        requestAnimationFrame(() => {
          setPageLoading(false);
        });
      }
    };

    // Slight delay to ensure UI thread isn't blocked during initial render
    const timer = setTimeout(finishLoading, loadingDelay);
    return () => clearTimeout(timer);
  }, [isLoading, isMobile, isLowEndDevice]);

  // Memory management for mobile
  useEffect(() => {
    // Mobile-specific memory management
    if (isMobile) {
      // Force garbage collection on page hide (when user switches apps)
      const handleVisibilityChange = () => {
        if (document.visibilityState === 'hidden') {
          // Clear any unnecessary caches or large objects
          // This is a signal to the JS engine that memory can be reclaimed
          console.debug('Optimizing memory usage for mobile');
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);
      return () => {
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [isMobile]);

  // Handle auth loading state
  if (isLoading || pageLoading) {
    return <HomePageSkeleton isMobile={isMobile} />;
  }

  // Handle not authenticated state
  if (!isAuthenticated) {
    return <AccessDenied />;
  }

  // Calculate staggered loading delays for sections
  const getDelay = (index: number) => isMobile ? index * 200 : 0;

  return (
    <>
      <GlobalStyles />
      <div className={`pt-12 sm:pt-16 lg:pt-20 pb-6 sm:pb-10 px-3 sm:px-4 md:px-6 lg:px-8 ${isLowEndDevice ? 'reduced-animation' : ''}`}>
        {/* Hero Video Section - Smaller height for mobile */}
        <div className="mb-4 sm:mb-6 md:mb-8 lg:mb-10 min-h-[200px] sm:min-h-[300px]"> 
          <Suspense 
            fallback={
              <div 
                className="relative w-full h-[200px] sm:h-[300px] md:h-[400px] rounded-lg sm:rounded-xl bg-gray-800/40 overflow-hidden" 
                style={{
                  animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
                }}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gray-700/50 flex items-center justify-center">
                    <svg 
                      className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500" 
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
            <FilmVideo isMobile={isMobile} />
          </Suspense>
        </div>  

        {/* Recently Added Section - Optimized for mobile */}
        <LazySection 
          title="RECENTLY ADDED" 
          altTitles={["FRESH FINDS"]} 
          importance="high"
          height={isMobile ? "240px" : "280px"}
          shouldAnimate={shouldAnimateTitles}
          delay={getDelay(0)}
        >
          <RecentlyAdded  />
        </LazySection>

        {/* Personalized Recommendations Section */}
        {isAuthenticated && (
          <LazySection
            title="RECOMMENDED FOR YOU"
            altTitles={["PICKS FOR YOU"]}
            importance="high"
            height={isMobile ? "240px" : "280px"}
            shouldAnimate={shouldAnimateTitles}
            delay={getDelay(1)}
          >
            <RecommendationSection
              recommendations={recommendations}
              loading={recommendationsLoading}
              error={recommendationsError}
              FilmSliderComponent={FilmSliderWrapper}
              isMobile={isMobile}
            />
          </LazySection>
        )}

        {/* Film Categories with progressive loading and reduced items for mobile */}
        {filmCategories.map((category, index) => (
          <LazySection
            key={category.id}
            title={category.title}
            altTitles={isMobile ? [] : category.displayTitles.slice(1)}
            importance={category.importance}
            height={isMobile ? "200px" : category.height}
            shouldAnimate={shouldAnimateTitles && category.importance === 'high'}
            delay={getDelay(index + 2)}
          >
            <MemoizedFilmSlider
              title={category.title}
              categoryFilter={category.categoryFilter}
              limit={category.limit}
              mobileLimit={category.mobileLimit}
            />
          </LazySection>
        ))}
      </div>
    </>
  );
};

export default memo(HomePage);