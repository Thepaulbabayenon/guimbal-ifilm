'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CiCircleInfo, CiVolumeHigh, CiVolumeMute, CiPlay1, CiVolume } from 'react-icons/ci';
import PlayVideoModal from '../PlayVideoModal';
import LearnMoreModal from '../learnMoreModal'; // Import LearnMoreModal
import { gsap } from 'gsap';

interface iAppProps {
  overview: string;
  trailerUrl: string;
  id: number;
  age: number;
  title: string;
  releaseDate: number;
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
  age,
  duration,
  id,
  overview,
  releaseDate,
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
    title,
    overview,
    release: releaseDate,
    producer: 'Producer Name', // replace with actual producer info
    director: 'Director Name', // replace with actual director info
    coDirector: 'Co-director Name', // replace with actual co-director info
    studio: 'Studio Name', // replace with actual studio info
    age,
    duration,
    category,
    trailer: trailerUrl.split('v=')[1], // Extract video ID from trailer URL
    rank: 5, // replace with actual ranking
    imageString: 'url-to-image.jpg', // replace with actual image URL
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
          Learn More
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
        age={age}
        duration={duration}
        key={id}
        overview={overview}
        release={releaseDate}
        title={title}
        trailerUrl={trailerUrl}
        category={category}
        ratings={userRatings[id] || 0} // Pass user rating
        setUserRating={setUserRating} // Function to update the rating
        userId={userId} // Pass user ID for marking as watched
        filmId={id} // Pass film ID to fetch comments and other details
        markAsWatched={markAsWatched} // Function to mark the movie as watched
      />

      {/* Learn More Modal */}
      <LearnMoreModal
        show={isLearnMoreModalOpen} // Updated to 'show' prop
        onHide={() => setLearnMoreModalOpen(false)} // Close modal
        film={film} // Pass the complete 'film' object instead of just filmId
      />
    </>
  );
}
