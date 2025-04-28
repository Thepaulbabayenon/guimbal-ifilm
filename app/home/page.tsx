"use client";

import { useEffect, useState, memo, lazy, Suspense, ReactElement, useCallback, useRef } from "react";
import { useUser } from "@/app/auth/nextjs/useUser";
import { LoadingSpinner } from "@/app/components/LoadingSpinner";
import { AccessDenied } from "@/app/components/AccessDenied";
import { TextLoop } from "@/components/ui/text-loop";

const FilmVideo = lazy(() => import("../components/FilmComponents/FilmVideo"));
const RecentlyAdded = lazy(() => import("../components/RecentlyAdded"));
const FilmSlider = lazy(() => import("@/app/components/FilmComponents/DynamicFilmSlider"));
const FilmSliderWrapper = lazy(() => import("@/app/components/FilmComponents/FilmsliderWrapper"));

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

interface RecommendedFilm {
  id: number;
  title: string;
  imageUrl: string;
  releaseYear: number;
  duration: number;
  averageRating: number | null;
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
  const [recommendedFilms, setRecommendedFilms] = useState<RecommendedFilm[]>([]);
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);
  const fetchController = useRef<AbortController | null>(null);
  const hasAttemptedFetch = useRef(false);
  const isMobile = useRef(typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      isMobile.current = window.innerWidth < 768;
    };
    
    window.addEventListener('resize', handleResize, { passive: true });
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (!isAuthenticated || !user?.id || recommendationsLoading || hasAttemptedFetch.current) {
      return;
    }

    hasAttemptedFetch.current = true;
    
    if (fetchController.current) {
      fetchController.current.abort();
    }
    
    setRecommendationsLoading(true);
    
    fetchController.current = new AbortController();
    const signal = fetchController.current.signal;

    const timeoutId = setTimeout(() => {
      fetch(`/api/recommendations?userId=${user.id}`, { signal })
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch recommendations');
          return res.json();
        })
        .then((data) => { 
          if (Array.isArray(data)) {
            setRecommendedFilms(data);
          } else if (data && typeof data === 'object' && data.rows && Array.isArray(data.rows)) {
            setRecommendedFilms(data.rows);
          } else if (data && typeof data === 'object' && data.recommendations && Array.isArray(data.recommendations)) {
            setRecommendedFilms(data.recommendations);
          } else if (data && typeof data === 'object' && Object.keys(data).length === 0) {
            console.log("No recommendations available for this user");
            setRecommendedFilms([]);
          } else {
            console.error("Received invalid data format for recommendations:", data);
            setRecommendedFilms([]);
          }
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            console.error("Error fetching recommendations:", err);
          }
        })
        .finally(() => {
          setRecommendationsLoading(false);
          fetchController.current = null;
        });
    }, isMobile.current ? 500 : 300);

    return () => {
      clearTimeout(timeoutId);
      if (fetchController.current) {
        fetchController.current.abort();
        fetchController.current = null;
      }
      setRecommendationsLoading(false); 
    };
  }, [isAuthenticated, user?.id]);

  useEffect(() => {
    if (!isAuthenticated) {
      setRecommendedFilms([]);
      hasAttemptedFetch.current = false;
    }
  }, [isAuthenticated]);

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

  return (
    <div className="pt-16 lg:pt-20 pb-10 px-4 md:px-6 lg:px-8">
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

      <div className="mb-6 md:mb-8 pb-10 lg:mb-10">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-400 mb-3 sm:mb-4 md:mb-6">
          <TextLoop interval={3}>
            {["RECENTLY ADDED", "FRESH FINDS", "NEW ARRIVALS"].map((text, i) => (
              <span key={`recently-${i}`}>{text}</span>
            ))}
          </TextLoop>
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

      {isAuthenticated && recommendedFilms.length > 0 && (
        <LazySection
          title="RECOMMENDED FOR YOU"
          altTitles={["PICKS FOR YOU", "BASED ON YOUR TASTE"]}
          priority={1}
          height="240px"
        >
          <div>
            <FilmSliderWrapper title="Recommended For You" films={recommendedFilms} />
          </div>
        </LazySection>
      )}

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