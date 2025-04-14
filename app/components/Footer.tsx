"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import Logo from "../../public/logo.svg";

// Organize footer links into categories for better structure
const footerLinkGroups = [
  {
    title: "Company",
    links: [
      { href: "/about", label: "About Us" },
      { href: "/contact", label: "Contact" },
      { href: "/blog", label: "Blog" },
      { href: "/investors", label: "Investors" },
    ]
  },
  {
    title: "Help & Support",
    links: [
      { href: "/FAQ", label: "FAQ" },
      { href: "/support", label: "Support" },
      { href: "/feedback", label: "Feedback" },
      { href: "/technical", label: "Technical" },
    ]
  },
  {
    title: "Content",
    links: [
      { href: "/movielib", label: "Movie Library" },
      { href: "/reviews", label: "Reviews" },
      { href: "/subscription", label: "Subscription" },
      { href: "/restricted", label: "Restricted" },
    ]
  },
  {
    title: "Legal",
    links: [
      { href: "/privacy", label: "Privacy Policy" },
      { href: "/terms", label: "Terms of Service" },
      { href: "/cookies", label: "Cookie Policy" },
    ]
  },
  {
    title: "Account",
    links: [
      { href: "/sign-in", label: "Sign In" },
      { href: "/sign-up", label: "Create Account" },
      { href: "/forgot-password", label: "Forgot Password" },
      { href: "/reset-password", label: "Reset Password" },
    ]
  },
];

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="bg-neutral-900 z-50 text-gray-300 px-6 pt-12 pb-8 border-t border-neutral-800">
      <div className="max-w-screen-xl mx-auto">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-12">
          {/* Company Logo and Description */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1 flex flex-col">
            <div className="flex items-center mb-4">
              <Image src={Logo} alt="Guimbal iFilm Society Logo" width={48} height={48} className="mr-3" />
              <span className="text-white font-semibold text-lg">Guimbal iFilm</span>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Dedicated to bringing you the finest in cinema and film appreciation since 2005.
            </p>
          </div>
          
          {/* Link Groups */}
          {footerLinkGroups.map((group) => (
            <div key={group.title} className="col-span-1">
              <h3 className="text-white font-medium mb-4">{group.title}</h3>
              <ul className="space-y-2">
                {group.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        
        {/* Bottom Bar */}
        <div className="pt-8 border-t border-neutral-800 flex flex-col md:flex-row justify-between items-center">
          <p className="text-sm text-gray-500 mb-4 md:mb-0">
            &copy; {currentYear} Guimbal iFilm Society. All rights reserved.
          </p>
          
          <div className="flex space-x-6">
            <Link href="/sitemap" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              Sitemap
            </Link>
            <Link href="/accessibility" className="text-xs text-gray-500 hover:text-gray-300 transition-colors">
              Accessibility
            </Link>
            <div className="text-xs text-gray-500">
              <span aria-label="Language selector">English (US)</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;