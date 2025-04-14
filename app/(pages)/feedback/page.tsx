"use client";
import React, { useState } from 'react';
import { BiSend, BiCheckCircle } from 'react-icons/bi';
import Link from 'next/link'; // Assuming Next.js

const FeedbackPage: React.FC = () => {
    const [feedback, setFeedback] = useState<string>('');
    const [name, setName] = useState<string>(''); // Optional: Keep if you want user's name
    const [email, setEmail] = useState<string>(''); // Optional: Keep for follow-up
    const [category, setCategory] = useState<string>('general');
    const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [termsAccepted, setTermsAccepted] = useState<boolean>(false);


    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        if (!termsAccepted) {
            alert("Please accept the terms to submit feedback.");
            return;
        }

        setIsSubmitting(true);
        console.log('Feedback submitted:', { name, email, category, feedback });

        // --- Placeholder for actual feedback submission ---
        // In a real application, you would send this data to your backend API
        // e.g., await fetch('/api/feedback', { method: 'POST', body: JSON.stringify({ name, email, category, feedback }) });
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay


        setIsSubmitted(true);
        setIsSubmitting(false);

        // Reset form after successful submission simulation
        setFeedback('');
        setName('');
        setEmail('');
        setCategory('general');
        setTermsAccepted(false);

        // Hide success message after a few seconds
        setTimeout(() => {
            setIsSubmitted(false);
        }, 5000);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white py-12"> {/* Dark theme */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">Share Your Feedback</h1>
                    <p className="mt-4 text-xl text-gray-400 max-w-2xl mx-auto">
                        Help us improve the iFilm Streaming Platform. We value your opinion!
                    </p>
                </div>

                <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden"> {/* Darker card */}
                    {isSubmitted ? (
                        <div className="p-8 text-center">
                            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-green-900/50 mb-6"> {/* Themed success */}
                                <BiCheckCircle className="h-10 w-10 text-green-400" />
                            </div>
                            <h2 className="text-2xl font-bold text-white mb-2">Thank You!</h2>
                            <p className="text-gray-300">
                                Your feedback has been submitted. We appreciate you taking the time to help us improve the platform.
                            </p>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
                            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                                <div className="col-span-1">
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">
                                        Your Name (Optional)
                                    </label>
                                    <input
                                        id="name"
                                        name="name"
                                        type="text"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        disabled={isSubmitting}
                                        className="block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                                        placeholder="Your Name"
                                    />
                                </div>

                                <div className="col-span-1">
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                                        Email Address (Optional)
                                    </label>
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={isSubmitting}
                                        className="block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                                        placeholder="you@example.com"
                                    />
                                     <p className="mt-1 text-xs text-gray-500">Needed only if you'd like a potential follow-up.</p>
                                </div>
                            </div>

                            <div>
                                <label htmlFor="category" className="block text-sm font-medium text-gray-300 mb-1">
                                    Feedback Category
                                </label>
                                <select
                                    id="category"
                                    name="category"
                                    value={category}
                                    onChange={(e) => setCategory(e.target.value)}
                                    disabled={isSubmitting}
                                    className="block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                                >
                                    <option value="general">General Feedback</option>
                                    <option value="usability">Platform Usability</option>
                                    <option value="recommendations">Recommendation Quality</option>
                                    <option value="content">Film Content/Availability</option>
                                    <option value="bug">Report a Bug/Technical Issue</option>
                                    <option value="feature">Feature Suggestion</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            <div>
                                <label htmlFor="feedback" className="block text-sm font-medium text-gray-300 mb-1">
                                    Your Feedback
                                </label>
                                <textarea
                                    id="feedback"
                                    name="feedback"
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    rows={5}
                                    required
                                    disabled={isSubmitting}
                                    className="block w-full rounded-md bg-gray-700 border-gray-600 text-white shadow-sm focus:border-red-500 focus:ring-red-500 sm:text-sm"
                                    placeholder="Please share your thoughts, suggestions, or describe any issues..."
                                ></textarea>
                            </div>

                            <div className="flex items-center">
                                <input
                                    id="terms"
                                    name="terms"
                                    type="checkbox"
                                    checked={termsAccepted}
                                    onChange={(e) => setTermsAccepted(e.target.checked)}
                                    disabled={isSubmitting}
                                    className="h-4 w-4 rounded border-gray-600 bg-gray-700 text-red-600 focus:ring-red-500"
                                />
                                <label htmlFor="terms" className="ml-2 block text-sm text-gray-400">
                                    I acknowledge my feedback may be used to improve the platform. {/* Simplified terms */}
                                     {/* Link to a real Privacy Policy if available */}
                                     {/* See our <Link href="/privacy-policy" className="text-red-400 hover:text-red-300">Privacy Policy</Link>. */}
                                </label>
                            </div>

                            <div>
                                <button
                                    type="submit"
                                    disabled={isSubmitting || !termsAccepted}
                                    className={`inline-flex items-center justify-center w-full sm:w-auto px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white ${
                                        (isSubmitting || !termsAccepted) ? 'bg-gray-500 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700'
                                     } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500 transition-colors`}
                                >
                                    <BiSend className="mr-2 h-5 w-5" />
                                    {isSubmitting ? 'Submitting...' : 'Submit Feedback'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>

                 <div className="bg-red-900/30 border border-red-800 rounded-xl p-6 mt-8 text-center"> {/* Themed info box */}
                    <h3 className="font-medium text-red-300 mb-2">We're Listening!</h3>
                    <p className="text-sm text-red-400">
                        Your feedback is crucial for making the iFilm platform better for everyone. For urgent account issues or technical support, please use the <Link href="/contact" className="underline hover:text-red-300">Contact Us</Link> page.
                    </p>
                </div>
            </div>
        </div>
    );
}

export default FeedbackPage;