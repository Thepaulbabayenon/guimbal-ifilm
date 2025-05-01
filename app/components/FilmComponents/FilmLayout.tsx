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
}

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
  const handleImageError = () => {
    console.error(`Failed to load image for film: ${film.title}`);
    setImageError(true);
  };
  
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

const FilmLayout: React.FC<FilmLayoutProps> = ({ title, films = [], loading, error, userId }) => {
  const [filmRatings, setFilmRatings] = useState<Record<number, number>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null);
  const [userRating, setUserRating] = useState<number>(0);
  const [showingTrailer, setShowingTrailer] = useState(false);
  const [currentVideoSource, setCurrentVideoSource] = useState<string | undefined>(undefined);
  const [currentTrailerUrl, setCurrentTrailerUrl] = useState<string | undefined>(undefined);
  
  // Use refs to track data loading status
  const dataFetchedRef = useRef(false);
  const isMountedRef = useRef(true);
  const pendingRatingUpdates = useRef<Record<number, number>>({});
  
  // Prevent memory leaks on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
    };
  }, []);
  
  // Optimized batch fetching of ratings - runs only once when films are loaded
  useEffect(() => {
    if (films.length === 0 || dataFetchedRef.current) return;

    const fetchRatings = async () => {
      try {
        // Process films in batches to prevent UI freezing
        const batchSize = 20; // Increased batch size for efficiency
        const batches = Math.ceil(films.length / batchSize);
        const newRatings: Record<number, number> = {};
        
        for (let i = 0; i < batches; i++) {
          if (!isMountedRef.current) return;
          
          const start = i * batchSize;
          const end = Math.min(start + batchSize, films.length);
          const batch = films.slice(start, end);
          
          // Use Promise.all to parallelize requests within each batch
          const batchPromises = batch.map(film => 
            axios.get(`/api/films/${film.id}/average-rating`)
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
        }
        
        if (isMountedRef.current) {
          setFilmRatings(newRatings);
          dataFetchedRef.current = true;
        }
      } catch (error) {
        console.error("Error fetching ratings:", error);
      }
    };

    fetchRatings();
  }, [films]);

  // Load user rating when a film is selected - with optimization
  const userRatingFetchedRef = useRef(false);
  
  useEffect(() => {
    if (!selectedFilm || !userId) return;
    
    // Reset the ref when a new film is selected
    userRatingFetchedRef.current = false;
    
    const fetchUserRating = async () => {
      // Prevent duplicate API calls
      if (userRatingFetchedRef.current) return;
      
      try {
        const response = await axios.get(`/api/films/${selectedFilm.id}/user-rating`, {
          params: { userId }
        });
        
        if (isMountedRef.current) {
          if (response.data && response.data.rating !== undefined) {
            setUserRating(response.data.rating);
          } else {
            setUserRating(0); // Reset if no rating exists
          }
          userRatingFetchedRef.current = true;
        }
      } catch (error) {
        console.error("Error fetching user rating:", error);
        if (isMountedRef.current) {
          setUserRating(0); // Reset on error
        }
      }
    };
    
    fetchUserRating();
  }, [selectedFilm, userId]);

  // Memoized film click handler
  const handleFilmClick = useCallback((film: Film) => {
    console.log("Film clicked:", film.title);
    setSelectedFilm(film);
    setModalOpen(true);
    setShowingTrailer(false);
    setCurrentVideoSource(film.videoSource);
    setCurrentTrailerUrl(film.trailerUrl);
  }, []);

  // Toggle between trailer and full video
  const toggleVideoSource = useCallback(() => {
    setShowingTrailer(prevState => !prevState);
  }, []);

  // Debounced rating handler to prevent excessive API calls
  const ratingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  const handleSetUserRating = useCallback((rating: number) => {
    if (!selectedFilm || !userId) return;
    
    // Update UI immediately for better user experience
    setUserRating(rating);
    
    // Store the pending update for this film
    pendingRatingUpdates.current[selectedFilm.id] = rating;
    
    // Clear any existing timeout
    if (ratingTimeoutRef.current) {
      clearTimeout(ratingTimeoutRef.current);
    }
    
    // Set new timeout to process the rating
    ratingTimeoutRef.current = setTimeout(async () => {
      const filmId = selectedFilm.id;
      const pendingRating = pendingRatingUpdates.current[filmId];
      
      if (pendingRating === undefined) return;
      
      try {
        // Save the user rating
        await axios.post(`/api/films/${filmId}/ratings`, {
          userId,
          filmId,
          rating: pendingRating
        });
        
        // Update the average rating
        if (isMountedRef.current) {
          const response = await axios.get(`/api/films/${filmId}/average-rating`);
          if (response.data?.averageRating !== undefined) {
            setFilmRatings(prev => ({
              ...prev,
              [filmId]: response.data.averageRating
            }));
          }
        }
      } catch (error) {
        console.error("Error with rating operation:", error);
      } finally {
        // Clear the pending update
        delete pendingRatingUpdates.current[filmId];
      }
    }, 500); // 500ms debounce
  }, [selectedFilm, userId]);

  // Memoized watched handler
  const markAsWatched = useCallback((userId: string, filmId: number) => {
    if (!userId) return;
    
    // Don't await this operation since it's not critical for UI updates
    axios.post(`/api/films/${filmId}/watched-films`, { 
      userId, 
      filmId 
    })
    .then(() => console.log(`Film ${filmId} marked as watched by user ${userId}`))
    .catch(error => console.error("Error marking film as watched:", error));
  }, []);

  // Add a smart refresh rating function that only makes API call when needed
  const refreshRating = useCallback(async (filmId?: number) => {
    try {
      const id = filmId || selectedFilm?.id;
      if (!id) return;

      // Skip if there's a pending update for this film
      if (pendingRatingUpdates.current[id] !== undefined) {
        return;
      }

      const response = await axios.get(`/api/films/${id}/average-rating`);
      if (isMountedRef.current && response.data?.averageRating !== undefined) {
        setFilmRatings(prev => ({
          ...prev,
          [id]: response.data.averageRating
        }));
      }
    } catch (error) {
      console.error("Error refreshing rating:", error);
    }
  }, [selectedFilm]);

  // Reset userRating when modal closes
  const handleModalClose = useCallback(() => {
    setModalOpen(false);
    // Don't immediately reset selectedFilm to prevent UI flicker
    // Allow a small delay for the modal closing animation
    setTimeout(() => {
      if (isMountedRef.current) {
        setSelectedFilm(null);
        setUserRating(0);
        setCurrentVideoSource(undefined);
        setCurrentTrailerUrl(undefined);
      }
    }, 300);
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (ratingTimeoutRef.current) {
        clearTimeout(ratingTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="recently-added-container mb-20">
      {/* Title Section */}
      <div className="flex items-center justify-center">
        <h1 className="text-gray-400 text-4xl font-bold mt-10 px-5 sm:px-0">
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
        <div className="text-center text-red-500 mt-4">
          {error}
        </div>
      )}

      {/* Film Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 px-5 sm:px-0 mt-10 gap-6">
        {films.map((film, index) => (
          <FilmItem
            key={`${film.id}-${index}`} 
            film={film}
            rating={filmRatings[film.id] || film.initialRatings}
            onClick={() => handleFilmClick(film)}
          />
        ))}
      </div>

      {/* Video Modal */}
      {selectedFilm && (
        <VideoModal
          title={selectedFilm.title}
          overview={selectedFilm.overview}
          trailerUrl={currentTrailerUrl || selectedFilm.trailerUrl || ""}
          videoSource={currentVideoSource || selectedFilm.videoSource}
          state={modalOpen}
          changeState={handleModalClose}
          releaseYear={selectedFilm.releaseYear}
          ageRating={selectedFilm.ageRating}
          duration={selectedFilm.time}
          ratings={filmRatings[selectedFilm.id] || selectedFilm.initialRatings}
          setUserRating={handleSetUserRating}
          userRating={userRating}
          userId={userId}
          filmId={selectedFilm.id}
          markAsWatched={markAsWatched}
          category={selectedFilm.category || "Uncategorized"}
          refreshRating={refreshRating}
          toggleVideoSource={toggleVideoSource}
          showingTrailer={showingTrailer}
        />
      )}
    </div>
  );
};

export default FilmLayout;