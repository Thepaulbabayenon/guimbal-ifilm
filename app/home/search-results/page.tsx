'use client';
import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

const SearchResultsPage: React.FC = () => {
  const searchParams = useSearchParams();
  const query = searchParams.get('query') || ''; // Get the query from the URL
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (!query) return;

    const fetchResults = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/films/search?query=${query}`);
        const data = await response.json();
        setResults(data.films || []); // Use films array from API response
      } catch (error) {
        console.error('Error fetching search results:', error);
        setResults([]);
      }
      setLoading(false);
    };

    fetchResults();
  }, [query]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-4">Search Results for "{query}"</h1>

      {loading && <p className="text-gray-500">Loading...</p>}

      {!loading && results.length === 0 && (
        <p className="text-gray-500">No results found for "{query}".</p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {results.map((result: any) => (
          <div
            key={result.id}
            className="border rounded-lg p-4 shadow hover:shadow-lg transition"
          >
            <a href={`/films/${result.id}`}>
              <img
                src={result.imageString}
                alt={result.title}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h2 className="text-lg font-semibold">{result.title}</h2>
              <p className="text-sm text-gray-500">{result.overview}</p>
            </a>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchResultsPage;
