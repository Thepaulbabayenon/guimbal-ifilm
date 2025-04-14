"use client";
import React, { useState } from 'react';
import Link from 'next/link'; // Assuming Next.js for linking

const FAQPage: React.FC = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const toggleFAQ = (index: number) => {
        setOpenIndex(openIndex === index ? null : index);
    };

    // --- FAQs Relevant to the iFilm Streaming Platform ---
    const allFaqs = [
        // Account & Profile
        { id: 1, category: "Account", question: "How do I sign up for an account?", answer: "Click the 'Sign Up' button on the homepage or login page. You can register using your email address and a password, or sign up quickly using your Google account." },
        { id: 2, category: "Account", question: "How do I reset my password?", answer: "Click on 'Forgot Password?' on the Sign In page. Enter your registered email address, and we'll send you a link to reset your password." },
        { id: 3, category: "Account", question: "Can I create multiple user profiles?", answer: "Yes! You can create multiple profiles under one account, each with its own viewing history and recommendations. Go to your Account settings to manage profiles." },
        // Streaming & Playback
        { id: 4, category: "Streaming", question: "What devices can I watch films on?", answer: "Our platform is accessible via web browsers on desktops, laptops, tablets, and smartphones. Ensure your browser is up-to-date for the best experience." },
        { id: 5, category: "Streaming", question: "Why is the video buffering or not playing smoothly?", answer: "Buffering issues are often related to internet connection speed. Try lowering the video quality setting in the player or check your network connection. If the problem persists, contact support." },
        { id: 6, category: "Streaming", question: "Are the films downloadable?", answer: "No, films are currently available for streaming only to protect the rights of the filmmakers. Downloading content is not permitted." },
        // Recommendations
        { id: 7, category: "Recommendations", question: "How does the recommendation system work?", answer: "Our custom hybrid algorithm analyzes your viewing history, ratings you give, films you add to your watchlist, and compares your preferences with similar users. It also considers film characteristics like genre and director to suggest films you might like." },
        { id: 8, category: "Recommendations", question: "Can I improve my recommendations?", answer: "Yes! The more you watch, rate films, and interact with the platform (like adding to watchlist), the better our algorithm becomes at suggesting relevant content for you." },
        // Content & Films
        { id: 9, category: "Content", question: "Where do the films come from?", answer: "The films on this platform are primarily sourced from the archives of the Guimbal iFilm Society, showcasing nearly two decades of local filmmaking talent from Guimbal, Iloilo." },
        { id: 10, category: "Content", question: "How often is new content added?", answer: "New films, especially from the annual Guimbal Film Festival, are added regularly. We also aim to digitize and add older films from the archive over time." },
         { id: 11, category: "Content", question: "How can filmmakers submit their work?", answer: "Currently, the platform features films from the Guimbal iFilm Society's archive. Information about future submission opportunities for the festival or platform will be announced on our Blog and social media channels." },
    ];

    const filteredFaqs = allFaqs.filter(faq =>
        faq.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faq.answer.toLowerCase().includes(searchTerm.toLowerCase())
    );

    // Dynamically generate categories and counts based on filtered FAQs
    const categories = Array.from(new Set(allFaqs.map(faq => faq.category)))
        .map(categoryName => ({
            name: categoryName,
            count: allFaqs.filter(faq => faq.category === categoryName).length
        }))
        .sort((a, b) => a.name.localeCompare(b.name)); // Sort categories alphabetically

    // Add "All FAQs" category
    categories.unshift({ name: "All FAQs", count: allFaqs.length });

    // Note: Pagination logic is simplified here. Real pagination needs state for current page.
    const itemsPerPage = 6;
    const paginatedFaqs = filteredFaqs.slice(0, itemsPerPage); // Show first page

    return (
        <div className="min-h-screen bg-gray-900 text-white py-12"> {/* Dark theme */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">Frequently Asked Questions</h1>
                    <p className="mt-4 text-xl text-gray-400 max-w-2xl mx-auto">
                        Find answers to common questions about the iFilm Streaming Platform
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Categories Sidebar */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-800 rounded-xl shadow-lg p-6"> {/* Darker card */}
                            <h2 className="text-lg font-bold text-white mb-4">Categories</h2>
                            <ul className="space-y-2">
                                {categories.map((category, index) => (
                                    <li key={index}>
                                        {/* Basic filtering simulation - clicking category won't filter list in this example */}
                                        <a
                                            href="#"
                                            onClick={(e) => { e.preventDefault(); alert(`Category filtering requires state management to update the FAQ list based on '${category.name}'.`); }}
                                            className={`flex justify-between items-center py-2 px-3 rounded-lg ${
                                                index === 0 // Highlight "All FAQs" for now
                                                    ? 'bg-red-900/30 text-red-300 font-medium'
                                                    : 'text-gray-300 hover:bg-gray-700'
                                            }`}
                                        >
                                            <span>{category.name}</span>
                                            <span className="bg-gray-700 text-gray-300 text-xs font-medium px-2 py-1 rounded-full">
                                                {category.count}
                                            </span>
                                        </a>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="mt-8 bg-red-900/30 border border-red-800 rounded-xl p-6"> {/* Themed help box */}
                            <h3 className="font-medium text-red-300 mb-2">Need more help?</h3>
                            <p className="text-sm text-red-400 mb-4">
                                Can't find what you're looking for? Contact our support team.
                            </p>
                            <Link href="/contact" passHref>
                               <button className="inline-flex items-center justify-center w-full bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm font-medium">
                                    Contact Support
                               </button>
                            </Link>
                        </div>
                    </div>

                    {/* FAQ Accordion */}
                    <div className="lg:col-span-3">
                        <div className="bg-gray-800 rounded-xl shadow-lg overflow-hidden"> {/* Darker card */}
                            {/* Search Bar */}
                            <div className="p-4 border-b border-gray-700">
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Search FAQs..."
                                        value={searchTerm}
                                        onChange={(e) => setSearchTerm(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-600 bg-gray-700 text-white rounded-lg focus:ring-red-500 focus:border-red-500"
                                    />
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                </div>
                            </div>

                            {/* FAQ Items */}
                            <ul className="divide-y divide-gray-700">
                                {paginatedFaqs.length > 0 ? paginatedFaqs.map((faq, index) => (
                                    <li key={faq.id} className="p-0">
                                        <button
                                            onClick={() => toggleFAQ(index)}
                                            className="w-full px-6 py-4 flex justify-between items-center hover:bg-gray-700 transition-colors focus:outline-none"
                                        >
                                            <span className="font-medium text-white text-left">{faq.question}</span>
                                            <svg
                                                className={`h-5 w-5 text-gray-400 transform transition-transform ${openIndex === index ? 'rotate-180' : ''}`}
                                                xmlns="http://www.w3.org/2000/svg"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                            </svg>
                                        </button>
                                        <div
                                            className={`transition-all duration-300 ease-in-out overflow-hidden ${
                                                openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                                            }`}
                                            style={{ transitionProperty: 'max-height, opacity' }} // Ensure smooth transition
                                        >
                                            <div className="px-6 pb-4 text-gray-300 prose prose-invert max-w-none"> {/* Added prose for better text formatting */}
                                                {faq.answer}
                                            </div>
                                        </div>
                                    </li>
                                )) : (
                                    <li className="p-6 text-center text-gray-400">No FAQs found matching your search.</li>
                                )}
                            </ul>

                            {/* Pagination (Placeholder Controls) */}
                             <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between">
                                <div className="text-sm text-gray-400">
                                     Showing <span className="font-medium">1-{paginatedFaqs.length}</span> of <span className="font-medium">{filteredFaqs.length}</span> results
                                </div>
                                <div className="flex space-x-2">
                                    <button onClick={() => alert('Pagination requires state management.')} className="px-3 py-1 border border-gray-600 rounded-md text-sm text-gray-400 hover:bg-gray-700 disabled:opacity-50" disabled> {/* Example disabled state */}
                                        Previous
                                    </button>
                                    <button onClick={() => alert('Pagination requires state management.')} className="px-3 py-1 border border-gray-600 rounded-md text-sm text-gray-400 hover:bg-gray-700">
                                        Next
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FAQPage;