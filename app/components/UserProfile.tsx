'use client';
import React, { useEffect, useState } from "react";
import { LoadingSpinner } from "./LoadingSpinner";
import SkeletonSlider from "./FilmComponents/SkeletonSlider";
import cache from "@/app/services/cashService";

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
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://www.Thebantayanfilmfestival.com';
  const [films, setFilms] = useState<Film[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  // Placeholder user data
  const user = {
    name: "John Doe",
    bio: "Movie enthusiast",
    avatar: "/avatar.png", // Path to a default avatar image
  };

  useEffect(() => {
    const fetchRecommendedFilms = async () => {
      const cacheKey = `recommendations-${userId}`;
      try {
        // Check if data is in cache
        const cachedData = cache.getFilms(cacheKey);
        if (cachedData) {
          setFilms(cachedData);
          setLoading(false);
          return;
        }

        // Fetch recommendations from your API
        const response = await fetch(`${baseUrl}/api/recommendations?userId=${userId}`);
        const data = await response.json();

        // If no films are found, set an error message
        if (data.length === 0) {
          setError("No recommendations found.");
        } else {
          setFilms(data);
          // Set data in cache
          cache.setFilms(cacheKey, data);
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

  const numberOfSkeletons = 4;

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Profile Header */}
      <div className="flex items-center mb-8">
        <img
          src={user.avatar}
          alt="User Avatar"
          className="w-20 h-20 rounded-full mr-4"
        />
        <div>
          <h1 className="text-2xl font-semibold">{user.name}</h1>
          <p className="text-gray-600">{user.bio}</p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {Array.from({ length: numberOfSkeletons }).map((_, index) => (
            <SkeletonSlider key={index} title="Loading Film" />
          ))}
        </div>
      ) : null}
      {error && <p className="text-center text-xl text-red-600">{error}</p>}
      {!loading && !error && (
        <div>
          <h2 className="text-3xl font-semibold text-center mb-8">Recommended Films for You</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {films.map((film) => (
              <div key={film.id} className="bg-white shadow-md rounded-lg overflow-hidden">
                <img
                  src={film.imageString}
                  alt={film.title}
                  className="w-full h-56 object-cover rounded-t-lg border-b border-gray-200"
                />
                <div className="px-4 py-3">
                  <h3 className="text-lg font-semibold text-gray-800">{film.title}</h3>
                  <p className="text-sm text-gray-500">Rank: {film.rank}</p>
                  <p className="text-sm text-gray-500 mt-2 line-clamp-2">{film.overview}</p>
                  <a
                    href={film.trailer}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block mt-3 text-blue-500 hover:text-blue-700 text-sm"
                  >
                    Watch Trailer
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {error && (
        <p className="text-center text-xl text-gray-600">
          No recommendations found. Please update your preferences.
        </p>
      )}
    </div>
  );
};

export default UserProfile;
