'use client'

import { useEffect, useState } from "react";
import { getAllMovies } from "../api/getMovies";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import PlayVideoModal from "./PlayVideoModal";
import { FaHeart, FaPlay } from 'react-icons/fa'; // Using Font Awesome icons


export function MovieSlider() {

  interface Movie {
  id: number;
  title: string;
  imageString: string;
  // Add other fields as necessary
}

  const [movies, setMovies] = useState<Movie[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  useEffect(() => {
    async function fetchMovies() {
      try {
        const moviesData = await getAllMovies();
        setMovies(moviesData);
      } catch (error) {
        console.error("Error fetching movies:", error);
      }
    }

    fetchMovies();
  }, []);

  const handlePlay = (movie: Movie) => {
    setSelectedMovie(movie);
    setModalOpen(true);
  };

  const handleHeart = (movieId: number) => {
    // Implement the heart logic here
    console.log(`Heart movie with ID: ${movieId}`);
  };

  return (
    <div className="recently-added-container mb-20"> {/* Add margin-bottom to this container */}
      <div className="flex justify-center">
        <Carousel 
          opts={{
            align: "start",
            loop: true,
          }}
          className="w-full max-w-4xl">
          <CarouselContent className="flex space-x-4">
            {movies.map((movie) => (
              <CarouselItem key={movie.id} className="flex-none w-64 relative">
                <div className="p-2">
                  <Card>
                    <CardContent className="relative flex items-center justify-center p-2">
                      <img
                        src={movie.imageString}
                        alt={movie.title}
                        className="object-cover w-full h-full transition-transform duration-300 hover:scale-110"
                      />
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 hover:opacity-100">
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center gap-4">
                          <button
                            onClick={() => handlePlay(movie)}
                            className="text-white text-3xl hover:text-gray-300 transition-transform transform hover:scale-110"
                          >
                            <FaPlay />
                          </button>
                          <button
                            onClick={() => handleHeart(movie.id)}
                            className="text-white text-3xl hover:text-red-500 transition-transform transform hover:scale-110"
                          >
                            <FaHeart />
                          </button>
                        </div>
                      </div>
                      <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-50 text-white p-2 text-center">
                        <span className="text-sm font-semibold">{movie.title}</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious />
          <CarouselNext  />
        </Carousel>
      </div>

      {selectedMovie && (
        <PlayVideoModal
          changeState={setModalOpen}
          overview={selectedMovie.title} // Replace with actual movie overview
          state={modalOpen}
          title={selectedMovie.title}
          youtubeUrl={selectedMovie.imageString} // Replace with actual movie youtubeUrl
          age={18} // Replace with actual movie age
          duration={2} // Replace with actual movie duration
          release={2024} // Replace with actual movie release year
          ratings={4.5} // Replace with actual movie ratings
          setUserRating={function (rating: number): void {
            throw new Error("Function not implemented.");
          } }        />
      )}
    </div>
  );
}
