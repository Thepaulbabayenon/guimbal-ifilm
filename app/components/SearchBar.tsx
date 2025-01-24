"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { debounce } from "lodash";

interface SearchBarProps {
  isMobile: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({ isMobile }) => {
  const [query, setQuery] = useState<string>("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const router = useRouter();

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

  const handleClick = () => {
    router.push(`/home/films/search-results?query=${encodeURIComponent(query)}`);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" && query.trim()) {
      // Instead of routing to a film ID, route to the search results page with the query
      router.push(`/home/films/search-results?query=${encodeURIComponent(query)}`);
    }
  };
  

  return (
    <div className={`relative max-w-lg ${isMobile ? "mx-auto mt-4 px-6" : ""}`}>
      <input
        type="text"
        className="p-1 pl-8 pr-3 text-xs bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        placeholder="Search for films..."
        value={query}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onClick={handleClick} // Use the new function
      />
      {loading && (
        <div className="absolute top-full left-0 w-full py-2 text-center text-gray-500">
          Loading...
        </div>
      )}
      <div className="absolute top-full left-0 w-full mt-2 border-gray-200 rounded-lg shadow-md z-10">
        {results && results.length > 0 ? (
          <ul className="max-h-64 overflow-y-auto">
            {results.map((result: any) => (
              <li
                key={result.id}
                className="px-4 py-2 border-b border-gray-200 hover:bg-gray-100"
              >
                <a href={`/home/films/${result.id}`} className="block text-gray-800">
                  <div className="font-semibold text-lg">{result.title}</div>
                  <div className="text-sm text-gray-500">{result.overview}</div>
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
}


export default SearchBar;
