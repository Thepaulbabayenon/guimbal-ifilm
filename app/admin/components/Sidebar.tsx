"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { gsap } from "gsap";
import { Menu, X, ChevronLeft, ChevronRight } from "lucide-react";

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isExpanded, setIsExpanded] = useState(true);
  const sidebarRef = useRef(null);
  const pathname = usePathname();

  // Animate sidebar on mount
  useEffect(() => {
    gsap.fromTo(
      sidebarRef.current,
      { x: -250, opacity: 0 },
      { x: 0, opacity: 1, duration: 0.6, ease: "power2.out" }
    );
  }, []);

  // Toggle sidebar visibility
  const toggleSidebar = () => {
    gsap.to(sidebarRef.current, {
      x: isOpen ? -250 : 0,
      duration: 0.5,
      ease: "power2.out",
    });
    setIsOpen(!isOpen);
  };

  // Expand/Collapse Sidebar Width
  const toggleExpand = () => {
    gsap.to(sidebarRef.current, {
      width: isExpanded ? "80px" : "250px",
      duration: 0.3,
      ease: "power2.out",
    });
    setIsExpanded(!isExpanded);
  };

  return (
    <div className="relative">
      {/* Toggle Button (Small Screens) */}
      <button
        className="absolute top-4 left-4 z-50 text-white bg-gray-800 p-2 rounded-md lg:hidden"
        onClick={toggleSidebar}
      >
        {isOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`${
          isOpen ? "translate-x-0" : "-translate-x-full"
        } bg-gray-900 text-white min-h-screen fixed top-0 left-0 transition-transform duration-300 ease-in-out shadow-lg lg:translate-x-0 flex flex-col justify-center items-center`}
        style={{ width: isExpanded ? "250px" : "80px" }}
      >
        {/* Expand/Collapse Button */}
        <button
          className="absolute top-4 right-4 text-white p-1 bg-gray-700 rounded-md hidden lg:block"
          onClick={toggleExpand}
        >
          {isExpanded ? <ChevronLeft size={20} /> : <ChevronRight size={20} />}
        </button>

        {/* Sidebar Content (Centered) */}
        <div className="flex flex-col items-center justify-center w-full">
          {/* Logo (Clickable to /admin) */}
          <Link href="/admin">
            <img
              src="/logo.svg"
              alt="Logo"
              className={`h-auto mx-auto cursor-pointer transition-all mb-8 ${
                isExpanded ? "w-32" : "w-12"
              }`}
            />
          </Link>

          {/* Navigation */}
          <nav className="w-full">
            <ul className="space-y-2 flex flex-col items-center">
              {[
                { name: "Dashboard", path: "/admin" },
                { name: "Upload Film", path: "/admin/upload" },
                { name: "Edit Film", path: "/admin/edit" },
                { name: "Delete Film", path: "/admin/delete" },
                { name: "Announcements", path: "/admin/announcements" },
                { name: "Manage Admin Users", path: "/admin/users" },
                { name: "Home", path: "/home" },
              ].map((item) => (
                <li key={item.path} className="relative w-full text-center">
                  <Link
                    href={item.path}
                    className={`flex items-center justify-center w-full py-3 px-4 rounded-md transition-all duration-200 ${
                      pathname === item.path
                        ? "bg-gray-700 text-blue-400 font-bold"
                        : "hover:bg-gray-800"
                    }`}
                  >
                    {isExpanded ? item.name : null}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </aside>
    </div>
  );
};

export default Sidebar;
