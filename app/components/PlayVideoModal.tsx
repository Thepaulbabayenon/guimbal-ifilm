'use client';

import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap"; 
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FaStar, FaRegStar, FaExpand, FaCompress } from "react-icons/fa";
import { MdMovie, MdMovieFilter } from "react-icons/md";
import axios from "axios";
import ReactPlayer from "react-player"; 
import Comments from "@/app/components/Comments";
import SimilarFilms from "@/app/components/similarFilms";

// Define the Film interface that matches what's used in DynamicFilmSlider
interface Film {
  id: number;
  title: string;
  overview: string;
  trailerUrl?: string;
  videoSource?: string;
  releaseYear: number;
  ageRating?: number;
  duration?: number;
  ratings?: number | null;
  category: string;
  // Add any other properties that your Film type might have
}

interface PlayVideoModalProps {
  film?: Film;  // Add optional film object prop
  title?: string;
  overview?: string;
  trailerUrl?: string;
  videoSource?: string;
  state: boolean;
  changeState: (state: boolean) => void;
  releaseYear?: number;
  ageRating?: number;
  duration?: number;
  ratings?: number | null;
  setUserRating: (rating: number) => void;
  userRating?: number;
  userId?: string;
  filmId?: number;
  markAsWatched?: (userId: string, filmId: number) => void;
  watchTimerDuration?: number;
  category?: string;
  refreshRating?: (filmId?: number) => Promise<void>;
  // Video source toggling props
  toggleVideoSource?: () => void;
  showingTrailer?: boolean;
}

type ModalSize = 'small' | 'desktop' | 'fullscreen';

