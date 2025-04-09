"use client";

import { useEffect, useState, memo, lazy, Suspense, ReactElement, useCallback } from "react";
import { useUser } from "@/app/auth/nextjs/useUser";
import { LoadingSpinner } from "@/app/components/LoadingSpinner";
import { AccessDenied } from "@/app/components/AccessDenied";
import { TextLoop } from "@/components/ui/text-loop"; // Using the library one for consistency here
// Lazy load components
const FilmVideo = lazy(() => import("../components/FilmComponents/FilmVideo"));
const RecentlyAdded = lazy(() => import("../components/RecentlyAdded"));
const FilmSlider = lazy(() => import("@/app/components/FilmComponents/DynamicFilmSlider"));
const FilmSliderWrapper = lazy(() => import("@/app/components/FilmComponents/FilmsliderWrapper")); // Directly use FilmSlider if Wrapper isn't needed

// Define interfaces
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
  title: string; // Main title used for ID generation
  displayTitles: string[]; // All titles for the loop
  categoryFilter?: string;
  limit: number;
}

interface RecommendedFilm {
  // Define the structure of your recommended film object
  id: number;
  title: string;
  imageUrl: string;
  releaseYear: number;
  duration: number;
  averageRating: number | null;
  // ... other necessary film properties
}

// Simplified Text Loop (as defined in the original code, keep if preferred)
const SimpleTextLoop = memo(({ texts }: SimpleTextLoopProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % texts.length);
    }, 3000); // Change text every 3 seconds

    return () => clearInterval(interval);
  }, [texts]); // Dependency array fix: use texts directly if stable, or texts.length

  return (
    <div className="h-8 overflow-hidden relative">
      {texts.map((text, index) => (
        <div
          key={index}
          className={`absolute transition-opacity duration-500 w-full ${
            index === currentIndex ? "opacity-100" : "opacity-0"
          }`}
          style={{ transform: `translateY(${index === currentIndex ? 0 : '100%'})` }} // Simplified animation
        >
          {text}
        </div>
      ))}
    </div>
  );
});
SimpleTextLoop.displayName = "SimpleTextLoop";


// Section component to lazy load sections
const LazySection = memo(({ children, title, altTitles = [] }: LazySectionProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const sectionId = `section-${title.replace(/\s+/g, '-').toLowerCase()}`;
  const allTitles = [title, ...altTitles];

  useEffect(() => {
    const sectionRef = document.getElementById(sectionId);
    if (!sectionRef) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect(); // Disconnect after becoming visible
        }
      },
      { rootMargin: "250px" } // Load slightly earlier
    );

    observer.observe(sectionRef);

    return () => observer.disconnect();
  }, [sectionId]); // Depend on sectionId

  return (
    // Use min-height to prevent layout shift before content loads
    <div id={sectionId} className="mt-6 min-h-[200px]">
      <h1 className="text-2xl sm:text-3xl font-bold text-gray-400 mb-3 sm:mb-4 md:mb-6">
        {/* Use SimpleTextLoop if preferred, otherwise use the library one */}
        <SimpleTextLoop texts={allTitles} />
        {/* Or use the library one:
         <TextLoop interval={3000}>
           {allTitles.map(t => <span key={t}>{t}</span>)}
         </TextLoop> */}
      </h1>
      {/* Render placeholder or spinner until visible and loaded */}
      {isVisible ? (
        <Suspense fallback={<div className="h-40 flex items-center justify-center"><LoadingSpinner /></div>}>
          {children}
        </Suspense>
      ) : (
        <div className="h-40" /> // Placeholder height
      )}
    </div>
  );
});
LazySection.displayName = "LazySection";


// Film categories configuration
const filmCategories: FilmCategory[] = [
  { id: "popular", title: "POPULAR FILMS", displayTitles: ["POPULAR FILMS", "TRENDING NOW", "MUST WATCH"], categoryFilter: undefined, limit: 10 },
  { id: "comedy", title: "COMEDY FILMS", displayTitles: ["COMEDY FILMS", "LAUGH OUT LOUD", "FUNNY FLICKS"], categoryFilter: "comedy", limit: 10 },
  { id: "drama", title: "DRAMA FILMS", displayTitles: ["DRAMA FILMS", "CRITICALLY ACCLAIMED", "EMOTIONAL JOURNEYS"], categoryFilter: "drama", limit: 10 },
  { id: "folklore", title: "FOLKLORE FILMS", displayTitles: ["FOLKLORE FILMS", "LOCAL LEGENDS", "CULTURAL STORIES"], categoryFilter: "folklore", limit: 10 },
  { id: "horror", title: "HORROR FILMS", displayTitles: ["HORROR FILMS", "THRILLS & CHILLS", "SCARY NIGHTS"], categoryFilter: "horror", limit: 10 },
  { id: "romance", title: "ROMANCE FILMS", displayTitles: ["ROMANCE FILMS", "LOVE STORIES", "HEARTFELT MOVIES"], categoryFilter: "romance", limit: 10 },
];

