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
import { CiStar } from "react-icons/ci";
import axios from "axios";
import ReactPlayer from "react-player"; 
import Comments from "@/app/components/Comments";
import SimilarFilms from "@/app/components/similarFilms";
import { IoMdExpand, IoMdContract } from "react-icons/io";
import { TbArrowsMinimize, TbRectangle } from "react-icons/tb";

interface PlayVideoModalProps {
  title: string;
  overview: string;
  trailerUrl: string;
  state: boolean;
  changeState: (state: boolean) => void;
  releaseYear: number;
  ageRating?: number;
  duration?: number;
  ratings: number;
  setUserRating: (rating: number) => void;
  userId?: string;
  filmId?: number;
  markAsWatched?: (userId: string, filmId: number) => void;
  watchTimerDuration?: number;
  category: string;
  refreshRating?: () => Promise<void>; 
}

// Define the ModalSize type explicitly
type ModalSize = 'small' | 'desktop' | 'fullscreen';

export default function PlayVideoModal({
  changeState,
  overview,
  state,
  title,
  trailerUrl,
  ageRating,
  duration,
  releaseYear,
  ratings,
  setUserRating,
  userId,
  filmId,
  markAsWatched,
  watchTimerDuration = 30000,
  category,
  refreshRating,
}: PlayVideoModalProps) {
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [hasWatched, setHasWatched] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const playerRef = useRef<ReactPlayer>(null);

  // Modal size state and dimensions
  const [modalSize, setModalSize] = useState<ModalSize>('desktop');
  const [isResizing, setIsResizing] = useState(false);
  const [customWidth, setCustomWidth] = useState<number | null>(null);
  const [customHeight, setCustomHeight] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Size configurations - updated for mobile responsiveness
  const sizeConfigs: Record<ModalSize, { 
    width: number | string, 
    height: number | string,
    mobileWidth: number | string,
    mobileHeight: number | string
  }> = {
    small: { 
      width: 320, 
      height: 480, 
      mobileWidth: '95vw', 
      mobileHeight: '70vh' 
    },
    desktop: { 
      width: 640, 
      height: 720, 
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

  const handleRatingClick = (rating: number) => {
    setUserRating(rating);
  };

  const toggleSize = () => {
    // On mobile, just toggle between small and fullscreen
    if (isMobile) {
      setModalSize(modalSize === 'fullscreen' ? 'small' : 'fullscreen');
    } else {
      const sizes: ModalSize[] = ['small', 'desktop', 'fullscreen'];
      const currentIndex = sizes.indexOf(modalSize);
      const nextIndex = (currentIndex + 1) % sizes.length;
      setModalSize(sizes[nextIndex]);
    }
    
    // Reset custom dimensions when switching to a preset size
    setCustomWidth(null);
    setCustomHeight(null);
  };

  useEffect(() => {
    setIsPlaying(state);
  }, [state]);

  useEffect(() => {
    if (state) {
      gsap.fromTo(
        dialogRef.current,
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" }
      );
    }
  }, [state]);

  useEffect(() => {
    if (state && !hasWatched && userId && filmId && markAsWatched) {
      timerRef.current = setTimeout(() => {
        axios
          .post("/api/films/[filmId]/watched-films", { userId, filmId, watchedDuration: 60 })
          .then(() => {
            markAsWatched(userId, filmId);
            setHasWatched(true);
          })
          .catch((error) => console.error("Error marking film as watched:", error));
      }, watchTimerDuration);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [state, hasWatched, markAsWatched, userId, filmId, watchTimerDuration]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isMobile) {
      setIsResizing(true);
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing && dialogRef.current && !isMobile) {
      const newWidth = Math.max(e.clientX - dialogRef.current.getBoundingClientRect().left, 200);
      const newHeight = Math.max(e.clientY - dialogRef.current.getBoundingClientRect().top, 200);
      
      setCustomWidth(newWidth);
      setCustomHeight(newHeight);
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
  };

  const handleDialogChange = (newState: boolean) => {
    if (!newState) {
      setIsPlaying(false);
      if (playerRef.current) {
        playerRef.current.seekTo(0);
      }
    }
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
      return isMobile ? '40vh' : '60vh';
    }
    return isMobile ? '200px' : '300px';
  };
  
  const playerHeight = getPlayerHeight();

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

  return (
    <Dialog open={state} onOpenChange={handleDialogChange}>
      <DialogContent
        ref={dialogRef}
        className={`overflow-y-auto p-4 transition-all duration-300 ${
          modalSize === 'fullscreen' ? 'rounded-none max-w-none' : ''
        } ${isMobile ? 'p-2' : 'p-4'}`}
        style={{ 
          width: dimensions.width, 
          height: dimensions.height,
          maxWidth: dimensions.maxWidth,
        }}
      >
        <DialogHeader className={`flex flex-row justify-between items-start ${isMobile ? 'gap-2' : ''}`}>
          <div className={isMobile ? 'max-w-full' : ''}>
            <DialogTitle className={isMobile ? 'text-lg' : ''}>{title}</DialogTitle>
            <DialogDescription className={`line-clamp-3 ${isMobile ? 'text-sm' : ''}`}>
              {overview}
            </DialogDescription>
            <div className={`flex gap-x-2 items-center flex-wrap ${isMobile ? 'text-xs' : ''}`}>
              <p>{releaseYear}</p>
              {ageRating && <p className="border py-0.5 px-1 border-gray-200 rounded">{ageRating}+</p>}
              {duration && <p className="font-normal">{duration}h</p>}
              <p>⭐ {ratings}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button 
              onClick={toggleSize} 
              className="p-2 rounded-full hover:bg-gray-100 transition-colors"
              title={`Switch to ${
                modalSize === 'small' ? 'desktop' : 
                modalSize === 'desktop' ? 'fullscreen' : 'small'
              } view`}
            >
              {modalSize === 'small' && <TbRectangle size={isMobile ? 16 : 20} />}
              {modalSize === 'desktop' && <IoMdExpand size={isMobile ? 16 : 20} />}
              {modalSize === 'fullscreen' && <TbArrowsMinimize size={isMobile ? 16 : 20} />}
            </button>
          </div>
        </DialogHeader>

        <div className="relative w-full mt-4" style={{ height: playerHeight }}>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="spinner-border animate-spin border-t-4 border-blue-500 rounded-full w-12 h-12"></div>
            </div>
          )}
          <ReactPlayer
            ref={playerRef}
            url={trailerUrl}
            playing={isPlaying}
            controls
            width="100%"
            height="100%"
            onReady={() => setLoading(false)}
            config={{
              file: { attributes: { controlsList: "nodownload" } },
            }}
          />
          
          {/* Resize handle - only shown on desktop and when not fullscreen */}
          {!isMobile && modalSize !== 'fullscreen' && (
            <div
              className="absolute bottom-2 right-2 cursor-se-resize p-2 bg-black bg-opacity-50 rounded-full hover:bg-opacity-70 z-10"
              onMouseDown={handleMouseDown}
            >
              <div className="w-3 h-3 bg-white rounded-full"></div>
            </div>
          )}
        </div>

        <div className="mt-4">
          <h4 className={`font-semibold mb-2 ${isMobile ? 'text-base' : 'text-lg'}`}>Rate this film:</h4>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <CiStar
                key={star}
                size={isMobile ? 20 : 24}
                color={(hoverRating || ratings) >= star ? "#FFD700" : "#e4e5e9"}
                onClick={() => handleRatingClick(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="cursor-pointer"
              />
            ))}
          </div>
        </div>

        {/* Components that are conditionally displayed based on modal size and device */}
        {/* On mobile, only show in fullscreen. On desktop, show when not small */}
        {((isMobile && modalSize === 'fullscreen') || (!isMobile && modalSize !== 'small')) && filmId && (
          <div className="mt-6">
            <Comments filmId={filmId} />
          </div>
        )}

        {((isMobile && modalSize === 'fullscreen') || (!isMobile && modalSize !== 'small')) && (
          <div className="mt-6">
            <SimilarFilms category={category} />
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}