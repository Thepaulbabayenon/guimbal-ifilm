"use client";

import React, { useEffect, useState, useCallback, memo, useRef } from "react";
import Image from "next/image";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import PlayVideoModal from "@/app/components/PlayVideoModal"; // Ensure this path is correct
import Autoplay from "embla-carousel-autoplay";
import { Button } from "@/components/ui/button";
import { CiHeart } from "react-icons/ci";
import { FaStar } from "react-icons/fa"; // Using react-icons star
import axios, { AxiosError } from "axios";
import { useUser } from "@/app/auth/nextjs/useUser";
import { getFilmRating, getFilmWithUserData } from "@/app/services/filmService"; // Ensure paths are correct
import cache from "@/app/services/cashService"; // Ensure path is correct
import FilmSliderSkeleton from "./SkeletonSlider"; // Ensure path is correct
import { TextLoop } from "@/components/ui/text-loop"; // Use the library loop

interface Film {
  id: number;
  imageUrl: string;
  title: string;
  ageRating: number;
  duration: number;
  overview: string;
  releaseYear: number;
  videoSource: string; // Keep if needed by modal
  category: string;
  trailerUrl: string;
  createdAt?: Date; // Optional fields if not always present
  updatedAt?: Date;
  producer?: string;
  director?: string;
  coDirector?: string;
  studio?: string;
  rank?: number;
  averageRating: number | null;
  inWatchlist?: boolean; // Now expected from initial fetch if user logged in
  watchlistId?: string | null; // Now expected from initial fetch if user logged in
}

interface FilmSliderProps {
  title: string; // For display title and cache key segment
  categoryFilter?: string; // For filtering API call
  limit?: number; // For limiting API call
  filmsData?: (Film | RecommendedFilm)[]; // Optional: To pass pre-fetched data (like recommendations)
}

interface RecommendedFilm {
  id: number;
  title: string;
  imageUrl: string;
  releaseYear: number;
  duration: number;
  averageRating: number | null;
}

// Renamed to avoid conflict if SimpleTextLoop is defined elsewhere
const SliderTextLoop = TextLoop;

