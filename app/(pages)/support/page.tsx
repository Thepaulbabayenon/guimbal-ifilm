import React from 'react';
import { FiHelpCircle, FiMail, FiActivity, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi'; // Relevant icons
import Link from 'next/link'; // Assuming Next.js for linking

const SupportPage: React.FC = () => {
    // --- Placeholder Platform Status ---
    // In a real app, this would be fetched from a status monitoring service
    const platformStatus = {
        status: "operational", // could be "operational", "degraded", "outage"
        message: "All systems normal."
    };

    const supportOptions = [
        {
            id: 1,
            type: "Frequently Asked Questions",
            description: "Find answers to common questions.",
            link: "/faq", // Link to your FAQ page
            icon: <FiHelpCircle className="h-8 w-8" />
        },
        {
            id: 2,
            type: "Contact Support Team",
            description: "Get in touch for specific issues.",
            link: "/contact", // Link to your Contact page
            icon: <FiMail className="h-8 w-8" />

        },
        {
            id: 3,
            type: "Community Forum", // If you have one
            description: "Discuss with other users.",
            link: "/forums", // Placeholder link
            icon: <FiActivity className="h-8 w-8" /> // Placeholder icon
        }
        // Add other relevant support links, e.g., documentation, tutorials
    ];

    return (
        <div className="min-h-screen bg-gray-900 text-white py-12"> {/* Dark theme */}
            <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl">Platform Support & Status</h1>
                    <p className="mt-4 text-xl text-gray-400 max-w-2xl mx-auto">
                        Check platform status and find help resources.
                    </p>
                </div>

                 {/* Platform Status Indicator */}
                <div className={`mb-12 p-4 rounded-lg border-l-4 ${
                    platformStatus.status === 'operational' ? 'bg-green-900/50 border-green-500' :
                    platformStatus.status === 'degraded' ? 'bg-yellow-900/50 border-yellow-500' :
                    'bg-red-900/50 border-red-500'
                }`}>
                    <div className="flex items-center">
                        <div className="flex-shrink-0">
                            {platformStatus.status === 'operational' ? <FiCheckCircle className="h-6 w-6 text-green-400" /> :
                             platformStatus.status === 'degraded' ? <FiAlertTriangle className="h-6 w-6 text-yellow-400" /> :
                             <FiAlertTriangle className="h-6 w-6 text-red-400" />}
                        </div>
                        <div className="ml-3">
                            <p className={`text-sm font-medium ${
                                platformStatus.status === 'operational' ? 'text-green-300' :
                                platformStatus.status === 'degraded' ? 'text-yellow-300' :
                                'text-red-300'
                            }`}>
                                {platformStatus.message} (Placeholder Status)
                                {/* Add link to a dedicated status page if available */}
                                {/* <a href="#" className="ml-2 underline">View Status Page</a> */}
                            </p>
                        </div>
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-white mb-6 text-center">How can we help?</h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {supportOptions.map(option => (
                        <Link href={option.link} key={option.id}>
                           <div className="block bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-red-900/50 transition-shadow cursor-pointer h-full"> {/* Darker card, red shadow */}
                                <div className="p-6 flex flex-col items-center text-center h-full">
                                    <div className="p-3 rounded-full bg-gray-700 text-red-500 mb-4"> {/* Adjusted colors */}
                                        {option.icon}
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-2">{option.type}</h3>
                                    <p className="text-gray-400 text-sm flex-grow">{option.description}</p>
                                    <div className="mt-4 text-red-500 font-medium group-hover:text-red-400">
                                        Go to {option.type.split(' ')[0]} →
                                    </div>
                                </div>
                           </div>
                        </Link>
                    ))}
                </div>

                <div className="mt-12 bg-gray-800 rounded-xl shadow-lg p-8 text-center"> {/* Darker card */}
                    <h2 className="text-2xl font-bold text-white mb-4">Reporting an Issue</h2>
                    <p className="text-gray-400 mb-6">
                        If you encounter a technical problem (e.g., streaming issues, login problems), please provide as much detail as possible when contacting support, including the film title, browser/device used, and steps to reproduce the issue.
                    </p>
                     <Link href="/contact?subject=Technical+Issue+Report" passHref>
                       <button className="bg-red-600 text-white border border-red-600 font-medium px-6 py-3 rounded-lg hover:bg-red-700 transition-colors">
                            Report Technical Issue
                       </button>
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default SupportPage; // Renamed component