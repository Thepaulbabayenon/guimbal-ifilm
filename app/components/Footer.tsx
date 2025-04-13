"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import Logo from "../../public/logo.svg";

const footerLinks = [
  { href: "/privacy", label: "Privacy" },
  { href: "/terms&conditions", label: "Terms & Conditions" },
  { href: "/contact", label: "Contact" },
  { href: "/FAQ", label: "FAQ" },
  { href: "/feedback", label: "Feedback" },
  { href: "/blog", label: "Blog" },
  { href: "/investors", label: "Investors" },
  { href: "/movielib", label: "Movie Library" },
  { href: "/restricted", label: "Restricted" },
  { href: "/reviews", label: "Reviews" },
  { href: "/subscription", label: "Subscription" },
  { href: "/technical", label: "Technical" },
  { href: "/emergency", label: "Emergency" },
  { href: "/forgot-password", label: "Forgot Password" },
  { href: "/reset-password", label: "Reset Password" },
];

const Footer = () => {
  return (
    <footer className="bg-neutral-900 text-gray-300 text-sm px-4 py-6 border-t border-neutral-700">
      <div className="max-w-screen-xl mx-auto flex flex-col items-center gap-4">
        {/* Link Grid */}
        <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-xs sm:text-sm text-gray-400">
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="hover:text-white transition-colors"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Logo + Copyright */}
        <div className="flex flex-col items-center mt-4 space-y-2">
          <Image src={Logo} alt="logo" width={40} height={40} />
          <p className="text-xs text-gray-500">
            &copy; {new Date().getFullYear()} Guimbal iFilm Society
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
