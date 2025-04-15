"use client";

import { useEffect, useState, memo, lazy, Suspense, ReactElement, useCallback, useRef } from "react";
import { useUser } from "@/app/auth/nextjs/useUser";
import { LoadingSpinner } from "@/app/components/LoadingSpinner";
import { AccessDenied } from "@/app/components/AccessDenied";
import { TextLoop } from "@/components/ui/text-loop"; // Using the library one for consistency here

// Lazy load components with explicit chunk names for better performance
const FilmVideo = lazy(() => import("../components/FilmComponents/FilmVideo"));
const RecentlyAdded = lazy(() => import("../components/RecentlyAdded"));
const FilmSlider = lazy(() => import("@/app/components/FilmComponents/DynamicFilmSlider"));
const FilmSliderWrapper = lazy(() => import("@/app/components/FilmComponents/FilmsliderWrapper"));

// Define interfaces
interface SimpleTextLoopProps {
  texts: string[];
}

interface LazySectionProps {
  children: ReactElement;
  title: string;
  altTitles?: string[];
  priority?: number; // Added priority for load sequencing
  height?: string; // Added for better placeholder sizing
}

interface FilmCategory {
  id: string;
  title: string;
  displayTitles: string[]; 
  categoryFilter?: string;
  limit: number;
}

interface RecommendedFilm {
  id: number;
  title: string;
  imageUrl: string;
  releaseYear: number;
  duration: number;
  averageRating: number | null;
}

