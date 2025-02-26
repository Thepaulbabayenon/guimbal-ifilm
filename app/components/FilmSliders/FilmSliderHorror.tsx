'use client';
import { useEffect, useState, useCallback } from "react";
import { getHorrorFilms } from "@/app/api/getFilms";
import { Card, CardContent } from "@/components/ui/card";
import { Carousel, CarouselContent, CarouselItem, CarouselPrevious, CarouselNext } from "@/components/ui/carousel";
import PlayVideoModal from "../PlayVideoModal";
import Autoplay from "embla-carousel-autoplay";
import { useUser } from "@clerk/nextjs";
import { CiStar } from "react-icons/ci";
import { FaHeart, FaPlay } from 'react-icons/fa';
import axios, { AxiosError } from "axios";

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
  trailer: string;
  rank: number;
}

export function FilmSliderHorror() {
  const { user } = useUser();
  const userId = user?.id;

  const [films, setFilms] = useState<Film[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [watchList, setWatchList] = useState<Record<number, boolean>>({});
  const [userRatings, setUserRatings] = useState<Record<number, number>>({});
  const [averageRatings, setAverageRatings] = useState<Record<number, number>>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null);

  useEffect(() => {
    const fetchFilms = async () => {
      try {
        const filmsData = await getHorrorFilms();
        setFilms(filmsData);
      } catch (error) {
        console.error("Error fetching films:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFilms();
  }, []);

  useEffect(() => {
    if (userId && films.length > 0) {
      fetchUserData();
    }
  }, [userId, films]);

  const fetchUserData = async () => {
    try {
      const filmIds = films.map(film => film.id);
      const [{ data: ratingsData }, { data: watchlistData }] = await Promise.all([
        axios.get("/api/films/user-ratings", { params: { userId, filmIds } }),
        axios.get("/api/watchlist", { params: { userId, filmIds } })
      ]);

      setUserRatings(ratingsData.userRatings || {});
      setAverageRatings(ratingsData.averageRatings || {});
      setWatchList(watchlistData.watchList || {});
    } catch (error) {
      console.error("Error fetching user data:", error);
    }
  };

  const handleToggleWatchlist = useCallback(async (filmId: number) => {
    if (!userId) {
      console.warn("Please log in to manage your watchlist.");
      return;
    }
  
    if (!filmId) {
      console.error("Invalid filmId:", filmId);
      return;
    }
  
    const isInWatchlist = watchList[filmId];
  
    try {
      console.log("Sending to API:", { filmId, userId });
  
      if (isInWatchlist) {
        await axios.delete("/api/watchlist/", { data: { filmId, userId } });
      } else {
        await axios.post("/api/watchlist/", { filmId, userId });
      }
  
      setWatchList((prev) => ({
        ...prev,
        [filmId]: !isInWatchlist,
      }));
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      console.error("Error toggling watchlist:", axiosError.response?.data || axiosError.message);
    }
  }, [userId, watchList]);
  

  const handleRatingClick = useCallback(async (filmId: number, newRating: number) => {
    if (!userId) {
      console.warn("Please log in to rate films.");
      return;
    }

    setUserRatings(prev => ({ ...prev, [filmId]: newRating }));

    try {
      await axios.post(`/api/films/${filmId}/user-rating`, { userId, rating: newRating });

      const { data } = await axios.get(`/api/films/${filmId}/average-rating`);
      setAverageRatings(prev => ({ ...prev, [filmId]: data.averageRating || 0 }));
    } catch (error) {
      console.error("Error saving rating:", error);
    }
  }, [userId]);

  const handlePlay = (film: Film) => {
    setSelectedFilm(film);
    setModalOpen(true);
  };

  const markAsWatched = async (filmId: number) => {
    if (!userId) return;

    try {
      await axios.post(`/api/films/${filmId}/watchedFilms`, { userId });
    } catch (error) {
      console.error("Error marking film as watched:", error);
    }
  };

  return (
    <div className="recently-added-container mb-10 w-full">
      {isLoading ? (
        <div className="flex justify-center items-center w-full">
          <div className="flex space-x-2">
            {[...Array(6)].map((_, index) => (
              <div key={index} className="w-52 md:w-50 h-60 bg-gray-700 rounded-lg animate-pulse" />
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
                        loading="lazy"
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
                            <CiStar
                              key={star}
                              className={`w-3 h-3 cursor-pointer ${
                                userRatings[film.id] >= star ? "text-yellow-400" : "text-gray-400"
                              }`}
                              onClick={() => handleRatingClick(film.id, star)}
                            />
                          ))}
                        </div>
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
          trailerUrl={selectedFilm.trailer}
          age={selectedFilm.age}
          duration={selectedFilm.duration}
          release={selectedFilm.release}
          ratings={userRatings[selectedFilm.id]}
          setUserRating={(rating: number) => handleRatingClick(selectedFilm.id, rating)}
          markAsWatched={() => markAsWatched(selectedFilm.id)}
          category={selectedFilm.category}
        />
      )}
    </div>
  );
}
