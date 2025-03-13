'use client';
import { useCallback, useEffect, useState, useMemo } from "react";
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
import axios from "axios";
import { Film } from "@/types/film";

// Import the getFilmRating function
import { getFilmRating } from "@/app/services/filmService";

interface RecommendationSection {
  reason: string;
  films: Film[];
}

interface FilmSliderRecoProps {
  userId: string;
}

// Using a cache object to store API responses
const apiCache = {
  recommendations: new Map(),
  filmDetails: new Map(),
  userRatings: new Map(),
  avgRatings: new Map(),
  watchlist: new Map(),
};

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
  
  // Replace loadedFilmIds Set with a simple object for better performance
  const [loadedFilmIds, setLoadedFilmIds] = useState<{ [key: number]: boolean }>({});

  // Memoized current section to prevent unnecessary recalculations
  const currentSection = useMemo(() => 
    recommendations[currentSectionIndex] || { reason: "", films: [] },
    [recommendations, currentSectionIndex]
  );

  // Fetch recommendations with caching
  useEffect(() => {
    async function fetchRecommendations() {
      if (!userId) {
        console.warn("User ID is required to fetch recommendations.");
        setRecommendations([]);
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        
        // Check cache first
        const cacheKey = `recommendations-${userId}`;
        if (apiCache.recommendations.has(cacheKey)) {
          setRecommendations(apiCache.recommendations.get(cacheKey));
          setIsLoading(false);
          return;
        }
        
        // Fetch if not in cache
        const response = await axios.get(`/api/recommendations?userId=${userId}`);
        if (response.status === 200 && response.data) {
          const data = response.data as RecommendationSection[];
          setRecommendations(data);
          
          // Cache the result
          apiCache.recommendations.set(cacheKey, data);
        } else {
          throw new Error("Invalid response");
        }
      } catch (error) {
        console.error("Error fetching recommended films:", error);
        setRecommendations([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRecommendations();
  }, [userId]);

  // Batch fetch film details for visible films
  useEffect(() => {
    if (!currentSection?.films?.length) return;

    const fetchMissingFilmDetails = async () => {
      // Filter only films that we haven't loaded or attempted to load yet
      const filmsToFetch = currentSection.films.filter(film => !loadedFilmIds[film.id]);
      
      if (filmsToFetch.length === 0) return;
      
      // Mark all as loaded to prevent duplicate requests
      const newLoadedIds = { ...loadedFilmIds };
      filmsToFetch.forEach(film => {
        newLoadedIds[film.id] = true;
      });
      setLoadedFilmIds(newLoadedIds);
      
      // Prepare batch requests - this is more efficient than individual requests
      const detailPromises = filmsToFetch.map(async (film) => {
        try {
          // Check cache first
          if (apiCache.filmDetails.has(film.id)) {
            return { id: film.id, details: apiCache.filmDetails.get(film.id) };
          }
          
          const response = await axios.get(`/api/films/${film.id}`);
          if (response.status === 200 && response.data) {
            // Cache the result
            apiCache.filmDetails.set(film.id, response.data);
            return { id: film.id, details: response.data };
          }
        } catch (error) {
          console.error(`Error fetching details for film ID ${film.id}:`, error);
          return { id: film.id, details: null };
        }
      });
      
      // Process results in batch
      const results = await Promise.all(detailPromises);
      
      // Update state once with all new details
      const newDetails = { ...filmDetails };
      results.forEach(result => {
        if (result?.details) {
          newDetails[result.id] = result.details;
        }
      });
      
      setFilmDetails(newDetails);
    };
    
    fetchMissingFilmDetails();
  }, [currentSection, loadedFilmIds]);

  // Batch fetch user data (ratings, watchlist) for visible films
  useEffect(() => {
    if (!userId || !currentSection?.films?.length) return;
    
    // Create a batch request for all user data
    const fetchUserData = async () => {
      // Only fetch data for films we haven't loaded yet
      const filmsNeedingUserData = currentSection.films.filter(
        film => !userRatings[film.id] && !watchList[film.id]
      );
      
      if (filmsNeedingUserData.length === 0) return;
      
      // Prepare batch requests for efficiency
      const userDataPromises = filmsNeedingUserData.map(async (film) => {
        const filmId = film.id;
        const cacheKeyRating = `rating-${userId}-${filmId}`;
        const cacheKeyAvgRating = `avgRating-${filmId}`;
        const cacheKeyWatchlist = `watchlist-${userId}-${filmId}`;
        
        try {
          // Use cached data if available
          let userRating = apiCache.userRatings.has(cacheKeyRating) ? 
            apiCache.userRatings.get(cacheKeyRating) : null;
          let avgRating = apiCache.avgRatings.has(cacheKeyAvgRating) ? 
            apiCache.avgRatings.get(cacheKeyAvgRating) : null;
          let isInWatchlist = apiCache.watchlist.has(cacheKeyWatchlist) ? 
            apiCache.watchlist.get(cacheKeyWatchlist) : null;
            
          // Fetch only what we don't have in cache
          const promises = [];
          
          if (userRating === null) {
            promises.push(
              axios.get(`/api/films/${filmId}/user-rating`, { params: { userId } })
              .then(res => {
                userRating = res.data.rating || 0;
                apiCache.userRatings.set(cacheKeyRating, userRating);
              })
              .catch(err => console.error(`Error fetching user rating for film ${filmId}:`, err))
            );
          }
          
          if (avgRating === null) {
            // Use the getFilmRating function instead of direct axios call
            promises.push(
              getFilmRating(filmId)
              .then(data => {
                avgRating = data.averageRating || 0;
                apiCache.avgRatings.set(cacheKeyAvgRating, avgRating);
              })
              .catch(err => console.error(`Error fetching avg rating for film ${filmId}:`, err))
            );
          }
          
          if (isInWatchlist === null) {
            promises.push(
              axios.get(`/api/watchlist/${filmId}`, { params: { userId } })
              .then(res => {
                isInWatchlist = res.data.inWatchlist;
                apiCache.watchlist.set(cacheKeyWatchlist, isInWatchlist);
              })
              .catch(err => console.error(`Error fetching watchlist status for film ${filmId}:`, err))
            );
          }
          
          if (promises.length > 0) {
            await Promise.all(promises);
          }
          
          return {
            filmId,
            userRating,
            avgRating,
            isInWatchlist
          };
        } catch (error) {
          console.error(`Error fetching user data for film ${filmId}:`, error);
          return null;
        }
      });
      
      // Process all results in a single batch
      const results = await Promise.all(userDataPromises);
      
      // Update all states at once to minimize renders
      const newUserRatings = { ...userRatings };
      const newAvgRatings = { ...averageRatings };
      const newWatchList = { ...watchList };
      
      results.forEach(result => {
        if (result) {
          newUserRatings[result.filmId] = result.userRating;
          newAvgRatings[result.filmId] = result.avgRating;
          newWatchList[result.filmId] = result.isInWatchlist;
        }
      });
      
      setUserRatings(newUserRatings);
      setAverageRatings(newAvgRatings);
      setWatchList(newWatchList);
    };
    
    fetchUserData();
  }, [currentSection, userId]);

  // Optimize watchlist toggle function
  const handleToggleWatchlist = useCallback(async (filmId: number) => {
    if (!userId || !filmId) {
      console.warn("User ID and film ID are required to manage watchlist.");
      return;
    }
  
    const isInWatchlist = watchList[filmId];
    
    // Optimistic update
    setWatchList(prev => ({
      ...prev,
      [filmId]: !isInWatchlist
    }));
  
    try {
      if (isInWatchlist) {
        await axios.delete("/api/watchlist/", { data: { filmId, userId } });
      } else {
        await axios.post("/api/watchlist/", { filmId, userId });
      }
      
      // Update cache
      const cacheKey = `watchlist-${userId}-${filmId}`;
      apiCache.watchlist.set(cacheKey, !isInWatchlist);
    } catch (error) {
      console.error("Error toggling watchlist:", error);
      
      // Revert on error
      setWatchList(prev => ({
        ...prev,
        [filmId]: isInWatchlist
      }));
    }
  }, [userId, watchList]);
  
  // Optimize rating function with getFilmRating
  const handleRatingClick = useCallback(async (filmId: number, newRating: number) => {
    if (!userId) {
      console.warn("Please log in to rate films.");
      return;
    }

    // Optimistic update
    setUserRatings(prev => ({ ...prev, [filmId]: newRating }));
    
    try {
      await axios.post(`/api/films/${filmId}/user-rating`, { userId, rating: newRating });
      
      // Update cache
      const cacheKey = `rating-${userId}-${filmId}`;
      apiCache.userRatings.set(cacheKey, newRating);

      // Get updated average rating using the getFilmRating function
      const ratingData = await getFilmRating(filmId);
      const newAvgRating = ratingData.averageRating || 0;
      
      setAverageRatings(prev => ({
        ...prev,
        [filmId]: newAvgRating,
      }));
      
      // Update cache
      const avgCacheKey = `avgRating-${filmId}`;
      apiCache.avgRatings.set(avgCacheKey, newAvgRating);
    } catch (error) {
      console.error("Error saving rating:", error);
      
      // Revert on error
      setUserRatings(prev => {
        const oldRating = apiCache.userRatings.get(`rating-${userId}-${filmId}`) || 0;
        return { ...prev, [filmId]: oldRating };
      });
    }
  }, [userId]);

  const handlePlay = useCallback((film: Film) => {
    setSelectedFilm(film);
    setModalOpen(true);
  }, []);

  const markAsWatched = useCallback(async (filmId: number) => {
    if (!userId) {
      console.error("User ID is not available.");
      return;
    }

    try {
      await axios.post(`/api/films/${filmId}/watched-films`, { userId });
    } catch (error) {
      console.error("Error marking film as watched:", error);
    }
  }, [userId]);

  const handleChangeSection = useCallback((index: number) => {
    if (index >= 0 && index < recommendations.length) {
      setCurrentSectionIndex(index);
    }
  }, [recommendations.length]);

  // Render loading skeleton
  if (isLoading) {
    return (
      <div className="recommendation-container mb-10 w-full">
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
      </div>
    );
  }

  return (
    <div className="recommendation-container mb-10 w-full">
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
                aria-label={`Switch to recommendation set ${index + 1}`}
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
                        {completeFilm.imageUrl ? (
                          <img
                            src={completeFilm.imageUrl}
                            alt={completeFilm.title || `Film ${film.id}`}
                            className="object-cover w-full h-60 rounded-lg transition-transform duration-300 hover:scale-105"
                            loading="lazy" // Add lazy loading
                          />
                        ) : (
                          <div className="w-full h-60 bg-gray-700 rounded-lg flex items-center justify-center">
                            <span className="text-sm text-gray-400">Loading...</span>
                          </div>
                        )}
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 transition-opacity duration-300 hover:opacity-100 bg-black bg-opacity-50 gap-2">
                          <button 
                            onClick={() => completeFilm.trailerUrl && handlePlay(completeFilm)} 
                            className="text-white text-xl"
                            disabled={!completeFilm.trailerUrl}
                            aria-label="Play trailer"
                          >
                            <FaPlay />
                          </button>
                          <button 
                            onClick={() => handleToggleWatchlist(film.id)} 
                            className="text-white text-xl"
                            aria-label={watchList[film.id] ? "Remove from watchlist" : "Add to watchlist"}
                          >
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
                                aria-label={`Rate ${star} stars`}
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

      {selectedFilm && (
        <PlayVideoModal
          changeState={setModalOpen}
          overview={selectedFilm.overview || ""}
          state={modalOpen}
          title={selectedFilm.title || ""}
          trailerUrl={selectedFilm.trailerUrl || ""}
          ageRating={selectedFilm.ageRating || 0}
          duration={selectedFilm.duration || 0}
          releaseYear={selectedFilm.releaseYear || 0}
          ratings={userRatings[selectedFilm.id] || 0}
          setUserRating={(rating: number) => handleRatingClick(selectedFilm.id, rating)}
          markAsWatched={() => markAsWatched(selectedFilm.id)}
          category={selectedFilm.category || ""}
        />
      )}
    </div>
  );
}