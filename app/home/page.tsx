"use client";

import { useEffect, useState, memo, lazy, Suspense, ReactElement, useRef } from "react";
import { useUser } from "@/app/auth/nextjs/useUser";
import { AccessDenied } from "@/app/components/AccessDenied";
import { TextLoop } from "@/components/ui/text-loop";
import { useRecommendations } from "@/hooks/useRecommendations"; 
import HomePageSkeleton from "@/app/components/HomepageSkeleton";

// Lazy loaded components
const FilmVideo = lazy(() => import("../components/FilmComponents/FilmVideo"));
const RecentlyAdded = lazy(() => import("../components/RecentlyAdded"));
const FilmSlider = lazy(() => import("@/app/components/FilmComponents/DynamicFilmSlider"));
const FilmSliderWrapper = lazy(() => import("@/app/components/FilmComponents/FilmsliderWrapper"));
const RecommendationSection = lazy(() => import("@/app/components/RecommendationSection"));

interface LazySectionProps {
  children: ReactElement;
  title: string;
  altTitles?: string[];
  priority?: number;
  height?: string;
}

interface FilmCategory {
  id: string;
  title: string;
  displayTitles: string[]; 
  categoryFilter?: string;
  limit: number;
}

const loadingQueue = {
  active: 0,
  maxConcurrent: 2,
  queue: [] as (() => void)[],
  
  add(callback: () => void) {
    if (this.active < this.maxConcurrent) {
      this.active++;
      callback();
    } else {
      this.queue.push(callback);
    }
  },
  
  next() {
    if (this.queue.length > 0 && this.active < this.maxConcurrent) {
      const nextCallback = this.queue.shift();
      if (nextCallback) {
        nextCallback();
      }
    }
  },
  
  complete() {
    this.active = Math.max(0, this.active - 1);
    this.next();
  }
};

const LazySection = memo(({ children, title, altTitles = [], priority = 0, height = "200px" }: LazySectionProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const sectionRef = useRef<HTMLDivElement>(null);
  const allTitles = [title, ...altTitles];
  
  useEffect(() => {
    if (!sectionRef.current) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !isVisible && !isLoading) {
          setIsLoading(true);
          
          loadingQueue.add(() => {
            setTimeout(() => {
              setIsVisible(true);
              loadingQueue.complete();
            }, priority * 100);
          });
          
          observer.disconnect();
        }
      },
      { 
        rootMargin: "100px",
        threshold: 0.1
      }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [isVisible, isLoading, priority]);

  return (
    <div ref={sectionRef} className="mt-6" style={{ minHeight: height }}>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-400 mb-3 sm:mb-4 md:mb-6">
        {allTitles.length > 1 ? (
          <TextLoop interval={3}>
            {allTitles.map((text, i) => (
              <span key={`${title}-${i}`}>{text}</span>
            ))}
          </TextLoop>
        ) : (
          <span>{allTitles[0]}</span>
        )}
      </h1>
    
      {isVisible ? (
        <Suspense fallback={
          <div className="flex items-center justify-center" style={{ height }}>
            {/* Replacing LoadingSpinner with a simple loading animation */}
            <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
          </div>
        }>
          {children}
        </Suspense>
      ) : (
        <div className="animate-pulse bg-gray-800/20 rounded" style={{ height }} />
      )}
    </div>
  );
});

LazySection.displayName = "LazySection";

const filmCategories: (FilmCategory & { height: string })[] = [
  { id: "popular", title: "POPULAR FILMS", displayTitles: ["POPULAR FILMS", "TRENDING NOW", "MUST WATCH"], categoryFilter: undefined, limit: 10, height: "240px" },
  { id: "comedy", title: "COMEDY FILMS", displayTitles: ["COMEDY FILMS", "LAUGH OUT LOUD", "FUNNY FLICKS"], categoryFilter: "comedy", limit: 10, height: "240px" },
  { id: "drama", title: "DRAMA FILMS", displayTitles: ["DRAMA FILMS", "CRITICALLY ACCLAIMED", "EMOTIONAL JOURNEYS"], categoryFilter: "drama", limit: 10, height: "240px" },
  { id: "folklore", title: "FOLKLORE FILMS", displayTitles: ["FOLKLORE FILMS", "LOCAL LEGENDS", "CULTURAL STORIES"], categoryFilter: "folklore", limit: 10, height: "240px" },
  { id: "horror", title: "HORROR FILMS", displayTitles: ["HORROR FILMS", "THRILLS & CHILLS", "SCARY NIGHTS"], categoryFilter: "horror", limit: 10, height: "240px" },
  { id: "romance", title: "ROMANCE FILMS", displayTitles: ["ROMANCE FILMS", "LOVE STORIES", "HEARTFELT MOVIES"], categoryFilter: "romance", limit: 10, height: "240px" },
];