const FilmSlider = ({ title, categoryFilter, limit = 10, filmsData }: FilmSliderProps) => {
  const { user, isAuthenticated, isLoading: authLoading } = useUser();
  const userId = user?.id;

  const [loading, setLoading] = useState(!filmsData); // Only loading if not pre-fetched
  const [error, setError] = useState<string | null>(null);
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userRating, setUserRating] = useState<number>(0); // Initialize userRating state
  const [savingWatchlistId, setSavingWatchlistId] = useState<number | null>(null);

  const films = React.useMemo(() => filmsData || [], [filmsData]);
  const setFilms = useState<(Film | RecommendedFilm)[]>([])[1];

  // useRef to prevent fetching on mount if data is passed via props
  const initialDataProvided = useRef(!!filmsData);
  const hasFetched = useRef(!!filmsData); // Track if fetch has been attempted

  // Generate cache key based on props that influence the fetch
  const getCacheKey = useCallback(() => {
    // Include userId in cache key if authenticated, to cache user-specific data like 'inWatchlist'
    const userSegment = isAuthenticated && userId ? `user-${userId}` : 'guest';
    return `films-${title.replace(/\s+/g, '-')}-${categoryFilter || 'all'}-${limit}-${userSegment}`;
  }, [title, categoryFilter, limit, userId, isAuthenticated]);

  // --- Data Fetching ---
  const fetchFilms = useCallback(async (cacheKey: string) => {
    // Prevent fetching if initial data was provided or already fetched
    if (hasFetched.current) return;

    setLoading(true);
    setError(null);
    hasFetched.current = true; // Mark as attempted

    try {
      const cachedFilms = cache.getFilms(cacheKey);
      if (cachedFilms) {
        setFilms(cachedFilms);
        setLoading(false);
        return;
      }

      // --- Backend Fetch ---
      // Assumption: Backend /api/films takes userId (if available), category, limit
      // and returns films including 'averageRating' and 'inWatchlist'/'watchlistId'
      let url = '/api/films';
      const params = new URLSearchParams();
      if (categoryFilter) params.append('category', categoryFilter);
      if (limit) params.append('limit', limit.toString());
      if (userId) params.append('userId', userId); // Send userId to backend

      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();

      // Adjust based on your actual API response structure
      const fetchedFilmsData: Film[] = (data && data.rows && Array.isArray(data.rows)) ? data.rows : (Array.isArray(data) ? data : []);

       if (!Array.isArray(fetchedFilmsData)) {
           throw new Error("Invalid data format received from server");
       }

      // Optionally: Refresh ratings here if needed, but ideally backend handles it
      // Removed the Promise.all loop for ratings here for performance

      cache.setFilms(cacheKey, fetchedFilmsData);
      setFilms(fetchedFilmsData);

    } catch (err) {
      console.error(`Error fetching films for category "${categoryFilter || 'all'}":`, err);
      setError(err instanceof Error ? err.message : "Failed to load films");
      setFilms([]); // Clear films on error
      cache.removeFilms(cacheKey); // Optional: Remove potentially bad cache entry
    } finally {
      setLoading(false);
    }
  }, [categoryFilter, limit, userId]); // Dependencies for fetching logic

  // Effect to trigger fetch only if data wasn't passed via props and not loading auth
  useEffect(() => {
    if (!initialDataProvided.current && !authLoading && !hasFetched.current) {
        const cacheKey = getCacheKey();
        fetchFilms(cacheKey);
    }
     // If filmsData prop changes, update the state
     else if (filmsData && initialDataProvided.current) {
        setFilms(filmsData);
         // Optionally update cache if prop data changes significantly
         // cache.setFilms(getCacheKey(), filmsData);
    }
  }, [filmsData, authLoading, fetchFilms, getCacheKey]);


  // --- Event Handlers (Memoized) ---
  const handleFilmClick = useCallback((film: Film | RecommendedFilm) => {
    setSelectedFilm(film as Film); // Set the selected film immediately
    setIsModalOpen(true);
    // Detailed data (like user rating) can be fetched *inside* the modal using refreshRating/filmId/userId
  }, []); // No dependencies needed if only setting state

  const handleToggleWatchlist = useCallback(async (e: React.MouseEvent<HTMLButtonElement>, film: Film | RecommendedFilm) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userId || !isAuthenticated) {
      // Maybe show a toast/message asking user to log in
      console.log("User not logged in, cannot toggle watchlist.");
      return;
    }

    const filmId = film.id;
    // Check if film is of type Film before accessing inWatchlist and watchlistId
    const wasInWatchlist = 'inWatchlist' in film ? film.inWatchlist : false;
    const oldWatchlistId = 'watchlistId' in film ? film.watchlistId : null;
    const cacheKey = getCacheKey();

    setSavingWatchlistId(filmId);

    // Optimistic UI Update
    setFilms(prevFilms =>
      prevFilms.map(f =>
        f.id === filmId ? { ...f, inWatchlist: !wasInWatchlist, watchlistId: wasInWatchlist ? null : 'temp' } : f // Temporarily update
      )
    );

    try {
      let newWatchlistId = null;
      if (wasInWatchlist) {
        // Use filmId or preferably watchlistId if available for deletion
        const deleteId = oldWatchlistId || filmId; // Adjust based on your API expectation
        await axios.delete(`/api/watchlist/${deleteId}`); // Adjust endpoint if needed
      } else {
        const response = await axios.post('/api/watchlist', { userId, filmId });
        newWatchlistId = response.data?.id; // Assuming API returns the new watchlist item ID
         if (!newWatchlistId) {
           console.warn("Watchlist POST did not return an ID.");
         }
      }

      // Update state with actual ID after successful API call
      setFilms(prevFilms =>
         prevFilms.map(f =>
           f.id === filmId ? { ...f, inWatchlist: !wasInWatchlist, watchlistId: newWatchlistId } : f
         )
       );

       // Update cache with the final state
       cache.setFilms(cacheKey, films.map(f =>
           f.id === filmId ? { ...f, inWatchlist: !wasInWatchlist, watchlistId: newWatchlistId } : f
         ));
       // Invalidate general watchlist status cache if you have one
       cache.invalidateWatchlist(userId);

    } catch (error) {
      console.error("Watchlist toggle error:", error);
       // Revert optimistic UI on error
        setFilms(prevFilms =>
            prevFilms.map(f =>
                f.id === filmId ? { ...f, inWatchlist: wasInWatchlist, watchlistId: oldWatchlistId } : f
            )
        );
       // Optionally show an error message to the user
      alert("Failed to update watchlist. Please try again.");
    } finally {
      setSavingWatchlistId(null);
    }
  }, [userId, isAuthenticated, getCacheKey, films]); // Added 'films' dependency for correct state in callback


   // Function to refresh rating for a specific film (e.g., after user rates in modal)
  // In DynamicFilmSlider.tsx
