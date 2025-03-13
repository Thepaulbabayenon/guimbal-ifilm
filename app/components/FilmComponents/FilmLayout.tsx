import React, { useEffect, useState, useCallback, memo } from "react";
import Image from "next/image";
import axios from "axios";
import { motion } from "framer-motion";
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

// Animation variants for staggered animations
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { 
    y: 0, 
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  }
};


const FilmItem = memo(({ 
  film, 
  rating, 
  onClick 
}: { 
  film: Film; 
  rating: number | null; 
  onClick: () => void;
}) => {
  return (
    <motion.div 
      variants={itemVariants}
      className="relative h-60 cursor-pointer" 
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      transition={{ type: "spring", stiffness: 400, damping: 25 }}
    >
      {/* Film Thumbnail */}
      <Image
        src={film.imageUrl}
        alt={film.title}
        width={500}
        height={400}
        className="rounded-sm absolute w-full h-full object-cover"
        loading="lazy"
      />

      {/* Overlay with hover animation */}
      <motion.div 
        className="h-60 relative z-10 w-full rounded-lg"
        initial={{ opacity: 0 }}
        whileHover={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="bg-gradient-to-b from-transparent via-black/50 to-black z-10 w-full h-full rounded-lg flex items-center justify-center">
          <Image
            src={film.imageUrl}
            alt={film.title}
            width={800}
            height={800}
            className="absolute w-full h-full -z-10 rounded-lg object-cover"
            loading="lazy"
          />

          <FilmCard
            key={film.id}
            ageRating={film.ageRating}  
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

          {/* Display Average Rating */}
          <div className="absolute bottom-5 left-5 bg-black bg-opacity-70 px-3 py-1 rounded">
            <p className="text-white text-sm">
              ⭐ Average Rating: {rating?.toFixed(2) || "N/A"} / 5
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
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
    console.log("films.length", films.length);
  console.log("Dependency change detected!");
    let isMounted = true;
  
    const fetchRatings = async () => {
      if (films.length === 0 || fetchedInitial) return;
      
      try { 
        // Process films in smaller batches to prevent UI freezing
        const batchSize = 4;
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
          
       
          await new Promise(resolve => setTimeout(resolve, 10));
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
      <motion.div 
        className="flex items-center justify-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-gray-400 text-4xl font-bold mt-10 px-5 sm:px-0">
          {title}
        </h1>
      </motion.div>

      {/* Loading Spinner */}
      {loading && (
        <motion.div 
          className="text-center text-white mt-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <div className="spinner-border animate-spin border-t-4 border-blue-500 rounded-full w-12 h-12"></div>
        </motion.div>
      )}

      {/* Error Handling */}
      {error && (
        <motion.div 
          className="text-center text-red-500 mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {error}
        </motion.div>
      )}

      {/* Film Grid with Framer Motion */}
      <motion.div 
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 px-5 sm:px-0 mt-10 gap-6"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
       {films.map((film, index) => (
        <FilmItem
          key={`${film.id}-${index}`} 
          film={film}
          rating={filmRatings[film.id] || null}
          onClick={() => handleFilmClick(film)}
        />
      ))}
      </motion.div>

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