const HomePage = () => {
  const { user, isAuthenticated, isLoading } = useUser();
  const [pageLoading, setPageLoading] = useState(true);
  const isMobile = useRef(typeof window !== 'undefined' && window.innerWidth < 768);
  
  // Updated to handle null userId correctly
  const { 
    recommendations, 
    loading: recommendationsLoading, 
    error: recommendationsError,
    refreshRecommendations
  } = useRecommendations(user?.id || null);

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      isMobile.current = window.innerWidth < 768;
    };
    
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Simulate initial page load effect
  useEffect(() => {
    // Set a minimum loading time to prevent flashing
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, [isLoading]);

  // Handle auth loading state
  if (isLoading || pageLoading) {
    return <HomePageSkeleton />;
  }

  // Handle not authenticated state
  if (!isAuthenticated) {
    return <AccessDenied />;
  }

  const recommendationsForSection = recommendations as any;

  return (
    <div className="pt-16 lg:pt-20 pb-10 px-4 md:px-6 lg:px-8">
      {/* Hero Video Section */}
      <div className="mb-6 md:mb-8 lg:mb-10 min-h-[300px]"> 
        <Suspense 
          fallback={
            <div className="relative w-full h-[300px] md:h-[400px] rounded-xl bg-gray-800/40 animate-pulse overflow-hidden">
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

      {/* Recently Added Section - Moved to top position */}
      <div className="mb-6 md:mb-8 lg:mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-400 mb-3 sm:mb-4 md:mb-6">
          <TextLoop interval={3}>
            {["RECENTLY ADDED", "FRESH FINDS", "NEW ARRIVALS"].map((text, i) => (
              <span key={`recently-${i}`}>{text}</span>
            ))}
          </TextLoop>
        </h1>
        <Suspense 
          fallback={
            <div className="grid grid-flow-col auto-cols-[minmax(180px,1fr)] md:auto-cols-[minmax(200px,1fr)] gap-4 overflow-x-hidden">
              {Array(6).fill(0).map((_, i) => (
                <div key={`rec-skeleton-${i}`} className="flex flex-col gap-2">
                  <div className="aspect-[2/3] bg-gray-800/40 rounded-lg animate-pulse"></div>
                  <div className="h-4 bg-gray-700/40 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-700/30 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          }
        >
          <RecentlyAdded />
        </Suspense>
      </div>

      {/* Personalized Recommendations Section - Moved below Recently Added */}
      {isAuthenticated && (
        <div className="mb-10">
          <Suspense fallback={
            <div className="mb-10">
              <div className="h-8 w-64 bg-gray-700/40 rounded mb-6"></div>
              <div className="grid grid-flow-col auto-cols-[minmax(180px,1fr)] md:auto-cols-[minmax(200px,1fr)] gap-4 overflow-x-hidden">
                {Array(6).fill(0).map((_, i) => (
                  <div key={`rec-${i}`} className="flex flex-col gap-2">
                    <div className="aspect-[2/3] bg-gray-800/40 rounded-lg animate-pulse"></div>
                    <div className="h-4 bg-gray-700/40 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-700/30 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          }>
            <RecommendationSection
              recommendations={recommendationsForSection}
              loading={recommendationsLoading}
              error={recommendationsError}
              FilmSliderComponent={FilmSliderWrapper}
            />
          </Suspense>
        </div>
      )}

      {/* Film Categories */}
      {filmCategories.map((category, index) => (
        <LazySection
          key={category.id}
          title={category.title}
          altTitles={category.displayTitles.slice(1)}
          priority={index + 2}
          height={category.height}
        >
          <FilmSlider
            title={category.title}
            categoryFilter={category.categoryFilter}
            limit={category.limit}
          />
        </LazySection>
      ))}
    </div>
  );
};

export default memo(HomePage);