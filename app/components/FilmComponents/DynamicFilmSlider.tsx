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
import { Button } from "@/components/ui/button";
import { CiHeart } from "react-icons/ci";
import { FaHeart, FaStar } from "react-icons/fa";
import { useUser } from "@/app/auth/nextjs/useUser";
import cache from "@/app/services/cashService";
import FilmSliderSkeleton from "./SkeletonSlider";

// Lazy load heavy components
const PlayVideoModal = React.lazy(() => import("@/app/components/PlayVideoModal"));

// Types
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

interface FilmSliderProps {
  title: string;
  categoryFilter?: string;
  limit?: number;
  filmsData?: Film[];
}

// Define props interface for FilmCard component
interface FilmCardProps {
  film: Film;
  index: number;
  isAuthenticated: boolean;
  userId: string | undefined;
  savingWatchlistId: number | null;
  handleFilmClick: (film: Film) => void;
  handleToggleWatchlist: (e: React.MouseEvent<HTMLButtonElement>, film: Film) => Promise<void>;
}

// Memoized film card component to prevent re-renders
const FilmCard = memo(({ 
  film, 
  index, 
  isAuthenticated, 
  userId, 
  savingWatchlistId,
  handleFilmClick, 
  handleToggleWatchlist 
}: FilmCardProps) => {
  const isInWatchlist = 'inWatchlist' in film ? film.inWatchlist : false;
  
  return (
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
          className="object-cover"
          sizes="(max-width: 640px) 50vw, (max-width: 768px) 33.33vw, (max-width: 1024px) 25vw, (max-width: 1280px) 20vw, 16.66vw"
          priority={index < 2} // Only prioritize the first two images
          loading={index < 2 ? "eager" : "lazy"}
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAFdQIYv8k0WwAAAABJRU5ErkJggg=="
          quality={index < 2 ? 85 : 75} // Lower quality for off-screen images
        />

        {/* Fixed heart icon section */}
        {(isAuthenticated && userId) && (
          <div className="absolute top-1 sm:top-2 right-1 sm:right-2 z-20">
            <Button
              variant="outline"
              size="icon"
              aria-label={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
              className="bg-black/60 hover:bg-black/80 backdrop-blur-sm rounded-full border-none heart-button w-7 h-7 sm:w-8 sm:h-8 transition-colors duration-200"
              onClick={(e) => handleToggleWatchlist(e, film)}
              disabled={savingWatchlistId === film.id}
            >
              {isInWatchlist ? (
                <FaHeart className="w-4 h-4 sm:w-5 sm:h-5 text-red-500" />
              ) : (
                <CiHeart className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
              )}
            </Button>
          </div>
        )}

        {/* Mobile-optimized play button (simpler hover effect) */}
        <div className="absolute inset-0 flex items-center justify-center bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="w-10 h-10 rounded-full bg-white/25 flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Simplified film info with reduced styling calculations */}
      <div className="absolute bottom-0 left-0 right-0 p-2 bg-black/80 pointer-events-none">
        <h3 className="text-white font-semibold text-xs sm:text-sm truncate" title={film.title}>
          {film.title}
        </h3>
        <div className="flex items-center text-xs text-gray-300 mt-1 space-x-1">
          <span>{film.releaseYear}</span>
          <span>•</span>
          <span>{Math.floor(film.duration || 0)} min</span>
          {film.averageRating !== null && film.averageRating > 0 && (
            <>
              <span>•</span>
              <span className="flex items-center">
                <FaStar className="w-3 h-3 text-yellow-400 mr-1" />
                {film.averageRating.toFixed(1)}
              </span>
            </>
          )}
        </div>
      </div>
    </div>
  );
});

FilmCard.displayName = "FilmCard";

