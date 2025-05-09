import React, { useEffect, useState, useCallback, memo, useRef } from "react";
import Image from "next/image";
import axios from "axios";
import { FilmCard } from "@/app/components/FilmComponents/FilmCard";
import { Film } from "@/types/film";
import VideoModal from "@/app/components/Modal/VideoModal"; 

interface FilmLayoutProps {
  title: string;
  films: Film[];
  loading: boolean;
  error: string | null;
  userId?: string;
  isMobile: boolean;
}

// Memoize FilmItem to prevent unnecessary re-renders
const FilmItem = memo(({ 
  film, 
  rating, 
  onClick 
}: { 
  film: Film; 
  rating: number | null; 
  onClick: () => void;
}) => {
  const [imageError, setImageError] = useState(false);
  
  // Handle image loading errors
  const handleImageError = useCallback(() => {
    setImageError(true);
  }, []);
  
  // Use a placeholder image if the original image fails to load
  const imageSrc = imageError ? '/placeholder-movie.png' : film.imageUrl;
  
  return (
    <div 
      className="relative h-60 cursor-pointer transition-transform duration-300 hover:scale-105" 
      onClick={onClick}
    >
      {/* Film Thumbnail with error handling */}
      <Image
        src={imageSrc}
        alt={film.title}
        width={500}
        height={400}
        className="rounded-sm absolute w-full h-full object-cover"
        loading="lazy"
        onError={handleImageError}
        placeholder="blur"
        blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+P+/HgAEhgJA/bYOUwAAAABJRU5ErkJggg=="
      />

      {/* Overlay with hover animation */}
      <div 
        className="h-60 relative z-10 w-full rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300"
      >
        <div className="bg-gradient-to-b from-transparent via-black/50 to-black z-10 w-full h-full rounded-lg flex items-center justify-center">
          <Image
            src={imageSrc}
            alt={film.title}
            width={800}
            height={800}
            className="absolute w-full h-full -z-10 rounded-lg object-cover"
            loading="lazy"
            onError={handleImageError}
          />

          <FilmCard
            key={film.id}
            imageUrl={film.imageUrl}
            ageRating={film.ageRating ?? 0}
            filmId={film.id}
            overview={film.overview}
            time={film.time}
            title={film.title}
            releaseYear={film.releaseYear}
            trailerUrl={film.trailerUrl}
            initialRatings={film.initialRatings}
            watchList={film.watchList}
            category={film.category || "Uncategorized"}
            onOpenModal={() => {}} // Empty function to prevent extra modal opening
          />
        </div>
      </div>
    </div>
  );
});

FilmItem.displayName = "FilmItem";

