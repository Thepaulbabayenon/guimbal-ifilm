"use client"

import React, { useEffect, useState, useCallback, ErrorInfo, Suspense } from "react"
import dynamic from "next/dynamic"
import { LoadingSpinner } from "@/app/components/LoadingSpinner"

// Dynamically import FilmSlider with no SSR to avoid hydration issues
const FilmSlider = dynamic(
  () => import("@/app/components/FilmComponents/DynamicFilmSlider"),
  { ssr: false }
)

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

interface FilmSliderWrapperProps {
  title: string
  categoryFilter?: string
  limit?: number
  films?: Film[]
}

// Empty recommendations message component
const EmptyRecommendationsMessage = ({ title }: { title: string }) => {
  return (
    <div className="w-full py-6">
      <h2 className="mb-4 text-xl sm:text-2xl font-bold text-white">{title}</h2>
      <div className="w-full p-8 bg-gray-800/30 rounded-lg text-center">
        <p className="text-gray-300 mb-2">
          <span className="block text-lg font-semibold mb-2">Want personalized recommendations?</span>
          Watch more films or interact more with iFilm to get tailored suggestions.
        </p>
        <p className="text-gray-400 text-sm">
          Our recommendation system gets better the more you watch and rate films.
        </p>
      </div>
    </div>
  )
}

// Fallback component for loading and error states
const FilmSliderFallback = ({ 
  title, 
  error, 
  retryFetch 
}: { 
  title: string, 
  error?: string | null, 
  retryFetch?: () => void 
}) => {
  if (error) {
    return (
      <div className="w-full py-6">
        <h2 className="mb-4 text-xl sm:text-2xl font-bold text-white">{title}</h2>
        <div className="w-full p-4 text-center bg-gray-800/50 rounded-lg">
          <p className="text-red-400 mb-3">{error}</p>
          {retryFetch && (
            <button 
              onClick={retryFetch}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full py-6">
      <h2 className="mb-4 text-xl sm:text-2xl font-bold text-white">{title}</h2>
      <div className="w-full h-40 flex items-center justify-center">
        <LoadingSpinner />
      </div>
    </div>
  )
}

// Error boundary for the FilmSlider component
class FilmSliderErrorBoundary extends React.Component<
  { 
    children: React.ReactNode,
    fallback: React.ReactNode,
    onError?: (error: Error, info: ErrorInfo) => void
  }, 
  { hasError: boolean }
> {
  constructor(props: any) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError(_: Error) {
    return { hasError: true }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("FilmSlider error:", error, info)
    if (this.props.onError) {
      this.props.onError(error, info)
    }
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback
    }

    return this.props.children
  }
}

// Wrapper component that handles error states and provides fallback
const FilmSliderWrapper = ({ title, categoryFilter, limit, films }: FilmSliderWrapperProps) => {
  const [error, setError] = useState<string | null>(null)
  const [key, setKey] = useState(0) // Used to force remount on retry
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    // Safe way to check for client-side rendering
    setIsMounted(true)
    
    // Reset error state on props change
    setError(null)
  }, [title, categoryFilter, limit])

  const handleError = useCallback((error: Error) => {
    console.error("FilmSlider encountered an error:", error)
    setError(error.message || "An unexpected error occurred")
  }, [])

  const handleRetry = useCallback(() => {
    setError(null)
    setKey(prev => prev + 1) 
  }, [])

  if (!isMounted) {
    return <FilmSliderFallback title={title} />
  }


  if (error) {
    return (
      <FilmSliderFallback 
        title={title} 
        error={error} 
        retryFetch={handleRetry} 
      />
    )
  }

  
  const isRecommendationsSection = title.toLowerCase().includes('recommend') || 
                                   title.toLowerCase().includes('for you') ||
                                   title.toLowerCase().includes('based on');
                                   
  const hasEmptyRecommendations = isRecommendationsSection && 
                                 films && 
                                 films.length > 0 && 
                                 films.every(film => 
                                   !film.duration || 
                                   film.duration === 0 || 
                                   isNaN(film.duration)
                                 );

  // Show message for empty recommendations
  if (hasEmptyRecommendations) {
    return <EmptyRecommendationsMessage title={title} />
  }

  // Process films to ensure duration is valid
  const processedFilms = films?.map(film => ({
    ...film,
    // Ensure duration is a valid number
    duration: typeof film.duration === 'number' && !isNaN(film.duration) ? film.duration : 0
  }));

  // Safe props to pass to FilmSlider
  const safeProps = {
    title,
    categoryFilter,
    limit,
    filmsData: processedFilms || undefined
  }

  return (
    <FilmSliderErrorBoundary
      fallback={
        <FilmSliderFallback 
          title={title} 
          error="Something went wrong while displaying films" 
          retryFetch={handleRetry}
        />
      }
      onError={handleError}
    >
      <Suspense fallback={<FilmSliderFallback title={title} />}>
        <div className="film-slider-container">
          {/* Key forces remount when retry is clicked */}
          <FilmSlider key={key} {...safeProps} />
        </div>
      </Suspense>
    </FilmSliderErrorBoundary>
  )
}

export default FilmSliderWrapper