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
import { useRouter } from "next/navigation";

// Helper function to fetch films based on category (if needed for additional functionality)
async function fetchFilmsByCategory(category: string) {
  const response = await fetch(`/api/films?category=${category}`);
  const data = await response.json();
  return data.films || [];
}

type DropdownProps = {
  categories: string[];
};

export function CategoryDropdown({ categories }: DropdownProps) {
  const router = useRouter(); // Initialize router for navigation
  const [isDropdownOpen, setIsDropdownOpen] = React.useState<boolean>(false); // Manage dropdown state

  // Handle category selection and navigation
  const handleSelect = (category: string) => {
    setIsDropdownOpen(false); // Close dropdown
    router.push(`/home/films/category/${encodeURIComponent(category)}`); // Navigate to the dynamic route
  };
  

  // Toggle the dropdown visibility
  const toggleDropdown = () => {
    setIsDropdownOpen((prev) => !prev); // Toggle dropdown visibility
  };

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="outline"
            onClick={toggleDropdown}
            className="text-xs px-3 py-1 bg-opacity-80 bg-gray-700 hover:bg-opacity-90 text-gray-300 rounded-md transition-all"
          >
            Select a Category
          </Button>
        </DropdownMenuTrigger>
        {/* Dropdown Menu Content */}
        {isDropdownOpen && (
          <DropdownMenuContent className="w-44 bg-gray-800 bg-opacity-90 text-white rounded-lg shadow-lg">
            <DropdownMenuLabel className="text-sm text-gray-400">Categories</DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-gray-600" />
            {categories.map((category) => (
              <DropdownMenuItem
                key={category}
                onClick={() => handleSelect(category)}
                className="text-sm px-2 py-1 hover:bg-gray-700 rounded-md transition-all"
              >
                {category}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        )}
      </DropdownMenu>
    </div>
  );
}
