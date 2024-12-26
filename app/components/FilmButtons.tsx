'use client';

import { Button } from "@/components/ui/button";
import { InfoIcon, PlayCircle, Volume2, VolumeX } from "lucide-react";
import { useState } from "react";
import PlayVideoModal from "./PlayVideoModal";

interface iAppProps {
  overview: string;
  youtubeUrl: string;
  id: number;
  age: number;
  title: string;
  releaseDate: number;
  duration: number;
  category: string;
  isMuted: boolean; // Accept mute state as prop
  toggleMute: () => void; // Accept function to toggle mute as prop
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
  toggleMute, // Destructure the mute state and function
}: iAppProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex gap-2">
        <Button onClick={() => setOpen(true)} className="text-lg font-medium">
          <PlayCircle className="mr-2 h-6 w-6" /> Play
        </Button>
        <Button
          onClick={() => setOpen(true)}
          className="text-lg font-medium bg-white/40 hover:bg-white/30 text-white"
        >
          <InfoIcon className="mr-2 h-6 w-6" /> Learn More
        </Button>
        <Button
          onClick={toggleMute} // Call the passed toggleMute function
          className="text-lg font-medium bg-gray-200 hover:bg-gray-300 text-black"
        >
          {isMuted ? (
            <>
              <VolumeX className="mr-2 h-6 w-6" /> Unmute
            </>
          ) : (
            <>
              <Volume2 className="mr-2 h-6 w-6" /> Mute
            </>
          )}
        </Button>
      </div>

      <PlayVideoModal
        state={open}
        changeState={setOpen}
        age={age}
        duration={duration}
        key={id}
        overview={overview}
        release={releaseDate}
        title={title}
        youtubeUrl={youtubeUrl}
        category={category}
        ratings={0}
        setUserRating={function (rating: number): void {
          throw new Error("Function not implemented.");
        }}
      />
    </>
  );
}
