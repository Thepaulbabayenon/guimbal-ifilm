"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from "@/components/ui/carousel";
import { Card, CardContent } from "@/components/ui/card";

// Helper function to fetch movies based on category
async function fetchMoviesByCategory(category: string) {
  const response = await fetch(`/api/movies?category=${category}`);
  const data = await response.json();
  return data.movies || [];
}

type DropdownProps = {
  categories: string[];
  onCategorySelect: (category: string) => void; // Add this prop to handle category selection
};

export function CategoryDropdown({ categories, onCategorySelect }: DropdownProps) {
  const [selectedCategory, setSelectedCategory] = React.useState<string | null>(null); // Store selected category
  const [movies, setMovies] = React.useState<any[]>([]); // Store fetched movies
  const [isDropdownOpen, setIsDropdownOpen] = React.useState<boolean>(false); // Manage dropdown state
  const [isLoading, setIsLoading] = React.useState<boolean>(false); // Loading state

  // Handle category selection and movie fetching
  const handleSelect = async (category: string) => {
    setSelectedCategory(category);
    setIsLoading(true); // Show loading indicator

    // Fetch movies based on the selected category
    try {
      const fetchedMovies = await fetchMoviesByCategory(category);
      setMovies(fetchedMovies);
    } catch (error) {
      console.error("Error fetching movies:", error);
    } finally {
      setIsLoading(false); // Hide loading indicator after fetching movies
    }

    // Pass the selected category to the parent (if necessary)
    onCategorySelect(category); // This will notify the parent component
    setIsDropdownOpen(false); // Close dropdown when a category is selected
  };

  // Toggle the dropdown visibility
  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev); // Toggle dropdown visibility
  };

  // Handle the exit button click to close the carousel
  const handleExit = () => {
    setSelectedCategory(null); // Clear selected category
    setMovies([]); // Clear movies
  };

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" onClick={toggleDropdown}>
            {selectedCategory || "Select a Category"}
          </Button>
        </DropdownMenuTrigger>

        {/* Dropdown Menu Content */}
        {isDropdownOpen && (
          <DropdownMenuContent className="w-56">
            <DropdownMenuLabel>Categories</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {categories.map((category) => (
              <DropdownMenuItem key={category} onClick={() => handleSelect(category)}>
                {category}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        )}
      </DropdownMenu>

      {/* Display loading indicator while fetching movies */}
      {isLoading && <div className="mt-4 text-center text-gray-500">Loading...</div>}

      {/* Display movies in a carousel if category is selected and movies are fetched */}
      {selectedCategory && !isLoading && movies.length > 0 && (
        <div className="mt-4 relative">
          <h2 className="text-lg font-semibold">Movies in {selectedCategory} Category</h2>
          
          {/* Exit button to close the carousel */}
          <div className="absolute top-2 right-2 z-10">
            <Button variant="link" onClick={handleExit} className="text-red-500">
              X
            </Button>
          </div>

          {/* Only render the carousel if movies are fetched */}
          <Carousel opts={{ align: "start" }} className="w-full max-w-sm">
            <CarouselContent>
              {movies.map((movie) => (
                <CarouselItem key={movie.id} className="md:basis-1/2 lg:basis-1/3">
                  <div className="p-1">
                    <Card>
                      <CardContent className="flex aspect-square items-center justify-center p-6">
                        {/* Display movie image with a fallback image if not available */}
                        <img
                          src={movie.imageString || "/path/to/placeholder-image.jpg"} // Placeholder image when no image is available
                          alt={movie.title}
                          className="w-full h-full object-cover"
                        />
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
        <div className="mt-4 text-center text-gray-500">No movies found in this category.</div>
      )}
    </div>
  );
}
