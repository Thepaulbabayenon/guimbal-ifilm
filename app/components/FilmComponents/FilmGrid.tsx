'use client';

import { useEffect, useState } from "react";
import { getAllFilms } from "../../api/getFilms"; // Ensure this API function exists
import { Card, CardContent } from "@/components/ui/card";
import PlayVideoModal from "../PlayVideoModal";
import { FaHeart, FaPlay } from "react-icons/fa";
import { useUser } from "@/app/auth/nextjs/useUser";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { ClipLoader } from "react-spinners"; // For the loading spinner

export function FilmGrid() {
  interface Film {
    id: number;
    title: string;
    age: number | null; // Allow null
    duration: number;
    imageString: string;
    overview: string;
    release: number;
    videoSource: string;
    category: string;
    trailer: string | null; // Allow null
    rank: number | null; // Allow null
  }
  
  
  

  const { user } = useUser();
  const userId = user?.id;

  const [films, setFilms] = useState<Film[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null);
  const [watchList, setWatchList] = useState<{ [key: number]: boolean }>({});
  const [loading, setLoading] = useState(true); // Track loading state

  useEffect(() => {
    async function fetchFilms() {
      try {
        const filmsData = await getAllFilms();
        const formattedFilms = filmsData.map((film) => ({
          ...film,
          age: film.age !== null ? Number(film.age) : 0, // Convert to number or default to 0
          trailer: film.trailer ?? "", // Ensure trailer is a string
          rank: film.rank ?? 0, // Default rank to 0 if null
        }));
    
        setFilms(formattedFilms);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching films:", error);
        setLoading(false);
      }
    }
    
    
  
    fetchFilms();
  }, []);
  
  useEffect(() => {
    if (userId && films.length > 0) {
      films.forEach((film) => {
        fetchWatchlistStatus(film.id);
      });
    }
  }, [userId, films]);

  const fetchWatchlistStatus = async (filmId: number) => {
    try {
      const response = await axios.get(`/api/watchlist/${filmId}`, { params: { userId } });
      setWatchList((prev) => ({ ...prev, [filmId]: response.data.inWatchlist }));
    } catch (error) {
      console.error("Error fetching watchlist status:", error);
    }
  };

  const handleToggleWatchlist = async (filmId: number) => {
    if (!userId) {
      toast.warn("Please log in to manage your watchlist.");
      return;
    }

    const isInWatchlist = watchList[filmId];

    try {
      if (isInWatchlist) {
        await axios.delete(`/api/watchlist`, { data: { filmId, userId } });
        toast.success("Removed from your watchlist.");
      } else {
        await axios.post("/api/watchlist", { filmId, userId });
        toast.success("Added to your watchlist.");
      }

      setWatchList((prev) => ({ ...prev, [filmId]: !isInWatchlist }));
    } catch (error) {
      console.error("Error toggling watchlist:", error);
      toast.error("Failed to update watchlist.");
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
      toast.success("Marked as watched!");
    } catch (error) {
      console.error("Error marking film as watched:", error);
      toast.error("Failed to mark as watched.");
    }
  };

  return (
    <div className="film-grid-container grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-2 p-2">
      <ToastContainer />
      
      {loading ? (
        <div className="col-span-full flex justify-center items-center">
          <ClipLoader color="#FF4500" size={50} /> {/* Loading spinner */}
        </div>
      ) : (
        films.map((film) => (
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
                      onClick={() => handleToggleWatchlist(film.id)}
                      className={`text-white text-lg hover:scale-110 transition-transform transform ${
                        watchList[film.id] ? "text-red-500" : "hover:text-red-500"
                      }`}
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
        ))
      )}

      {selectedFilm && (
       <PlayVideoModal
       changeState={setModalOpen}
       overview={selectedFilm.overview}
       state={modalOpen}
       title={selectedFilm.title}
       trailerUrl={selectedFilm.trailer ?? ""} // Ensure it's a string
       age={selectedFilm.age ?? 0} // Default age to 0
       duration={selectedFilm.duration}
       release={selectedFilm.release}
       ratings={selectedFilm.rank ?? 0} // Default rank to 0
       setUserRating={() => {}} // Implement this function if needed
       markAsWatched={() => markAsWatched(selectedFilm.id)}
       category={selectedFilm.category}
     />     
      )}
    </div>
  );
}

export default FilmGrid;
