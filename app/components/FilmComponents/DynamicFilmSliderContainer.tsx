"use client"

import React, { useEffect, useState } from "react"
import FilmSlider from "@/app/components/FilmSliders/DynamicFilmSlider"

// Define available film categories
export type FilmCategory = "comedy" | "drama" | "folklore" | "action" | "horror" | "documentary"

interface FilmSlidersProps {
  categories?: FilmCategory[]
  filmsPerCategory?: number
}

const FilmSliders = ({ 
  categories = ["comedy", "drama", "folklore", "action", "horror", "documentary"],
  filmsPerCategory = 10
}: FilmSlidersProps) => {
  const [availableCategories, setAvailableCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true)
        
        // This endpoint would return all available categories with films
        // Replace with your actual API endpoint
        const response = await fetch("/api/film-categories")
        
        if (!response.ok) {
          throw new Error("Failed to fetch categories")
        }
        
        const data = await response.json()
        
        // Filter categories based on the ones we want to display
        // and that actually have films
        const filteredCategories = categories.filter(cat => 
          data.categories.includes(cat.toLowerCase())
        )
        
        setAvailableCategories(filteredCategories)
      } catch (error) {
        console.error("Error fetching categories:", error)
        // Fallback to predefined categories
        setAvailableCategories(categories)
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [categories])

  if (loading) {
    return <div className="container mx-auto px-4 py-8">Loading film categories...</div>
  }

  // Format category name for display (capitalize first letter)
  const formatCategoryTitle = (category: string): string => {
    return category.charAt(0).toUpperCase() + category.slice(1) + " Movies"
  }

  return (
    <div className="container mx-auto px-4">
      {availableCategories.map((category) => (
        <FilmSlider
          key={category}
          title={formatCategoryTitle(category)}
          categoryFilter={category}
          limit={filmsPerCategory}
        />
      ))}
    </div>
  )
}

export default FilmSliders