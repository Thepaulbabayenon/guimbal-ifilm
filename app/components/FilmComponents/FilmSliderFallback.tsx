"use client"

import React from "react"
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel"
import { Button } from "@/components/ui/button"
import { AlertCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface FilmSliderFallbackProps {
  title: string
  categoryFilter?: string
  limit?: number
  error?: string | null
  retryFetch?: () => void
}

const FilmSliderFallback = ({ 
  title, 
  categoryFilter,
  limit = 10, 
  error = null,
  retryFetch 
}: FilmSliderFallbackProps) => {
  
  
  const placeholderCount = limit > 5 ? 5 : limit
  const placeholders = Array(placeholderCount).fill(null)
  
  
  const displayTitle = categoryFilter 
    ? `${categoryFilter} Movies` 
    : "Popular Films"
  
  return (
    <section className="py-8">
      <div className="mb-6">
        <h2 className="text-2xl font-bold">{displayTitle}</h2>
      </div>
      
      {error ? (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription className="flex flex-col gap-4">
            <p>{error || "Failed to load films. Please try again later."}</p>
            {retryFetch && (
              <Button 
                variant="outline" 
                onClick={retryFetch}
                className="w-fit"
              >
                Try Again
              </Button>
            )}
          </AlertDescription>
        </Alert>
      ) : (
        <Carousel
          opts={{ align: "start" }}
          className="w-full"
        >
          <CarouselContent>
            {placeholders.map((_, index) => (
              <CarouselItem key={index} className="md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
                <div className="relative overflow-hidden rounded-lg animate-pulse">
                  <div className="aspect-[3/3] w-full bg-gray-300 dark:bg-gray-700"></div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <div className="h-4 bg-gray-200 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 dark:bg-gray-600 rounded w-1/2"></div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="hidden md:flex left-0 translate-x-0" />
          <CarouselNext className="hidden md:flex right-0 translate-x-0" />
        </Carousel>
      )}
      
      {!error && (
        <div className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
          Loading content... If this persists, please refresh the page.
        </div>
      )}
    </section>
  )
}

export default FilmSliderFallback