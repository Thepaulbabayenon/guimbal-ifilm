"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { debounce } from "lodash";
import gsap from "gsap";

interface SearchBarProps {
  isMobile: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ isMobile }) => {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const resultsRef = React.useRef<HTMLUListElement>(null);

  // Debounced search function
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
      router.push(`/home/films/search-results?query=${encodeURIComponent(query)}`);
    }
  };

  // GSAP animations for input field and results
  useEffect(() => {
    if (inputRef.current) {
      gsap.fromTo(
        inputRef.current,
        { scale: 1, backgroundColor: "transparent" },
        { scale: 1.05, backgroundColor: "rgba(255, 255, 255, 0.1)", duration: 0.3, ease: "ease.inOut" }
      );
    }

    if (results.length > 0 && resultsRef.current) {
      gsap.fromTo(
        resultsRef.current,
        { opacity: 0, y: -20 },
        { opacity: 1, y: 0, duration: 0.3, stagger: 0.1, ease: "ease.out" }
      );
    }
  }, [results]);

  return (
    <div className={`relative max-w-lg ${isMobile ? "mx-auto mt-4 px-6" : ""} bg-transparent`}>
      <input
        ref={inputRef}
        type="text"
        className="p-3 pl-8 pr-3 text-sm bg-transparent text-white rounded-full shadow-md focus:outline-none transform hover:scale-105 border border-gray-800"
        placeholder="Search for films..."
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
      />
      {loading && (
        <div className="absolute top-full left-0 w-full py-2 text-center text-gray-500 opacity-70">
          Loading...
        </div>
      )}
      <div className="absolute top-full left-0 w-full mt-2 border-gray-900 rounded-lg shadow-lg bg-transparent z-10">
        {results && results.length > 0 ? (
          <ul ref={resultsRef} className="max-h-64 overflow-y-auto bg-transparent">
            {results.map((result: any) => (
              <li
                key={result.id}
                className="px-4 py-3 border-b border-gray-900 hover:bg-blue-100 transition-all rounded-md"
              >
                <a href={`/home/films/${result.id}`} className="block text-gray-800">
                  <div className="font-semibold text-lg">{result.title}</div>
                </a>
              </li>
            ))}
          </ul>
        ) : query && !loading ? (
          <div className="px-4 py-2 text-center text-gray-500">No results found</div>
        ) : null}
      </div>
    </div>
  );
};

export default SearchBar;
