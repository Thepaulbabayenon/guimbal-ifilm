"use client";

import { useEffect, useState, memo, lazy, Suspense, ReactElement } from "react";
import { useUser } from "@/app/auth/nextjs/useUser";
import { LoadingSpinner } from "@/app/components/LoadingSpinner";
import { AccessDenied } from "@/app/components/AccessDenied";

// Lazy load components
const FilmVideo = lazy(() => import("../components/FilmComponents/FilmVideo"));
const RecentlyAdded = lazy(() => import("../components/RecentlyAdded"));
const FilmSliderWrapper = lazy(() => import("../components/FilmComponents/FilmsliderWrapper"));

// Define proper interfaces for the components
interface SimpleTextLoopProps {
  texts: string[];
}

interface LazySectionProps {
  children: ReactElement;
  title: string;
  altTitles?: string[];
}

interface FilmCategory {
  id: string;
  title: string;
  categoryFilter?: string;
  limit: number;
  altTitles: string[];
}

// Simplified version of TextLoop with less intensive animations
const SimpleTextLoop = memo(({ texts }: SimpleTextLoopProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % texts.length);
    }, 3000); // Change text every 3 seconds
    
    return () => clearInterval(interval);
  }, [texts.length]);
  
  return (
    <div className="h-8 overflow-hidden relative">
      {texts.map((text, index) => (
        <div
          key={index}
          className={`absolute transition-all duration-500 w-full ${
            index === currentIndex 
              ? "translate-y-0 opacity-100" 
              : "translate-y-8 opacity-0"
          }`}
        >
          {text}
        </div>
      ))}
    </div>
  );
});
SimpleTextLoop.displayName = "SimpleTextLoop";

// Section component to lazy load sections as they come into view
const LazySection = memo(({ children, title, altTitles = [] }: LazySectionProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const allTitles = [title, ...altTitles];
  
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" } // Load a bit before it comes into view
    );
    
    const sectionRef = document.getElementById(`section-${title.replace(/\s+/g, '-').toLowerCase()}`);
    if (sectionRef) observer.observe(sectionRef);
    
    return () => observer.disconnect();
  }, [title]);
  
  return (
    <div id={`section-${title.replace(/\s+/g, '-').toLowerCase()}`} className="mt-6">
      <h1 className="text-3xl font-bold text-gray-400">
        <SimpleTextLoop texts={allTitles} />
      </h1>
      {isVisible && <Suspense fallback={<div className="h-40 flex items-center justify-center"><LoadingSpinner /></div>}>{children}</Suspense>}
    </div>
  );
});
LazySection.displayName = "LazySection";

// Film categories configuration
const filmCategories: FilmCategory[] = [
  { id: "popular", title: "POPULAR FILMS", categoryFilter: undefined, limit: 10, altTitles: ["POPULAR MOVIES", "POPULAR CINEMA"] },
  { id: "comedy", title: "COMEDY FILMS", categoryFilter: "comedy", limit: 10, altTitles: ["COMEDY MOVIES", "COMEDY CINEMA"] },
  { id: "drama", title: "DRAMA FILMS", categoryFilter: "drama", limit: 10, altTitles: ["DRAMA MOVIES", "DRAMA CINEMA"] },
  { id: "folklore", title: "FOLKLORE FILMS", categoryFilter: "folklore", limit: 10, altTitles: ["FOLKLORE MOVIES", "FOLKLORE CINEMA"] },
  { id: "horror", title: "HORROR FILMS", categoryFilter: "horror", limit: 10, altTitles: ["HORROR MOVIES", "HORROR CINEMA"] },
  { id: "romance", title: "ROMANCE FILMS", categoryFilter: "romance", limit: 10, altTitles: ["ROMANCE MOVIES", "ROMANCE CINEMA"] },
];

// Add interface for LoadingSpinner
interface LoadingSpinnerProps {
  size?: string;
}

// Main component
const HomePage = () => {
  const { user, isAuthenticated, isLoading } = useUser();
  const [recommendedFilms, setRecommendedFilms] = useState([]);

  useEffect(() => {
    if (user) {
      // Use AbortController to cancel fetch if component unmounts
      const controller = new AbortController();
      const signal = controller.signal;
      
      fetch(`/api/recommendations?userId=${user.id}`, { signal })
        .then((res) => res.json())
        .then((data) => setRecommendedFilms(data))
        .catch((err) => {
          if (err.name !== 'AbortError') {
            console.error("Error fetching recommendations:", err);
          }
        });
      
      return () => controller.abort();
    }
  }, [user]);

  // Loading State
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Access Denied State
  if (!isAuthenticated) {
    return <AccessDenied />;
  }

  return (
    <div className="pt-16 lg:pt-20 p-5 lg:p-0">
      <Suspense fallback={<div className="h-96 flex items-center justify-center"><LoadingSpinner /></div>}>
        <FilmVideo />
      </Suspense>

      <h1 className="text-3xl font-bold text-gray-400">
        <SimpleTextLoop texts={["BEST FILMS", "TOP MOVIES", "AWARD WINNERS"]} />
      </h1>

      <Suspense fallback={<div className="h-40 flex items-center justify-center"><LoadingSpinner /></div>}>
        <RecentlyAdded />
      </Suspense>

      {/* Render categories with lazy loading */}
      {filmCategories.map((category) => (
        <LazySection 
          key={category.id} 
          title={category.title}
          altTitles={category.altTitles}
        >
          <FilmSliderWrapper
            title={category.title}
            categoryFilter={category.categoryFilter}
            limit={category.limit}
          />
        </LazySection>
      ))}

      {/* Recommended Films Section */}
      {recommendedFilms.length > 0 && (
        <LazySection title="RECOMMENDED FOR YOU">
          <FilmSliderWrapper title="Recommended Films" films={recommendedFilms} />
        </LazySection>
      )}
    </div>
  );
};

export default memo(HomePage);