"use client"

import React, { useEffect, useState, useCallback, ErrorInfo, Suspense } from "react"
import FilmSlider from "@/app/components/FilmComponents/DynamicFilmSlider" 
import FilmSliderFallback from "./FilmSliderFallback"


interface FilmSliderWrapperProps {
  title: string
  categoryFilter?: string
  limit?: number
  films?: any[]
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
const FilmSliderWrapper = (props: FilmSliderWrapperProps) => {
  const [error, setError] = useState<string | null>(null)
  const [key, setKey] = useState(0) // Used to force remount on retry

  const handleError = useCallback((error: Error) => {
    console.error("FilmSlider encountered an error:", error)
    setError(error.message || "An unexpected error occurred")
  }, [])

  const handleRetry = useCallback(() => {
    setError(null)
    setKey(prev => prev + 1) // Force remount of component
  }, [])

  // If there's an explicit error passed from child components
  if (error) {
    return (
      <FilmSliderFallback 
        {...props} 
        error={error} 
        retryFetch={handleRetry} 
      />
    )
  }

  return (
    <FilmSliderErrorBoundary
      fallback={
        <FilmSliderFallback 
          {...props} 
          error="Something went wrong while displaying films" 
          retryFetch={handleRetry}
        />
      }
      onError={handleError}
    >
      <Suspense fallback={<FilmSliderFallback {...props} />}>
        <FilmSlider key={key} {...props} />
      </Suspense>
    </FilmSliderErrorBoundary>
  )
}

export default FilmSliderWrapper