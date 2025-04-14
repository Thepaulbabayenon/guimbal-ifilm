import React from 'react';
import Link from 'next/link';
import { FiFilm, FiUsers, FiCloud, FiAward, FiHeart, FiInfo, FiMail, FiPhone, FiMapPin, FiCheckCircle } from 'react-icons/fi'; // Relevant icons

const AboutPlatformPage: React.FC = () => {
    // --- Platform & Society Highlights (Replace with actual relevant data/goals) ---
    const platformHighlights = [
        { metric: 'Films Archived', value: '250+', icon: <FiFilm/>, description: 'Preserving nearly two decades of local cinema.' },
        { metric: 'Filmmaker Community', value: 'Guimbal iFilm Society', icon: <FiUsers/>, description: 'Supporting the longest-running community filmmakers.' },
        { metric: 'Cloud-Powered', value: 'AWS Infrastructure', icon: <FiCloud/>, description: 'Scalable and reliable access via the cloud.' },
        { metric: 'Enhanced Engagement', value: 'Custom Recommendations', icon: <FiAward/>, description: 'Personalized discovery using our hybrid algorithm.' } // Using FiAward symbolically
    ];

    // --- Key Platform Features ---
    const platformFeatures = [
        "Extensive Digital Archive of Guimbal iFilm Society Films",
        "High-Quality Cloud-Based Streaming",
        "Personalized Film Recommendations (Hybrid Algorithm)",
        "User Profiles & Watchlist Functionality",
        "Community Features (Ratings, Reviews - *coming soon*)" ,
        "Accessible on Desktop and Mobile Devices"
    ];

    return (
        <div className="min-h-screen bg-gray-900 text-white"> {/* Dark Theme */}
            {/* Hero section */}
            <div className="bg-gradient-to-r from-red-800 via-red-700 to-black"> {/* Themed Gradient */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
                    <div className="text-center">
                         <div className="flex justify-center mb-4">
                             {/* Simple Logo Placeholder */}
                            <div className="h-16 w-16 rounded-full bg-white/10 border-2 border-red-400 flex items-center justify-center">
                                <FiFilm className="h-8 w-8 text-red-400" />
                            </div>
                        </div>
                        <h1 className="text-4xl font-extrabold text-white sm:text-5xl sm:tracking-tight lg:text-6xl">
                            About the Guimbal iFilm Platform
                        </h1>
                        <p className="mt-6 max-w-3xl mx-auto text-xl text-red-100">
                            Preserving Heritage, Enhancing Accessibility, and Celebrating Local Cinema through Technology.
                        </p>
                    </div>
                </div>
            </div>

            {/* Main content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Platform Highlights */}
                <section className="mb-16">
                    <h2 className="text-3xl font-bold text-white mb-8 text-center">Our Mission & Impact</h2>
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {platformHighlights.map((item, index) => (
                            <div key={index} className="bg-gray-800 rounded-xl shadow-lg p-6 text-center transform hover:scale-105 transition-transform duration-300">
                                <div className="flex justify-center text-red-500 mb-3 text-4xl">
                                    {item.icon}
                                </div>
                                <h3 className="text-gray-300 text-sm font-medium uppercase tracking-wider">{item.metric}</h3>
                                <p className="mt-1 text-2xl font-semibold text-white">{item.value}</p>
                                <p className="mt-2 text-xs text-gray-400">{item.description}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
                    {/* Platform Features & Technology */}
                    <section className="lg:col-span-2">
                        <h2 className="text-2xl font-bold text-white mb-6">Platform Features</h2>
                        <div className="bg-gray-800 rounded-xl shadow-lg p-6 mb-8">
                             <ul className="space-y-3">
                                {platformFeatures.map((feature, index) => (
                                    <li key={index} className="flex items-center">
                                        <FiCheckCircle className="h-5 w-5 text-red-500 mr-3 flex-shrink-0"/>
                                        <span className="text-gray-300">{feature}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <h2 className="text-2xl font-bold text-white mb-6">Technology Behind the Platform</h2>
                         <div className="bg-gray-800 rounded-xl shadow-lg p-6">
                            <p className="text-gray-300 mb-4">
                                This platform leverages modern cloud technologies to provide a reliable and scalable streaming experience. Key components include:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-gray-400">
                                <li><strong className="text-red-400">Cloud Infrastructure:</strong> Hosted on Amazon Web Services (AWS) for robust performance and global reach (leveraging S3, CloudFront, etc. - *as mentioned in thesis*).</li>
                                <li><strong className="text-red-400">Custom Recommendation Engine:</strong> A hybrid algorithm combining collaborative filtering (user behavior) and content-based filtering (film attributes) to offer personalized suggestions.</li>
                                <li><strong className="text-red-400">Database Management:</strong> Utilizing NeonDB for efficient storage and retrieval of film metadata and user information (*as mentioned in thesis*).</li>
                                <li><strong className="text-red-400">Modern Frontend:</strong> Built with Next.js, TypeScript, and Tailwind CSS for a responsive and interactive user interface (*as mentioned in thesis*).</li>
                            </ul>
                             {/* Optional: Link to a more technical blog post or diagram */}
                             {/* <div className="mt-6">
                                <Link href="/blog/tech-deep-dive" className="text-red-500 hover:text-red-400 text-sm font-medium">
                                    Learn more about the technology →
                                </Link>
                            </div> */}
                         </div>
                    </section>

                    {/* Sidebar */}
                    <div className="lg:col-span-1 space-y-8">
                         {/* Guimbal iFilm Society Info */}
                        <section className="bg-gray-800 rounded-xl shadow-lg p-6">
                             <h2 className="text-xl font-bold text-white mb-4 flex items-center"><FiInfo className="mr-2"/> The Guimbal iFilm Society</h2>
                             <p className="text-sm text-gray-400 mb-4">
                                Established nearly 20 years ago, the Guimbal iFilm Society is the Philippines' longest-running community-based filmmaker group, dedicated to nurturing local talent and telling local stories through film.
                             </p>
                             {/* Add link to society's own page/facebook if it exists */}
                              <a href="https://www.facebook.com/bantayanfilmfestival" target="_blank" rel="noopener noreferrer" className="text-red-500 hover:text-red-400 text-sm font-medium">
                                Follow the Society on Facebook →
                              </a>
                        </section>

                        {/* Contact Information */}
                        <section className="bg-gray-800 rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold text-white mb-4">Contact Us</h2>
                            <p className="text-sm text-gray-400 mb-4">For inquiries about the platform or the Guimbal iFilm Society:</p>
                            <ul className="space-y-3 text-sm">
                                <li className="flex items-start">
                                    <FiMail className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                                    <div>
                                      <span className="text-gray-300 block">thebantayanfilmfestival@gmail.com</span>
                                      <span className="text-gray-500 text-xs block">(Society Contact)</span>
                                      <span className="text-gray-300 block mt-1">support@ifilmplatform.com</span>
                                      <span className="text-gray-500 text-xs block">(Platform Support - Placeholder)</span>
                                    </div>
                                </li>
                                <li className="flex items-start">
                                    <FiMapPin className="h-5 w-5 text-gray-400 mr-3 mt-0.5 flex-shrink-0" />
                                    <span className="text-gray-300">Guimbal, Iloilo, Philippines</span>
                                </li>
                                {/* Add Phone if available */}
                                {/* <li className="flex">
                                    <FiPhone className="h-5 w-5 text-gray-400 mr-3" />
                                    <span className="text-gray-300">(+63) XXX-XXX-XXXX (Placeholder)</span>
                                </li> */}
                            </ul>
                            <div className="mt-6">
                               <Link href="/contact" passHref>
                                   <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500 transition-colors">
                                        Go to Contact Page
                                   </button>
                               </Link>
                            </div>
                        </section>

                         {/* Support the Platform */}
                        <section className="bg-gray-800 rounded-xl shadow-lg p-6">
                             <h2 className="text-xl font-bold text-white mb-4 flex items-center"><FiHeart className="mr-2"/> Support Us</h2>
                             <p className="text-sm text-gray-400 mb-4">
                                Maintaining this platform requires resources. Consider supporting the Guimbal iFilm Society to help preserve local cinema and keep this platform running.
                             </p>
                              <Link href="/support-us" passHref> {/* Link to a dedicated support/donation page if created */}
                                <button className="w-full inline-flex items-center justify-center px-4 py-2 border border-red-600 text-sm font-medium rounded-md shadow-sm text-red-400 bg-transparent hover:bg-red-900/30 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-red-500 transition-colors">
                                     Learn How to Support
                                </button>
                             </Link>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default AboutPlatformPage; // Renamed component