const refreshFilmRating = useCallback(async (filmId?: number) => {
  // Handle case when filmId is undefined
  if (filmId === undefined) {
    console.warn("refreshFilmRating called without filmId");
    return;
  }

  try {
    const ratingData = await getFilmRating(filmId); // Fetch fresh rating
    const newRating = ratingData.averageRating;

    cache.setRating(filmId, newRating); // Update cache

    // Update the film in the main list state
    setFilms(prevFilms =>
      prevFilms.map(f => (f.id === filmId ? { ...f, averageRating: newRating } : f))
    );

    // Update selected film if it's the one being refreshed
    setSelectedFilm(prevSelected =>
      prevSelected && prevSelected.id === filmId ? { ...prevSelected, averageRating: newRating } : prevSelected
    );

    // Update the main cache for the slider
    const cacheKey = getCacheKey();
    const currentCachedFilms = cache.getFilms(cacheKey);
    if(currentCachedFilms) {
      const updatedCachedFilms = currentCachedFilms.map((f: Film) => 
        (f.id === filmId ? { ...f, averageRating: newRating } : f)
      );
      cache.setFilms(cacheKey, updatedCachedFilms);
    }
  } catch (err) {
    console.error(`Error refreshing rating for film ${filmId}:`, err);
  }
}, [getCacheKey]); // Dependency on getCacheKey to update the correct cache
   // Placeholder: Actual rating update logic should ideally live within the modal
   // or be passed to it. This is just a placeholder if needed here.
  const handleRatingUpdate = useCallback((filmId: number, rating: number) => {
       console.log(`Placeholder: Rating update called for film ${filmId} with rating ${rating}`);
       // This function might be passed to the modal, which then calls refreshFilmRating
       // after successfully submitting the rating via API.
   }, []);

  // --- Render Logic ---
  if (loading || authLoading) {
    return <FilmSliderSkeleton title={title} itemCount={limit > 5 ? 5 : limit} data-testid="film-slider-skeleton" />;
  }

  if (error) {
    return <div className="w-full py-8 text-center text-red-500 px-4">Error loading films for {title}: {error}</div>;
  }

  // Use films state which is initialized/updated from props or fetch
  if (!films || films.length === 0) {
     // Only show "No films" if not loading and not erroring, and fetch was attempted or initial data was empty
    if(!loading && !error && (hasFetched.current || initialDataProvided.current)) {
        return <div className="w-full py-8 text-center text-gray-500 px-4">No films found in the "{title}" category.</div>;
    }
    // Otherwise, it might still be loading initial state or has an error handled above
    return null;
  }

  // Dynamic Titles for TextLoop based on category/title
  const getSliderTitles = () => {
    if (categoryFilter === 'comedy') return ["Comedy Films", "Laugh Out Loud", "Funny Flicks"];
    if (categoryFilter === 'drama') return ["Drama Films", "Critically Acclaimed", "Emotional Journeys"];
    // Add more specific titles based on filter or use generics
    return [title, "Trending Now", "Top Picks"];
  };

  return (
    <section className="py-4 sm:py-6 md:py-8">
        {/* Title using TextLoop - ensure `SliderTextLoop` is defined correctly */}
        {/* Removed TextLoop to match HomePage's SimpleTextLoop usage */}
        {/* <div className="mb-3 sm:mb-4 md:mb-6 h-8">
             <SliderTextLoop
                 interval={4000} // Adjusted interval
                 className="text-xl sm:text-2xl font-bold"
                 // Removed complex transition variants for simplicity
             >
                 {getSliderTitles().map((text) => (
                     <h2 key={text} className="text-xl sm:text-2xl font-bold text-white"> {/* Ensure text color contrasts */}
                       {/* {text}
                    </h2>
                ))}
             </SliderTextLoop>
         </div> */}

      <Carousel
        plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]} // Slightly longer delay, stop on interaction
        opts={{ align: "start", loop: films.length > 4 }} // Loop only if enough items
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4"> {/* Adjust margin based on padding */}
          {films.map((film) => (
            <CarouselItem key={film.id} className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6"> {/* Adjust basis for more items */}
              <div
                className="relative overflow-hidden rounded-lg group cursor-pointer shadow-lg transition-shadow duration-300 hover:shadow-xl bg-gray-800" // Added background placeholder
                onClick={() => handleFilmClick(film)}
                role="button" // Accessibility
                tabIndex={0} // Accessibility
                onKeyDown={(e) => e.key === 'Enter' && handleFilmClick(film)} // Accessibility
              >
                <div className="aspect-[2/3] w-full relative">
                  <Image
                    src={film.imageUrl || '/placeholder-image.png'} // Fallback image
                    alt={film.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16.6vw" // Updated sizes
                    // Consider adding priority={index < 3} if this slider is above the fold initially
                    // For lazy-loaded sliders, priority should be false (default)
                    loading="lazy" // Explicit lazy loading
                  />

                  {/* Watchlist Button */}
                  {isAuthenticated && userId && 'inWatchlist' in film && (
                    <div className="absolute top-1 sm:top-2 right-1 sm:right-2 z-20">
                      <Button
                        variant="outline"
                        size="icon"
                        aria-label={film.inWatchlist ? "Remove from watchlist" : "Add to watchlist"}
                        className={`bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full border-none heart-button w-7 h-7 sm:w-8 sm:h-8 transition-colors duration-200 ${savingWatchlistId === film.id ? 'animate-pulse' : ''}`}
                        onClick={(e) => handleToggleWatchlist(e, film)}
                        disabled={savingWatchlistId === film.id}
                      >
                        <CiHeart className={`w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-200 ${film.inWatchlist ? "text-red-500 fill-current" : "text-white"}`} />
                      </Button>
                    </div>
                  )}

                  {/* Play Icon Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-t from-black/60 via-black/30 to-transparent pointer-events-none">
                    <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/25 backdrop-blur-sm flex items-center justify-center border border-white/30">
                      <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
                      </svg>
                    </div>
                  </div>
                </div>

                 {/* Info Overlay */}
                 <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 bg-gradient-to-t from-black/90 via-black/70 to-transparent pointer-events-none">
                    <h3 className="text-white font-semibold text-xs sm:text-sm md:text-base truncate" title={film.title}>
                        {film.title}
                    </h3>
                    <div className="flex items-center text-[10px] sm:text-xs text-gray-300 mt-1 space-x-2">
                        <span>{film.releaseYear}</span>
                        <span>•</span>
                        <span>{ 'duration' in film ? Math.floor(film.duration) : 'NaN'} min</span>
                        {film.averageRating !== null && film.averageRating > 0 && (
                            <>
                                <span>•</span>
                                <span className="flex items-center">
                                    <FaStar className="w-3 h-3 sm:w-[14px] sm:h-[14px] text-yellow-400 mr-1" />
                                    {film.averageRating.toFixed(1)}
                                </span>
                            </>
                        )}
                    </div>
                 </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        {/* Show arrows only if enough items to scroll */}
        {films.length > 5 && ( 
            <>
                <CarouselPrevious className="absolute left-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex disabled:opacity-50" />
                <CarouselNext className="absolute right-0 top-1/2 -translate-y-1/2 z-10 hidden md:flex disabled:opacity-50" />
            </>
        )}
      </Carousel>

      {/* Video Modal */}
      {selectedFilm && isModalOpen && (
        <PlayVideoModal
          // --- Pass necessary data ---
          title={selectedFilm.title}
          overview={selectedFilm.overview}
          trailerUrl={selectedFilm.trailerUrl}
          releaseYear={selectedFilm.releaseYear}
          ageRating={selectedFilm.ageRating}
          duration={selectedFilm.duration}
          ratings={selectedFilm.averageRating ?? 0}
          category={selectedFilm.category}
          filmId={selectedFilm.id}
          userId={userId || ""}
          setUserRating={setUserRating}
          state={isModalOpen}
          changeState={setIsModalOpen}
        />
      )}
    </section>
  );
};

export default memo(FilmSlider);
