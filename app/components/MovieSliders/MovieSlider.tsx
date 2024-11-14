'use client'

import { useEffect, useState } from "react";
import { getAllMovies } from "@/app/api/getMovies"; // Ensure this API function exists
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import PlayVideoModal from "../PlayVideoModal";
import Autoplay from "embla-carousel-autoplay"
import { FaHeart, FaPlay } from 'react-icons/fa';

export function MovieSlider() {
  interface Movie {
    id: number;
    title: string;
    age: number; // Include if your API returns this
    duration: number; // Include if your API returns this
    imageString: string;
    overview: string; // Include if your API returns this
    release: number; // Include if your API returns this
    videoSource: string; // Include if your API returns this
    category: string; // Include if your API returns this
    youtubeString: string; // Use this instead of youtubeUrl
    rank: number; // Include if your API returns this
  }

  const [movies, setMovies] = useState<Movie[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  useEffect(() => {
    async function fetchMovies() {
      try {
        const moviesData = await getAllMovies(); // Fetch all movies
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
    console.log(`Heart movie with ID: ${movieId}`);
  };

  return (
    <div className="recently-added-container mb-20">
      <div className="flex justify-center">
        <Carousel 
          plugins={[
            Autoplay({
              delay: 2000,
            }),
          ]}
          opts={{ align: "start", loop: true }} 
          className="w-full max-w-4xl"
        >
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
          <CarouselNext />
        </Carousel>
      </div>

      {selectedMovie && (
        <PlayVideoModal
          changeState={setModalOpen}
          overview={selectedMovie.overview}
          state={modalOpen}
          title={selectedMovie.title}
          youtubeUrl={selectedMovie.youtubeString} // Use youtubeString instead of youtubeUrl
          age={selectedMovie.age}
          duration={selectedMovie.duration}
          release={selectedMovie.release}
          ratings={selectedMovie.rank} // Adjust if rank is not equivalent to ratings
          setUserRating={function (rating: number): void {
            throw new Error("Function not implemented.");
          }}        
        />
      )}
    </div>
  );
}
