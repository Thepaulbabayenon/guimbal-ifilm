'use client';

import { useState, useEffect, useRef } from "react";
import { gsap } from "gsap"; // Import GSAP
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CiStar } from "react-icons/ci";
import axios from "axios";
import Comments from "@/app/components/Comments"; // Import Comments component
import SimilarFilms from "@/app/components/similarFilms";

interface PlayVideoModalProps {
  title: string;
  overview: string;
  trailerUrl: string;
  state: boolean;
  changeState: (state: boolean) => void;
  release: number;
  age: number;
  duration: number;
  ratings: number;
  setUserRating: (rating: number) => void;
  userId?: string;
  filmId?: number; // Ensure filmId is passed as a prop
  markAsWatched?: (userId: string, filmId: number) => void;
  watchTimerDuration?: number;
  category: string;
}

export default function PlayVideoModal({
  changeState,
  overview,
  state,
  title,
  trailerUrl,
  age,
  duration,
  release,
  ratings,
  setUserRating,
  userId,
  filmId, // Destructure filmId
  markAsWatched,
  watchTimerDuration = 30000,
  category,
}: PlayVideoModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [hasWatched, setHasWatched] = useState(false);
  const [loading, setLoading] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [modalWidth, setModalWidth] = useState(425);
  const [modalHeight, setModalHeight] = useState(600);
  const [isResizing, setIsResizing] = useState(false);

  const toggleFullscreen = () => {
    if (!isFullscreen && iframeRef.current) {
      iframeRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (isFullscreen && document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const modifiedTrailerUrl = trailerUrl ? trailerUrl.replace("watch?v=", "embed/") : "";

  const handleRatingClick = (rating: number) => {
    setUserRating(rating);
  };

  // GSAP animation for modal entry
  useEffect(() => {
    if (state) {
      gsap.fromTo(
        dialogRef.current,
        { opacity: 0, scale: 0.9 }, // initial state
        { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" } // final state
      );
    }
  }, [state]);

  // GSAP animation for iframe loading
  useEffect(() => {
    if (!loading && iframeRef.current) {
      gsap.fromTo(
        iframeRef.current,
        { opacity: 0, scale: 0.95 }, // initial state
        { opacity: 1, scale: 1, duration: 0.5, ease: "power2.out" }
      );
    }
  }, [loading]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isResizing) {
      setModalWidth(Math.max(e.clientX - dialogRef.current!.offsetLeft, 200)); // Minimum width of 200px
      setModalHeight(Math.max(e.clientY - dialogRef.current!.offsetTop, 200)); // Minimum height of 200px
    }
  };

  const handleMouseUp = () => {
    setIsResizing(false);
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

  useEffect(() => {
    if (state && !hasWatched && userId && filmId && markAsWatched) {
      timerRef.current = setTimeout(() => {
        if (userId && filmId) {
          axios
            .post("/api/films/[filmId]/watchedFilms", {
              userId,
              filmId,
              watchedDuration: 60, // Adjust as per your requirement
            })
            .then(() => {
              markAsWatched(userId, filmId);
              setHasWatched(true);
            })
            .catch((error) => {
              console.error("Error marking film as watched:", error);
            });
        }
      }, watchTimerDuration);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [state, hasWatched, markAsWatched, userId, filmId, watchTimerDuration]);

  const handleIframeLoad = () => {
    setLoading(false);
  };

  return (
    <Dialog open={state} onOpenChange={() => changeState(!state)}>
      <DialogContent
        ref={dialogRef}
        className="sm:max-w-[425px] max-h-[90vh] overflow-y-auto p-4"
        style={{ width: `${modalWidth}px`, height: `${modalHeight}px` }}
      >
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="line-clamp-3">{overview}</DialogDescription>
          <div className="flex gap-x-2 items-center">
            <p>{release}</p>
            <p className="border py-0.5 px-1 border-gray-200 rounded">{age}+</p>
            <p className="font-normal text-sm">{duration}h</p>
            <p>⭐ {ratings}</p>
          </div>
        </DialogHeader>

        <div className="relative w-full" style={{ paddingBottom: "56.25%" }}>
          {loading && (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="spinner-border animate-spin border-t-4 border-blue-500 rounded-full w-12 h-12"></div>
            </div>
          )}
          <iframe
            ref={iframeRef}
            src={modifiedTrailerUrl}
            className={`absolute top-0 left-0 w-full h-full ${loading ? "opacity-0" : "opacity-100"}`}
            frameBorder="0"
            allowFullScreen
            title={title}
            loading="lazy"
            onLoad={handleIframeLoad}
          />
        </div>

        {/* Rate this film */}
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

        {/* Comments Section */}
        {filmId && (
          <div className="mt-8">
            <Comments filmId={filmId} />
          </div>
        )}

        {/* Similar Films Section */}
        <div className="mt-8">
          <SimilarFilms category={category} />
        </div>

        {/* Resizer handle */}
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
