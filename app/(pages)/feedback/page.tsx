"use client"
import React, { useState } from 'react';

const FeedbackPage: React.FC = () => {
    const [feedback, setFeedback] = useState<string>('');

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        console.log('Feedback submitted:', feedback);
        setFeedback('');
    };

    return (
        <div className="feedback-page">
            <h1>Feedback</h1>
            <form onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="feedback">Your Feedback</label>
                    <textarea
                        id="feedback"
                        name="feedback"
                        value={feedback}
                        onChange={(e) => setFeedback(e.target.value)}
                        rows={5}
                        required
                    ></textarea>
                </div>
                <button type="submit">Submit Feedback</button>
            </form>
        </div>
    );
}

export default FeedbackPage;
