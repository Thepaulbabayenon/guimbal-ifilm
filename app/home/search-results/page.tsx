// app/search-results/page.tsx

"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation"; // To get search params from the URL
import { FilmCard } from "@/app/components/FilmCard"; // Import your FilmCard component
import PlayVideoModal from "@/app/components/PlayVideoModal";
import axios from "axios";

const SearchResults = () => {
  const searchParams = useSearchParams(); // Get search params from the URL
  const query = searchParams.get("query") || ""; // Default to empty string if no query
  const [films, setFilms] = useState<any[]>([]); // State to store fetched films
  const [error, setError] = useState<string | null>(null); // State to handle errors
  const [selectedFilm, setSelectedFilm] = useState<any | null>(null); // Store selected film for PlayVideoModal
  const [isModalOpen, setIsModalOpen] = useState(false); // State to manage modal visibility

  // Fetch films based on the search query
  useEffect(() => {
    const fetchFilms = async () => {
      try {
        const response = await axios.get(`/api/search-films?query=${query}`);
        if (response.data) {
          setFilms(response.data);
        } else {
          setFilms([]);
        }
      } catch (err) {
        setError("Error fetching films.");
        console.error(err);
      }
    };

    if (query) {
      fetchFilms();
    }
  }, [query]);

  // Handle film card click to open the modal
  const handleFilmClick = (film: any) => {
    setSelectedFilm(film); // Store the clicked film
    setIsModalOpen(true); // Open the modal
  };

  return (
    <div className="p-4">
      <h1 className="text-xl font-semibold mb-4">Search Results for "{query}"</h1>

      {/* Display error message */}
      {error && <p className="text-red-500">{error}</p>}

      {/* Display films if available */}
      {films.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {films.map((film: any) => (
            <div key={film.id} className="relative">
              <FilmCard
                filmId={film.id}
                overview={film.overview}
                title={film.title}
                watchList={film.watchList}
                youtubeUrl={film.youtubeUrl}
                year={film.year}
                age={film.age}
                time={film.time}
                initialRatings={film.initialRatings}
                onClick={() => {}}
                category={film.category}
              />
              <div
                onClick={() => handleFilmClick(film)}
                className="absolute inset-0 bg-black opacity-50 flex justify-center items-center cursor-pointer"
              >
                <span className="text-white">Play Video</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No films found.</p>
      )}

      {/* Film Video Modal */}
      {selectedFilm && (
        <PlayVideoModal
          youtubeUrl={selectedFilm.youtubeUrl}
          title={selectedFilm.title}
          overview={selectedFilm.overview}
          state={isModalOpen}
          changeState={setIsModalOpen}
          age={selectedFilm.age}
          duration={selectedFilm.time}
          release={selectedFilm.year}
          ratings={selectedFilm.initialRatings}
          setUserRating={() => {}}
          category={selectedFilm.category}
        />
      )}
    </div>
  );
};

export default SearchResults;
