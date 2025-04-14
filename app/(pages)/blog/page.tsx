'use client'; // Add this at the top to mark as a Client Component

import React from 'react';

const BlogPage: React.FC = () => {
    // --- Sample Blog Posts Relevant to Guimbal iFilm Society ---
    const blogPosts = [
        {
            id: 1,
            title: "Spotlight: Award-Winning Short Film 'Ang Pagtukad'",
            author: "Guimbal iFilm Society",
            date: "July 15, 2025",
            content: "Dive deep into the making of 'Ang Pagtukad', the acclaimed short film from last year's festival. Featuring interviews with the director and cast, exploring the themes and challenges of bringing this local story to life."
        },
        {
            id: 2,
            title: "Announcing the 20th Guimbal Film Festival Dates!",
            author: "Festival Committee",
            date: "July 10, 2025",
            content: "Get ready! We're excited to announce the dates for the landmark 20th Guimbal Film Festival. Find out more about the submission deadlines, event schedule, and how you can participate in celebrating two decades of local filmmaking."
        },
        {
            id: 3,
            title: "Behind the Lens: A Conversation with Director Maria Santos",
            author: "Platform Team",
            date: "July 5, 2025",
            content: "We sat down with emerging filmmaker Maria Santos to discuss her creative process, inspirations, and her latest film now streaming exclusively on our platform. Learn about her journey within the Guimbal iFilm Society."
        }
    ];

    const handleLoadMore = () => {
        // Placeholder: In a real app, this would fetch more posts from a backend API
        console.log("Load More button clicked - requires backend integration");
        alert("Functionality to load more posts requires backend integration.");
    };

    const handleReadMore = (e: React.MouseEvent, postId: number) => {
        e.preventDefault();
        alert(`Read More for post ${postId} - requires specific post pages.`);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white py-12">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">iFilm Society Blog</h1>
                    <p className="mt-4 text-xl text-gray-400 max-w-2xl mx-auto">
                        News, Insights, and Stories from the Guimbal Filmmaking Community
                    </p>
                </div>

                <div className="space-y-8">
                    {blogPosts.map(post => (
                        <div key={post.id} className="bg-gray-800 rounded-xl shadow-lg overflow-hidden transition-all hover:shadow-red-900/50">
                            <div className="p-8">
                                <div className="flex items-center mb-4 text-sm text-gray-400">
                                    <span>{post.date}</span>
                                    <span className="mx-2">•</span>
                                    <span>By {post.author}</span>
                                </div>

                                <h2 className="text-2xl font-bold text-white mb-4 hover:text-red-500 transition-colors">
                                    {post.title}
                                </h2>

                                <p className="text-gray-300 mb-5 leading-relaxed">
                                    {post.content}
                                </p>

                                <div className="mt-6">
                                    <a 
                                        href="#" 
                                        onClick={(e) => handleReadMore(e, post.id)} 
                                        className="text-red-500 font-medium hover:text-red-400 transition-colors inline-flex items-center"
                                    >
                                        Read more
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </a>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-10 text-center">
                    <button
                        onClick={handleLoadMore}
                        className="bg-red-600 text-white border border-red-600 font-medium px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Load More Articles
                    </button>
                </div>
            </div>
        </div>
    );
}

export default BlogPage;