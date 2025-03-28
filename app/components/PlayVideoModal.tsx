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

  const [modalWidth, setModalWidth] = useState(425);
  const [modalHeight, setModalHeight] = useState(600);
  const [isResizing, setIsResizing] = useState(false);

  const handleRatingClick = (rating: number) => {
    setUserRating(rating);
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

  const handleMouseDown = () => {
    setIsResizing(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing) {
      setModalWidth(Math.max(e.clientX - dialogRef.current!.offsetLeft, 200));
      setModalHeight(Math.max(e.clientY - dialogRef.current!.offsetTop, 200));
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
        className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto p-4"
        style={{ width: `${modalWidth}px`, height: `${modalHeight}px` }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="line-clamp-3">{overview}</DialogDescription>
          <div className="flex gap-x-2 items-center">
            <p>{releaseYear}</p>
            <p className="border py-0.5 px-1 border-gray-200 rounded">{ageRating}+</p>
            <p className="font-normal text-sm">{duration}h</p>
            <p>⭐ {ratings}</p>
          </div>
        </DialogHeader>

        <div className="relative w-full h-[300px]}">
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
        </div>

        <div className="mt-4">
          <h4 className="text-lg font-semibold mb-2">Rate this film:</h4>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <CiStar
                key={star}
                size={24}
                color={(hoverRating || ratings) >= star ? "#FFD700" : "#e4e5e9"}
                onClick={() => handleRatingClick(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="cursor-pointer"
              />
            ))}
          </div>
        </div>

        {filmId && (
          <div className="mt-8">
            <Comments filmId={filmId} />
          </div>
        )}

        <div className="mt-8">
          <SimilarFilms category={category} />
        </div>

        <div
          className="absolute bottom-0 right-0 cursor-se-resize p-2"
          onMouseDown={handleMouseDown}
        >
          <div className="w-4 h-4 bg-gray-300 rounded-full"></div>
        </div>
      </DialogContent>
    </Dialog>
  );
}