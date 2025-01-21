'use client';

import { useState, useEffect, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { FaStar } from "react-icons/fa";
import { db } from "@/db/drizzle"; 
import { film, comments } from "@/db/schema"; 
import { eq, sql } from "drizzle-orm";

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
  category: string; 
  setUserRating: (rating: number) => void;
  userId?: string; 
  filmId?: number; 
  markAsWatched?: (userId: string, filmId: number) => void;
  watchTimerDuration?: number; 
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
  category, 
  setUserRating,
  userId,
  filmId,
  markAsWatched,
  watchTimerDuration = 60000, // Default to 60 seconds
}: PlayVideoModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [hasWatched, setHasWatched] = useState(false);
  const [loading, setLoading] = useState(true); 
  const [similarMovies, setSimilarMovies] = useState<any[]>([]); 
  const [commentsList, setCommentsList] = useState<any[]>([]); 
  const [newComment, setNewComment] = useState(""); 
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const [modalWidth, setModalWidth] = useState(425); // Set initial width of the modal
  const [modalHeight, setModalHeight] = useState(600); // Set initial height of the modal
  const [watchTime, setWatchTime] = useState(0); // Track the watch time in seconds

  // Resizing logic
  const isResizing = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);

  const onMouseDownResize = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    startX.current = e.clientX;
    startY.current = e.clientY;
  };

  const onMouseMoveResize = (e: MouseEvent) => {
    if (!isResizing.current || !dialogRef.current) return;
    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;
    setModalWidth((prevWidth) => Math.max(prevWidth + dx, 300)); // Prevent shrinking too small
    setModalHeight((prevHeight) => Math.max(prevHeight + dy, 300)); // Prevent shrinking too small
    startX.current = e.clientX;
    startY.current = e.clientY;
  };

  const onMouseUpResize = () => {
    isResizing.current = false;
  };

  useEffect(() => {
    if (isResizing.current) {
      document.addEventListener("mousemove", onMouseMoveResize);
      document.addEventListener("mouseup", onMouseUpResize);
    } else {
      document.removeEventListener("mousemove", onMouseMoveResize);
      document.removeEventListener("mouseup", onMouseUpResize);
    }
    return () => {
      document.removeEventListener("mousemove", onMouseMoveResize);
      document.removeEventListener("mouseup", onMouseUpResize);
    };
  }, []);

  const toggleFullscreen = () => {
    if (!isFullscreen && iframeRef.current) {
      iframeRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (isFullscreen && document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const modifiedTrailerUrl = trailerUrl.replace("watch?v=", "embed/");

  const handleRatingClick = (rating: number) => {
    setUserRating(rating);
  };

  const handleAddComment = async () => {
    if (newComment.trim() && userId && filmId) {
      const commentData = {
        userId,
        filmId,
        content: newComment.trim(),
      };

      await db.insert(comments).values(commentData);
      setCommentsList((prev) => [
        ...prev,
        { user: "You", content: newComment.trim() },
      ]);
      setNewComment("");
    }
  };

  const fetchComments = async () => {
    if (filmId) {
      const fetchedComments = await db
        .select()
        .from(comments)
        .where(eq(comments.filmId, filmId))
        .orderBy(sql`${comments.createdAt} DESC`);
      setCommentsList(fetchedComments);
    }
  };

  useEffect(() => {
    const fetchSimilarMovies = async () => {
      const similarMovies = await db
        .select()
        .from(film)
        .where(eq(film.category, category))
        .limit(5);
      setSimilarMovies(similarMovies);
    };

    if (category) {
      fetchSimilarMovies();
    }

    if (state && filmId) {
      fetchComments();
    }

    if (state && !hasWatched && userId && filmId && markAsWatched) {
      // Set up the timer to mark as watched after the specified duration
      timerRef.current = setTimeout(() => {
        markAsWatched(userId, filmId); // Call the API to mark the film as watched
        setHasWatched(true); // Set the hasWatched state to true after 60 seconds
      }, watchTimerDuration);
    }

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [state, hasWatched, markAsWatched, userId, filmId, category, watchTimerDuration]);

  // Function to track video watch time and trigger the API call after 60 seconds
  useEffect(() => {
    const video = iframeRef.current;
    if (video) {
      const interval = setInterval(() => {
        const currentTime = video.currentTime;
        setWatchTime(currentTime);

        if (currentTime >= 60 && !hasWatched) {
          markAsWatched(userId, filmId);
          setHasWatched(true); // Mark as watched after 60 seconds
        }
      }, 1000); // Check every second

      return () => clearInterval(interval);
    }
  }, [hasWatched, userId, filmId, markAsWatched]);

  const handleIframeLoad = () => {
    setLoading(false);
    if (iframeRef.current) {
      iframeRef.current.requestFullscreen();
      setIsFullscreen(true);
    }
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

        <div className="mt-4">
          <h4 className="text-lg font-semibold mb-2">Rate this movie:</h4>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <FaStar
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

        <button
          className="absolute top-2 right-2 bg-gray-800 text-white px-2 py-1 rounded-md"
          onClick={toggleFullscreen}
        >
          {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
        </button>

        <div className="mt-8">
          <h3 className="text-lg font-semibold">Comments</h3>
          <div className="mt-4">
            <input
              type="text"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Add a comment"
              className="w-full border border-gray-300 rounded-md p-2 text-black"
            />
            <button
              onClick={handleAddComment}
              className="mt-2 bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              Post
            </button>
          </div>

          <div className="mt-4">
            {commentsList.map((comment, index) => (
              <div key={index} className="border-b border-gray-200 py-2">
                <p className="text-sm font-semibold">{comment.user}</p>
                <p className="text-sm text-gray-600">{comment.content}</p>
              </div>
            ))}
          </div>
        </div>

        <div
          className="absolute bottom-2 right-2 w-4 h-4 bg-gray-600 cursor-se-resize"
          onMouseDown={onMouseDownResize}
        />
      </DialogContent>
    </Dialog>
  );
}
