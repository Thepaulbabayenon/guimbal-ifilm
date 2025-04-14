// src/app/sitemap/page.tsx (or your preferred location)
"use client"; // Add if needed for client-side interactivity, though this is mostly static

import React from 'react';
import Link from 'next/link';
import { FiMap } from 'react-icons/fi'; // Example icon

// Re-using the structure from your Footer for consistency
// Ideally, import this from a shared location if used in multiple places
const footerLinkGroups = [
  {
    title: "Platform", // Renamed from Company
    links: [
      { href: "/about", label: "About Us" }, // Changed Investors -> About Us
      { href: "/contact", label: "Contact" },
      { href: "/blog", label: "Blog" },
      { href: "/support-us", label: "Support Us" }, // Added Support link
    ]
  },
  {
    title: "Help & Support",
    links: [
      { href: "/faq", label: "FAQ" }, // Capitalized FAQ
      { href: "/support", label: "Platform Status" }, // Renamed from Support
      { href: "/feedback", label: "Feedback" },
      { href: "/tech", label: "Platform Technology" }, // Renamed from Technical
    ]
  },
  {
    title: "Explore", // Renamed from Content
    links: [
      { href: "/browse", label: "Browse Films" }, // Changed href/label
      // Reviews are part of film pages, so removed from sitemap as standalone page
      // Subscription changed to Support Tiers
      { href: "/support-tiers", label: "Support Tiers" },
      // Restricted page is functional, not usually in sitemap
    ]
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms & Conditions" }, // Adjusted label
      // Cookie Policy might be part of Privacy or separate
       { href: "/privacy#cookies", label: "Cookie Information" }, // Example linking to section
    ]
  },
  {
    title: "Account",
    links: [
      { href: "/sign-in", label: "Sign In" },
      { href: "/sign-up", label: "Create Account" },
      { href: "/forgot-password", label: "Forgot Password" },
       // Reset password page is usually accessed via email link, less common in sitemap
    ]
  },
   {
    title: "Other", // Added section for pages not fitting elsewhere
    links: [
        { href: "/accessibility", label: "Accessibility Statement" },
        { href: "/sitemap", label: "Sitemap" }, // Link to itself
    ]
   }
];


const SitemapPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 text-white py-16 px-4 sm:px-6 lg:px-8"> {/* Dark theme */}
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center mb-10">
          <FiMap className="text-red-500 text-4xl mr-4" />
          <h1 className="text-4xl font-extrabold text-white tracking-tight">
            Platform Sitemap
          </h1>
        </div>

        <p className="mb-12 text-lg text-gray-400">
          Navigate through the main sections and pages of the Guimbal iFilm Society Streaming Platform.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-8 gap-y-10">
          {footerLinkGroups.map((group) => (
            <div key={group.title}>
              <h2 className="text-xl font-semibold text-red-400 mb-4">{group.title}</h2>
              <ul className="space-y-3">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-300 hover:text-white hover:underline transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SitemapPage;