"use client"
import Link from 'next/link';
import React, { useState, useEffect } from 'react';
import { FiStar, FiSend, FiUser, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';

// Interface for a single review
interface Review {
    id: string; // Use string for potential DB IDs
    userName: string; // Or userId if users are logged in
    userId?: string; // Optional: if reviews are linked to user accounts
    rating: number; // 1-5
    comment: string;
    createdAt: Date; // Add timestamp
}

// Props for the component, including the film ID
interface FilmReviewsSectionProps {
    filmId: string; 
    currentUser?: { id: string; name: string } | null;
}

const FilmReviewsSection: React.FC<FilmReviewsSectionProps> = ({ filmId, currentUser }) => {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [newReviewRating, setNewReviewRating] = useState<number>(0);
    const [newReviewComment, setNewReviewComment] = useState<string>('');
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [submitStatus, setSubmitStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

    // --- Fetch Reviews (Placeholder) ---
    useEffect(() => {
        const fetchReviews = async () => {
            setIsLoading(true);
            setError(null);
            try {
                // --- Replace with your actual API call ---
                console.log(`Fetching reviews for film ID: ${filmId}`);
                // Example: const response = await fetch(`/api/films/${filmId}/reviews`);
                // if (!response.ok) throw new Error('Failed to fetch reviews');
                // const data = await response.json();

                // --- Placeholder Data ---
                await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate delay
                const placeholderData: Review[] = [
                     { id: 'r1', userName: "MovieBuff123", rating: 4, comment: "A compelling local story with great performances!", createdAt: new Date(Date.now() - 86400000 * 2) }, // 2 days ago
                     { id: 'r2', userName: "GuimbalFan", rating: 5, comment: "Must watch! Shows the talent within our community.", createdAt: new Date(Date.now() - 86400000) }, // 1 day ago
                     { id: 'r3', userName: "CriticMind", rating: 3, comment: "Good effort, pacing felt a bit slow in the middle.", createdAt: new Date() }
                ];
                setReviews(placeholderData);
                // --- End Placeholder ---

            } catch (err) {
                setError(err instanceof Error ? err.message : 'An unknown error occurred');
                console.error("Error fetching reviews:", err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchReviews();
    }, [filmId]); // Refetch if filmId changes

    // --- Handle Rating Change ---
    const handleRatingHover = (index: number) => {
        // Optional: visual feedback on hover
    };
    const handleRatingClick = (rating: number) => {
        setNewReviewRating(rating);
    };

    // --- Handle Comment Change ---
    const handleCommentChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
        setNewReviewComment(event.target.value);
    };

    // --- Handle Form Submission ---
    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (newReviewRating === 0 || !newReviewComment.trim() || !currentUser) {
             setSubmitStatus({ type: 'error', message: 'Please provide a rating and comment.' });
             setTimeout(() => setSubmitStatus(null), 3000);
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus(null);

        const reviewData = {
            filmId: filmId,
            userId: currentUser.id, // Assuming user ID is available
            userName: currentUser.name, // Assuming user name is available
            rating: newReviewRating,
            comment: newReviewComment.trim(),
        };

        try {
            // --- Replace with your actual API call to submit review ---
            console.log("Submitting review:", reviewData);
            // Example: const response = await fetch(`/api/films/${filmId}/reviews`, {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify(reviewData),
            // });
            // if (!response.ok) throw new Error('Failed to submit review');
            // const submittedReview = await response.json();

            // --- Placeholder Success ---
            await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate delay
             const submittedReview: Review = {
                 ...reviewData,
                 id: `r${Date.now()}`, // Generate temporary ID
                 createdAt: new Date(),
             };
             setReviews([submittedReview, ...reviews]); // Add new review to the top
             setNewReviewRating(0);
             setNewReviewComment('');
             setSubmitStatus({ type: 'success', message: 'Review submitted successfully!' });
             // --- End Placeholder ---


        } catch (err) {
             const message = err instanceof Error ? err.message : 'Could not submit review.';
             setSubmitStatus({ type: 'error', message: message });
             console.error("Error submitting review:", err);
        } finally {
            setIsSubmitting(false);
            // Clear status message after a few seconds
            setTimeout(() => setSubmitStatus(null), 4000);
        }
    };

    return (
        // Use appropriate wrapper (e.g., section) where this component is placed
        <div className="mt-12 bg-gray-800 p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-white mb-6 border-b border-gray-700 pb-3">Reviews & Ratings</h2>

            {/* Add Review Form (Show only if user is logged in) */}
            {currentUser ? (
                <form onSubmit={handleSubmit} className="mb-8 p-4 bg-gray-700 rounded">
                    <h3 className="text-lg font-semibold text-white mb-3">Leave Your Review</h3>
                     {submitStatus && (
                        <div className={`mb-4 p-3 rounded text-sm ${submitStatus.type === 'success' ? 'bg-green-900/50 text-green-300 border border-green-700' : 'bg-red-900/50 text-red-300 border border-red-700'} flex items-center`}>
                            {submitStatus.type === 'success' ? <FiCheckCircle className="mr-2"/> : <FiAlertCircle className="mr-2"/>}
                            {submitStatus.message}
                        </div>
                     )}
                    <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-300 mb-1">Your Rating</label>
                        <div className="flex space-x-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <FiStar
                                    key={star}
                                    className={`h-6 w-6 cursor-pointer transition-colors ${
                                        star <= newReviewRating ? 'text-yellow-400 fill-current' : 'text-gray-500 hover:text-yellow-300'
                                    }`}
                                    onClick={() => handleRatingClick(star)}
                                    onMouseEnter={() => handleRatingHover(star)} // Optional visual feedback
                                    onMouseLeave={() => {}} // Optional visual feedback
                                />
                            ))}
                        </div>
                    </div>
                    <div className="mb-4">
                        <label htmlFor="comment" className="block text-sm font-medium text-gray-300 mb-1">Your Comment</label>
                        <textarea
                            id="comment"
                            name="comment"
                            rows={4}
                            value={newReviewComment}
                            onChange={handleCommentChange}
                            required
                            disabled={isSubmitting}
                            className="block w-full rounded-md bg-gray-600 border-gray-500 text-white shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm placeholder-gray-400"
                            placeholder={`Share your thoughts on the film...`}
                        ></textarea>
                    </div>
                    <button
                        type="submit"
                        disabled={isSubmitting || newReviewRating === 0 || !newReviewComment.trim()}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <FiSend className="mr-2 h-4 w-4" />
                        {isSubmitting ? 'Submitting...' : 'Submit Review'}
                    </button>
                </form>
            ) : (
                 <div className="mb-8 p-4 bg-gray-700 rounded text-center text-gray-400 text-sm">
                    <Link href="/sign-in" className="text-red-400 hover:underline font-medium">Sign in</Link> to leave a review.
                 </div>
            )}

            {/* Display Reviews */}
            <div className="reviews-list space-y-6">
                {isLoading && <p className="text-gray-400 text-center">Loading reviews...</p>}
                {error && <p className="text-red-400 text-center">Error loading reviews: {error}</p>}
                {!isLoading && !error && reviews.length === 0 && (
                    <p className="text-gray-400 text-center">Be the first to review this film!</p>
                )}
                {!isLoading && !error && reviews.map(review => (
                    <div key={review.id} className="review bg-gray-700 p-4 rounded-lg shadow">
                        <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center">
                                <FiUser className="h-5 w-5 text-gray-400 mr-2"/>
                                <span className="font-semibold text-white">{review.userName}</span>
                             </div>
                            <div className="flex items-center">
                                 {[1, 2, 3, 4, 5].map((star) => (
                                    <FiStar
                                        key={star}
                                        className={`h-4 w-4 ${star <= review.rating ? 'text-yellow-400 fill-current' : 'text-gray-500'}`}
                                    />
                                ))}
                            </div>
                        </div>
                        <p className="text-gray-300 text-sm mb-1">{review.comment}</p>
                        <p className="text-xs text-gray-500 text-right">
                            {review.createdAt.toLocaleDateString()}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default FilmReviewsSection;