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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // Mobile menu state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState(""); // Search input state
  const segment = useSelectedLayoutSegment();
  const pathName = usePathname();

  const isProfilePage = segment === "user";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const toggleMobileMenu = () => setIsMobileMenuOpen((prev) => !prev);

  const handleSearch = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleCloseSearch = () => {
    setSelectedCategory(null);
    setSearchQuery("");
  };

  if (isProfilePage) {
    return null;
  }

  return (
    <>
      {/* Mobile Menu Icon */}
      <div className="lg:hidden fixed top-5 right-5 z-50">
        <Menu
          onClick={toggleMobileMenu}
          className="w-8 h-8 text-white cursor-pointer transition-opacity duration-300 hover:opacity-75"
        />
      </div>

      {/* Mobile Menu Content */}
      {isMobileMenuOpen && (
        <motion.div
          initial={{ opacity: 0, x: "-100%" }}
          animate={{ opacity: 1, x: "0%" }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-40 bg-black bg-opacity-90 flex flex-col items-center justify-center lg:hidden"
        >
          <X
            onClick={toggleMobileMenu}
            className="absolute top-5 right-5 w-8 h-8 text-white cursor-pointer"
          />
          <ul className="flex flex-col items-center gap-y-6 text-white text-lg">
            {links.map((link, idx) => (
              <li key={idx} onClick={toggleMobileMenu}>
                <Link href={link.href}>{link.name}</Link>
              </li>
            ))}
          </ul>

          {/* Add UserNav and Search in Mobile Menu */}
          <div className="mt-6 flex flex-col items-center w-full px-8">
            <input
              type="text"
              placeholder="Search films..."
              className="w-full p-2 pl-4 pr-4 text-sm bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              value={searchQuery}
              onChange={handleSearch}
            />
            <div className="mt-6">
              <UserNav />
            </div>
          </div>
        </motion.div>
      )}

      {/* Desktop Navbar */}
      <motion.div
        initial={{ opacity: 0, scaleY: 0 }}
        animate={{
          opacity: 1,
          scaleY: 1,
        }}
        transition={{ duration: 0.3 }}
        className={`navbar fixed top-0 left-0 right-0 w-full max-w-7xl mx-auto items-center justify-between px-5 sm:px-6 py-5 lg:px-8 flex ${
          isScrolled ? "bg-black bg-opacity-80" : "bg-transparent"
        }`}
      >
        {/* Logo and Navigation Links */}
        <div className="flex items-center">
          <Link href="/home" className="w-32">
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

        {/* Search, Bell Icon, and UserNav */}
        <div className="hidden lg:flex items-center gap-x-8">
          <CategoryDropdown
            categories={["Comedy", "Drama", "Folklore", "Horror"]}
            onCategorySelect={setSelectedCategory}
          />
          <input
            type="text"
            placeholder="Search films..."
            className="p-2 pl-10 pr-4 text-sm bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            value={searchQuery}
            onChange={handleSearch}
          />
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Bell className="h-5 w-5 text-gray-300 cursor-pointer hover:text-white transition-transform duration-300 transform hover:scale-125" />
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-64 bg-gray-800 text-white rounded-lg shadow-lg">
              <DropdownMenuLabel>Notifications</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="p-3 hover:bg-gray-700">
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
