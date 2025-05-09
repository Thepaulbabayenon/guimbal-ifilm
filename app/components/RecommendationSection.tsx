"use client";

import React, { useState, useEffect } from "react";
import { Suspense } from "react";
import { LoadingSpinner } from "@/app/components/LoadingSpinner";
import { TextLoop } from "@/components/ui/text-loop";
import { BrainCircuit, ChevronLeft, ChevronRight } from "lucide-react"; 

interface RecommendationGroup {
  reason: string;
  films: Film[];
  isAIEnhanced?: boolean;
  isCustomCategory?: boolean;
}

interface Film {
  id: number;
  imageUrl: string;
  title: string;
  ageRating?: number;
  duration: number;
  overview?: string;
  releaseYear: number;
  videoSource?: string;
  category?: string;
  trailerUrl?: string;
  averageRating: number | null;
  inWatchlist?: boolean;
  watchlistId?: string | null;
}

interface RecommendationSectionProps {
  recommendations: RecommendationGroup[];
  loading: boolean;
  error: string | null;
  FilmSliderComponent: React.ComponentType<any>;
  isMobile: boolean; // Added the isMobile prop to the interface
}

const RecommendationSection = ({ recommendations, loading, error, FilmSliderComponent, isMobile }: RecommendationSectionProps) => {
  const [selectedGroup, setSelectedGroup] = useState<number>(0);
  
  // Navigate to previous recommendation group
  const goToPrevious = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedGroup(prev => (prev - 1 + recommendations.length) % recommendations.length);
  };
  
  // Navigate to next recommendation group
  const goToNext = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSelectedGroup(prev => (prev + 1) % recommendations.length);
  };
  if (loading) {
    return (
      <div className="h-[240px] flex items-center justify-center mb-10">
        <LoadingSpinner />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="py-4 px-6 bg-red-900/20 rounded-lg text-red-400 text-center mb-10">
        {error}
      </div>
    );
  }
  
  if (!recommendations || recommendations.length === 0) {
    return null;
  }

  // Force selectedGroup to be valid
  const validSelectedGroup = Math.min(Math.max(0, selectedGroup), recommendations.length - 1);

  return (
    <div className="mb-10">
      <div className="flex justify-between items-center mb-3 sm:mb-4 md:mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-400">
          <TextLoop interval={4}>
            {["RECOMMENDED FOR YOU", "PERSONALIZED PICKS", "TAILORED FOR YOU"].map((text, i) => (
              <span key={`recommendations-${i}`}>{text}</span>
            ))}
          </TextLoop>
        </h1>
        
        {recommendations.length > 1 && !isMobile && (
          <div className="flex items-center gap-2">
            <button 
              onClick={goToPrevious}
              className="p-2 rounded-full bg-gray-800/50 text-gray-300 hover:bg-gray-700/70 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Previous recommendations"
              type="button"
            >
              <ChevronLeft size={20} />
            </button>
            <button 
              onClick={goToNext}
              className="p-2 rounded-full bg-gray-800/50 text-gray-300 hover:bg-gray-700/70 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
              aria-label="Next recommendations"
              type="button"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
      
      {recommendations.length > 1 && !isMobile && (
        <div className="flex flex-wrap gap-2 mb-4">
          {recommendations.map((group, idx) => (
            <button
              key={`rec-tab-${idx}`}
              onClick={() => setSelectedGroup(idx)}
              className={`px-3 py-1.5 rounded-full text-sm transition-all ${
                validSelectedGroup === idx
                  ? "bg-blue-600 text-white font-medium"
                  : "bg-gray-800/50 text-gray-300 hover:bg-gray-700/70"
              }`}
              type="button"
            >
              <span className="flex items-center gap-1.5">
                {group.isAIEnhanced && <BrainCircuit size={14} className="text-blue-300" />}
                <span className="truncate max-w-[180px]">
                  {group.reason || `Recommendation Set ${idx + 1}`}
                </span>
              </span>
            </button>
          ))}
        </div>
      )}
      
      <div className="relative">
        {recommendations.map((group, idx) => (
          <div 
            key={`rec-content-${idx}`}
            className={`transition-all duration-500 ${
              validSelectedGroup === idx 
                ? "opacity-100 z-10 relative" 
                : "opacity-0 absolute inset-0 z-0 pointer-events-none"
            }`}
          >
            {group.isAIEnhanced && (
              <div className="flex items-center gap-1.5 text-blue-400 text-sm mb-2">
                <BrainCircuit size={16} />
                <span>AI-enhanced recommendation</span>
              </div>
            )}
            
            <Suspense fallback={<div className="h-[240px] flex items-center justify-center"><LoadingSpinner /></div>}>
              <FilmSliderComponent
                title={group.reason || "Recommended Films"}
                filmsData={group.films}
                isAIEnhanced={group.isAIEnhanced}
                isMobile={isMobile} // Pass isMobile to the FilmSliderComponent
              />
            </Suspense>
          </div>
        ))}
      </div>
      
      {/* Navigation dots for mobile */}
      {recommendations.length > 1 && (isMobile || true) && (
        <div className="flex justify-center gap-1.5 mt-4">
          {recommendations.map((_, idx) => (
            <button
              key={`nav-dot-${idx}`}
              onClick={() => setSelectedGroup(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                validSelectedGroup === idx ? "bg-blue-500 w-4" : "bg-gray-600 hover:bg-gray-500"
              }`}
              aria-label={`Go to recommendation set ${idx + 1}`}
              type="button"
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecommendationSection;
