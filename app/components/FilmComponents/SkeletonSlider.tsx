"use client"

import { Skeleton } from "@/components/ui/skeleton"
import { TextLoop } from "@/components/ui/text-loop"
import { 
  Carousel, 
  CarouselContent, 
  CarouselItem, 
  CarouselNext, 
  CarouselPrevious 
} from "@/components/ui/carousel"

interface FilmSliderSkeletonProps {
  title: string;
  itemCount?: number;
}

const FilmSliderSkeleton = ({ title, itemCount = 5 }: FilmSliderSkeletonProps) => {
  const categoryTitles = [
    "Loading Films",
    "Just a Moment",
    "Getting Movies"
  ];

  return (
    <section className="py-4 sm:py-6 md:py-8 animate-pulse">
      <div className="mb-3 sm:mb-4 md:mb-6">
        <TextLoop
          interval={3}
          className="text-xl sm:text-2xl font-bold"
          transition={{ duration: 0.5 }}
          variants={{
            initial: { opacity: 0, y: 20 },
            animate: { opacity: 1, y: 0 },
            exit: { opacity: 0, y: -20 }
          }}
        >
          {categoryTitles.map((text, index) => (
            <h2 key={index} className="text-xl sm:text-2xl font-bold text-gray-300">
              {text}
            </h2>
          ))}
        </TextLoop>
      </div>
      <Carousel
        opts={{ align: "start" }}
        className="w-full"
      >
        <CarouselContent>
          {Array(itemCount).fill(0).map((_, index) => (
            <CarouselItem key={index} className="basis-1/2 sm:basis-1/3 md:basis-1/3 lg:basis-1/4 xl:basis-1/5">
              <div className="relative overflow-hidden rounded-lg">
                <div className="aspect-[2/3] w-full relative">
                  <Skeleton className="object-cover transition-transform duration-300 group-hover:scale-105 rounded-lg" />
                </div>
                
                <div className="absolute bottom-0 left-0 right-0 p-2 sm:p-3 md:p-4">
                  <Skeleton className="h-3 sm:h-4 md:h-5 w-3/4 mb-2" />
                  <div className="flex items-center gap-1 sm:gap-2">
                    <Skeleton className="h-2 sm:h-3 w-8 sm:w-10" />
                    <div className="mx-1 sm:mx-2 h-2 w-1 bg-gray-300 rounded-full opacity-20" />
                    <Skeleton className="h-2 sm:h-3 w-10 sm:w-12" />
                    <div className="mx-1 sm:mx-2 h-2 w-1 bg-gray-300 rounded-full opacity-20" />
                    <div className="flex items-center">
                      <div className="mr-1 h-3 w-3 sm:h-4 sm:w-4 rounded-full bg-gray-300 opacity-20" />
                      <Skeleton className="h-2 sm:h-3 w-6 sm:w-8" />
                    </div>
                  </div>
                </div>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious className="hidden md:flex left-0 translate-x-0 opacity-40" />
        <CarouselNext className="hidden md:flex right-0 translate-x-0 opacity-40" />
      </Carousel>
    </section>
  );
};

export default FilmSliderSkeleton;
