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

// Helper function to fetch  based on category
async function fetchFilmsByCategory(category: string) {
  const response = await fetch(`/api/films?category=${category}`);
  const data = await response.json();
  console.log("API Response:", data); // Log API response
  return data.films || [];
}

export function CategoryCarousel() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [films, setFilms] = useState<any[]>([]); // Store the fetched films
  const [isLoading, setIsLoading] = useState<boolean>(false); // Loading state
  const carouselRef = useRef<HTMLDivElement>(null); // Reference for controlling carousel

  // Example categories
  const categories = ["Comedy", "Drama", "Horror", "Action"];

  const handleCategorySelect = async (category: string) => {
    setSelectedCategory(category);
    setIsLoading(true); // Show loading indicator

    try {
      // Fetch films based on the selected category
      const fetchedFilms = await fetchFilmsByCategory(category);
      console.log("Fetched Films:", fetchedFilms); // Debug: log fetched films
      setFilms(fetchedFilms);
    } catch (error) {
      console.error("Error fetching films:", error);
      setFilms([]); // Set empty array on error
    } finally {
      setIsLoading(false); // Hide loading indicator after fetching films
    }
  };

  // Debug logs
  console.log("Selected Category:", selectedCategory);
  console.log("Films:", films);
  console.log("Is Loading:", isLoading);

  useEffect(() => {
    // Reset carousel position when films are updated
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = 0;
    }
  }, [films]);

  return (
    <div className="relative"> {/* Positioning container */}
      {/* Category Dropdown to select the category */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-10">
        <CategoryDropdown
          categories={categories}
          onCategorySelect={handleCategorySelect}
        />
      </div>

      {/* Display loading indicator while fetching films */}
      {isLoading && <div className="mt-4 text-center text-gray-500">Loading...</div>}

      {/* Carousel to display the films */}
      {!isLoading && films.length > 0 && (
        <div className="overflow-hidden">
          <Carousel
            opts={{ align: "start" }}
            className="w-full max-w-sm"
            ref={carouselRef} // Attach ref to control carousel position
          >
            <CarouselContent>
              {films.map((film) => (
                <CarouselItem key={film.id} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <Card>
                      <CardContent className="flex aspect-square items-center justify-center p-6">
                        {/* Display film details such as title */}
                        <span className="text-3xl font-semibold">{film.title}</span>
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

      {/* Display a message when no films are found */}
      {selectedCategory && !isLoading && films.length === 0 && (
        <div className="mt-4 text-center text-gray-500">
          No films found in this category.
        </div>
      )}
    </div>
  );
}
