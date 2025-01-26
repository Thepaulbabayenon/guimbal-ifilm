import React, { useEffect, useRef } from "react";
import { FilmCard } from "@/app/components/FilmComponents/FilmCard";
import Image from "next/image";
import gsap from "gsap";

interface Film {
  id: number;
  title: string;
  overview: string;
  watchList: boolean;
  trailerUrl: string;
  year: number;
  age: number;
  time: number;
  initialRatings: number;
  category: string;
  imageString: string;
}

interface FilmLayoutProps {
  title: string;
  films: Film[];
  loading: boolean;
  error: string | null;
}

const FilmLayout: React.FC<FilmLayoutProps> = ({ title, films, loading, error }) => {
  const filmGridRef = useRef<HTMLDivElement | null>(null);

  // GSAP Animation for film cards
  useEffect(() => {
    if (filmGridRef.current) {
      gsap.fromTo(
        filmGridRef.current.children, 
        { opacity: 0, y: 50 }, // initial state
        {
          opacity: 1,
          y: 0,
          duration: 1,
          stagger: 0.1, // stagger the animations for each film
          ease: "power3.out",
        }
      );
    }
  }, [films]);

  return (
    <div className="recently-added-container mb-20">
      {/* Title Section */}
      <div className="flex items-center justify-center">
        <h1 className="text-gray-400 text-4xl font-bold mt-10 px-5 sm:px-0">
          {title}
        </h1>
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="text-center text-white mt-6">
          <div className="spinner-border animate-spin border-t-4 border-blue-500 rounded-full w-12 h-12"></div>
        </div>
      )}

      {/* Error Handling */}
      {error && <div className="text-center text-red-500 mt-4">{error}</div>}

      {/* Film Grid */}
      <div
        ref={filmGridRef}
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 px-5 sm:px-0 mt-10 gap-6"
      >
        {films.map((film) => (
          <div
            key={film.id}
            className="relative h-60"
            style={{ opacity: 0 }} // Initial opacity set to 0 for animation
          >
            {/* Film Thumbnail */}
            <Image
              src={film.imageString}
              alt={film.title}
              width={500}
              height={400}
              className="rounded-sm absolute w-full h-full object-cover"
            />

            {/* Overlay with hover animation */}
            <div className="h-60 relative z-10 w-full transform transition duration-500 hover:scale-125 opacity-0 hover:opacity-100">
              <div className="bg-gradient-to-b from-transparent via-black/50 to-black z-10 w-full h-full rounded-lg flex items-center justify-center">
                <Image
                  src={film.imageString}
                  alt={film.title}
                  width={800}
                  height={800}
                  className="absolute w-full h-full -z-10 rounded-lg object-cover"
                />
                <FilmCard
                  key={film.id}
                  age={film.age}
                  filmId={film.id}
                  overview={film.overview}
                  time={film.time}
                  title={film.title}
                  year={film.year}
                  trailerUrl={film.trailerUrl}
                  initialRatings={film.initialRatings}
                  watchList={film.watchList}
                  category={film.category || "Uncategorized"}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FilmLayout;
