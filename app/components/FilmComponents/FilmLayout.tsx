// FilmLayout component
import React, { useEffect, useState, useCallback, memo, useRef } from "react";
import Image from "next/image";
import axios from "axios";
import { gsap } from "gsap";
import { FilmCard } from "@/app/components/FilmComponents/FilmCard";
import ReactPlayer from "react-player";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FaStar, FaRegStar, FaExpand, FaCompress } from "react-icons/fa";
import { MdMovie, MdMovieFilter } from "react-icons/md";
import { Film } from "@/types/film";

// Define the VideoModal component directly in this file
interface VideoModalProps {
  title: string;
  overview: string;
  trailerUrl: string;
  videoSource?: string;
  state: boolean;
  changeState: (state: boolean) => void;
  releaseYear: number;
  ageRating?: number;
  duration?: number;
  ratings: number | null | undefined;
  setUserRating: (rating: number) => void;
  userRating?: number;
  userId?: string;
  filmId?: number;
  markAsWatched?: (userId: string, filmId: number) => void;
  watchTimerDuration?: number;
  category: string;
  refreshRating?: (filmId?: number) => Promise<void>;
  toggleVideoSource?: () => void;
  showingTrailer?: boolean;
}

type ModalSize = 'small' | 'desktop' | 'fullscreen';

