// This is a dynamic route page for film reviews where the filmId comes from the URL

import { Suspense } from 'react';
import FilmReviewsSection from '@/app/components/FilmComponents/FilmReviewSection'; // Adjust path if needed

// Mock function to get current user - replace with your actual auth logic
function getCurrentUser() {
  // In a real app, you'd get this from your authentication system
  // For now, return null (not logged in) or mock user data
  return null; 
  // Example logged in user:
  // return { id: "user123", name: "John Doe" };
}

interface FilmReviewsPageProps {
  params: {
    filmId: string;
  };
}

export default function FilmReviewsPage({ params }: FilmReviewsPageProps) {
  const { filmId } = params;
  
  // Get current user info
  const currentUser = getCurrentUser();
  
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-6">Film Reviews</h1>
      <Suspense fallback={<div>Loading reviews...</div>}>
        <FilmReviewsSection filmId={filmId} currentUser={currentUser} />
      </Suspense>
    </div>
  );
}