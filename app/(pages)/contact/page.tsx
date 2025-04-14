'use client';
import React, { useState } from 'react';

const ContactPage: React.FC = () => {
    const [formState, setFormState] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitMessage, setSubmitMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormState({
            ...formState,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitMessage('');
        console.log('Form submitted:', formState);

        // --- Placeholder for actual form submission ---
        // In a real application, you would send this data to your backend API
        // e.g., await fetch('/api/contact', { method: 'POST', body: JSON.stringify(formState) });
        await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate network delay

        setSubmitMessage('Your message has been sent successfully! We will get back to you soon.');
        setIsSubmitting(false);
        setFormState({ name: '', email: '', subject: '', message: '' }); // Reset form

        // Hide message after a few seconds
        setTimeout(() => setSubmitMessage(''), 5000);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white py-12"> {/* Dark theme */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">Contact Us</h1>
                    <p className="mt-4 text-xl text-gray-400 max-w-2xl mx-auto">
                        Have questions about the platform, films, or the Guimbal iFilm Society? Reach out!
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Contact Info */}
                    <div className="lg:col-span-1">
                        <div className="bg-gray-800 rounded-xl shadow-lg p-8"> {/* Darker card */}
                            <h2 className="text-xl font-bold text-white mb-6">Contact Information</h2>

                            <div className="space-y-6 text-gray-300">
                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <svg className="h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-white font-medium">Phone</p>
                                        {/* Replace with actual number if available */}
                                        <p className="mt-1">(+63) XXX-XXX-XXXX (Placeholder)</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <svg className="h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-white font-medium">Email</p>
                                        {/* Use the provided or a platform-specific email */}
                                        <p className="mt-1">thebantayanfilmfestival@gmail.com <br/> or support@ifilmplatform.com (Placeholder)</p>
                                    </div>
                                </div>

                                <div className="flex items-start">
                                    <div className="flex-shrink-0">
                                        <svg className="h-6 w-6 text-red-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                    </div>
                                    <div className="ml-4">
                                        <p className="text-white font-medium">Address</p>
                                        <p className="mt-1 text-gray-300">Guimbal, Iloilo<br />Philippines, 5022</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-8 pt-8 border-t border-gray-700"> {/* Darker border */}
                                <h3 className="text-lg font-medium text-white mb-4">Follow Us</h3>
                                <div className="flex space-x-4">
                                    {/* Link directly to the known Facebook page */}
                                    <a href="https://www.facebook.com/bantayanfilmfestival" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-red-500">
                                        <span className="sr-only">Facebook</span>
                                        <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                                            <path fillRule="evenodd" d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z" clipRule="evenodd" />
                                        </svg>
                                    </a>
                                    {/* Add other relevant social media links if available */}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <div className="bg-gray-800 rounded-xl shadow-lg p-8"> {/* Darker card */}
                           {submitMessage && (
                                <div className="mb-6 p-4 bg-green-900/50 border border-green-800 rounded-lg text-green-200 text-center">
                                    {submitMessage}
                                </div>
                            )}
                            <form onSubmit={handleSubmit}>
                                <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
                                    <div className="sm:col-span-1">
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-300">
                                            Full Name
                                        </label>
                                        <div className="mt-1">
                                            <input
                                                type="text"
                                                name="name"
                                                id="name"
                                                value={formState.name}
                                                onChange={handleChange}
                                                disabled={isSubmitting}
                                                className="py-3 px-4 block w-full shadow-sm rounded-md bg-gray-700 border-gray-600 text-white focus:ring-red-500 focus:border-red-500"
                                                placeholder="Your Name"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-1">
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-300">
                                            Email
                                        </label>
                                        <div className="mt-1">
                                            <input
                                                type="email"
                                                name="email"
                                                id="email"
                                                value={formState.email}
                                                onChange={handleChange}
                                                disabled={isSubmitting}
                                                className="py-3 px-4 block w-full shadow-sm rounded-md bg-gray-700 border-gray-600 text-white focus:ring-red-500 focus:border-red-500"
                                                placeholder="you@example.com"
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label htmlFor="subject" className="block text-sm font-medium text-gray-300">
                                            Subject
                                        </label>
                                        <div className="mt-1">
                                            <input
                                                type="text"
                                                name="subject"
                                                id="subject"
                                                value={formState.subject}
                                                onChange={handleChange}
                                                disabled={isSubmitting}
                                                className="py-3 px-4 block w-full shadow-sm rounded-md bg-gray-700 border-gray-600 text-white focus:ring-red-500 focus:border-red-500"
                                                placeholder="Inquiry about..."
                                                required
                                            />
                                        </div>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label htmlFor="message" className="block text-sm font-medium text-gray-300">
                                            Message
                                        </label>
                                        <div className="mt-1">
                                            <textarea
                                                id="message"
                                                name="message"
                                                rows={6}
                                                value={formState.message}
                                                onChange={handleChange}
                                                disabled={isSubmitting}
                                                className="py-3 px-4 block w-full shadow-sm rounded-md bg-gray-700 border-gray-600 text-white focus:ring-red-500 focus:border-red-500"
                                                placeholder="Your question or message..."
                                                required
                                            ></textarea>
                                        </div>
                                    </div>

                                    <div className="sm:col-span-2">
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className={`w-full inline-flex items-center justify-center px-6 py-3 border border-transparent rounded-md shadow-sm text-base font-medium text-white ${
                                                isSubmitting ? 'bg-gray-500' : 'bg-red-600 hover:bg-red-700'
                                            } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500 transition-colors`}
                                        >
                                            {isSubmitting ? 'Sending...' : 'Send Message'}
                                        </button>
                                    </div>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ContactPage;