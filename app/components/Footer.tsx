"use client";
import React from "react";
import Image from "next/image";
import Link from "next/link";
import Logo from "../../public/logo.svg";
import { useSelectedLayoutSegment } from "next/navigation";

const Footer = () => {
  const segment = useSelectedLayoutSegment();
  console.log("Current segment:", segment); // Debugging
  
  // Adjust the condition based on your routing structure
  const isProfilePage = segment === "user";

  if (isProfilePage) {
    return null;
  }

  return (
    <footer className="bg-black text-gray-400 p-1 text-xs">
      <div className="flex flex-col items-center justify-center gap-y-2 pt-3 border-t border-gray-700 mt-8">
        <div className="flex flex-wrap justify-center gap-2 mb-2">
          <Link href="/privacy">Privacy</Link>
          <Link href="/terms&conditions">Terms & Conditions</Link>
          <Link href="/contact">Contact</Link>
          <Link href="/FAQ">FAQ</Link>
          <Link href="/feedback">Feedback</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/investors">Investors</Link>
          <Link href="/movielib">Movie Library</Link>
          <Link href="/restricted">Restricted</Link>
          <Link href="/reviews">Reviews</Link>
          <Link href="/subscription">Subscription</Link>
          <Link href="/technical">Technical</Link>
          <Link href="/emergency">Emergency</Link>
          <Link href="/forgot-password">Forgot Password</Link>
          <Link href="/reset-password">Reset Password</Link>
        </div>
        <Image src={Logo} alt="logo" width={40} height={40} />
        <p>&copy; {new Date().getFullYear()} Guimbal iFilm Society</p>
      </div>
    </footer>
  );
};

export default Footer;
