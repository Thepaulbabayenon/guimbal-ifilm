'use client';

import { useState, useEffect } from 'react';
import { useUpdateContext } from '@/hooks/updateContext';

const RatingComponent = ({ movieId }: { movieId: number }) => {
  const { triggerUpdate } = useUpdateContext();
  const [rating, setRating] = useState<number | null>(null); // Store user's rating
  const [loading, setLoading] = useState<boolean>(true);

  const fetchRating = async () => {
    try {
      const response = await fetch(`/api/ratings/${movieId}`, {
        headers: { userId: 'user-id-placeholder' }, // Replace with actual user ID from auth/session
      });
      const data = await response.json();
      if (response.ok) {
        setRating(data.rating);
      } else {
        console.error('Error fetching rating:', data.error);
      }
    } catch (error) {
      console.error('Error fetching rating:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRating = async (newRating: number) => {
    try {
      await fetch(`/api/ratings/${movieId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          userId: 'user-id-placeholder', // Replace with actual user ID
        },
        body: JSON.stringify({ rating: newRating }),
      });

      setRating(newRating);
      triggerUpdate(); // Notify other components to refresh
    } catch (error) {
      console.error('Error submitting rating:', error);
    }
  };

  useEffect(() => {
    fetchRating();
  }, [movieId]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="rating-component">
      <h3>Your Rating: {rating || 'Not Rated Yet'}</h3>
      <div className="rating-buttons">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            onClick={() => handleRating(star)}
            className={star === rating ? 'selected' : ''}
          >
            {star} ★
          </button>
        ))}
      </div>
    </div>
  );
};

export default RatingComponent;
