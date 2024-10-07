"use client"
import React, { useState } from 'react';

interface Review {
    id: number;
    userName: string;
    rating: number;
    comment: string;
}

const ReviewsPage: React.FC = () => {
    const [reviews, setReviews] = useState<Review[]>([
        { id: 1, userName: "John Doe", rating: 4, comment: "Great product, highly recommend!" },
        { id: 2, userName: "Jane Smith", rating: 5, comment: "Excellent service and fast delivery." }
    ]);

    const [newReview, setNewReview] = useState<Review>({ id: 0, userName: "", rating: 0, comment: "" });

    const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = event.target;
        setNewReview(prevReview => ({
            ...prevReview,
            [name]: value
        }));
    };

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const newId = reviews.length + 1;
        const reviewToAdd: Review = { ...newReview, id: newId };
        setReviews([...reviews, reviewToAdd]);
        setNewReview({ id: 0, userName: "", rating: 0, comment: "" });
    };

    return (
        <div className="reviews-page">
            <h1>Customer Reviews</h1>
            <div className="reviews-list">
                {reviews.map(review => (
                    <div key={review.id} className="review">
                        <h2>{review.userName}</h2>
                        <p><strong>Rating:</strong> {review.rating}</p>
                        <p>{review.comment}</p>
                    </div>
                ))}
            </div>
            <div className="add-review">
                <h2>Add Your Review</h2>
                <form onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label htmlFor="userName">Your Name</label>
                        <input
                            type="text"
                            id="userName"
                            name="userName"
                            value={newReview.userName}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="rating">Rating (1-5)</label>
                        <input
                            type="number"
                            id="rating"
                            name="rating"
                            min="1"
                            max="5"
                            value={newReview.rating}
                            onChange={handleInputChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="comment">Your Review</label>
                        <textarea
                            id="comment"
                            name="comment"
                            rows={5}
                            value={newReview.comment}
                            onChange={handleInputChange}
                            required
                        ></textarea>
                    </div>
                    <button type="submit">Submit Review</button>
                </form>
            </div>
        </div>
    );
}

export default ReviewsPage;
