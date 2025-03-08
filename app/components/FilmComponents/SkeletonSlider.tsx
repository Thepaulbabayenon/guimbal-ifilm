"use client"


import React from "react"
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel"

interface FilmSliderSkeletonProps {
  title: string
  itemCount?: number
}

const FilmSliderSkeleton = ({ title, itemCount = 5 }: FilmSliderSkeletonProps) => {
  return (
    <section className="py-8">
      <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded mb-6 animate-pulse" />
      
      <Carousel
        opts={{
          align: "start",
          loop: true,
        }}
        className="relative"
      >
        <CarouselContent>
          {Array(itemCount).fill(0).map((_, index) => (
            <CarouselItem key={index} className="md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
              <div className="relative overflow-hidden rounded-lg">
                {/* Skeleton for the image */}
                <div className="aspect-[2/3] w-full bg-gray-300 dark:bg-gray-800 animate-pulse rounded-lg" />
                
                {/* Skeleton for the text content */}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2 animate-pulse" />
                  <div className="flex items-center mt-1 space-x-2">
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-10 animate-pulse" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3 animate-pulse" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-14 animate-pulse" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3 animate-pulse" />
                    <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-8 animate-pulse" />
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex left-0 translate-x-0" />
        <CarouselNext className="hidden md:flex right-0 translate-x-0" />
      </Carousel>
    </section>
  )
}

export default FilmSliderSkeleton