'use client'

import { useEffect, useState } from "react";
import { getHorrorFilms } from "@/app/api/getFilms"; // Ensure this API function exists
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import PlayVideoModal from "./PlayVideoModal";
import Autoplay from "embla-carousel-autoplay";
import { useUser } from "@clerk/nextjs";
import { Star } from "lucide-react";
import { FaHeart, FaPlay } from 'react-icons/fa';
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

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
  rank: number; // External rating
}

export function FilmSliderHorror() {
  const { user } = useUser();
  const userId = user?.id;

  const [films, setFilms] = useState<Film[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [watchList, setWatchList] = useState<{ [key: number]: boolean }>({});
  const [userRatings, setUserRatings] = useState<{ [key: number]: number }>({});
  const [averageRatings, setAverageRatings] = useState<{ [key: number]: number }>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null);

  useEffect(() => {
    async function fetchFilms() {
      try {
        const filmsData = await getHorrorFilms();
        setFilms(filmsData);
      } catch (error) {
        console.error("Error fetching films:", error);
      }finally {
        setIsLoading(false); // End loading state
      }
    }

    fetchFilms();
  }, []);

  useEffect(() => {
    if (userId) {
      films.forEach(film => {
        fetchUserAndAverageRating(film.id);
        fetchWatchlistStatus(film.id);
      });
    }
  }, [userId, films]);

  // Fetch user rating and average rating
  const fetchUserAndAverageRating = async (filmId: number) => {
    try {
      const userResponse = await axios.get(`/api/films/${filmId}/user-rating`, { params: { userId } });
      setUserRatings(prev => ({ ...prev, [filmId]: userResponse.data.rating || 0 }));

      const avgResponse = await axios.get(`/api/films/${filmId}/average-rating`);
      setAverageRatings(prev => ({ ...prev, [filmId]: avgResponse.data.averageRating || 0 }));
    } catch (error) {
      console.error("Error fetching ratings:", error);
    }
  };

  // Fetch watchlist status
  const fetchWatchlistStatus = async (filmId: number) => {
    try {
      const response = await axios.get(`/api/watchlist/${filmId}`, { params: { userId } });
      setWatchList(prev => ({ ...prev, [filmId]: response.data.inWatchlist }));
    } catch (error) {
      console.error("Error fetching watchlist status:", error);
    }
  };

  // Handle adding/removing from watchlist
  const handleToggleWatchlist = async (filmId: number) => {
    if (!userId) {
      toast.warn("Please log in to manage your watchlist.");
      return;
    }

    const isInWatchlist = watchList[filmId];
    try {
      if (isInWatchlist) {
        await axios.delete(`/api/watchlist/${filmId}`, { data: { userId } });
        toast.success("Removed from your watchlist.");
      } else {
        await axios.post("/api/watchlist", { filmId, userId });
        toast.success("Added to your watchlist.");
      }
      setWatchList(prev => ({ ...prev, [filmId]: !isInWatchlist }));
    } catch (error) {
      console.error("Error toggling watchlist:", error);
      toast.error("Failed to update watchlist.");
    }
  };

  // Handle rating click
  const handleRatingClick = async (filmId: number, newRating: number) => {
    if (!userId) {
      toast.warn("Please log in to rate films.");
      return;
    }

    setUserRatings(prev => ({ ...prev, [filmId]: newRating }));
    try {
      await axios.post(`/api/films/${filmId}/user-rating`, { userId, rating: newRating });

      // Update average rating
      const avgResponse = await axios.get(`/api/films/${filmId}/average-rating`);
      setAverageRatings(prev => ({ ...prev, [filmId]: avgResponse.data.averageRating || 0 }));

      toast.success("Your rating has been saved!");
    } catch (error) {
      console.error("Error saving rating:", error);
      toast.error("Failed to save your rating.");
    }
  };

  const handlePlay = (film: Film) => {
    setSelectedFilm(film);
    setModalOpen(true);
  };

  const markAsWatched = async (filmId: number) => {
    if (!userId) {
      console.error("User ID is not available.");
      return;
    }

    try {
      await axios.post(`/api/films/${filmId}/watchedFilms`, { userId });
      toast.success("Marked as watched!");
    } catch (error) {
      console.error("Error marking film as watched:", error);
      toast.error("Failed to mark as watched.");
    }
  };

  return (
      <div className="recently-added-container mb-10 w-full">
        <ToastContainer />
        {isLoading ? (
        <div className="flex justify-center items-center w-full">
          <div className="flex space-x-2">
            {[...Array(6)].map((_, index) => (
              <div
                key={index}
                className="w-52 md:w-50 h-60 bg-gray-700 rounded-lg animate-pulse"
              />
            ))}
          </div>
        </div>
        ) : (
          <div className="flex justify-center w-full">
            <Carousel
              plugins={[Autoplay({ delay: 4000 })]}
              opts={{ align: "start", loop: true }}
              className="w-full"
            >
              <CarouselContent className="flex space-x-2">
                {films.map((film) => (
                  <CarouselItem key={film.id} className="flex-none w-52 md:w-56 relative">
                    <Card>
                      <CardContent className="relative p-2">
                        <img
                          src={film.imageString}
                          alt={film.title}
                          className="object-cover w-full h-60 rounded-lg transition-transform duration-300 hover:scale-105"
                        />
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 hover:opacity-100 bg-black bg-opacity-50 gap-2">
                          <button onClick={() => handlePlay(film)} className="text-white text-xl">
                            <FaPlay />
                          </button>
                          <button onClick={() => handleToggleWatchlist(film.id)} className="text-white text-xl">
                            <FaHeart className={watchList[film.id] ? "text-red-500" : ""} />
                          </button>
                        </div>
                        <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-50 text-white p-1 text-center">
                          <span className="text-xs font-semibold">{film.title}</span>
                          <div className="flex items-center justify-center mt-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={`w-3 h-3 cursor-pointer ${
                                  userRatings[film.id] >= star ? "text-yellow-400" : "text-gray-400"
                                }`}
                                onClick={() => handleRatingClick(film.id, star)}
                              />
                            ))}
                          </div>
                          <p className="text-xs mt-1">
                            Avg: {typeof averageRatings[film.id] === "number" ? averageRatings[film.id].toFixed(1) : "N/A"}/5
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-0" />
              <CarouselNext className="right-0" />
            </Carousel>
          </div>
        )}
  
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
            ratings={userRatings[selectedFilm.id]}
            setUserRating={(rating: number) => handleRatingClick(selectedFilm.id, rating)}
            markAsWatched={() => markAsWatched(selectedFilm.id)} // Pass the function here
            category={selectedFilm.category}
          />
        )}
      </div>
    );
}
