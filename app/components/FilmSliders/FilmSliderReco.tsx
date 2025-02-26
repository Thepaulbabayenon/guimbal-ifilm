'use client';
import { useCallback, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
} from "@/components/ui/carousel";
import PlayVideoModal from "../PlayVideoModal";
import Autoplay from "embla-carousel-autoplay";
import { CiStar } from "react-icons/ci";
import { FaHeart, FaPlay } from "react-icons/fa";
import axios, { AxiosError } from "axios";

interface Film {
  id: number;
  title?: string;
  age?: number;
  duration?: number;
  imageString?: string;
  overview?: string;
  release?: number;
  videoSource?: string;
  category?: string;
  trailer?: string;
  rank?: number;
}

interface RecommendationSection {
  reason: string;
  films: Film[];
}

interface FilmSliderRecoProps {
  userId: string;
}

async function fetchRecommendedFilms(userId: string) {
  try {
    const response = await axios.get(`/api/recommendations?userId=${userId}`);
    if (response.status !== 200 || !response.data) {
      throw new Error("Invalid response");
    }
    return response.data as RecommendationSection[];
  } catch (error) {
    console.error("Error fetching recommended films:", error);
    throw error;
  }
}

// Function to fetch complete film details
async function fetchFilmDetails(filmId: number) {
  try {
    const response = await axios.get(`/api/films/${filmId}`);
    if (response.status !== 200 || !response.data) {
      throw new Error("Invalid response");
    }
    return response.data;
  } catch (error) {
    console.error(`Error fetching details for film ID ${filmId}:`, error);
    return null;
  }
}

