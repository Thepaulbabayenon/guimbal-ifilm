"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { debounce } from "lodash";
import gsap from "gsap";
import { X } from "lucide-react";
import { motion } from "framer-motion";

interface SearchBarProps {
  isMobile: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ isMobile }) => {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isClient, setIsClient] = useState<boolean>(false);
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const resultsRef = React.useRef<HTMLUListElement>(null);

  // Set isClient to true once component mounts
  useEffect(() => {
    setIsClient(true);
  }, []);

  const isYear = (input: string) => /^\d{4}$/.test(input);

  const handleSearch = debounce(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);

    const searchParams = isYear(searchQuery)
      ? `year=${searchQuery}`
      : `query=${searchQuery}&category=${searchQuery}`;

    try {
      const response = await fetch(`/api/films/search?${searchParams}`);
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
      router.push(`/home/films/search-results?query=${encodeURIComponent(query)}`);
    }
  };

  const clearSearch = () => {
    setQuery("");
    setResults([]);
    if (inputRef.current) inputRef.current.focus();
  };

  
 
  useEffect(() => {
    if (!isClient) return; // Prevent animations from running on the server
  
    if (inputRef.current) {
      gsap.fromTo(
        inputRef.current,
        { scale: 1, backgroundColor: "transparent" },
        { scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)", duration: 0.3 }
      );
    }
  
    if (results.length > 0 && resultsRef.current) {
      gsap.fromTo(
        resultsRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.3 }
      );
    }
  }, [results, isClient]);
  

  return (
    <div className={`relative max-w-lg ${isMobile ? "mx-auto mt-4 px-6" : ""} bg-transparent`}>
      <div className="relative w-full">
        <input
          ref={inputRef}
          type="text"
          className="p-3 pl-8 pr-10 text-sm bg-gray-800 text-white rounded-full shadow-md focus:outline-none transform hover:scale-105 border border-gray-700 w-full"
          placeholder="Search for films by title or year..."
          value={query}
          onChange={handleChange}
          onKeyDown={isClient ? handleKeyDown : undefined}
        />
        {query && (
          <button
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            onClick={clearSearch}
          >
            <X size={18} />
          </button>
        )}
      </div>

      {/* Loading Animation */}
      {loading && isClient && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="absolute top-full left-0 w-full flex justify-center py-2"
        >
          <div className="flex space-x-2">
            {[...Array(3)].map((_, index) => (
              <motion.div
                key={index}
                className="w-2 h-2 bg-blue-400 rounded-full"
                animate={{
                  y: [0, -5, 0],
                  opacity: [0.6, 1, 0.6],
                }}
                transition={{
                  repeat: Infinity,
                  duration: 0.6,
                  delay: index * 0.2,
                }}
              />
            ))}
          </div>
        </motion.div>
      )}

      {/* Search Results */}
      {isClient && (
        <div className="absolute top-full left-0 w-full mt-2 rounded-lg shadow-lg bg-gray-900 z-10">
          {results.length > 0 ? (
            <motion.ul
              ref={resultsRef}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="max-h-64 overflow-y-auto bg-gray-900 rounded-lg"
            >
              {results.map((result: any) => (
                <motion.li
                  key={result.id}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className="px-4 py-3 border-b border-gray-700 hover:bg-gray-800 transition-all cursor-pointer"
                  onClick={() => router.push(`/home/films/${result.id}`)}
                >
                  <div className="text-white text-lg font-semibold">{result.title}</div>
                </motion.li>
              ))}
            </motion.ul>
          ) : query && !loading ? (
            <div className="px-4 py-2 text-center text-gray-500">No results found</div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default SearchBar;