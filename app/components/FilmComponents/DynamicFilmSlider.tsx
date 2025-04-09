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
import PlayVideoModal from "@/app/components/PlayVideoModal";
import Autoplay from "embla-carousel-autoplay";
import { Button } from "@/components/ui/button";
import { CiHeart } from "react-icons/ci";
import { FaStar } from "react-icons/fa";
import axios from "axios";
import { useUser } from "@/app/auth/nextjs/useUser";
import { getFilmRating } from "@/app/services/filmService";
import cache from "@/app/services/cashService";
import FilmSliderSkeleton from "./SkeletonSlider";
import { TextLoop } from "@/components/ui/text-loop";

// Image cache to prevent re-renders
const imageCache = new Map();

// Image preloader component
const ImagePreloader = ({ src }: { src: string }) => {
  useEffect(() => {
    if (src && !imageCache.has(src)) {
      const img = new window.Image();
      img.src = src;
      img.onload = () => {
        imageCache.set(src, true);
      };
    }
  }, [src]);
  
  return null;
};

interface Film {
  id: number;
  imageUrl: string;
  title: string;
  ageRating: number;
  duration: number;
  overview: string;
  releaseYear: number;
  videoSource: string;
  category: string;
  trailerUrl: string;
  createdAt?: Date;
  updatedAt?: Date;
  producer?: string;
  director?: string;
  coDirector?: string;
  studio?: string;
  rank?: number;
  averageRating: number | null;
  inWatchlist?: boolean;
  watchlistId?: string | null;
}

interface FilmSliderProps {
  title: string;
  categoryFilter?: string;
  limit?: number;
  filmsData?: (Film | RecommendedFilm)[];
  isPriority?: boolean; // New prop to indicate if this slider is high priority
}

interface RecommendedFilm {
  id: number;
  title: string;
  imageUrl: string;
  releaseYear: number;
  duration: number;
  averageRating: number | null;
}

const SliderTextLoop = TextLoop;

