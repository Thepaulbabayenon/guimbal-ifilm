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
  const isProfilePage = segment && segment.includes("user");

  if (isProfilePage) {
    return null;
  }

  return (
    <footer className="bg-black text-gray-400 p-1 text-xs">
      <div className="flex flex-col items-center justify-center gap-y-2 pt-3 border-t border-gray-700 mt-8">
        <Image src={Logo} alt="logo" width={40} height={40} />
        <p>&copy; {new Date().getFullYear()} Guimbal iFilm Society</p>
      </div>
    </footer>
  );
};

export default Footer;
