'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CiCircleInfo, CiVolumeHigh, CiVolumeMute, CiPlay1, CiVolume } from 'react-icons/ci';
import PlayVideoModal from '@/app/components/PlayVideoModal';
import LearnMoreModal from '../learnMoreModal';
import { gsap } from 'gsap';

interface iAppProps {
  overview: string;
  trailerUrl: string;
  id: number;
  ageRating: number;
  title: string;
  releaseYear: number;
  duration: number;
  category: string;
  isMuted: boolean;
  toggleMute: () => void;
  userRatings: { [key: number]: number };
  averageRatings: { [key: number]: number };
  setUserRating: (rating: number) => void;
  markAsWatched: (userId: string, filmId: number) => void;
  userId: string;
}

export default function FilmButtons({
  ageRating,
  duration,
  id,
  overview,
  releaseYear,
  title,
  trailerUrl,
  category,
  isMuted,
  toggleMute,
  userRatings,
  averageRatings,
  setUserRating,
  markAsWatched,
  userId,
}: iAppProps) {
  const [isPlayModalOpen, setPlayModalOpen] = useState(false);
  const [isLearnMoreModalOpen, setLearnMoreModalOpen] = useState(false); // State for LearnMoreModal

  const film = {
    id,
    title,
    overview,
    releaseYear, // ✅ Matches database schema
    ageRating,
    duration,
    category,
    director: "Director Name", // Replace with actual director data
    coDirector: "Co-director Name", // Replace with actual co-director data
    producer: "Producer Name", // Replace with actual producer data
    studio: "Studio Name", // Replace with actual studio data
    trailerUrl, // ✅ Matches database schema
    imageUrl: "url-to-image.jpg", // ✅ Matches database schema
    rank: 5, // Replace with actual rank data if available
  };
  

  // GSAP animations for buttons
  const handleHoverIn = (element: any) => {
    gsap.to(element, {
      scale: 1.1,
      duration: 0.3,
      ease: 'power2.out',
    });
  };

  const handleHoverOut = (element: any) => {
    gsap.to(element, {
      scale: 1,
      duration: 0.3,
      ease: 'power2.in',
    });
  };

  return (
    <>
      <div className="flex gap-4">
        {/* Play Button */}
        <Button
          onClick={() => setPlayModalOpen(true)}
          className="text-lg font-medium bg-blue-900 hover:bg-blue-600 text-white shadow-md rounded-lg"
          onMouseEnter={(e) => handleHoverIn(e.currentTarget)}
          onMouseLeave={(e) => handleHoverOut(e.currentTarget)}
        >
          <CiPlay1 className="mr-2 h-8 w-8 transition-all duration-200" />
          Play
        </Button>

        {/* Learn More Button */}
        <Button
          onClick={() => setLearnMoreModalOpen(true)} // Open LearnMoreModal
          className="text-lg font-medium bg-gray-800 hover:bg-gray-600 text-white shadow-md rounded-lg"
          onMouseEnter={(e) => handleHoverIn(e.currentTarget)}
          onMouseLeave={(e) => handleHoverOut(e.currentTarget)}
        >
          <CiCircleInfo className="mr-2 h-8 w-8 transition-all duration-200" />
          <LearnMoreModal film={film} />
        </Button>

        {/* Volume Icon (No Background) */}
        <div
          onClick={toggleMute}
          onMouseEnter={(e) => handleHoverIn(e.currentTarget)}
          onMouseLeave={(e) => handleHoverOut(e.currentTarget)}
          className="cursor-pointer transition-transform duration-200"
        >
          {isMuted ? (
            <CiVolumeMute className="h-10 w-10 text-red-600 transition-transform duration-300 hover:scale-110" />
          ) : (
            <CiVolumeHigh className="h-10 w-10 text-green-600 transition-transform duration-300 hover:scale-110" />
          )}
        </div>
      </div>

      {/* Play Video Modal */}
      <PlayVideoModal
        state={isPlayModalOpen}
        changeState={setPlayModalOpen}
        ageRating={ageRating}
        duration={duration}
        key={id}
        overview={overview}
        releaseYear={releaseYear}
        title={title}
        trailerUrl={trailerUrl}
        category={category}
        ratings={userRatings[id] || 0} 
        setUserRating={setUserRating} 
        userId={userId} 
        filmId={id} 
        markAsWatched={markAsWatched} 
      />

      {/* Learn More Modal */}
        
    </>
  );
}