function VideoModal({
  changeState,
  overview,
  state,
  title,
  trailerUrl,
  videoSource,
  ageRating,
  duration,
  releaseYear,
  ratings,
  setUserRating,
  userRating = 0,
  userId,
  filmId,
  markAsWatched,
  watchTimerDuration = 30000,
  category,
  refreshRating,
  toggleVideoSource,
  showingTrailer = true,
}: VideoModalProps) {
  // State hooks
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [hasWatched, setHasWatched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [internalShowingTrailer, setInternalShowingTrailer] = useState(showingTrailer !== undefined ? showingTrailer : true);
  const [modalSize, setModalSize] = useState<ModalSize>('desktop');
  const [isMobile, setIsMobile] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{text: string, type: 'success' | 'error' | null}>({text: '', type: null});
  
  // Refs
  const dialogRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const playerRef = useRef<ReactPlayer>(null);
  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Ensure ratings is a number
  const ratingsValue = typeof ratings === 'number' ? ratings : 0;
  
  // Size configurations with responsiveness
  const sizeConfigs = {
    small: { 
      width: 400, 
      height: 540, 
      mobileWidth: '95vw', 
      mobileHeight: '70vh' 
    },
    desktop: { 
      width: 768, 
      height: 800, 
      mobileWidth: '95vw', 
      mobileHeight: '85vh'
    },
    fullscreen: { 
      width: '100vw', 
      height: '100vh',
      mobileWidth: '100vw',
      mobileHeight: '100vh'
    }
  };

  // Check for mobile device
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    
    return () => {
      window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Helper function to show feedback messages
  const showFeedback = (message: string, type: 'success' | 'error') => {
    setFeedbackMessage({ text: message, type });
    
    // Clear any existing feedback timer
    if (feedbackTimerRef.current) {
      clearTimeout(feedbackTimerRef.current);
    }
    
    // Set timeout to clear the message after 3 seconds
    feedbackTimerRef.current = setTimeout(() => {
      setFeedbackMessage({ text: '', type: null });
    }, 3000);
  };

  // Handle user rating submission
  const handleRatingClick = async (rating: number) => {
    try {
      if (!userId || !filmId) {
        showFeedback("Unable to submit rating. Please log in and try again.", "error");
        return;
      }
      
      const response = await axios.post(`/api/films/${filmId}/user-rating`, {
        rating,
        userId
      });
      
      if (response.data.success) {
        setUserRating(rating);
        showFeedback("Your rating has been submitted.", "success");
        
        if (refreshRating) {
          await refreshRating();
        }
      }
    } catch (error) {
      console.error("Error setting film rating:", error);
      showFeedback("Failed to submit rating. Please try again.", "error");
    }
  };

  // Toggle between different modal sizes
  const toggleSize = () => {
    if (isMobile) {
      setModalSize(modalSize === 'fullscreen' ? 'small' : 'fullscreen');
    } else {
      const sizes: ModalSize[] = ['small', 'desktop', 'fullscreen'];
      const currentIndex = sizes.indexOf(modalSize);
      const nextIndex = (currentIndex + 1) % sizes.length;
      setModalSize(sizes[nextIndex]);
    }
  };

  // Handle video source toggling
  const handleToggleVideoSource = () => {
    if (toggleVideoSource) {
      // Use parent component's toggle function if provided
      toggleVideoSource();
    } else if (videoSource) {
      // Otherwise use internal state
      setInternalShowingTrailer(!internalShowingTrailer);
    }
    
    // Reset player position
    if (playerRef.current) {
      playerRef.current.seekTo(0);
    }
  };

  // Get the current video URL based on state
  const getCurrentVideoUrl = () => {
    // Use external state if provided, otherwise use internal state
    const isShowingTrailer = toggleVideoSource ? showingTrailer : internalShowingTrailer;
    return (!videoSource || isShowingTrailer) ? trailerUrl : videoSource;
  };

  // Animation and state effects
  useEffect(() => {
    setIsPlaying(state);
  }, [state]);

  useEffect(() => {
    if (state) {
      gsap.fromTo(
        dialogRef.current,
        { opacity: 0, scale: 0.92 },
        { opacity: 1, scale: 1, duration: 0.4, ease: "power2.out" }
      );
    }
  }, [state]);

  // Mark film as watched after a certain duration
  useEffect(() => {
    if (state && !hasWatched && userId && filmId && markAsWatched) {
      timerRef.current = setTimeout(() => {
        axios
          .post("/api/films/[filmId]/watched-films", { userId, filmId, watchedDuration: 60 })
          .then(() => {
            markAsWatched(userId, filmId);
            setHasWatched(true);
            showFeedback("Film added to your watched list", "success");
          })
          .catch((error) => {
            console.error("Error marking film as watched:", error);
          });
      }, watchTimerDuration);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [state, hasWatched, markAsWatched, userId, filmId, watchTimerDuration]);

  // Clean up feedback timer when component unmounts
  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current) {
        clearTimeout(feedbackTimerRef.current);
      }
    };
  }, []);

  // Dialog state change handling
  const handleDialogChange = (newState: boolean) => {
    if (!newState) {
      setIsPlaying(false);
      if (playerRef.current) {
        playerRef.current.seekTo(0);
      }
    }
    changeState(newState);
  };

  // Get current dimensions based on modal size and device type
  const getCurrentDimensions = () => {
    const baseConfig = sizeConfigs[modalSize];
    
    if (modalSize === 'fullscreen') {
      return { width: '100vw', height: '100vh', maxWidth: '100vw' };
    }
    
    if (isMobile) {
      return {
        width: baseConfig.mobileWidth,
        height: baseConfig.mobileHeight,
        maxWidth: '95vw'
      };
    }
    
    return {
      width: `${baseConfig.width}px`,
      height: `${baseConfig.height}px`,
      maxWidth: 'unset'
    };
  };

  const dimensions = getCurrentDimensions();
  
  // Responsive player height
  const getPlayerHeight = () => {
    if (modalSize === 'fullscreen') {
      return isMobile ? '45vh' : '65vh';
    }
    return isMobile ? '220px' : '360px';
  };
  
  const playerHeight = getPlayerHeight();

  // Format duration in hours and minutes
  const formatDuration = (durationInHours: number) => {
    const hours = Math.floor(durationInHours);
    const minutes = Math.round((durationInHours - hours) * 60);
    
    if (hours === 0) {
      return `${minutes}m`;
    } else if (minutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${minutes}m`;
    }
  };

  // Determine if we're showing trailer or full movie for the UI
  const isShowingTrailer = toggleVideoSource ? showingTrailer : internalShowingTrailer;

  return (
    <Dialog open={state} onOpenChange={handleDialogChange}>
      <DialogContent
        ref={dialogRef}
        className={`overflow-y-auto transition-all duration-300 bg-black text-white 
        ${modalSize === 'fullscreen' ? 'rounded-none max-w-none' : 'rounded-lg'} 
        ${isMobile ? 'p-3' : 'p-6'}`}
        style={{ 
          width: dimensions.width, 
          height: dimensions.height,
          maxWidth: dimensions.maxWidth,
          scrollbarWidth: 'thin',
          scrollbarColor: '#333 #111',
        }}
      >
        {/* Feedback message */}
        {feedbackMessage.text && (
          <div className={`mb-4 p-3 rounded-md ${
            feedbackMessage.type === 'success' 
              ? 'bg-green-900 text-green-100' 
              : 'bg-red-900 text-red-100'
          }`}>
            {feedbackMessage.text}
          </div>
        )}
        
        {/* Header section */}
        <DialogHeader className="flex flex-row justify-between items-start border-b border-gray-800 pb-4">
          <div className={isMobile ? 'max-w-full' : ''}>
            <DialogTitle className={`${isMobile ? 'text-xl' : 'text-2xl'} font-bold mb-2`}>
              {title}
            </DialogTitle>
            
            <div className={`flex gap-x-3 items-center flex-wrap mb-3 text-gray-300 ${isMobile ? 'text-xs' : 'text-sm'}`}>
              <span className="font-medium">{releaseYear}</span>
              {ageRating && <span className="border py-0.5 px-2 border-gray-500 rounded-md">{ageRating}+</span>}
              {duration && <span>{formatDuration(duration)}</span>}
              <div className="flex items-center">
                <FaStar className="text-yellow-400 mr-1" size={isMobile ? 12 : 14} />
                <span className="font-medium">{ratingsValue.toFixed(1)}</span>
              </div>
            </div>
            
            <DialogDescription className={`line-clamp-3 text-gray-300 ${isMobile ? 'text-sm' : ''}`}>
              {overview}
            </DialogDescription>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Video source toggle button */}
            {videoSource && (
              <button 
                onClick={handleToggleVideoSource} 
                className="p-2 rounded-md bg-gray-800 hover:bg-gray-700 transition-colors flex items-center gap-1"
                title={isShowingTrailer ? "Watch full movie" : "Watch trailer"}
              >
                {isShowingTrailer ? (
                  <><MdMovie size={isMobile ? 14 : 16} /> <span className={`${isMobile ? 'text-xs' : 'text-sm'}`}>Movie</span></>
                ) : (
                  <><MdMovieFilter size={isMobile ? 14 : 16} /> <span className={`${isMobile ? 'text-xs' : 'text-sm'}`}>Trailer</span></>
                )}
              </button>
            )}
            
            {/* Size toggle button */}
            <button 
              onClick={toggleSize} 
              className="p-2 rounded-md bg-gray-800 hover:bg-gray-700 transition-colors"
              title={`Switch to ${
                modalSize === 'small' ? 'desktop' : 
                modalSize === 'desktop' ? 'fullscreen' : 'small'
              } view`}
            >
              {modalSize === 'small' && <FaExpand size={isMobile ? 14 : 16} />}
              {modalSize === 'desktop' && <FaExpand size={isMobile ? 14 : 16} />}
              {modalSize === 'fullscreen' && <FaCompress size={isMobile ? 14 : 16} />}
            </button>
          </div>
        </DialogHeader>

        {/* Video player section */}
        <div className="relative w-full mt-4 bg-gray-900 rounded-md overflow-hidden" style={{ height: playerHeight }}>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70">
              <div className="w-12 h-12 border-4 border-t-blue-500 border-opacity-50 rounded-full animate-spin"></div>
            </div>
          )}
          
          <ReactPlayer
            ref={playerRef}
            url={getCurrentVideoUrl()}
            playing={isPlaying}
            controls
            width="100%"
            height="100%"
            onReady={() => setLoading(false)}
            config={{
              file: { 
                attributes: { 
                  controlsList: "nodownload",
                  disablePictureInPicture: true
                } 
              },
            }}
            className="rounded-md"
          />
          
          {/* Video source indicator */}
          <div className="absolute top-2 right-2 bg-black bg-opacity-50 p-1 px-2 rounded text-xs">
            {isShowingTrailer ? "Trailer" : "Movie"}
          </div>
        </div>

        {/* Rating section */}
        <div className="mt-6 bg-gray-900 p-4 rounded-md">
          <h4 className={`font-semibold mb-3 ${isMobile ? 'text-base' : 'text-lg'}`}>Rate this film</h4>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className="transition-transform hover:scale-110 focus:outline-none"
                onClick={() => handleRatingClick(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
              >
                {(hoverRating > 0 ? hoverRating >= star : userRating >= star) ? (
                  <FaStar size={isMobile ? 24 : 28} className="text-yellow-400" />
                ) : (
                  <FaRegStar size={isMobile ? 24 : 28} className="text-gray-400" />
                )}
              </button>
            ))}
            {userRating > 0 && (
              <span className="ml-3 self-center text-sm text-gray-300">
                Your rating: {userRating}/5
              </span>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

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
            onOpenModal={(videoSource, trailerUrl) => onClick()}
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
  // Set default to false to prioritize showing full video instead of trailer
  const [showingTrailer, setShowingTrailer] = useState(false);
  // Add state for current video URLs
  const [currentVideoSource, setCurrentVideoSource] = useState<string | undefined>(undefined);
  const [currentTrailerUrl, setCurrentTrailerUrl] = useState<string | undefined>(undefined);


  useEffect(() => {
    let isMounted = true;
  
    const fetchRatings = async () => {
      if (films.length === 0 || fetchedInitial) return;
      
      try { 
        // Process films in smaller batches to prevent UI freezing
        const batchSize = 10;
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
    console.log("Film clicked:", film.title);
    setSelectedFilm(film);
    setModalOpen(true);
    // Make sure we're starting with the full video, not the trailer
    setShowingTrailer(false);
    // Set current video sources
    setCurrentVideoSource(film.videoSource);
    setCurrentTrailerUrl(film.trailerUrl);
  }, []);

  // Toggle between trailer and full video
  const toggleVideoSource = useCallback(() => {
    console.log("Toggling video source. Current state:", showingTrailer);
    setShowingTrailer(prevState => !prevState);
  }, [showingTrailer]);

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

  // Add a refresh ratings function
  const refreshRating = useCallback(async (filmId?: number) => {
    try {
      const id = filmId || selectedFilm?.id;
      if (!id) return;

      const response = await axios.get(`/api/films/${id}/average-rating`);
      if (response.data?.averageRating !== undefined) {
        setFilmRatings(prev => ({
          ...prev,
          [id]: response.data.averageRating
        }));
      }
    } catch (error) {
      console.error("Error refreshing rating:", error);
    }
  }, [selectedFilm]);

  return (
    <div className="recently-added-container mb-20">
      {/* Title Section */}
      <div className="flex items-center justify-center">
        <h1 className="text-gray-400 text-4xl font-bold mt-10 px-5 sm:px-0">
     
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

      {/* Integrated Video Modal component */}
      {selectedFilm && (
        <VideoModal
        title={selectedFilm.title}
        overview={selectedFilm.overview}
        trailerUrl={currentTrailerUrl || selectedFilm.trailerUrl || ""}
        videoSource={currentVideoSource || selectedFilm.videoSource}
        state={modalOpen}
        changeState={setModalOpen}
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
