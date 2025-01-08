"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Logo from "../../public/logo.svg";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import { debounce } from "lodash";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CategoryDropdown } from "./CategoryDropdown";
import { useCategory } from "@/app/context/categoryContext";
import UserNav from "./UserNav";

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

  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const router = useRouter();
  const { selectedCategory, setSelectedCategory } = useCategory(); // Access category context
  const pathName = usePathname(); // Use pathName to determine current route
  const isProfilePage = pathName.includes("/user");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
      if (window.scrollY > lastScrollY) {
        setShowNavbar(false); // Hide navbar on scroll down
      } else {
        setShowNavbar(true); // Show navbar on scroll up
      }
      setLastScrollY(window.scrollY);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY]);

  const handleSearch = debounce(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/films/search?query=${searchQuery}`);
      const data = await response.json();
      setResults(data.films || []);
    } catch (error) {
      console.error("Search error:", error);
      setResults([]);
    }

    setLoading(false);
  }, 500);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    handleSearch(event.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && query.trim()) {
      router.push(`/home/search-results?query=${encodeURIComponent(query)}`);
    }
  };

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

  if (isProfilePage) {
    return null; // Don't render navbar on profile pages
  }

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden fixed top-3 right-3 z-50">
        <Menu
          onClick={toggleMobileMenu}
          className="w-6 h-6 text-white cursor-pointer transition-opacity duration-300 hover:opacity-75"
        />
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, x: "-100%" }}
          animate={{ opacity: 1, x: "0%" }}
          exit={{ opacity: 0, x: "-100%" }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 bg-black bg-opacity-90 flex flex-col items-center justify-center lg:hidden"
        >
          <X
            onClick={toggleMobileMenu}
            className="absolute top-3 right-3 w-6 h-6 text-white cursor-pointer"
          />
          <ul className="flex flex-col items-center gap-y-4 text-white text-base">
            {links.map((link, idx) => (
              <li key={idx} onClick={toggleMobileMenu}>
                <Link href={link.href}>{link.name}</Link>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex flex-col items-center w-full px-6">
            <div className="relative max-w-lg mx-auto mt-4">
              <input
                type="text"
                className="p-1 pl-8 pr-3 text-xs bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Search for films..."
                value={query}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
              />
              {loading && (
                <div className="absolute top-full left-0 w-full py-2 text-center text-gray-500">
                  Loading...
                </div>
              )}
              <div className="absolute top-full left-0 w-full mt-2 r border-gray-200 rounded-lg shadow-md z-10">
                {results && results.length > 0 ? (
                  <ul className="max-h-64 overflow-y-auto">
                    {results.map((result: any) => (
                      <li
                        key={result.id}
                        className="px-4 py-2 border-b border-gray-200 hover:bg-gray-100"
                      >
                        <a
                          href={`/films/${result.id}`}
                          className="block text-gray-800"
                        >
                          <div className="font-semibold text-lg">
                            {result.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {result.overview}
                          </div>
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : query && !loading ? (
                  <div className="px-4 py-2 text-center text-gray-500">
                    No results found
                  </div>
                ) : null}
              </div>
            </div>
            <div className="mt-4">
              <UserNav />
            </div>
          </div>
        </motion.div>
      )}

      {/* Main Navbar */}
      <motion.div
        initial={{ opacity: 0, y: -100 }}
        animate={{ opacity: showNavbar ? 1 : 0, y: showNavbar ? 0 : -100 }}
        transition={{ duration: 0.3 }}
        className={`navbar fixed top-0 left-0 right-0 z-40 w-full max-w-7xl mx-auto px-4 py-3 flex items-center justify-between transition-all duration-300 ${
          isScrolled ? "bg-black bg-opacity-80" : "bg-transparent"
        }`}
      >
        <div className="flex items-center">
          <Link href="/home" className="w-24">
            <Image src={Logo} alt="Logo" priority width={60} height={60} />
          </Link>
          <ul className="lg:flex gap-x-4 ml-10 hidden">
            {links.map((link, idx) => (
              <motion.li
                key={idx}
                className="relative group"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Link
                  href={link.href}
                  className={`${
                    pathName === link.href ? "text-white font-semibold" : "text-gray-300"
                  } text-xs transition-all duration-300 group-hover:text-white`}
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
        <div className="hidden lg:flex items-center gap-x-4">
          <div className="flex items-center gap-x-4">
            <CategoryDropdown categories={["Comedy", "Drama", "Folklore", "Horror"]} />
            <div className="relative max-w-lg">
              <input
                type="text"
                className="p-1 pl-8 pr-3 text-xs bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="Search for films..."
                value={query}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
              />
              {loading && (
                <div className="absolute top-full left-0 w-full py-2 text-center text-gray-500">
                  Loading...
                </div>
              )}
              <div className="absolute top-full left-0 w-full mt-2 r border-gray-200 rounded-lg shadow-md z-10">
                {results && results.length > 0 ? (
                  <ul className="max-h-64 overflow-y-auto">
                    {results.map((result: any) => (
                      <li
                        key={result.id}
                        className="px-4 py-2 border-b border-gray-200 hover:bg-gray-100"
                      >
                        <a
                          href={`/films/${result.id}`}
                          className="block text-gray-800"
                        >
                          <div className="font-semibold text-lg">
                            {result.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {result.overview}
                          </div>
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : query && !loading ? (
                  <div className="px-4 py-2 text-center text-gray-500">
                    No results found
                  </div>
                ) : null}
              </div>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Bell className="h-4 w-4 text-gray-300 cursor-pointer hover:text-white transition-transform duration-300 transform hover:scale-110" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-52 bg-gray-800 text-white rounded-md shadow-md">
              <DropdownMenuLabel className="text-xs">Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="p-2 hover:bg-gray-700 text-xs">
                <p>New films are coming</p>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <UserNav />
        </div>
      </motion.div>
    </>
  );
}
