'use client';
import React, { useState } from 'react';
import { debounce } from 'lodash'; // For debouncing the search query

// SearchBar Component
const SearchBar: React.FC = () => {
  const [query, setQuery] = useState<string>('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  // Debounce the search query
  const handleSearch = debounce(async (searchQuery: string) => {
    if (!searchQuery.trim()) {
      setResults([]);
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`/api/films/search?query=${searchQuery}`);
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error('Search error:', error);
      setResults([]);
    }

    setLoading(false);
  }, 500); // Debounce delay of 500ms

  // Handle input change
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(event.target.value);
    handleSearch(event.target.value); // Trigger search on input change
  };

  return (
    <div className="relative max-w-lg mx-auto mt-4">
      <input
        type="text"
        className="w-full p-3 pl-10 pr-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder="Search for films..."
        value={query}
        onChange={handleChange}
      />
      {loading && <div className="absolute top-full left-0 w-full py-2 text-center text-gray-500">Loading...</div>}

      <div className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-md z-10">
        {results && results.length > 0 ? (
          <ul className="max-h-64 overflow-y-auto">
            {results.map((result: any) => (
              <li key={result.id} className="px-4 py-2 border-b border-gray-200 hover:bg-gray-100">
                <a href={`/films/${result.id}`} className="block text-gray-800">
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
};

export default SearchBar;