// Main component
const HomePage = () => {
  const { user, isAuthenticated, isLoading } = useUser();
  const [recommendedFilms, setRecommendedFilms] = useState<RecommendedFilm[]>([]); // Use specific type
  const [recommendationsLoading, setRecommendationsLoading] = useState(false);

  useEffect(() => {
    // Fetch recommendations only if authenticated and not already loading
    if (isAuthenticated && user?.id && recommendedFilms.length === 0 && !recommendationsLoading) {
      setRecommendationsLoading(true);
      const controller = new AbortController();
      const signal = controller.signal;

      fetch(`/api/recommendations?userId=${user.id}`, { signal })
        .then((res) => {
          if (!res.ok) throw new Error('Failed to fetch recommendations');
          return res.json();
        })
        .then((data: RecommendedFilm[]) => { // Type the expected data
             // Ensure data is an array before setting
             if (Array.isArray(data)) {
                setRecommendedFilms(data);
             } else {
                console.error("Received non-array data for recommendations:", data);
                setRecommendedFilms([]); // Set to empty array on error or invalid data
            }
        })
        .catch((err) => {
          if (err.name !== 'AbortError') {
            console.error("Error fetching recommendations:", err);
            setRecommendedFilms([]); // Clear recommendations on error
          }
        })
        .finally(() => {
          setRecommendationsLoading(false);
        });

      // Cleanup function to abort fetch if component unmounts or user changes
      return () => {
        controller.abort();
        setRecommendationsLoading(false); // Reset loading state on cleanup
      }
    } else if (!isAuthenticated) {
        // Clear recommendations if user logs out
        setRecommendedFilms([]);
    }
    // Dependencies: user?.id and isAuthenticated trigger re-fetch if they change
  }, [user?.id, isAuthenticated, recommendedFilms.length, recommendationsLoading]);


  // Loading State for Auth
  if (isLoading) {
    return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
  }

  // Access Denied State - Show login prompt or specific content
  if (!isAuthenticated) {
     // Optionally return different content for non-logged-in users
     // For now, just showing AccessDenied
    return <AccessDenied  />;
  }

  // --- Render Authenticated View ---
  return (
    <div className="pt-16 lg:pt-20 pb-10 px-4 md:px-6 lg:px-8"> {/* Added padding */}
      {/* Featured Video Section */}
      <Suspense fallback={<div className="h-96 flex items-center justify-center mb-6"><LoadingSpinner /></div>}>
        <div className="mb-6 md:mb-8 lg:mb-10"> {/* Added margin bottom */}
            <FilmVideo />
        </div>
      </Suspense>

      {/* Recently Added Section - Consider making this a LazySection too if it fetches data */}
       <h1 className="text-2xl sm:text-3xl font-bold text-gray-400 mb-3 sm:mb-4 md:mb-6">
            <SimpleTextLoop texts={["RECENTLY ADDED", "FRESH FINDS", "NEW ARRIVALS"]} />
        </h1>
      <Suspense fallback={<div className="h-40 flex items-center justify-center mb-6"><LoadingSpinner /></div>}>
         <div className="mb-6 md:mb-8 lg:mb-10">
            <RecentlyAdded />
        </div>
      </Suspense>

       {/* Recommended Films Section - Show only if logged in and films exist */}
       {isAuthenticated && recommendedFilms.length > 0 && (
        <LazySection
          title="RECOMMENDED FOR YOU"
          altTitles={["PICKS FOR YOU", "BASED ON YOUR TASTE"]}
        >
          <div className="mt-6">
            <FilmSliderWrapper title="Recommended For You" films={recommendedFilms} />
          </div>
        </LazySection>
      )}

       {/* Render categories with lazy loading */}
      {filmCategories.map((category) => (
        <LazySection
          key={category.id}
          title={category.title} // Main title for ID
          altTitles={category.displayTitles.slice(1)} // Alt titles for loop
        >
          {/* Pass categoryFilter and limit directly to FilmSlider */}
          <FilmSlider
            title={category.title} // Use the main title
            categoryFilter={category.categoryFilter}
            limit={category.limit}
            // filmsData is not passed here, FilmSlider will fetch based on filter/limit
          />
        </LazySection>
      ))}

    </div>
  );
};

export default memo(HomePage); // Memoize HomePage
