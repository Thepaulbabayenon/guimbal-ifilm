"use client";
import Link from "next/link";
import Image from "next/image";
import Logo from "../../public/logo.svg";
import { usePathname, useSelectedLayoutSegment } from "next/navigation";
import { Bell, Menu, Search, X } from "lucide-react"; // Importing X icon for closing mobile menu
import UserNav from "./UserNav";
import { useEffect, useRef, useState } from "react";
import axios from "axios";
import debounce from "lodash.debounce";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { animatePlaceholder, onAnimationEnd, PLACEHOLDERS } from "./animatedPlaceholder";

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
  const [isNavbarVisible, setIsNavbarVisible] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Track mobile menu visibility
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const segment = useSelectedLayoutSegment();
  const pathName = usePathname();
  const searchInputRef = useRef<HTMLInputElement>(null);

  const isProfilePage = segment === "user";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      setIsNavbarVisible(window.scrollY <= 50);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const performSearch = async (query: string) => {
    if (!query) return setSearchResults([]);
    setLoading(true);
    try {
      const response = await axios.get("/api/search", { params: { query } });
      setSearchResults(response.data);
    } catch (error) {
      console.error("Error fetching search results:", error);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearch = debounce((query: string) => {
    performSearch(query);
  }, 300);

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    debouncedSearch(e.target.value);
  };

  useEffect(() => {
    if (searchInputRef.current) {
      animatePlaceholder(searchInputRef.current, PLACEHOLDERS[0], onAnimationEnd);
    }
  }, []);

  const toggleNotifications = () => setIsNotificationsOpen(!isNotificationsOpen);

  const toggleSearch = () => {
    setIsSearchOpen((prev) => !prev);
    if (!isSearchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev); // Toggle mobile menu

  const notifications = [
    { id: 1, message: "New films are coming", time: "2 minutes ago" },
    { id: 2, message: "Watch Lagdos now", time: "10 minutes ago" },
    { id: 3, message: "Your profile was viewed", time: "1 hour ago" },
  ];

  if (isProfilePage) {
    return null;
  }

  return (
    <>
      <div className="lg:hidden fixed top-5 right-5 z-50">
        <Menu
          onClick={toggleMobileMenu}
          className="w-8 h-8 text-white cursor-pointer transition-opacity duration-300 hover:opacity-75"
        />
      </div>

      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, x: "-100%" }}
          animate={{ opacity: 1, x: "0%" }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-40 bg-black bg-opacity-80 flex flex-col items-center justify-center lg:hidden"
        >
          <X
            onClick={toggleMobileMenu}
            className="absolute top-5 right-5 w-8 h-8 text-white cursor-pointer"
          />
          <ul className="flex flex-col items-center gap-y-6 text-white text-xl">
            {links.map((link, idx) => (
              <li key={idx} onClick={toggleMobileMenu}>
                <Link href={link.href}>{link.name}</Link>
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, scaleY: 0 }}
        animate={{
          opacity: isNavbarVisible ? 1 : 0,
          scaleY: isNavbarVisible ? 1 : 0,
        }}
        transition={{ duration: 0.3 }}
        className={`navbar fixed top-0 left-0 right-0 w-full max-w-7xl mx-auto items-center justify-between px-5 sm:px-6 py-5 lg:px-8 flex ${
          isNavbarVisible ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0 pointer-events-none"
        }`}
        style={{ backgroundColor: isScrolled ? "rgba(0, 0, 0, 0.8)" : "transparent" }}
      >
        <div className="flex items-center">
          <Link href="/home" className={`w-32 transition-transform duration-500 ${isScrolled ? "scale-90" : "scale-100"}`}>
            <Image src={Logo} alt="Logo" priority width={65} height={65} />
          </Link>
          <ul className="lg:flex gap-x-5 ml-14 hidden">
            {links.map((link, idx) => (
              <motion.li
                key={idx}
                className="relative group"
                whileHover={{ scale: 1.1, x: "5px" }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href={link.href}
                  className={`${
                    pathName === link.href ? "text-white font-semibold" : "text-gray-300"
                  } text-sm transition-all duration-300 group-hover:text-white`}
                >
                  {link.name}
                </Link>
                <span
                  className={`${
                    pathName === link.href ? "w-full" : "w-0"
                  } group-hover:w-full transition-all duration-300 absolute left-0 bottom-0 h-0.5 bg-white`}
                />
              </motion.li>
            ))}
          </ul>
        </div>

        <div className="flex items-center gap-x-8">
          <div className="relative">
            <Search onClick={toggleSearch} className="w-5 h-5 text-gray-300 cursor-pointer hover:text-white transition-transform duration-300 transform hover:scale-125" />
            {isSearchOpen && (
              <div className="absolute z-10 mt-2 w-80 bg-gray-500 rounded-lg shadow-lg">
                <div className="p-4 relative">
                  <input
                    ref={searchInputRef}
                    type="text"
                    placeholder="Search..."
                    aria-label="Search"
                    className="w-full p-4 pl-12 border text-black border-gray-500 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-gray-700 transition-all duration-300"
                    value={searchQuery}
                    onChange={handleSearchInputChange}
                  />
                  <Search className="absolute top-1/2 left-4 transform -translate-y-1/2 w-5 h-5 text-gray-500" />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery("")}
                      className="absolute top-1/2 right-4 transform -translate-y-1/2 text-gray-500 hover:text-gray-900 transition-colors duration-300"
                    >
                      &times;
                    </button>
                  )}
                </div>
                {loading && <div className="flex justify-center py-2"><Loader2 /></div>}
                {searchResults.length > 0 && (
                  <ul className="mt-2 border-t border-gray-200 divide-y divide-gray-200">
                    {searchResults.map((movie: { id: number; title: string }) => (
                      <DropdownMenuItem key={movie.id} className="p-3 hover:bg-gray-700 transition-colors duration-200">
                        {movie.title}
                      </DropdownMenuItem>
                    ))}
                  </ul>
                )}
                {searchResults.length === 0 && searchQuery && (
                  <p className="mt-4 text-white">No results found</p>
                )}
              </div>
            )}
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger>
              <Bell onClick={toggleNotifications} className="h-5 w-5 text-gray-300 cursor-pointer hover:text-white transition-transform duration-300 transform hover:scale-125" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 bg-gray-800 text-white rounded-lg shadow-lg">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {isNotificationsOpen && notifications.map(notification => (
                <DropdownMenuItem key={notification.id} className="p-3 hover:bg-gray-700 transition-colors duration-200">
                  <div className="flex justify-between">
                    <p>{notification.message}</p>
                    <span className="text-sm text-gray-400">{notification.time}</span>
                  </div>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <UserNav />
        </div>
      </motion.div>

      <style jsx>{`
        .navbar {
          transition: opacity 0.3s ease-in-out, transform 0.3s ease-in-out;
          transform-origin: top;
          z-index: 1000;
        }
        .scale-y-0 {
          transform: scaleY(0);
        }
        .scale-y-100 {
          transform: scaleY(1);
        }
      `}</style>
    </>
  );
}
