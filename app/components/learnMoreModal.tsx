"use client";

import React from "react";
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

  return (
    <MorphingDialog>
      <MorphingDialogTrigger className="cursor-pointer">
        <Button variant="primary">Learn More</Button>
      </MorphingDialogTrigger>
      <MorphingDialogContainer>
        <MorphingDialogContent className="bg-gray-900 text-white rounded-xl max-w-md p-6">
          <MorphingDialogClose className="absolute top-4 right-4 text-white" />
          <MorphingDialogTitle className="text-2xl font-semibold text-center">
            {film.title || "Film Details"}
          </MorphingDialogTitle>

          <div className="flex flex-col items-center mt-4">
            <img
              src={film.imageString}
              alt={`${film.title} Poster`}
              className="w-40 h-60 object-cover rounded-xl shadow-lg"
            />
          </div>

          <MorphingDialogDescription className="space-y-3 mt-4">
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
              <strong>Duration:</strong> {film.duration} minutes
            </p>
            <p>
              <strong>Category:</strong> {film.category}
            </p>
            <p>
              <strong>Rank:</strong> {film.rank}
            </p>
          </MorphingDialogDescription>

          <div className="mt-4">
            <strong className="text-lg">Trailer:</strong>
            <div className="w-full aspect-video mt-2">
              <iframe
                width="100%"
                height="100%"
                src={film.trailer}
                title={`${film.title} Trailer`}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                className="rounded-xl shadow-md"
              />
            </div>
          </div>
        </MorphingDialogContent>
      </MorphingDialogContainer>
    </MorphingDialog>
  );
};

export default LearnMoreModal;
