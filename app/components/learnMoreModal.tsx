"use client";

import React, { useState } from "react";
import ReactPlayer from "react-player";
import {
  MorphingDialog,
  MorphingDialogTrigger,
  MorphingDialogContainer,
  MorphingDialogContent,
  MorphingDialogClose,
  MorphingDialogTitle,
  MorphingDialogDescription,
} from "@/components/ui/morphing-dialog"; 

import Image from "next/image";

interface FilmDetails {
  title: string;
  overview: string;
  producer: string;
  director: string;
  coDirector: string;
  studio: string;
  ageRating: number;
  duration: number;
  category: string;
  trailerUrl: string;
  rank: number;
  imageUrl: string;
  releaseYear: number;
}

interface LearnMoreModalProps {
  film: FilmDetails; 
}

const LearnMoreModal: React.FC<LearnMoreModalProps> = ({ film }) => {
  if (!film) return null;

  const [loading, setLoading] = useState(true);

  return (
    <MorphingDialog>
      <MorphingDialogTrigger className="cursor-pointer">
        <div className="bg-gray-800 text-white px-4 py-1 rounded-lg text-center">
          Learn More
        </div>
      </MorphingDialogTrigger>
      <MorphingDialogContainer>
        <MorphingDialogContent className="bg-gray-900 text-white rounded-xl max-w-sm p-4">
          <MorphingDialogClose className="absolute top-3 right-3 text-white text-sm" />
          <MorphingDialogTitle className="text-xl font-semibold text-center">
            {film.title || "Film Details"}
          </MorphingDialogTitle>

          <div className="flex flex-col items-center mt-3">
          <Image
              width={40}
              height={40}
              src={
                film.imageUrl && typeof film.imageUrl === 'string' && film.imageUrl.startsWith("http")
                  ? film.imageUrl
                  : "/default-placeholder.png"
              }
              alt={film.title || "Film poster"}
              className="rounded-md"
            />
          </div>

          <MorphingDialogDescription className="space-y-2 mt-3 text-sm">
            <p>
              <strong>Overview:</strong> {film.overview}
            </p>
            <p>
              <strong>Release Year:</strong> {film.releaseYear}
            </p>
            <p>
              <strong>Producer:</strong> {film.producer}
            </p>
            <p>
              <strong>Director:</strong> {film.director}
            </p>
            <p>
              <strong>Studio:</strong> {film.studio}
            </p>
            <p>
              <strong>Age Rating:</strong> {film.ageRating}+
            </p>
            <p>
              <strong>Duration:</strong> {film.duration} min
            </p>
            <p>
              <strong>Category:</strong> {film.category}
            </p>
            <p>
              <strong>Rank:</strong> {film.rank}
            </p>
          </MorphingDialogDescription>

          <div className="mt-3">
            <strong className="text-sm">Trailer:</strong>
            <div className="w-full mt-2 rounded-lg overflow-hidden">
              <ReactPlayer
                url={film.trailerUrl}
                playing
                controls
                width="100%"
                height="100%"
                onReady={() => setLoading(false)}
                config={{
                  file: { attributes: { controlsList: "nodownload" } },
                }}
              />
            </div>
          </div>
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  );
};

export default LearnMoreModal;
