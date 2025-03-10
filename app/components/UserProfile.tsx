'use client';
import React, { useEffect, useState } from "react";

// Define the Film type
type Film = {
  id: number;
  title: string;
  age: number;
  duration: string;
  imageString: string;
  overview: string;
  release: string;
  videoSource: string;
  category: string;
  trailer: string;
  rank: number;
};

// UserProfile Component
const UserProfile = ({ userId }: { userId: string }) => {
  const [films, setFilms] = useState<Film[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchRecommendedFilms = async () => {
      try {
        // Fetch recommendations from your API
        const response = await fetch(`http://localhost:3000/api/recommendations?userId=${userId}`);
        const data = await response.json();

        // If no films are found, set an error message
        if (data.length === 0) {
          setError("No recommendations found.");
        } else {
          setFilms(data);
        }
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        setError("Failed to fetch recommendations.");
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendedFilms();
  }, [userId]);

  return (
    <div className="container mx-auto px-4 py-8">
      {loading && <p className="text-center text-xl text-gray-600">Loading...</p>}
      {error && <p className="text-center text-xl text-red-600">{error}</p>}
      {!loading && !error && (
        <div>
          <h2 className="text-3xl font-semibold text-center mb-8">Recommended Films for You</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {films.map((film) => (
              <div key={film.id} className="bg-white shadow-lg rounded-lg overflow-hidden">
                <img src={film.imageString} alt={film.title} className="w-full h-56 object-cover" />
                <div className="p-4">
                  <h3 className="text-xl font-semibold text-gray-800">{film.title}</h3>
                  <p className="text-sm text-gray-600">Rank: {film.rank}</p>
                  <p className="text-sm text-gray-500 mt-2">{film.overview}</p>
                  <a
                    href={film.trailer}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-3 text-blue-500 hover:text-blue-700"
                  >
                    Watch Trailer
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
