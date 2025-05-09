// This is a static page for reviews - you'd need to get the filmId from somewhere
// such as query parameters, context, or a default value

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

export default function ReviewsPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  // Get filmId from query parameters or use a default
  const filmId = typeof searchParams?.filmId === 'string' 
    ? searchParams.filmId 
    : 'default-film-id';
  
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