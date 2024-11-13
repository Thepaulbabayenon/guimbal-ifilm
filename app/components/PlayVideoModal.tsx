'use client';
import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { FaStar } from 'react-icons/fa'; // Import star icons for the rating system

interface PlayVideoModalProps {
  title: string;
  overview: string;
  youtubeUrl: string;
  state: boolean;
  changeState: (state: boolean) => void;
  release: number;
  age: number;
  duration: number;
  ratings: number; // External ratings (user rating)
  setUserRating: (rating: number) => void; // Function to update user rating
}

export default function PlayVideoModal({
  changeState,
  overview,
  state,
  title,
  youtubeUrl,
  age,
  duration,
  release,
  ratings,
  setUserRating, // Destructure setUserRating
}: PlayVideoModalProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [hoverRating, setHoverRating] = useState<number>(0); // State for hover rating
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const toggleFullscreen = () => {
    if (!isFullscreen && iframeRef.current) {
      iframeRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else if (isFullscreen && document.fullscreenElement) {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const modifiedYoutubeUrl = youtubeUrl.replace("watch?v=", "embed/");

  const handleRatingClick = (rating: number) => {
    setUserRating(rating); // Update rating in MovieCard via API or Local Storage
  };

  return (
    <Dialog open={state} onOpenChange={() => changeState(!state)}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription className="line-clamp-3">{overview}</DialogDescription>
          <div className="flex gap-x-2 items-center">
            <p>{release}</p>
            <p className="border py-0.5 px-1 border-gray-200 rounded">{age}+</p>
            <p className="font-normal text-sm">{duration}h</p>
            <p>⭐ {ratings}</p> {/* Display external ratings */}
          </div>
        </DialogHeader>

        <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
          <iframe
            ref={iframeRef}
            src={modifiedYoutubeUrl}
            className="absolute top-0 left-0 w-full h-full"
            frameBorder="0"
            allowFullScreen
            title={title}
            loading="lazy"
          />
        </div>
        
        {/* Rating Section */}
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
          {ratings > 0 && (
            <p className="mt-2 text-sm text-gray-600">
              You rated this movie: {ratings} out of 5 stars
            </p>
          )}
        </div>

        <button
          className="absolute top-2 right-2 bg-gray-800 text-white px-2 py-1 rounded-md"
          onClick={toggleFullscreen}
        >
          {isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
        </button>
      </DialogContent>
    </Dialog>
  );
}
