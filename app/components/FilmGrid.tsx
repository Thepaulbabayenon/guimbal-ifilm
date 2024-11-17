'use client'

import { useEffect, useState } from "react";
import { getAllFilms } from "../api/getFilms"; // Ensure this API function exists
import { Card, CardContent } from "@/components/ui/card";
import PlayVideoModal from "./PlayVideoModal";
import { FaHeart, FaPlay } from 'react-icons/fa';

export function FilmGrid() {
  interface Film {
    id: number;
    title: string;
    age: number;
    duration: number;
    imageString: string;
    overview: string;
    release: number;
    videoSource: string;
    category: string;
    youtubeString: string;
    rank: number;
  }

  const [films, setFilms] = useState<Film[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null);

  useEffect(() => {
    async function fetchFilms() {
      try {
        const filmsData = await getAllFilms();
        setFilms(filmsData);
      } catch (error) {
        console.error("Error fetching films:", error);
      }
    }

    fetchFilms();
  }, []);

  const handlePlay = (film: Film) => {
    setSelectedFilm(film);
    setModalOpen(true);
  };

  const handleHeart = (filmId: number) => {
    console.log(`Heart film with ID: ${filmId}`);
  };

  return (
    <div className="film-grid-container grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 p-2">
      {films.map((film) => (
        <div key={film.id} className="relative p-1">
          <Card className="h-40 w-full">
            <CardContent className="relative flex items-center justify-center p-1 h-full">
              <img
                src={film.imageString}
                alt={film.title}
                className="object-cover w-full h-full transition-transform duration-200 hover:scale-105"
              />
              <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-200 hover:opacity-100">
                <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center gap-3">
                  <button
                    onClick={() => handlePlay(film)}
                    className="text-white text-lg hover:text-gray-300 transition-transform transform hover:scale-110"
                  >
                    <FaPlay />
                  </button>
                  <button
                    onClick={() => handleHeart(film.id)}
                    className="text-white text-lg hover:text-red-500 transition-transform transform hover:scale-110"
                  >
                    <FaHeart />
                  </button>
                </div>
              </div>
              <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-70 text-white p-1 text-center text-xs font-semibold">
                {film.title}
              </div>
            </CardContent>
          </Card>
        </div>
      ))}

      {selectedFilm && (
        <PlayVideoModal
          changeState={setModalOpen}
          overview={selectedFilm.overview}
          state={modalOpen}
          title={selectedFilm.title}
          youtubeUrl={selectedFilm.youtubeString}
          age={selectedFilm.age}
          duration={selectedFilm.duration}
          release={selectedFilm.release}
          ratings={selectedFilm.rank}
          setUserRating={() => {}} // Implement this function if needed
        />
      )}
    </div>
  );
}

export default FilmGrid;
