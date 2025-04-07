'use client';
import { FC, useState } from "react";
import Link from "next/link";

interface FilmDetailsProps {
  filmId: number;
  title: string;
  overview: string;
  producer: string | undefined; 
  director: string | undefined; 
  coDirector: string | undefined; 
  studio: string | undefined; 
  averageRating: number | null;
  trailerUrl: string;
}

const FilmDetails: FC<FilmDetailsProps> = ({
  filmId,
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

  return (
    <div
      className="flex flex-col justify-between w-full md:w-1/2 text-white mt-4"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
    >
      {/* Make title clickable inside FilmDetails */}
      <h2 className="text-2xl font-semibold">
        <Link href={`/home/films/${filmId}`} className="text-blue-500 hover:underline">
          {title}
        </Link>
      </h2>

      <p className="text-sm mt-2">{overview}</p>

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
