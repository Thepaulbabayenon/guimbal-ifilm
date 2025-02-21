"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Logo from "../../public/logo.svg";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import UserNav from "./UserNav";
import SearchBar from "@/app/components/SearchBar";
import NotificationDropdown from "@/app/components/NotificationDropdown";

interface LinkProps {
  name: string;
  href: string;
}

const links: LinkProps[] = [
  { name: "Home", href: "/home" },
  { name: "Films", href: "/home/films" },
  { name: "Recently Added", href: "/home/recently" },
  { name: "Favorites", href: "/home/user/favorites" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  const pathName = usePathname();
  const isProfilePage = pathName.includes("/user");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      setShowNavbar(window.scrollY < lastScrollY);
      setLastScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

  if (isProfilePage) return null;

  return (
    <>
      {/* Mobile Menu Button */}
      <motion.div 
        className="lg:hidden fixed top-3 right-3 z-50 cursor-pointer"
        whileTap={{ scale: 0.9 }}
      >
        <Menu onClick={toggleMobileMenu} className="w-6 h-6 text-white transition-opacity hover:opacity-75" />
      </motion.div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, x: "-100%" }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: "-100%" }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col items-center justify-center lg:hidden"
          >
            <X onClick={toggleMobileMenu} className="absolute top-3 right-3 w-6 h-6 text-white cursor-pointer" />
            <ul className="flex flex-col items-center gap-y-4 text-white text-base">
              {links.map((link, idx) => (
                <motion.li 
                  key={idx} 
                  whileHover={{ scale: 1.1 }} 
                  whileTap={{ scale: 0.9 }}
                  onClick={toggleMobileMenu}
                >
                  <Link href={link.href}>{link.name}</Link>
                </motion.li>
              ))}
            </ul>
            <div className="mt-4 flex flex-col items-center w-full px-6">
              <SearchBar isMobile={true} />
              <UserNav />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Navbar */}
      <motion.div
        initial={{ opacity: 0, y: -50 }}
        animate={{ opacity: showNavbar ? 1 : 0, y: showNavbar ? 0 : -50 }}
        transition={{ duration: 0.3 }}
        className={`fixed top-0 left-0 right-0 z-40 w-full max-w-7xl mx-auto px-4 py-3 flex items-center justify-between transition-all duration-300 ${isScrolled ? "bg-black bg-opacity-80" : "bg-transparent"}`}
      >
        <div className="flex items-center">
          <Link href="/home">
            <motion.div whileHover={{ scale: 1.5 }}>
              <Image src={Logo} alt="Logo" priority width={60} height={60} />
            </motion.div>
          </Link>

          <ul className="lg:flex gap-x-6 ml-10 hidden">
            {links.map((link, idx) => {
              const isActive = pathName === link.href;

              return (
                <motion.li 
                  key={idx} 
                  whileHover={{ scale: 1.1, y: -3 }}
                  whileTap={{ scale: 0.95 }}
                  className="relative"
                >
                  <Link 
                    href={link.href} 
                    className={`text-sm font-light transition-all ${
                      isActive ? "text-yellow-400" : "text-gray-300"
                    }`}
                    style={{
                      textShadow: isActive 
                        ? "2px 2px 6px rgba(255, 255, 0, 0.5)" 
                        : "2px 2px 4px rgba(0, 0, 0, 0.3)",
                      filter: isActive 
                        ? "drop-shadow(0px 4px 6px rgba(255, 255, 0, 0.5))" 
                        : "drop-shadow(0px 4px 6px rgba(255, 255, 255, 0.1))",
                    }}
                  >
                    {link.name}
                  </Link>
                </motion.li>
              );
            })}
          </ul>
        </div>

        <div className="hidden lg:flex items-center gap-x-4">
          <SearchBar isMobile={false} />
          <NotificationDropdown />
          <UserNav />
        </div>
      </motion.div>
    </>
  );
}