const FilmLayout: React.FC<FilmLayoutProps> = ({ title, films = [], loading, error, userId, isMobile }) => {
  // Main state
  const [filmRatings, setFilmRatings] = useState<Record<number, number>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null);
  const [userRating, setUserRating] = useState<number>(0);
  const [showingTrailer, setShowingTrailer] = useState(false);
  const [currentVideoSource, setCurrentVideoSource] = useState<string | undefined>(undefined);
  const [currentTrailerUrl, setCurrentTrailerUrl] = useState<string | undefined>(undefined);
  
  // Refs to prevent memory leaks and track component lifecycle
  const isMountedRef = useRef(true);
  const dataFetchedRef = useRef(false);
  const pendingRatingUpdates = useRef<Record<number, number>>({});
  const ratingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userRatingFetchedRef = useRef(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Clean up resources on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      
      if (ratingTimeoutRef.current) {
        clearTimeout(ratingTimeoutRef.current);
      }
      
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  // Batch fetch ratings with optimizations - only runs once
  useEffect(() => {
    // Skip if no films, already fetched, or component unmounted
    if (films.length === 0 || dataFetchedRef.current || !isMountedRef.current) return;

    // Create abort controller for cleanup
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;

    const fetchRatings = async () => {
      try {
        dataFetchedRef.current = true; // Set flag early to prevent duplicate fetches
        
        // Process films in batches to prevent UI freezing
        const batchSize = 20;
        const batches = Math.ceil(films.length / batchSize);
        const newRatings: Record<number, number> = {};
        
        for (let i = 0; i < batches; i++) {
          if (!isMountedRef.current) return;
          
          const start = i * batchSize;
          const end = Math.min(start + batchSize, films.length);
          const batch = films.slice(start, end);
          
          // Create batch of promises with the abort signal
          const batchPromises = batch.map(film => 
            axios.get(`/api/films/${film.id}/average-rating`, { signal })
              .then(response => ({
                id: film.id,
                rating: response.data?.averageRating
              }))
              .catch(() => ({
                id: film.id,
                rating: null
              }))
          );
          
          const results = await Promise.all(batchPromises);
          
          // Update ratings
          results.forEach(item => {
            if (item.rating !== undefined && item.rating !== null) {
              newRatings[item.id] = item.rating;
            } else {
              // Use the initial rating from film data if API returns nothing
              const film = films.find(f => f.id === item.id);
              if (film) {
                newRatings[item.id] = film.initialRatings;
              }
            }
          });
          
          // Introduce small delay between batches to prevent freezing
          if (i < batches - 1 && isMountedRef.current) {
            await new Promise(resolve => setTimeout(resolve, 50));
          }
        }
        
        if (isMountedRef.current) {
          setFilmRatings(newRatings);
        }
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error("Error fetching ratings:", error);
        }
      }
    };

    fetchRatings();
  }, [films]);

  // Fetch user rating when a film is selected - optimized
  useEffect(() => {
    if (!selectedFilm || !userId || !isMountedRef.current) return;
    
    // Reset the ref when a new film is selected
    userRatingFetchedRef.current = false;
    
    // Create new abort controller
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();
    const signal = abortControllerRef.current.signal;
    
    const fetchUserRating = async () => {
      if (userRatingFetchedRef.current) return;
      
      try {
        const response = await axios.get(`/api/films/${selectedFilm.id}/user-rating`, {
          params: { userId },
          signal
        });
        
        if (isMountedRef.current) {
          if (response.data && response.data.rating !== undefined) {
            setUserRating(response.data.rating);
          } else {
            setUserRating(0);
          }
          userRatingFetchedRef.current = true;
        }
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error("Error fetching user rating:", error);
          if (isMountedRef.current) {
            setUserRating(0);
          }
        }
      }
    };
    
    fetchUserRating();
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [selectedFilm, userId]);

  // Memoized handlers to prevent unnecessary re-creation
  const handleFilmClick = useCallback((film: Film) => {
    if (!isMountedRef.current) return;
    
    setSelectedFilm(film);
    setModalOpen(true);
    setShowingTrailer(false);
    setCurrentVideoSource(film.videoSource);
    setCurrentTrailerUrl(film.trailerUrl);
  }, []);

  const toggleVideoSource = useCallback(() => {
    if (!isMountedRef.current) return;
    setShowingTrailer(prevState => !prevState);
  }, []);

  const handleSetUserRating = useCallback((rating: number) => {
    if (!selectedFilm || !userId || !isMountedRef.current) return;
    
    // Update UI immediately for better user experience
    setUserRating(rating);
    
    // Store the pending update for this film
    pendingRatingUpdates.current[selectedFilm.id] = rating;
    
    // Clear any existing timeout
    if (ratingTimeoutRef.current) {
      clearTimeout(ratingTimeoutRef.current);
    }
    
    // Set new timeout to process the rating with debounce
    ratingTimeoutRef.current = setTimeout(async () => {
      if (!isMountedRef.current) return;
      
      const filmId = selectedFilm.id;
      const pendingRating = pendingRatingUpdates.current[filmId];
      
      if (pendingRating === undefined) return;
      
      try {
        // Create abort controller for this request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }
        abortControllerRef.current = new AbortController();
        const signal = abortControllerRef.current.signal;
        
        // Save the user rating
        await axios.post(`/api/films/${filmId}/ratings`, {
          userId,
          filmId,
          rating: pendingRating
        }, { signal });
        
        // Update the average rating
        if (isMountedRef.current) {
          const response = await axios.get(`/api/films/${filmId}/average-rating`, { signal });
          if (response.data?.averageRating !== undefined) {
            setFilmRatings(prev => ({
              ...prev,
              [filmId]: response.data.averageRating
            }));
          }
        }
      } catch (error) {
        if (!axios.isCancel(error)) {
          console.error("Error with rating operation:", error);
        }
      } finally {
        // Clear the pending update
        delete pendingRatingUpdates.current[filmId];
      }
    }, 500);
  }, [selectedFilm, userId]);

  // Memoized watched handler
  const markAsWatched = useCallback((userId: string, filmId: number) => {
    if (!userId || !isMountedRef.current) return;
    
    // Use a background task approach to avoid waiting
    const markWatched = async () => {
      try {
        await axios.post(`/api/films/${filmId}/watched-films`, { userId, filmId });
      } catch (error) {
        console.error("Error marking film as watched:", error);
      }
    };
    
    markWatched();
  }, []);

  // Refresh rating function - optimized with signal
  const refreshRating = useCallback(async (filmId?: number) => {
    if (!isMountedRef.current) return;
    
    try {
      const id = filmId || selectedFilm?.id;
      if (!id) return;

      // Skip if there's a pending update for this film
      if (pendingRatingUpdates.current[id] !== undefined) {
        return;
      }

      // Create abort controller
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();
      const signal = abortControllerRef.current.signal;

      const response = await axios.get(`/api/films/${id}/average-rating`, { signal });
      if (isMountedRef.current && response.data?.averageRating !== undefined) {
        setFilmRatings(prev => ({
          ...prev,
          [id]: response.data.averageRating
        }));
      }
    } catch (error) {
      if (!axios.isCancel(error)) {
        console.error("Error refreshing rating:", error);
      }
    }
  }, [selectedFilm]);

  // Modal close handler - prevent memory leaks
  const handleModalClose = useCallback(() => {
    if (!isMountedRef.current) return;
    
    setModalOpen(false);
    
    // Use a short delay for the modal closing animation
    const closeTimer = setTimeout(() => {
      if (isMountedRef.current) {
        setSelectedFilm(null);
        setUserRating(0);
        setCurrentVideoSource(undefined);
        setCurrentTrailerUrl(undefined);
      }
    }, 300);
    
    // Clean up the timer if component unmounts during the delay
    return () => clearTimeout(closeTimer);
  }, []);

  // Dynamic CSS classes based on device type
  const gridClassNames = isMobile 
    ? "grid grid-cols-1 sm:grid-cols-2 px-3 mt-6 gap-4" 
    : "grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 px-5 sm:px-0 mt-10 gap-6";

  const titleClassNames = isMobile
    ? "text-gray-400 text-3xl font-bold mt-6 px-4"
    : "text-gray-400 text-4xl font-bold mt-10 px-5 sm:px-0";

  return (
    <div className="recently-added-container mb-20" data-testid="film-layout">
      {/* Title Section */}
      <div className="flex items-center justify-center">
        <h1 className={titleClassNames}>
          {title}
        </h1>
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="text-center text-white mt-6">
          <div className="spinner-border animate-spin border-t-4 border-blue-500 rounded-full w-12 h-12"></div>
        </div>
      )}

      {/* Error Handling */}
      {error && (
        <div className="text-center text-red-500 mt-6 px-4">
          <p>Error: {error}</p>
          <button 
            className="mt-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            onClick={() => window.location.reload()}
          >
            Retry
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && !error && films.length === 0 && (
        <div className="text-center text-gray-400 mt-6 px-4">
          <p>No films found in this category.</p>
        </div>
      )}

      {/* Film Grid */}
      {!loading && !error && films.length > 0 && (
        <div className={gridClassNames}>
          {films.map((film) => (
            <FilmItem 
              key={film.id} 
              film={film} 
              rating={filmRatings[film.id] || film.initialRatings} 
              onClick={() => handleFilmClick(film)} 
            />
          ))}
        </div>
      )}

      {/* Video Modal */}
      {selectedFilm && (
        <VideoModal
          isOpen={modalOpen}
          onClose={handleModalClose}
          title={selectedFilm.title}
          overview={selectedFilm.overview}
          mainVideoUrl={currentVideoSource}
          trailerUrl={currentTrailerUrl || ""}
          showingTrailer={showingTrailer}
          toggleVideo={toggleVideoSource}
          userRating={userRating}
          averageRating={filmRatings[selectedFilm.id] || selectedFilm.initialRatings}
          onSetRating={handleSetUserRating}
          onMarkWatched={userId ? () => markAsWatched(userId, selectedFilm.id) : undefined}
          releaseYear={selectedFilm.releaseYear}
          ageRating={selectedFilm.ageRating}
          runningTime={selectedFilm.time}
          refreshRating={() => refreshRating(selectedFilm.id)}
          userId={userId}
          filmId={selectedFilm.id}
        />
      )}
    </div>
  );
};

export default FilmLayout;