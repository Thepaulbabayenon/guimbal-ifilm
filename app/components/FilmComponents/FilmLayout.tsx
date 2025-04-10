import React, { useEffect, useState, useCallback, memo } from "react";
import Image from "next/image";
import axios from "axios";
import { FilmCard } from "@/app/components/FilmComponents/FilmCard";
import PlayVideoModal from "@/app/components/PlayVideoModal";
import { Film } from "@/types/film";

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
  const imageSrc = imageError ? '/placeholder-movie.jpg' : film.imageUrl;
  
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
            onOpenModal={() => onClick()} 
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
  const [fetchedInitial, setFetchedInitial] = useState(false);

  useEffect(() => {
    let isMounted = true;
  
    const fetchRatings = async () => {
      if (films.length === 0 || fetchedInitial) return;
      
      try { 
        // Process films in smaller batches to prevent UI freezing
        const batchSize = 10; // Increased batch size since we're using less animations
        const batches = Math.ceil(films.length / batchSize);
        
        for (let i = 0; i < batches; i++) {
          if (!isMounted) return;
          
          const start = i * batchSize;
          const end = Math.min(start + batchSize, films.length);
          const batch = films.slice(start, end);
          
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
          
          if (isMounted) {
            setFilmRatings(prev => {
              const newRatings = { ...prev };
              results.forEach(item => {
                if (item.rating !== undefined && item.rating !== null) {
                  newRatings[item.id] = item.rating;
                }
              });
              return newRatings;
            });
          }
        }
        
        setFetchedInitial(true);
      } catch (error) {
        console.error("Error fetching ratings:", error);
      }
    };

    fetchRatings();

    return () => {
      isMounted = false;
    };
  }, [films, fetchedInitial]);

  // Memoized film click handler
  const handleFilmClick = useCallback((film: Film) => {
    setSelectedFilm(film);
    setModalOpen(true);
  }, []);

  // Memoized rating handler
  const handleSetUserRating = useCallback((rating: number) => {
    setUserRating(rating);
    
    if (selectedFilm && userId) {
      axios.post(`/api/films/${selectedFilm.id}/ratings`, {
        userId,
        filmId: selectedFilm.id,
        rating
      })
      .then(() => {
        return axios.get(`/api/films/${selectedFilm.id}/average-rating`);
      })
      .then(response => {
        if (response.data?.averageRating !== undefined) {
          setFilmRatings(prev => ({
            ...prev,
            [selectedFilm.id]: response.data.averageRating
          }));
        }
      })
      .catch(error => console.error("Error with rating operation:", error));
    }
  }, [selectedFilm, userId]);

  // Memoized watched handler
  const markAsWatched = useCallback((userId: string, filmId: number) => {
    console.log(`Film ${filmId} marked as watched by user ${userId}`);
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

      {/* Film Grid without Framer Motion */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 px-5 sm:px-0 mt-10 gap-6">
        {films.map((film, index) => (
          <FilmItem
            key={`${film.id}-${index}`} 
            film={film}
            rating={filmRatings[film.id] || null}
            onClick={() => handleFilmClick(film)}
          />
        ))}
      </div>

      {/* Single Video Modal controlled at the layout level */}
      {selectedFilm && (
        <PlayVideoModal
          title={selectedFilm.title}
          overview={selectedFilm.overview}
          trailerUrl={selectedFilm.trailerUrl}
          state={modalOpen}
          changeState={setModalOpen}
          releaseYear={selectedFilm.releaseYear}
          ageRating={selectedFilm.ageRating}
          duration={selectedFilm.time}
          ratings={filmRatings[selectedFilm.id] || selectedFilm.initialRatings}
          setUserRating={handleSetUserRating}
          userId={userId}
          filmId={selectedFilm.id}
          markAsWatched={markAsWatched}
          category={selectedFilm.category}
        />
      )}
    </div>
  );
};

export default FilmLayout;