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
} from "@/components/ui/morphing-dialog"; // Adjust path if needed
import { Button } from "react-bootstrap";
import Image from "next/image";

interface FilmDetails {
  title: string;
  overview: string;
  release: number;
  producer: string;
  director: string;
  coDirector: string;
  studio: string;
  age: number;
  duration: number;
  category: string;
  trailer: string;
  rank: number;
  imageString: string;
}

interface LearnMoreModalProps {
  film: FilmDetails; // Film details to display
}

const LearnMoreModal: React.FC<LearnMoreModalProps> = ({ film }) => {
  if (!film) return null;

  const [loading, setLoading] = useState(true);

  return (
    <MorphingDialog>
      <MorphingDialogTrigger className="cursor-pointer">
        <Button variant="primary">Learn More</Button>
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
                film.imageString.startsWith("http")
                  ? film.imageString
                  : "/default-placeholder.png"
              }
              alt={`${film.title} Poster`}
              className="w-32 h-48 object-cover rounded-lg shadow-md"
            />
          </div>

          <MorphingDialogDescription className="space-y-2 mt-3 text-sm">
            <p>
              <strong>Overview:</strong> {film.overview}
            </p>
            <p>
              <strong>Release Year:</strong> {film.release}
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
              <strong>Age Rating:</strong> {film.age}+
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
                url={film.trailer}
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