export function FilmSliderReco({ userId }: FilmSliderRecoProps) {
  const [recommendations, setRecommendations] = useState<RecommendationSection[]>([]);
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [watchList, setWatchList] = useState<{ [key: number]: boolean }>({});
  const [userRatings, setUserRatings] = useState<{ [key: number]: number }>({});
  const [averageRatings, setAverageRatings] = useState<{ [key: number]: number }>({});
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null);
  const [filmDetails, setFilmDetails] = useState<{ [key: number]: Film }>({});
  const [loadedFilmIds, setLoadedFilmIds] = useState<Set<number>>(new Set());

  // Fetch recommendations
  useEffect(() => {
    async function fetchRecommendations() {
      try {
        setIsLoading(true);
        const data = await fetchRecommendedFilms(userId);
        setRecommendations(data);
      } catch (error) {
        console.error("Error fetching recommended films:", error);
        setRecommendations([]);
      } finally {
        setIsLoading(false);
      }
    }

    if (userId) {
      fetchRecommendations();
    } else {
      console.warn("User ID is required to fetch recommendations.");
      setRecommendations([]);
      setIsLoading(false);
    }
  }, [userId]);

  // Fetch complete details for each film in the current section
  useEffect(() => {
    if (!recommendations.length || currentSectionIndex >= recommendations.length) {
      return;
    }

    const currentSection = recommendations[currentSectionIndex];
    if (!currentSection || !currentSection.films) {
      return;
    }

    async function loadFilmDetails() {
      const filmIds = currentSection.films.map(film => film.id);
      const newDetails = { ...filmDetails };
      const newLoadedIds = new Set(loadedFilmIds);
      
      const detailPromises = filmIds.map(async (id) => {
        // Skip if we already have the details or have attempted to load them
        if (newLoadedIds.has(id)) {
          return;
        }
        
        newLoadedIds.add(id);
        const details = await fetchFilmDetails(id);
        if (details) {
          newDetails[id] = details;
        }
      });
      
      await Promise.all(detailPromises);
      setFilmDetails(newDetails);
      setLoadedFilmIds(newLoadedIds);
    }
    
    loadFilmDetails();
  }, [recommendations, currentSectionIndex, loadedFilmIds]);

  // Fetch user-specific data for films (ratings, watchlist)
  useEffect(() => {
    if (!userId || !recommendations.length || currentSectionIndex >= recommendations.length) {
      return;
    }

    const currentSection = recommendations[currentSectionIndex];
    if (!currentSection || !currentSection.films) {
      return;
    }

    // Create a set to track films we've already fetched user data for
    const fetchedUserDataIds = new Set(Object.keys(watchList).map(Number));

    async function fetchDataForFilms() {
      const filmsToFetch = currentSection.films.filter(film => !fetchedUserDataIds.has(film.id));
      
      if (filmsToFetch.length === 0) {
        return; // Skip if we already have all the data
      }

      const filmPromises = filmsToFetch.map(async (film) => {
        try {
          const [userRatingResponse, avgRatingResponse, watchlistResponse] = await Promise.all([
            axios.get(`/api/films/${film.id}/user-rating`, { params: { userId } }),
            axios.get(`/api/films/${film.id}/average-rating`),
            axios.get(`/api/watchlist/${film.id}`, { params: { userId } }),
          ]);

          setUserRatings((prev) => ({
            ...prev,
            [film.id]: userRatingResponse.data.rating || 0,
          }));
          setAverageRatings((prev) => ({
            ...prev,
            [film.id]: avgRatingResponse.data.averageRating || 0,
          }));
          setWatchList((prev) => ({
            ...prev,
            [film.id]: watchlistResponse.data.inWatchlist,
          }));
        } catch (error) {
          console.error(`Error fetching data for film ID ${film.id}:`, error);
        }
      });

      await Promise.all(filmPromises);
    }
    
    fetchDataForFilms();
  }, [recommendations, currentSectionIndex, userId, watchList]);

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
  
  const handleRatingClick = async (filmId: number, newRating: number) => {
    if (!userId) {
      console.warn("Please log in to rate films.");
      return;
    }

    setUserRatings((prev) => ({ ...prev, [filmId]: newRating }));
    try {
      await axios.post(`/api/films/${filmId}/user-rating`, { userId, rating: newRating });

      const avgResponse = await axios.get(`/api/films/${filmId}/average-rating`);
      setAverageRatings((prev) => ({
        ...prev,
        [filmId]: avgResponse.data.averageRating || 0,
      }));
    } catch (error) {
      console.error("Error saving rating:", error);
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
      await axios.post(`/api/films/${filmId}/watched-films`, { userId });
    } catch (error) {
      console.error("Error marking film as watched:", error);
    }
  };

  const handleChangeSection = (index: number) => {
    if (index >= 0 && index < recommendations.length) {
      setCurrentSectionIndex(index);
    }
  };

  // Get current section
  const currentSection = recommendations[currentSectionIndex] || { reason: "", films: [] };

  return (
    <div className="recommendation-container mb-10 w-full">
      {isLoading ? (
        <div className="flex flex-col w-full gap-4">
          <div className="h-8 bg-gray-700 w-48 rounded animate-pulse"></div>
          <div className="flex justify-center items-center w-full">
            <div className="flex space-x-2 overflow-hidden">
              {[...Array(6)].map((_, index) => (
                <div
                  key={index}
                  className="w-52 md:w-50 h-60 bg-gray-700 rounded-lg animate-pulse"
                />
              ))}
            </div>
          </div>
        </div>
      ) : (
        <div className="flex flex-col w-full gap-4">
          {/* Section title */}
          <div className="flex justify-between items-center px-4">
            <h2 className="text-xl font-bold">{currentSection.reason}</h2>
            
            {/* Section navigation */}
            <div className="flex space-x-2">
              {recommendations.map((_, index) => (
                <button
                  key={index}
                  onClick={() => handleChangeSection(index)}
                  className={`w-3 h-3 rounded-full ${
                    index === currentSectionIndex ? 'bg-white' : 'bg-gray-500'
                  }`}
                />
              ))}
            </div>
          </div>
          
          {/* Films carousel */}
          <div className="flex justify-center w-full">
            <Carousel
              plugins={[Autoplay({ delay: 4000 })]}
              opts={{ align: "start", loop: true }}
              className="w-full"
            >
              <CarouselContent className="flex space-x-2">
                {currentSection.films.map((film) => {
                  const details = filmDetails[film.id] || {};
                  const completeFilm = { ...film, ...details };
                  
                  return (
                    <CarouselItem key={film.id} className="flex-none w-52 md:w-56 relative">
                      <Card>
                        <CardContent className="relative p-2">
                          {completeFilm.imageString ? (
                            <img
                              src={completeFilm.imageString}
                              alt={completeFilm.title || `Film ${film.id}`}
                              className="object-cover w-full h-60 rounded-lg transition-transform duration-300 hover:scale-105"
                            />
                          ) : (
                            <div className="w-full h-60 bg-gray-700 rounded-lg flex items-center justify-center">
                              <span className="text-sm text-gray-400">Loading...</span>
                            </div>
                          )}
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 hover:opacity-100 bg-black bg-opacity-50 gap-2">
                            <button 
                              onClick={() => completeFilm.trailer && handlePlay(completeFilm)} 
                              className="text-white text-xl"
                              disabled={!completeFilm.trailer}
                            >
                              <FaPlay />
                            </button>
                            <button onClick={() => handleToggleWatchlist(film.id)} className="text-white text-xl">
                              <FaHeart className={watchList[film.id] ? "text-red-500" : ""} />
                            </button>
                          </div>
                          <div className="absolute bottom-0 left-0 w-full bg-black bg-opacity-50 text-white p-1 text-center">
                            <span className="text-xs font-semibold">{completeFilm.title || `Film ${film.id}`}</span>
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
                            <p className="text-xs mt-1">
                              Avg: {typeof averageRatings[film.id] === "number" ? averageRatings[film.id].toFixed(1) : "N/A"}/5
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    </CarouselItem>
                  );
                })}
              </CarouselContent>
              <CarouselPrevious className="left-0" />
              <CarouselNext className="right-0" />
            </Carousel>
          </div>
        </div>
      )}

      {selectedFilm && (
        <PlayVideoModal
          changeState={setModalOpen}
          overview={selectedFilm.overview || ""}
          state={modalOpen}
          title={selectedFilm.title || ""}
          trailerUrl={selectedFilm.trailer || ""}
          age={selectedFilm.age || 0}
          duration={selectedFilm.duration || 0}
          release={selectedFilm.release || 0}
          ratings={userRatings[selectedFilm.id] || 0}
          setUserRating={(rating: number) => handleRatingClick(selectedFilm.id, rating)}
          markAsWatched={() => markAsWatched(selectedFilm.id)}
          category={selectedFilm.category || ""}
        />
      )}
    </div>
  );
}