// Main component with mobile performance optimizations
const FilmSlider = ({ title, categoryFilter, limit = 10, filmsData }: FilmSliderProps) => {
  const { user, isAuthenticated, isLoading: authLoading } = useUser();
  const userId = user?.id;

  const [films, setFilms] = useState<Film[]>(filmsData || []);
  const [loading, setLoading] = useState(!filmsData);
  const [error, setError] = useState<string | null>(null);
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [savingWatchlistId, setSavingWatchlistId] = useState<number | null>(null);

  // State management references to prevent unnecessary renders
  const initialDataProvided = useRef(!!filmsData);
  const hasFetched = useRef(false);
  const isMounted = useRef(true);

  // Memoized cache key for improved caching
  const getCacheKey = useCallback(() => {
    const userSegment = isAuthenticated && userId ? `user-${userId}` : 'guest';
    return `films-${title.replace(/\s+/g, '-')}-${categoryFilter || 'all'}-${limit}-${userSegment}`;
  }, [title, categoryFilter, limit, userId, isAuthenticated]);

  // Optimized fetch function
  const fetchFilms = useCallback(async () => {
    // Don't fetch if we already have data or we've already fetched
    if (initialDataProvided.current || hasFetched.current) return;
    if (!isMounted.current) return;
    
    const cacheKey = getCacheKey();
    setLoading(true);
    setError(null);
    
    try {
      // Try to get from cache first
      const cachedFilms = cache.getFilms(cacheKey);
      if (cachedFilms && cachedFilms.length > 0) {
        if (isMounted.current) {
          setFilms(cachedFilms);
          hasFetched.current = true;
          setLoading(false);
        }
        return;
      }

      // Dynamically build API URL
      let url = '/api/films';
      const params = new URLSearchParams();
      if (categoryFilter) params.append('category', categoryFilter);
      
      // Use smaller limit for mobile
      const isMobile = window.innerWidth < 768;
      const adjustedLimit = isMobile ? Math.min(limit, 6) : limit;
      params.append('limit', adjustedLimit.toString());
      
      if (userId) params.append('userId', userId);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await fetch(url, {
        // Add cache control headers
        headers: { 'Cache-Control': 'max-age=3600' }
      });
      
      if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

      const data = await response.json();
      const fetchedFilmsData = (data?.rows && Array.isArray(data.rows)) ? data.rows : 
                               (Array.isArray(data) ? data : []);
      
      if (!Array.isArray(fetchedFilmsData)) {
        throw new Error("Invalid data format received from server");
      }
      
      // Set in cache and update state if component still mounted
      cache.setFilms(cacheKey, fetchedFilmsData);
      if (isMounted.current) {
        setFilms(fetchedFilmsData);
        hasFetched.current = true;
        setLoading(false);
      }
    } catch (err) {
      console.error(`Error fetching films for category "${categoryFilter || 'all'}":`, err);
      if (isMounted.current) {
        setError(err instanceof Error ? err.message : "Failed to load films");
        setFilms([]);
        setLoading(false);
      }
      cache.removeFilms(cacheKey);
    }
  }, [categoryFilter, limit, userId, getCacheKey]);

  // Simplified watchlist toggle with optimistic UI updates
  const handleToggleWatchlist = useCallback(async (e: React.MouseEvent<HTMLButtonElement>, film: Film) => {
    e.preventDefault();
    e.stopPropagation();

    if (!userId || !isAuthenticated) {
      alert("Please log in to manage your watchlist.");
      return;
    }

    const filmId = film.id;
    const wasInWatchlist = 'inWatchlist' in film ? film.inWatchlist : false;

    // Set saving state
    setSavingWatchlistId(filmId);

    // Optimistic UI update
    setFilms(prevFilms =>
      prevFilms.map(f =>
        f.id === filmId ? { ...f, inWatchlist: !wasInWatchlist } : f
      )
    );

    try {
      // Simplified API call
      const endpoint = wasInWatchlist ? 
        `/api/watchlist/${filmId}` : 
        '/api/watchlist';
      
      const method = wasInWatchlist ? 'DELETE' : 'POST';
      
      const response = await fetch(endpoint, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: method === 'POST' ? JSON.stringify({ userId, filmId }) : undefined
      });

      if (!response.ok) throw new Error('Failed to update watchlist');
      
      // Update cache after successful operation
      const cacheKey = getCacheKey();
      const cachedFilms = cache.getFilms(cacheKey);
      if (cachedFilms) {
        const updatedCachedFilms = cachedFilms.map((f: Film) => 
          f.id === filmId ? { ...f, inWatchlist: !wasInWatchlist } : f
        );
        cache.setFilms(cacheKey, updatedCachedFilms);
      }
    } catch (error) {
      console.error("Watchlist toggle error:", error);
      
      // Revert UI on error
      setFilms(prevFilms =>
        prevFilms.map(f =>
          f.id === filmId ? { ...f, inWatchlist: wasInWatchlist } : f
        )
      );
      
      alert("Failed to update watchlist. Please try again.");
    } finally {
      setSavingWatchlistId(null);
    }
  }, [userId, isAuthenticated, getCacheKey]);

  // Handle film click with lazy-loaded modal
  const handleFilmClick = useCallback((film: Film) => {
    setSelectedFilm(film);
    setIsModalOpen(true);
  }, []);

  // Effect for initial data fetching
  useEffect(() => {
    if (!initialDataProvided.current && !authLoading && !hasFetched.current) {
      fetchFilms();
    }
    
    return () => {
      isMounted.current = false;
    };
  }, [authLoading, fetchFilms]);

  // Simplified rendering logic
  
  if (loading || authLoading) {
    return <FilmSliderSkeleton title={title} itemCount={Math.min(limit, 4)} />;
  }

  if (error) {
    return <div className="w-full py-4 text-center text-red-500">Error loading films</div>;
  }

  if (!films || films.length === 0) {
    if (!loading && !error && (hasFetched.current || initialDataProvided.current)) {
      return <div className="w-full py-4 text-center text-gray-500">No films found</div>;
    }
    return null;
  }

  // Use simplified carousel for mobile
  const isMobileView = typeof window !== 'undefined' && window.innerWidth < 768;
  
  return (
    <section className="py-4">
      <h2 className="mb-3 text-xl font-bold text-white">{title}</h2>

      <Carousel
        opts={{ 
          align: "start", 
          loop: films.length > 4,
          dragFree: isMobileView // Make mobile swiping more responsive
        }}
        className="w-full"
      >
        <CarouselContent className="-ml-2 md:-ml-4">
          {films.map((film, index) => (
            <CarouselItem 
              key={film.id} 
              className="pl-2 md:pl-4 basis-1/2 sm:basis-1/3 md:basis-1/4 lg:basis-1/5 xl:basis-1/6"
            >
              <FilmCard
                film={film}
                index={index}
                isAuthenticated={isAuthenticated}
                userId={userId}
                savingWatchlistId={savingWatchlistId}
                handleFilmClick={handleFilmClick}
                handleToggleWatchlist={handleToggleWatchlist}
              />
            </CarouselItem>
          ))}
        </CarouselContent>
        
        {/* Only show navigation arrows on desktop */}
        {!isMobileView && films.length > 4 && (
          <>
            <CarouselPrevious className="left-0 -ml-3 hidden md:flex" />
            <CarouselNext className="right-0 -mr-3 hidden md:flex" />
          </>
        )}
      </Carousel>

      {/* Lazy load the modal only when needed */}
      {selectedFilm && isModalOpen && (
        <React.Suspense fallback={<div className="fixed inset-0 bg-black/50 flex items-center justify-center">Loading...</div>}>
          <PlayVideoModal
            title={selectedFilm.title}
            overview={selectedFilm.overview || ''}
            videoSource={selectedFilm.videoSource || ''}
            trailerUrl={selectedFilm.trailerUrl || ''}
            releaseYear={selectedFilm.releaseYear}
            ageRating={selectedFilm.ageRating || 0}
            duration={selectedFilm.duration}
            ratings={selectedFilm.averageRating ?? 0}
            category={selectedFilm.category || ''}
            filmId={selectedFilm.id}
            userId={userId || ""}
            setUserRating={() => {}}
            state={isModalOpen}
            changeState={setIsModalOpen}
          />
        </React.Suspense>
      )}
    </section>
  );
};

export default memo(FilmSlider);