const FilmSlider = ({ title, categoryFilter, limit = 10, filmsData, isPriority = false }: FilmSliderProps) => {
  const { user, isAuthenticated, isLoading: authLoading } = useUser();
  const userId = user?.id;

  const [films, setFilms] = useState<(Film | RecommendedFilm)[]>(filmsData || []);
  const [loading, setLoading] = useState(!filmsData);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [userRating, setUserRating] = useState<number>(0);
  const [savingWatchlistId, setSavingWatchlistId] = useState<number | null>(null);
  
  // Track mounted state to prevent state updates after unmount
  const isMounted = useRef(true);
  
  // Track if this component has been visible to the user
  const hasBeenVisible = useRef(false);
  
  // Intersection observer for lazy loading
  const sliderRef = useRef<HTMLElement | null>(null);

  // Initial data state tracking
  const initialDataProvided = useRef(!!filmsData);
  const hasFetched = useRef(!!filmsData);

  // Generate cache key based on props that influence the fetch
  const getCacheKey = useCallback(() => {
    const userSegment = isAuthenticated && userId ? `user-${userId}` : 'guest';
    return `films-${title.replace(/\s+/g, '-')}-${categoryFilter || 'all'}-${limit}-${userSegment}`;
  }, [title, categoryFilter, limit, userId, isAuthenticated]);

  // Setup intersection observer for lazy loading
  useEffect(() => {
    if (!isPriority && sliderRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !hasBeenVisible.current) {
              hasBeenVisible.current = true;
              
              // Lazy fetch only if needed
              if (!initialDataProvided.current && !hasFetched.current) {
                const cacheKey = getCacheKey();
                fetchFilms(cacheKey);
              }
            }
          });
        },
        { threshold: 0.1 } // Trigger when 10% visible
      );
      
      observer.observe(sliderRef.current);
      
      return () => {
        if (sliderRef.current) {
          observer.unobserve(sliderRef.current);
        }
      };
    }
  }, [isPriority, getCacheKey,]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  // --- Data Fetching ---
  const fetchFilms = useCallback(async (cacheKey: string) => {
    if (hasFetched.current) return;

    setLoading(true);
    setError(null);
    hasFetched.current = true;

    try {
      const cachedFilms = cache.getFilms(cacheKey);
      if (cachedFilms) {
        if (isMounted.current) {
          setFilms(cachedFilms);
          setLoading(false);
          
          // Preload images even for cached films
          cachedFilms.forEach((film: Film | RecommendedFilm) => {
            if (film.imageUrl && !imageCache.has(film.imageUrl)) {
              const img = new window.Image();
              img.src = film.imageUrl;
              img.onload = () => {
                imageCache.set(film.imageUrl, true);
              };
            }
          });
        }
        return;
      }

      // --- Backend Fetch ---
      let url = '/api/films';
      const params = new URLSearchParams();
      if (categoryFilter) params.append('category', categoryFilter);
      if (limit) params.append('limit', limit.toString());
      if (userId) params.append('userId', userId);

      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url);
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();

      const fetchedFilmsData: Film[] = (data && data.rows && Array.isArray(data.rows)) ? data.rows : (Array.isArray(data) ? data : []);

      if (!Array.isArray(fetchedFilmsData)) {
        throw new Error("Invalid data format received from server");
      }

      // Cache the data
      cache.setFilms(cacheKey, fetchedFilmsData);
      
      if (isMounted.current) {
        setFilms(fetchedFilmsData);
        
        // Preload images for fetched films
        fetchedFilmsData.forEach((film: Film) => {
          if (film.imageUrl && !imageCache.has(film.imageUrl)) {
            const img = new window.Image();
            img.src = film.imageUrl;
            img.onload = () => {
              imageCache.set(film.imageUrl, true);
            };
          }
        });
      }

    } catch (err) {
      console.error(`Error fetching films for category "${categoryFilter || 'all'}":`, err);
      if (isMounted.current) {
        setError(err instanceof Error ? err.message : "Failed to load films");
        setFilms([]);
      }
      cache.removeFilms(cacheKey);
    } finally {
      if (isMounted.current) {
        setLoading(false);
      }
    }
  }, [categoryFilter, limit, userId]);

  // Effect to trigger fetch only if necessary
  useEffect(() => {
    // Priority sliders load immediately
    if (isPriority && !initialDataProvided.current && !authLoading && !hasFetched.current) {
      const cacheKey = getCacheKey();
      fetchFilms(cacheKey);
    }
    // Non-priority sliders are handled by the intersection observer
    
    // If filmsData prop changes, update the state
    if (filmsData && initialDataProvided.current) {
      setFilms(filmsData);
      
      // Preload images for provided films
      filmsData.forEach((film: Film | RecommendedFilm) => {
        if (film.imageUrl && !imageCache.has(film.imageUrl)) {
          const img = new window.Image();
          img.src = film.imageUrl;
          img.onload = () => {
            imageCache.set(film.imageUrl, true);
          };
        }
      });
    }
  }, [filmsData, authLoading, fetchFilms, getCacheKey, isPriority]);

  // --- Event Handlers ---
  const handleFilmClick = useCallback((film: Film | RecommendedFilm) => {
    setSelectedFilm(film as Film);
    setIsModalOpen(true);
  }, []);

  const handleToggleWatchlist = useCallback(async (e: React.MouseEvent<HTMLButtonElement>, film: Film | RecommendedFilm) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userId || !isAuthenticated) {
      console.log("User not logged in, cannot toggle watchlist.");
      return;
    }

    const filmId = film.id;
    const wasInWatchlist = 'inWatchlist' in film ? film.inWatchlist : false;
    const oldWatchlistId = 'watchlistId' in film ? film.watchlistId : null;
    const cacheKey = getCacheKey();

    setSavingWatchlistId(filmId);

    // Optimistic UI Update
    setFilms(prevFilms =>
      prevFilms.map(f =>
        f.id === filmId ? { ...f, inWatchlist: !wasInWatchlist, watchlistId: wasInWatchlist ? null : 'temp' } : f
      )
    );

    try {
      let newWatchlistId = null;
      if (wasInWatchlist) {
        const deleteId = oldWatchlistId || filmId;
        await axios.delete(`/api/watchlist/${deleteId}`);
      } else {
        const response = await axios.post('/api/watchlist', { userId, filmId });
        newWatchlistId = response.data?.id;
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
  }, [userId, isAuthenticated, getCacheKey, films]);

  // Function to refresh rating for a specific film
  const refreshFilmRating = useCallback(async (filmId?: number) => {
    if (filmId === undefined) {
      console.warn("refreshFilmRating called without filmId");
      return;
    }

    try {
      const ratingData = await getFilmRating(filmId);
      const newRating = ratingData.averageRating;

      cache.setRating(filmId, newRating);

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
  }, [getCacheKey]);

  // --- Render Logic ---
  if (loading || authLoading) {
    return <FilmSliderSkeleton title={title} itemCount={limit > 5 ? 5 : limit} data-testid="film-slider-skeleton" />;
  }

  if (error) {
    return <div className="w-full py-8 text-center text-red-500 px-4">Error loading films for {title}: {error}</div>;
  }

  if (!films || films.length === 0) {
    if(!loading && !error && (hasFetched.current || initialDataProvided.current)) {
      return <div className="w-full py-8 text-center text-gray-500 px-4">No films found in the "{title}" category.</div>;
    }
    return null;
  }

  // Dynamic Titles for TextLoop based on category/title
  const getSliderTitles = () => {
    if (categoryFilter === 'comedy') return ["Comedy Films", "Laugh Out Loud", "Funny Flicks"];
    if (categoryFilter === 'drama') return ["Drama Films", "Critically Acclaimed", "Emotional Journeys"];
    return [title, "Trending Now", "Top Picks"];
  };

  return (
    <section className="py-4 sm:py-6 md:py-8" ref={sliderRef}>
      {/* Preload images for visible items */}
      {films.slice(0, 5).map((film) => (
        <ImagePreloader key={`preload-${film.id}`} src={film.imageUrl} />
      ))}
      
      <div className="mb-3 sm:mb-4 md:mb-6 h-8">
        <h2 className="text-xl sm:text-2xl font-bold text-white">{title}</h2>
      </div>

      <Carousel
        plugins={[Autoplay({ delay: 5000, stopOnInteraction: true })]}
        opts={{ align: "start", loop: films.length > 4 }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {films.map((film, index) => (
            <CarouselItem key={film.id} className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6">
              <div
                className="relative overflow-hidden rounded-lg group cursor-pointer shadow-lg transition-shadow duration-300 hover:shadow-xl bg-gray-800"
                onClick={() => handleFilmClick(film)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleFilmClick(film)}
              >
                <div className="aspect-[2/3] w-full relative">
                  <Image
                    src={film.imageUrl || '/placeholder-image.png'}
                    alt={film.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16.6vw"
                    priority={isPriority && index < 5}
                    loading={isPriority && index < 5 ? "eager" : "lazy"}
                    // Use cached version if available
                    key={`${film.id}-${imageCache.has(film.imageUrl) ? 'cached' : 'uncached'}`}
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
                    <span>{'duration' in film ? Math.floor(film.duration) : 'NaN'} min</span>
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