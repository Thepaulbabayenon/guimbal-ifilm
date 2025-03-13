"use client"

import FilmSliderSkeleton from "@/app/components/FilmComponents/SkeletonSlider" 
import { TextLoop } from "@/components/ui/text-loop"
import React, { useEffect, useState } from "react"
import Image from "next/image"
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel"
import PlayVideoModal from "@/app/components/PlayVideoModal" 
import Autoplay from "embla-carousel-autoplay"
import { Button } from "@/components/ui/button"
import { CiHeart } from "react-icons/ci"
import axios, { AxiosError } from "axios"
import { usePathname } from "next/navigation"
import { useUser } from "@/app/auth/nextjs/useUser";

// Import the getFilmRating function
import { getFilmRating } from "@/app/services/filmService"; 

interface Film {
  id: number
  imageUrl: string
  title: string
  ageRating: number
  duration: number
  overview: string
  releaseYear: number
  videoSource: string
  category: string
  trailerUrl: string
  createdAt: Date
  updatedAt: Date
  producer: string
  director: string
  coDirector: string
  studio: string
  rank: number
  averageRating: number | null
  watchList?: boolean;
  inWatchlist?: boolean;
  watchlistId?: string | null;
}


interface FilmSliderProps {
  title: string
  categoryFilter?: string
  limit?: number
  films?: any[]; 
}

