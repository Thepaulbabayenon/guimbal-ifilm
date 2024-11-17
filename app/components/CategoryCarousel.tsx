"use client";
import * as React from "react";
import { useState, useRef, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { CategoryDropdown } from "./CategoryDropdown";

// Helper function to fetch movies based on category
async function fetchMoviesByCategory(category: string) {
  const response = await fetch(`/api/movies?category=${category}`);
  const data = await response.json();
  return data.movies || [];
}

export function CategoryCarousel() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [movies, setMovies] = useState<any[]>([]); // Store the fetched movies
  const [isLoading, setIsLoading] = useState<boolean>(false); // Loading state
  const carouselRef = useRef<HTMLDivElement>(null); // Reference for controlling carousel

  // Example categories
  const categories = ["Comedy", "Drama", "Horror", "Action"];

  const handleCategorySelect = async (category: string) => {
    setSelectedCategory(category);
    setIsLoading(true); // Show loading indicator

    try {
      // Fetch movies based on the selected category
      const fetchedMovies = await fetchMoviesByCategory(category);
      console.log("Fetched Movies:", fetchedMovies); // Debug: log fetched movies
      setMovies(fetchedMovies);
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setIsLoading(false); // Hide loading indicator after fetching movies
    }
  };

  // Debug logs
  console.log("Selected Category:", selectedCategory);
  console.log("Movies:", movies);
  console.log("Is Loading:", isLoading);

  useEffect(() => {
    // Reset carousel position when movies are updated
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = 0;
    }
  }, [movies]);

  return (
    <div className="relative"> {/* Positioning container */}
      {/* Category Dropdown to select the category */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-10">
        <CategoryDropdown
          categories={categories}
          onCategorySelect={handleCategorySelect}
        />
      </div>

      {/* Display loading indicator while fetching movies */}
      {isLoading && <div className="mt-4 text-center text-gray-500">Loading...</div>}

      {/* Carousel to display the movies */}
      {selectedCategory && !isLoading && movies.length > 0 && (
        <div className="overflow-hidden">
          <Carousel
            opts={{
              align: "start",
            }}
            className="w-full max-w-sm"
            ref={carouselRef} // Attach ref to control carousel position
          >
            <CarouselContent>
              {movies.map((movie, index) => (
                <CarouselItem key={movie.id} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <Card>
                      <CardContent className="flex aspect-square items-center justify-center p-6">
                        {/* Display movie details such as title */}
                        <span className="text-3xl font-semibold">{movie.title}</span>
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
      )}

      {/* Display a message when no movies are found */}
      {selectedCategory && !isLoading && movies.length === 0 && (
        <div className="mt-4 text-center text-gray-500">
          No movies found in this category.
        </div>
      )}
    </div>
  );
}
