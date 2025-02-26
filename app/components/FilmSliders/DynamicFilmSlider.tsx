"use client"

import React, { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel"

// Film type definition based on your schema
interface Film {
  id: number
  imageString: string
  title: string
  age: number
  duration: number
  overview: string
  release: number
  videoSource: string
  category: string
  trailer: string
  createdAt: Date
  updatedAt: Date
  producer: string
  director: string
  coDirector: string
  studio: string
  rank: number
  averageRating: number | null
}

// Props for the FilmSlider component
interface FilmSliderProps {
  title: string
  categoryFilter?: string
  limit?: number
}

const FilmSlider = ({ title, categoryFilter, limit = 10 }: FilmSliderProps) => {
  const [films, setFilms] = useState<Film[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchFilms = async () => {
      try {
        setLoading(true)
        
        // Example API endpoint - replace with your actual data fetching
        const url = categoryFilter 
          ? `/api/films?category=${encodeURIComponent(categoryFilter)}&limit=${limit}`
          : `/api/films?limit=${limit}`
        
        const response = await fetch(url)
        
        if (!response.ok) {
          throw new Error(`Error fetching films: ${response.statusText}`)
        }
        
        const data = await response.json()
        setFilms(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load films")
        console.error("Error fetching films:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchFilms()
  }, [categoryFilter, limit])

  if (loading) {
    return <div className="w-full py-8 text-center">Loading films...</div>
  }

  if (error) {
    return <div className="w-full py-8 text-center text-red-500">Error: {error}</div>
  }

  if (films.length === 0) {
    return <div className="w-full py-8 text-center">No films found in this category.</div>
  }

  return (
    <section className="py-8">
      <h2 className="text-2xl font-bold mb-6">{title}</h2>
      
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="relative"
      >
        <CarouselContent>
          {films.map((film) => (
            <CarouselItem key={film.id} className="md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
              <Link href={`/film/${film.id}`}>
                <div className="relative overflow-hidden rounded-lg group">
                  <div className="aspect-[2/3] w-full relative">
                    <Image
                      src={film.imageString}
                      alt={film.title}
                      fill
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 33vw, 20vw"
                    />
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <h3 className="text-white font-medium text-sm md:text-base truncate">
                      {film.title}
                    </h3>
                    <div className="flex items-center text-xs text-gray-300 mt-1">
                      <span>{film.release}</span>
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
              </Link>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex left-0 translate-x-0" />
        <CarouselNext className="hidden md:flex right-0 translate-x-0" />
      </Carousel>
    </section>
  )
}

export default FilmSlider