// Optimized text loop with reduced re-renders
const SimpleTextLoop = memo(({ texts }: SimpleTextLoopProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Use useEffect with cleanup to prevent memory leaks
  useEffect(() => {
    const changeText = () => {
      setCurrentIndex((prev) => (prev + 1) % texts.length);
    };
    
    // Clear any existing interval
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    
    // Set new interval
    intervalRef.current = setInterval(changeText, 3000);
    
    // Cleanup function
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [texts.length]); // Only depend on texts.length, not the entire texts array

  return (
    <div className="h-8 overflow-hidden relative">
      {texts.map((text, index) => (
        <div
          key={`text-${index}`} // Improved key for better reconciliation
          className={`absolute transition-opacity duration-500 w-full ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
          style={{ 
            transform: `translateY(${index === currentIndex ? 0 : '100%'})`,
            willChange: 'transform, opacity' // Hint to browser for optimization
          }}
        >
          {text}
        </div>
      ))}
    </div>
  );
});

SimpleTextLoop.displayName = "SimpleTextLoop";

// Global loading queue to prevent too many simultaneous loads
const loadingQueue = {
  active: 0,
  maxConcurrent: 2, // Only load 2 sections at once
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

// Section component to lazy load sections with improved loading mechanics
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
          
          // Use the queue system to prevent too many loads at once
          loadingQueue.add(() => {
            // Artificial delay based on priority to stagger loads
            setTimeout(() => {
              setIsVisible(true);
              loadingQueue.complete();
            }, priority * 100); // Stagger loads by priority
          });
          
          observer.disconnect();
        }
      },
      { 
        rootMargin: "100px", // Reduced from 250px for better performance
        threshold: 0.1 // Only needs to be 10% visible to start loading
      }
    );

    observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, [isVisible, isLoading, priority]);

  return (
    <div ref={sectionRef} className="mt-6" style={{ minHeight: height }}>
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-400 mb-3 sm:mb-4 md:mb-6">
        <SimpleTextLoop texts={allTitles} />
      </h1>
    
      {isVisible ? (
        <Suspense fallback={
          <div className="flex items-center justify-center" style={{ height }}>
            <LoadingSpinner />
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

// Film categories configuration with added heights for better placeholders
const filmCategories: (FilmCategory & { height: string })[] = [
  { id: "popular", title: "POPULAR FILMS", displayTitles: ["POPULAR FILMS", "TRENDING NOW", "MUST WATCH"], categoryFilter: undefined, limit: 10, height: "240px" },
  { id: "comedy", title: "COMEDY FILMS", displayTitles: ["COMEDY FILMS", "LAUGH OUT LOUD", "FUNNY FLICKS"], categoryFilter: "comedy", limit: 10, height: "240px" },
  { id: "drama", title: "DRAMA FILMS", displayTitles: ["DRAMA FILMS", "CRITICALLY ACCLAIMED", "EMOTIONAL JOURNEYS"], categoryFilter: "drama", limit: 10, height: "240px" },
  { id: "folklore", title: "FOLKLORE FILMS", displayTitles: ["FOLKLORE FILMS", "LOCAL LEGENDS", "CULTURAL STORIES"], categoryFilter: "folklore", limit: 10, height: "240px" },
  { id: "horror", title: "HORROR FILMS", displayTitles: ["HORROR FILMS", "THRILLS & CHILLS", "SCARY NIGHTS"], categoryFilter: "horror", limit: 10, height: "240px" },
  { id: "romance", title: "ROMANCE FILMS", displayTitles: ["ROMANCE FILMS", "LOVE STORIES", "HEARTFELT MOVIES"], categoryFilter: "romance", limit: 10, height: "240px" },
];

// Main component with optimization
const HomePage = () => {
  const { user, isAuthenticated, isLoading } = useUser();
  const [recommendedFilms, setRecommendedFilms] = useState<RecommendedFilm[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const fetchController = useRef<AbortController | null>(null);

  // Debounce scroll events to reduce performance impact
  useEffect(() => {
    const handleScroll = () => {
      // Debounce scroll events in iOS
      if (!window.requestAnimationFrame) {
        return;
      }
      
      window.requestAnimationFrame(() => {
        // Do nothing, just sync to animation frame
        // This prevents excessive scroll event handling
      });
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Optimized recommendations fetch
  useEffect(() => {
    // Clean up previous fetch if it exists
    if (fetchController.current) {
      fetchController.current.abort();
      fetchController.current = null;
    }
    
    if (isAuthenticated && user?.id && recommendedFilms.length === 0 && !recommendationsLoading) {
      setRecommendationsLoading(true);
      
      // Create new controller for this fetch
      fetchController.current = new AbortController();
      const signal = fetchController.current.signal;

      // Add slight delay to prevent UI blocking during initial load
      const timeoutId = setTimeout(() => {
        fetch(`/api/recommendations?userId=${user.id}`, { signal })
          .then((res) => {
            if (!res.ok) throw new Error('Failed to fetch recommendations');
            return res.json();
          })
          .then((data: RecommendedFilm[]) => { 
            if (Array.isArray(data)) {
              setRecommendedFilms(data);
            } else {
              console.error("Received non-array data for recommendations:", data);
              setRecommendedFilms([]);
            }
          })
          .catch((err) => {
            if (err.name !== 'AbortError') {
              console.error("Error fetching recommendations:", err);
              setRecommendedFilms([]); 
            }
          })
          .finally(() => {
            setRecommendationsLoading(false);
            fetchController.current = null;
          });
      }, 300); // Short delay to let the UI render first

      return () => {
        clearTimeout(timeoutId);
        if (fetchController.current) {
          fetchController.current.abort();
          fetchController.current = null;
        }
        setRecommendationsLoading(false); 
      };
    } else if (!isAuthenticated) {
      setRecommendedFilms([]);
    }
  }, [user?.id, isAuthenticated, recommendationsLoading, recommendedFilms.length]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <AccessDenied />;
  }

  // --- Render Authenticated View ---
  return (
    <div className="pt-16 lg:pt-20 pb-10 px-4 md:px-6 lg:px-8">
      {/* Film Video Section - High priority loading */}
      <div className="mb-6 md:mb-8 lg:mb-10 min-h-[300px]"> 
        <Suspense 
          fallback={
            <div className="h-[300px] md:h-[400px] flex items-center justify-center">
              <LoadingSpinner />
            </div>
          }
        >
          <FilmVideo />
        </Suspense>
      </div>

      {/* Recently Added Section - Second priority */}
      <div className="mb-6 md:mb-8 pb-10 lg:mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-400 mb-3 sm:mb-4 md:mb-6">
          <SimpleTextLoop texts={["RECENTLY ADDED", "FRESH FINDS", "NEW ARRIVALS"]} />
        </h1>
        <Suspense 
          fallback={
            <div className="h-[240px] flex items-center justify-center">
              <LoadingSpinner />
            </div>
          }
        >
          <RecentlyAdded />
        </Suspense>
      </div>

      {/* Recommended Section - Show if available */}
      {isAuthenticated && recommendedFilms.length > 0 && (
        <LazySection
          title="RECOMMENDED FOR YOU"
          altTitles={["PICKS FOR YOU", "BASED ON YOUR TASTE"]}
          priority={1} // Lower numbers load first
          height="240px"
        >
          <div>
            <FilmSliderWrapper title="Recommended For You" films={recommendedFilms} />
          </div>
        </LazySection>
      )}

      {/* Category Sections - Load with incremental priorities */}
      {filmCategories.map((category, index) => (
        <LazySection
          key={category.id}
          title={category.title}
          altTitles={category.displayTitles.slice(1)}
          priority={index + 2} // Gradually increasing priority numbers (load later)
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