'use client'

import { useEffect, useState } from "react";
import { getDramaMovies } from "../api/getMovies"; // Make sure you have this API endpoint
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import PlayVideoModal from "./PlayVideoModal";
import { FaHeart, FaPlay } from 'react-icons/fa';
import Autoplay from "embla-carousel-autoplay";

export function MovieSliderDrama() {
  interface Movie {
    id: number;
    title: string;
    age: number;
    duration: number;
    imageString: string;
    overview: string;
    release: number;
    videoSource: string; // Optional
    category: string; // Optional
    youtubeUrl: string; // Ensure this is mapped correctly
    rank: number; // Optional
  }

  const [movies, setMovies] = useState<Movie[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);

  useEffect(() => {
    async function fetchMovies() {
      try {
        const moviesData = await getDramaMovies(); // Fetch only drama movies
        const formattedMovies: Movie[] = moviesData.map(movie => ({
          id: movie.id,
          title: movie.title,
          age: movie.age,
          duration: movie.duration,
          imageString: movie.imageString,
          overview: movie.overview,
          release: movie.release,
          videoSource: movie.videoSource, // Optional
          category: movie.category, // Optional
          youtubeUrl: movie.youtubeString, // Map youtubeString to youtubeUrl
          rank: movie.rank, // Optional
        }));
        setMovies(formattedMovies);
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
        opts={{ align: "start", loop: true }} className="w-full max-w-4xl">
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
          youtubeUrl={selectedMovie.youtubeUrl} // Pass the actual movie youtube URL
          age={selectedMovie.age}
          duration={selectedMovie.duration}
          release={selectedMovie.release}
          ratings={selectedMovie.rank} // Pass the actual movie ratings
          setUserRating={function (rating: number): void {
            throw new Error("Function not implemented.");
          }}        
        />
      )}
    </div>
  );
}