const FilmSlider = ({ title, categoryFilter, limit = 10 }: FilmSliderProps) =>  {
  // Use the authentication hook to get user data and auth state
  const { user, isAuthenticated, isLoading: authLoading } = useUser();
  
  const [films, setFilms] = useState<Film[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inWatchlist, setInWatchlist] = useState(false);
  const [watchlistId, setWatchlistId] = useState<string | null>(null);
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [userRating, setUserRating] = useState<number>(0)
  const [savingWatchlistId, setSavingWatchlistId] = useState<number | null>(null)
  const [averageRating, setAverageRating] = useState<number | null>(null)
  const pathname = usePathname()

  // Get userId from the auth hook
  const userId = user?.id;

  // Fetch watchlist status and user data on component mount
  useEffect(() => {
    if (!userId || !selectedFilm) {
      setLoading(false);
      return;
    }

    const filmId = selectedFilm.id;
    const initialRatings = selectedFilm.averageRating || 0;

    const fetchUserData = async () => {
      try {
        const watchlistResponse = await axios.get(`/api/films/${filmId}/watchlist`, { 
          params: { userId } 
        });

        if (watchlistResponse.data) {
          setInWatchlist(watchlistResponse.data.inWatchlist);
          setWatchlistId(watchlistResponse.data.watchListId);
        }
        
        // Fetch user's rating
        const ratingResponse = await axios.get(`/api/films/${filmId}/user-rating`, { 
          params: { userId } 
        });

        if (ratingResponse.data && ratingResponse.data.rating !== undefined) {
          setUserRating(ratingResponse.data.rating);
        }

        // Fetch average rating
        const avgResponse = await axios.get(`/api/films/${filmId}/average-rating`);
        if (avgResponse.data && avgResponse.data.averageRating !== undefined) {
          setAverageRating(avgResponse.data.averageRating);
        } else {
          setAverageRating(initialRatings);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setAverageRating(initialRatings);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [selectedFilm, userId]);

  const categoryTitles = categoryFilter
    ? [
        `${categoryFilter} Movies`,
        `Best ${categoryFilter} Films`,
        `Top ${categoryFilter} Picks`
      ]
    : [
        "Popular Films",
        "Trending Now",
        "Editor's Choice",
        "Binge-Worthy Picks"
      ]

  useEffect(() => {
    // Only fetch films if authentication loading is complete
    if (authLoading) {
      return;
    }
    
    setLoading(true)
    setError(null)
    setFilms([])
    
    const fetchFilms = async () => {
      try {
        // Create URL with query parameters
        let url = '/api/films';
        const params = new URLSearchParams();
        
        if (categoryFilter) {
          params.append('category', categoryFilter);
        }
        
        if (limit) {
          params.append('limit', limit.toString());
        }
        
        // Add params to URL if there are any
        if (params.toString()) {
          url += `?${params.toString()}`;
        }
        
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(`Error fetching films: ${response.statusText}`);
        }
        
        const data = await response.json();
        let filmsData: Film[] = [];
        
        if (data && data.rows && Array.isArray(data.rows)) {
          filmsData = data.rows;
        } else if (Array.isArray(data)) {
          filmsData = data;
        } else {
          console.error("Received unexpected data format:", data);
          setError("Invalid data format received from server");
          setLoading(false);
          return;
        }
        
        // If user is logged in, check watchlist status for each film
        if (userId && isAuthenticated) {
          try {
            const watchlistResponse = await axios.get('/api/watchlist', {
              params: { userId }
            });
            
            const watchlistItems = watchlistResponse.data || [];
            
            // Add watchlist info to each film
            filmsData = filmsData.map(film => {
              const watchlistItem = watchlistItems.find((item: any) => item.filmId === film.id);
              return {
                ...film,
                inWatchlist: !!watchlistItem,
                watchlistId: watchlistItem?.id
              };
            });
          } catch (err) {
            console.error("Error fetching watchlist:", err);
            // Continue with films but without watchlist data
          }
        }

        // Use Promise.all to fetch updated ratings for all films in parallel
        const filmsWithUpdatedRatings = await Promise.all(
          filmsData.map(async (film) => {
            try {
              const ratingData = await getFilmRating(film.id);
              return {
                ...film,
                averageRating: ratingData.averageRating || film.averageRating
              };
            } catch (err) {
              console.error(`Error fetching rating for film ${film.id}:`, err);
              return film;
            }
          })
        );
        
        setFilms(filmsWithUpdatedRatings);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load films");
        console.error("Error fetching films:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchFilms();
  }, [categoryFilter, limit, userId, isAuthenticated, authLoading]);

  const handleFilmClick = (e: React.MouseEvent, film: Film) => {
    e.preventDefault();
    // Don't open modal if click was on the heart button
    if ((e.target as HTMLElement).closest('button')?.className.includes('heart-button')) {
      return;
    }
    setSelectedFilm(film);
    setIsModalOpen(true);
    
    // Update inWatchlist and watchlistId states based on this film
    if (film.inWatchlist !== undefined) {
      setInWatchlist(film.inWatchlist);
    }
    if (film.watchlistId !== undefined) {
      setWatchlistId(film.watchlistId);
    }
  };

  const handleRatingUpdate = async (rating: number) => {
    setUserRating(rating);
    
    if (selectedFilm && userId) {
      try {
        await fetch(`/api/films/${selectedFilm.id}/user-ratings`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            userId,
            filmId: selectedFilm.id,
            rating
          }),
        });

        // After submitting a new rating, get the updated average rating
        const updatedRating = await getFilmRating(selectedFilm.id);
        
        // Update the rating in our state
        setFilms(prevFilms => 
          prevFilms.map(f => {
            if (f.id === selectedFilm.id) {
              return { ...f, averageRating: updatedRating.averageRating };
            }
            return f;
          })
        );

        // Also update the selected film if it's open in the modal
        setSelectedFilm(prev => {
          if (prev && prev.id === selectedFilm.id) {
            return { ...prev, averageRating: updatedRating.averageRating };
          }
          return prev;
        });
      } catch (error) {
        console.error("Error saving rating:", error);
      }
    }
  };
  
  const markAsWatched = async (userId: string, filmId: number) => {
    // This function will be called by the PlayVideoModal component
    console.log(`Marking film ${filmId} as watched by user ${userId}`);
    // In a real app, you'd likely update some UI state here
  };
  
 
  const handleToggleWatchlist = async (e: React.MouseEvent<HTMLButtonElement>, film: Film) => {
    e.preventDefault();
    e.stopPropagation();
  
    if (!userId) {
      alert("Please log in to manage your watchlist.");
      return;
    }
  
    const filmId = film.id;
    setSavingWatchlistId(filmId);
    const isInWatchlist = film.inWatchlist;
  
    try {
      // Optimistic UI update
      setFilms(prevFilms => 
        prevFilms.map(f => {
          if (f.id === filmId) {
            return { ...f, inWatchlist: !isInWatchlist };
          }
          return f;
        })
      );
  
      if (isInWatchlist) {
        // Updated DELETE request using film ID in URL path
        await axios.delete(`/api/watchlist/${filmId}`);
      } else {
        // Add to watchlist (existing POST request remains unchanged)
        const response = await axios.post('/api/watchlist', {
          userId,
          filmId
        });
        
        if (response.data?.id) {
          setFilms(prevFilms => 
            prevFilms.map(f => {
              if (f.id === filmId) {
                return { ...f, watchlistId: response.data.id };
              }
              return f;
            })
          );
        }
      }
    } catch (error) {
      // Rollback on error
      setFilms(prevFilms => 
        prevFilms.map(f => {
          if (f.id === filmId) {
            return { ...f, inWatchlist: isInWatchlist };
          }
          return f;
        })
      );
      
      const axiosError = error as AxiosError;
      console.error("Watchlist error:", axiosError.response?.data || error);
      alert(`Failed: ${(axiosError.response?.data as any)?.error || "Please try again"}`);
    } finally {
      setSavingWatchlistId(null);
    }
  };

  // Function to refresh the rating for a specific film
  const refreshFilmRating = async (filmId: number) => {
    try {
      const ratingData = await getFilmRating(filmId);
      
      setFilms(prevFilms => 
        prevFilms.map(f => {
          if (f.id === filmId) {
            return { ...f, averageRating: ratingData.averageRating };
          }
          return f;
        })
      );

      // Also update selected film if it's being viewed
      if (selectedFilm && selectedFilm.id === filmId) {
        setSelectedFilm(prev => {
          if (prev) {
            return { ...prev, averageRating: ratingData.averageRating };
          }
          return prev;
        });
      }
    } catch (err) {
      console.error(`Error refreshing rating for film ${filmId}:`, err);
    }
  };

  if (loading || authLoading) {
    return <FilmSliderSkeleton title={title} itemCount={limit > 5 ? 5 : limit} />;
  }
  
  if (error) {
    return <div className="w-full py-8 text-center text-red-500">Error: {error}</div>;
  }

  if (!films || films.length === 0) {
    return <div className="w-full py-8 text-center">No films found in this category.</div>;
  }

  return (
    <section className="py-8">
      <div className="mb-6">
        <TextLoop
          interval={4}
          className="text-2xl font-bold"
          transition={{ duration: 0.5 }}
          variants={{
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -20 }
          }}
        >
          {categoryTitles.map((text, index) => (
            <h2 key={index} className="text-2xl font-bold">
              {text}
            </h2>
          ))}
        </TextLoop>
      </div>
      <Carousel
        plugins={[Autoplay({ delay: 4000 })]}
        opts={{ align: "start", loop: true }}
        className="w-full"
      >
        <CarouselContent>
          {films.map((film) => (
            <CarouselItem key={film.id} className="md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
              <div 
                className="relative overflow-hidden rounded-lg group cursor-pointer"
                onClick={(e) => handleFilmClick(e, film)}
              >
                <div className="aspect-[3/3] w-full relative">
                  <Image
                    src={film.imageUrl}
                    alt={film.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 20vw"
                  />
                  
                  {/* Heart Button (Watchlist) - Only show if user is authenticated */}
                  {isAuthenticated && userId && (
                     <div className="absolute top-2 right-2 z-10">
                     <Button 
                       variant="outline" 
                       size="icon"
                       className="bg-black/50 hover:bg-black/70 heart-button" 
                       onClick={(e) => handleToggleWatchlist(e, film)} 
                       disabled={savingWatchlistId === film.id || loading}
                     >
                       <CiHeart className={`w-6 h-6 ${film.inWatchlist ? "text-red-500" : "text-white"}`} />
                     </Button>
                   </div>
                  )}
                       
                  {/* Play button overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/30">
                    <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                      <svg 
                        className="w-8 h-8 text-white" 
                        fill="currentColor" 
                        viewBox="0 0 24 24"
                      >
                        <path d="M8 5v14l11-7z" />
                      </svg>
                    </div>
                  </div>
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                  <h3 className="text-white font-medium text-sm md:text-base truncate">
                    {film.title}
                  </h3>
                  <div className="flex items-center text-xs text-gray-300 mt-1">
                    <span>{film.releaseYear}</span>
                    <span className="mx-2">•</span>
                    <span>{Math.floor(film.duration)} min</span>
                    {film.averageRating && (
                      <>
                        <span className="mx-2">•</span>
                        <span className="flex items-center">
                          <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 24 24" 
                            fill="currentColor" 
                            className="w-4 h-4 text-yellow-500 mr-1"
                          >
                            <path fillRule="evenodd" d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z" clipRule="evenodd" />
                          </svg>
                          {film.averageRating.toFixed(1)}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex left-0 translate-x-0" />
        <CarouselNext className="hidden md:flex right-0 translate-x-0" />
      </Carousel>

      {/* Video Modal */}
      {selectedFilm && (
        <PlayVideoModal
          title={selectedFilm.title}
          overview={selectedFilm.overview}
          trailerUrl={selectedFilm.trailerUrl}
          state={isModalOpen}
          changeState={setIsModalOpen}
          releaseYear={selectedFilm.releaseYear}
          ageRating={selectedFilm.ageRating}
          duration={selectedFilm.duration}
          ratings={selectedFilm.averageRating || 0}
          setUserRating={handleRatingUpdate}
          userId={userId || ""}
          filmId={selectedFilm.id}
          markAsWatched={markAsWatched}
          category={selectedFilm.category}
          refreshRating={() => refreshFilmRating(selectedFilm.id)}
        />
      )}
    </section>
  );
};

export default FilmSlider;