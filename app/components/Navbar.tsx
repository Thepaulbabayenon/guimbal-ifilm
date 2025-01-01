"use client";
import Link from "next/link";
import Image from "next/image";
import Logo from "../../public/logo.svg";
import { usePathname, useSelectedLayoutSegment } from "next/navigation";
import { Bell, Menu, X } from "lucide-react";
import UserNav from "./UserNav";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
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
  const [searchQuery, setSearchQuery] = useState("");
  const [showNavbar, setShowNavbar] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  const { selectedCategory, setSelectedCategory } = useCategory(); // Access category context
  const segment = useSelectedLayoutSegment();
  const pathName = usePathname();
  const isProfilePage = segment === "user";

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

  if (isProfilePage) {
    return null; // Don't render navbar on profile pages
  }

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

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
            <input
              type="text"
              placeholder="Search films..."
              className="w-full p-2 text-sm bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={searchQuery}
              onChange={handleSearch}
            />
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
        {/* Logo and Links */}
        <div className="flex items-center">
          <Link href="/home" className="w-24">
            <Image src={Logo} alt="Logo" priority width={50} height={50} />
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

        {/* Right Actions */}
        <div className="hidden lg:flex items-center gap-x-6">
          <CategoryDropdown
            categories={["Comedy", "Drama", "Folklore", "Horror"]}
             // Update category in context
          />
          <input
            type="text"
            placeholder="Search films..."
            className="p-1 pl-8 pr-3 text-xs bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={searchQuery}
            onChange={handleSearch}
          />
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

