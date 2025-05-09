import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { gsap } from "gsap";
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

export interface VideoModalProps {
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

export function VideoModal({
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

export default VideoModal;