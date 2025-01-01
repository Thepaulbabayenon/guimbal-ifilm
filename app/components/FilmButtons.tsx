'use client';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CiCircleInfo, CiVolumeHigh, CiVolumeMute, CiPlay1 } from 'react-icons/ci';
import PlayVideoModal from './PlayVideoModal';
import LearnMoreModal from './learnMoreModal'; // Import LearnMoreModal

interface iAppProps {
  overview: string;
  youtubeUrl: string;
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
  youtubeUrl,
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
    youtubeString: youtubeUrl.split('v=')[1], // Extract video ID from YouTube URL
    rank: 5, // replace with actual ranking
    imageString: 'url-to-image.jpg', // replace with actual image URL
  };

  return (
    <>
      <div className="flex gap-3">
        <Button
          onClick={() => setPlayModalOpen(true)}
          className="text-lg font-medium bg-blue-900 hover:bg-blue-600 text-white shadow-md rounded-lg transition-all duration-200 transform hover:scale-105"
        >
          <CiPlay1 className="mr-2 h-6 w-6 transition-all duration-200 transform hover:scale-110" />
          Play
        </Button>
        <Button
          onClick={() => setLearnMoreModalOpen(true)} // Open LearnMoreModal
          className="text-lg font-medium bg-gray-800 hover:bg-gray-600 text-white shadow-md rounded-lg transition-all duration-200 transform hover:scale-105"
        >
          <CiCircleInfo className="mr-2 h-6 w-6 transition-all duration-200 transform hover:scale-110" />
          Learn More
        </Button>
        <Button
          onClick={toggleMute} // Call the passed toggleMute function
          className="text-lg font-medium bg-gray-400 hover:bg-gray-200 text-black shadow-md rounded-lg transition-all duration-200 transform hover:scale-105"
        >
          {isMuted ? (
            <CiVolumeMute className="mr-2 h-6 w-6 text-red-600 transition-all duration-200 transform hover:scale-110" />
          ) : (
            <CiVolumeHigh className="mr-2 h-6 w-6 text-green-600 transition-all duration-200 transform hover:scale-110" />
          )}
        </Button>
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
        youtubeUrl={youtubeUrl}
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
