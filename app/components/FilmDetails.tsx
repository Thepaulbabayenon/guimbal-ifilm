'use client';
import { FC, useState } from "react";

interface FilmDetailsProps {
  title: string;
  overview: string;
  producer: string;
  director: string;
  coDirector: string;
  studio: string;
  averageRating: number | null;
  trailerUrl: string;
}

const FilmDetails: FC<FilmDetailsProps> = ({
  title,
  overview,
  producer,
  director,
  coDirector,
  studio,
  averageRating,
  trailerUrl,
}) => {
  const [isVisible, setIsVisible] = useState(false);

  const handleToggleVisibility = () => {
    setIsVisible((prevState) => !prevState);
  };

  return (
    <div
      className="flex flex-col justify-between w-full md:w-1/2 text-white mt-4"
      onMouseEnter={() => setIsVisible(true)} // Show details when hovered
      onMouseLeave={() => setIsVisible(false)} // Hide details when not hovered
    >
      <h2 className="text-2xl font-semibold">{title}</h2>

      {/* Overview always visible */}
      <p className="text-sm mt-2">{overview}</p>

      {/* FilmDetails toggle logic */}
      {isVisible && (
        <div className="mt-4">
          <div className="text-sm">
            <strong>Producer:</strong> {producer}
          </div>
          <div className="text-sm">
            <strong>Director:</strong> {director}
          </div>
          <div className="text-sm">
            <strong>Co-Director:</strong> {coDirector}
          </div>
          <div className="text-sm">
            <strong>Studio:</strong> {studio}
          </div>
          <div className="text-sm">
            <strong>Average Rating:</strong> {averageRating ?? "N/A"}
          </div>
        </div>
      )}

      {/* More Info / Trailer */}
      {isVisible && (
        <div className="mt-4">
          <a
            href={trailerUrl}
            className="text-blue-500 hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Watch Trailer
          </a>
        </div>
      )}
    </div>
  );
};

export default FilmDetails;