export default function PlayVideoModal({
  film,  // Add film parameter
  changeState,
  overview: propOverview,
  state,
  title: propTitle,
  trailerUrl: propTrailerUrl,
  videoSource: propVideoSource,
  ageRating: propAgeRating,
  duration: propDuration,
  releaseYear: propReleaseYear,
  ratings: propRatings,
  setUserRating,
  userRating = 0,
  userId,
  filmId: propFilmId,
  markAsWatched,
  watchTimerDuration = 30000,
  category: propCategory,
  refreshRating,
  toggleVideoSource,
  showingTrailer = true,
}: PlayVideoModalProps) {
  // Extract values from film prop if provided, otherwise use individual props
  const title = film?.title || propTitle || "";
  const overview = film?.overview || propOverview || "";
  const trailerUrl = film?.trailerUrl || propTrailerUrl || "";
  const videoSource = film?.videoSource || propVideoSource;
  const releaseYear = film?.releaseYear || propReleaseYear || 0;
  const ageRating = film?.ageRating || propAgeRating;
  const duration = film?.duration || propDuration;
  const ratings = film?.ratings ?? propRatings;
  const filmId = film?.id || propFilmId;
  const category = film?.category || propCategory || "";

  // State hooks
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [hasWatched, setHasWatched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  // Only initialize internal state if no external control is provided
  const [internalShowingTrailer, setInternalShowingTrailer] = useState(showingTrailer !== undefined ? showingTrailer : true);
  const [modalSize, setModalSize] = useState<ModalSize>('desktop');
  const [isResizing, setIsResizing] = useState(false);
  const [customWidth, setCustomWidth] = useState<number | null>(null);
  const [customHeight, setCustomHeight] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{text: string, type: 'success' | 'error' | null}>({text: '', type: null});
  const [isSavingRating, setIsSavingRating] = useState(false);
  const [averageRating, setAverageRating] = useState<number>(typeof ratings === 'number' ? ratings : 0);
  // Add a specific state to control video source URL
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  
  // Refs
  const dialogRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const playerRef = useRef<ReactPlayer>(null);
  const feedbackTimerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Ensure ratings is a number (default to 0 if null or undefined)
  const ratingsValue = typeof ratings === 'number' ? ratings : 0;
  
  // Size configurations with improved responsiveness
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

  // Fetch user rating and average rating when modal opens
  useEffect(() => {
    if (state && userId && filmId) {
      const fetchRatingData = async () => {
        try {
          // Fetch user's rating
          const ratingResponse = await axios.get(`/api/films/${filmId}/user-rating`, { 
            params: { userId } 
          });

          if (ratingResponse.data && ratingResponse.data.rating !== undefined) {
            setUserRating(ratingResponse.data.rating);
          }

          // Fetch average rating
          const avgResponse = await axios.get(`/api/films/${filmId}/average-rating`);
          if (avgResponse.data && avgResponse.data.averageRating !== undefined) {
            setAverageRating(avgResponse.data.averageRating);
          } else {
            setAverageRating(ratingsValue);
          }
        } catch (error) {
          console.error("Error fetching rating data:", error);
        }
      };

      fetchRatingData();
    }
  }, [state, userId, filmId, ratingsValue, setUserRating]);

  // Handle user rating submission with proper error handling
  const handleRatingClick = async (rating: number) => {
    if (isSavingRating) return; // Prevent multiple submissions
    
    if (!userId || !filmId) {
      showFeedback("Unable to submit rating. Please log in and try again.", "error");
      return;
    }
    
    // Store previous rating for rollback
    const previousRating = userRating;
    
    try {
      // Optimistic UI update
      setUserRating(rating);
      setIsSavingRating(true);
      
      // Use the consistent API endpoint
      const response = await axios.post(`/api/films/${filmId}/user-rating`, {
        userId,
        rating
      });
      
      if (response.data.success) {
        showFeedback(
          rating === 0 
            ? "Your rating has been removed." 
            : "Your rating has been submitted.", 
          "success"
        );
        
        // Update average rating
        if (refreshRating) {
          await refreshRating(filmId);
        } else {
          // Directly fetch new average if refreshRating not provided
          try {
            const avgResponse = await axios.get(`/api/films/${filmId}/average-rating`);
            if (avgResponse.data && avgResponse.data.averageRating !== undefined) {
              setAverageRating(avgResponse.data.averageRating);
            }
          } catch (error) {
            console.error("Error fetching average rating:", error);
          }
        }
      }
    } catch (error) {
      console.error("Error setting film rating:", error);
      showFeedback("Failed to submit rating. Please try again.", "error");
      
      // Rollback on error
      setUserRating(previousRating);
    } finally {
      setIsSavingRating(false);
    }
  };
  
  // Add a function to handle removing a rating
  const handleRemoveRating = async () => {
    if (userRating === 0) return; // Already removed
    await handleRatingClick(0); // Use 0 to indicate rating removal
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
    
    setCustomWidth(null);
    setCustomHeight(null);
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
    
    // Reset player position regardless of which state we're using
    if (playerRef.current) {
      playerRef.current.seekTo(0);
    }
  };

  // Get the current video URL based on state
  const getCurrentVideoUrl = () => {
    if (!state) return null; // Return null when modal is closed to fully stop the player
    
    // Use external state if provided, otherwise use internal state
    const isShowingTrailer = toggleVideoSource ? showingTrailer : internalShowingTrailer;
    return (!videoSource || isShowingTrailer) ? trailerUrl : videoSource;
  };

  // Update video URL and playing state based on modal state
  useEffect(() => {
    if (state) {
      // Set video URL only when modal is open
      setVideoUrl(getCurrentVideoUrl());
      // Small delay to ensure DOM is ready
      setTimeout(() => {
        setIsPlaying(true);
      }, 100);
    } else {
      // When modal closes, stop playing immediately
      setIsPlaying(false);
      // Set URL to null after a short delay to ensure it's fully stopped
      setTimeout(() => {
        setVideoUrl(null);
      }, 50);
    }
  }, [state, trailerUrl, videoSource, showingTrailer, internalShowingTrailer]);

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

  // Resize handling
  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isMobile) {
      setIsResizing(true);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing && dialogRef.current && !isMobile) {
      const newWidth = Math.max(e.clientX - dialogRef.current.getBoundingClientRect().left, 320);
      const newHeight = Math.max(e.clientY - dialogRef.current.getBoundingClientRect().top, 400);
      
      setCustomWidth(newWidth);
      setCustomHeight(newHeight);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  // Dialog state change handling - enhanced to completely stop video
  const handleDialogChange = (newState: boolean) => {
    if (!newState) {
      // Immediately stop playing
      setIsPlaying(false);
      
      // Reset player position
      if (playerRef.current) {
        playerRef.current.seekTo(0);
      }
      
      // Set video URL to null to completely unmount the player source
      setTimeout(() => {
        setVideoUrl(null);
      }, 50);
    }
    
    // Inform parent component about state change
    changeState(newState);
  };

  // Get current dimensions based on modal size, custom values, and device type
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
      width: customWidth ? `${customWidth}px` : `${baseConfig.width}px`,
      height: customHeight ? `${customHeight}px` : `${baseConfig.height}px`,
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

  // Add/remove event listeners for resize
  useEffect(() => {
    if (isResizing) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
    } else {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    }

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isResizing]);

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

  // Format average rating safely
  const safeAverageRating = typeof averageRating === "number" && !isNaN(averageRating) 
    ? averageRating 
    : ratingsValue;

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
                <span className="font-medium">{safeAverageRating.toFixed(1)}</span>
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
          
          {/* Only render ReactPlayer when videoUrl is not null */}
          {videoUrl && (
            <ReactPlayer
              ref={playerRef}
              url={videoUrl}
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
                youtube: {
                  playerVars: {
                    disablekb: 1,
                    modestbranding: 1
                  }
                }
              }}
              className="rounded-md"
              onPause={() => setIsPlaying(false)}
              volume={1}
              muted={!state} // Mute when modal is closed (redundant safety)
            />
          )}
          
          {/* Video source indicator */}
          {videoUrl && (
            <div className="absolute top-2 right-2 bg-black bg-opacity-50 p-1 px-2 rounded text-xs">
              {isShowingTrailer ? "Trailer" : "Movie"}
            </div>
          )}
          
          {/* Show message when video is stopped/not loaded */}
          {!videoUrl && !loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <p className="text-gray-400">Video paused</p>
            </div>
          )}
          
          {/* Resize handle */}
          {!isMobile && modalSize !== 'fullscreen' && (
            <div
              className="absolute bottom-3 right-3 cursor-se-resize p-2 bg-white bg-opacity-10 hover:bg-opacity-20 rounded-full transition-all z-10"
              onMouseDown={handleMouseDown}
            >
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
          )}
        </div>

        {/* Rating section - Updated with remove rating button */}
        <div className="mt-6 bg-gray-900 p-4 rounded-md">
          <div className="flex justify-between items-center mb-3">
            <h4 className={`font-semibold ${isMobile ? 'text-base' : 'text-lg'}`}>Rate this film</h4>
            {safeAverageRating > 0 && (
              <span className="text-sm text-gray-300">
                Average: {safeAverageRating.toFixed(1)}/5
              </span>
            )}
          </div>
          <div className="flex gap-2 items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                className={`transition-transform hover:scale-110 focus:outline-none ${isSavingRating ? 'opacity-70 cursor-wait' : ''}`}
                onClick={() => handleRatingClick(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                disabled={isSavingRating}
              >
                {(hoverRating > 0 ? hoverRating >= star : userRating >= star) ? (
                  <FaStar size={isMobile ? 24 : 28} className="text-yellow-400" />
                ) : (
                  <FaRegStar size={isMobile ? 24 : 28} className="text-gray-400" />
                )}
              </button>
            ))}
            {userRating > 0 && (
              <>
                <span className="ml-3 self-center text-sm text-gray-300">
                  Your rating: {userRating}/5
                </span>
                <button
                  onClick={handleRemoveRating}
                  className="ml-2 px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded text-gray-300"
                  disabled={isSavingRating}
                >
                  Remove
                </button>
              </>
            )}
            {isSavingRating && (
              <span className="ml-3 self-center text-sm text-gray-300 animate-pulse">
                Saving...
              </span>
            )}
          </div>
        </div>

        {/* Comments & Similar Films section - conditionally displayed */}
        {((isMobile && modalSize === 'fullscreen') || (!isMobile && modalSize !== 'small')) && filmId && (
          <div className="mt-6 bg-gray-900 p-4 rounded-md">
            <h4 className={`font-semibold mb-3 ${isMobile ? 'text-base' : 'text-lg'}`}>Comments</h4>
            <Comments filmId={filmId} />
          </div>
        )}

        {((isMobile && modalSize === 'fullscreen') || (!isMobile && modalSize !== 'small')) && (
          <div className="mt-6 bg-gray-900 p-4 rounded-md mb-4">
            <h4 className={`font-semibold mb-3 ${isMobile ? 'text-base' : 'text-lg'}`}>Similar Films</h4>
            <SimilarFilms category={category} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}