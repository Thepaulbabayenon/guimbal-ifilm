// src/app/accessibility/page.tsx (or your preferred location)
"use client"; // Add if needed

import React from 'react';
import Link from 'next/link';
import { FiUsers, FiMessageSquare } from 'react-icons/fi'; 
import { FiCheckSquare } from 'react-icons/fi'; // Example icons

const AccessibilityPage: React.FC = () => {
    const currentYear = new Date().getFullYear();

    return (
        <div className="min-h-screen bg-gray-900 text-gray-300 py-16 px-4 sm:px-6 lg:px-8"> {/* Dark theme */}
            <div className="max-w-3xl mx-auto bg-gray-800 p-8 rounded-lg shadow-xl border border-gray-700">
                <div className="flex items-center mb-8 pb-4 border-b border-gray-700">
                   <FiUsers className="text-red-500 text-4xl mr-4"/>
                   <h1 className="text-3xl font-bold text-white">
                        Accessibility Statement
                   </h1>
                </div>

                <p className="mb-6 text-sm text-gray-400">
                    Last Updated: July 19, {currentYear}
                </p>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-3 text-red-400">Our Commitment</h2>
                    <p className="mb-4">
                        The Guimbal iFilm Society and the maintainers of this streaming platform are committed to ensuring digital accessibility for people with disabilities. We are continually improving the user experience for everyone and applying relevant accessibility standards.
                    </p>
                    <p>
                        We believe that the power of local cinema should be accessible to the widest possible audience, regardless of technology or ability.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-3 text-red-400">Conformance Status</h2>
                    <p className="mb-4">
                        We aim for the Platform to substantially conform to the Web Content Accessibility Guidelines (WCAG) 2.1 level AA. Conformance with these guidelines helps make the web more user-friendly for all people.
                    </p>
                    <p className="text-sm text-gray-400">
                        While we strive to adhere to the accepted guidelines and standards for accessibility, it may not always be possible to do so in all areas of the website, particularly with user-generated content (like reviews, if enabled) or third-party integrations. We are continually seeking out solutions that will bring all areas of the site up to the same level of overall web accessibility.
                    </p>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-3 text-red-400 flex items-center">
                        <FiCheckSquare className="mr-2"/> Accessibility Features
                    </h2>
                    <p className="mb-4">Where possible, we have implemented the following features:</p>
                    <ul className="list-disc list-inside space-y-2 ml-4 text-gray-300">
                        <li>Use of semantic HTML for structure and meaning.</li>
                        <li>Efforts to ensure sufficient color contrast.</li>
                        <li>Support for keyboard navigation.</li>
                        <li>Alternative text for important images (where applicable).</li>
                        <li>Clear headings and labels for forms and content sections.</li>
                         <li>Resizable text (using browser zoom functionality).</li>
                         {/* Add more specific features if implemented, e.g., ARIA attributes, video captions/subtitles */}
                         <li>Video player controls accessible via keyboard. (Verify this)</li>
                         <li>*Future Goal:* Providing captions or subtitles for films where available.</li>
                    </ul>
                </section>

                <section className="mb-8">
                    <h2 className="text-2xl font-semibold mb-3 text-red-400">Known Limitations</h2>
                     <p className="mb-4">
                        Despite our best efforts, users may experience some accessibility issues. Potential limitations include:
                    </p>
                     <ul className="list-disc list-inside space-y-2 ml-4 text-gray-300 text-sm">
                         <li>Some older film content may lack captions or high-quality audio descriptions.</li>
                         <li>Complex interactive elements, like custom video players or data visualizations (if any), might pose challenges for certain assistive technologies.</li>
                         <li>Third-party embedded content (if any) may not fully conform to our standards.</li>
                     </ul>
                     <p className="mt-4 text-sm text-gray-400">
                        We are actively working to address these limitations where feasible.
                    </p>
                </section>

                <section>
                    <h2 className="text-2xl font-semibold mb-3 text-red-400 flex items-center">
                       <FiMessageSquare className="mr-2"/> Feedback & Contact
                    </h2>
                    <p className="mb-4">
                        We welcome your feedback on the accessibility of the Guimbal iFilm Streaming Platform. If you encounter accessibility barriers or have suggestions for improvement, please let us know:
                    </p>
                    <ul className="list-none space-y-2 text-gray-300">
                         <li>
                            <strong>Email:</strong>{' '}
                            <Link href="mailto:accessibility@ifilmplatform.com" className="text-red-400 hover:underline">
                                accessibility@ifilmplatform.com (Placeholder)
                            </Link>
                        </li>
                         <li>
                            <strong>Contact Form:</strong>{' '}
                             <Link href="/contact?subject=Accessibility+Feedback" className="text-red-400 hover:underline">
                                Use our Contact Form
                            </Link>
                         </li>
                    </ul>
                     <p className="mt-4 text-sm text-gray-400">
                        We try to respond to feedback within 5 business days.
                    </p>
                </section>

            </div>
        </div>
    );
};

export default AccessibilityPage;