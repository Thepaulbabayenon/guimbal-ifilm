import React from "react";

interface HomePageSkeletonProps {
  isMobile?: boolean;
}

const HomePageSkeleton: React.FC<HomePageSkeletonProps> = ({ isMobile = false }) => {
  // Adjust number of items to show based on mobile state
  const itemsToShow = isMobile ? 4 : 6;
  
  // Adjust grid classes based on mobile state
  const gridClasses = isMobile 
    ? "grid grid-flow-col auto-cols-[minmax(150px,1fr)] gap-3 overflow-x-hidden" 
    : "grid grid-flow-col auto-cols-[minmax(180px,1fr)] md:auto-cols-[minmax(200px,1fr)] gap-4 overflow-x-hidden";
  
  // Adjust hero height based on mobile state
  const heroHeight = isMobile 
    ? "h-[250px] md:h-[350px]" 
    : "h-[300px] md:h-[400px]";

  return (
    <div className="pt-16 lg:pt-20 pb-10 px-4 md:px-6 lg:px-8 animate-fadeIn">
      {/* Hero Video Section Skeleton */}
      <div className="mb-6 md:mb-8 lg:mb-10">
        <div className={`relative w-full ${heroHeight} rounded-xl bg-gray-800/40 animate-pulse overflow-hidden`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-gray-700/50 flex items-center justify-center">
              <svg 
                className="w-8 h-8 text-gray-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24" 
                xmlns="http://www.w3.org/2000/svg"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" 
                />
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" 
                />
              </svg>
            </div>
          </div>
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <div className="h-8 w-64 bg-gray-700/50 rounded mb-2"></div>
            <div className="h-4 w-96 bg-gray-700/50 rounded"></div>
          </div>
        </div>
      </div>

      {/* Recommendations Section Skeleton */}
      <div className="mb-10">
        <div className="h-8 w-64 bg-gray-700/40 rounded mb-6"></div>
        <div className={gridClasses}>
          {Array(itemsToShow).fill(0).map((_, i) => (
            <div key={`rec-${i}`} className="flex flex-col gap-2">
              <div className="aspect-[2/3] bg-gray-800/40 rounded-lg animate-pulse"></div>
              <div className="h-4 bg-gray-700/40 rounded w-3/4"></div>
              <div className="h-3 bg-gray-700/30 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Recently Added Section Skeleton */}
      <div className="mb-10">
        <div className="h-8 w-64 bg-gray-700/40 rounded mb-6"></div>
        <div className={gridClasses}>
          {Array(itemsToShow).fill(0).map((_, i) => (
            <div key={`recent-${i}`} className="flex flex-col gap-2">
              <div className="aspect-[2/3] bg-gray-800/40 rounded-lg animate-pulse"></div>
              <div className="h-4 bg-gray-700/40 rounded w-3/4"></div>
              <div className="h-3 bg-gray-700/30 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>

      {/* Film Categories Skeletons - 3 of them */}
      {Array(isMobile ? 2 : 3).fill(0).map((_, categoryIndex) => (
        <div key={`category-${categoryIndex}`} className="mb-10">
          <div className="h-8 w-64 bg-gray-700/40 rounded mb-6"></div>
          <div className={gridClasses}>
            {Array(itemsToShow).fill(0).map((_, i) => (
              <div key={`cat-${categoryIndex}-${i}`} className="flex flex-col gap-2">
                <div className="aspect-[2/3] bg-gray-800/40 rounded-lg animate-pulse"></div>
                <div className="h-4 bg-gray-700/40 rounded w-3/4"></div>
                <div className="h-3 bg-gray-700/30 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default HomePageSkeleton;