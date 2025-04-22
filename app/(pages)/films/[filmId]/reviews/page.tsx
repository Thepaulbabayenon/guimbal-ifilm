import { Suspense } from 'react';
import FilmReviewsSection from '@/app/components/FilmComponents/FilmReviewSection';

// Mock function to get current user - replace with your actual auth logic
function getCurrentUser() {
  // In a real app, you'd get this from your authentication system
  return null;
}

// Make the component async
export default async function FilmReviewsPage({ 
  params 
}: { 
  params: { filmId: string } 
}) {
  const { filmId } = params;

  // Fetch current user (you can later replace this with your actual auth logic)
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

export async function generateMetadata({ 
  params 
}: { 
  params: { filmId: string } 
}) {
  return {
    title: `Reviews for Film ${params.filmId}`,
    description: `User reviews and ratings for film ${params.filmId}`,
  };
}