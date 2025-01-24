// components/SimilarFilms.tsx
'use client';
import { useState, useEffect } from "react";
import { db } from "@/db/drizzle";
import { film } from "@/db/schema";
import { eq } from "drizzle-orm";

interface SimilarFilmsProps {
  category: string;
}

export default function SimilarFilms({ category }: SimilarFilmsProps) {
  const [similarFilms, setSimilarFilms] = useState<any[]>([]);

  useEffect(() => {
    const fetchSimilarFilms = async () => {
      const films = await db
        .select()
        .from(film)
        .where(eq(film.category, category))
        .limit(5);
      setSimilarFilms(films);
    };

    if (category) fetchSimilarFilms();
  }, [category]);

  return (
    <div>
      <h3 className="text-lg font-semibold">Similar Films</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {similarFilms.length > 0 ? (
          similarFilms.map((film) => (
            <div
              key={film.id}
              className="border border-gray-300 rounded-lg p-3 shadow hover:shadow-lg transition duration-200"
            >
              <img
                src={film.imageString} // Replace with your image field
                alt={film.title}
                className="w-full h-auto rounded-lg mb-2"
              />
              <h4 className="text-md font-semibold line-clamp-1">{film.title}</h4>
              <p className="text-sm text-gray-600 line-clamp-2">{film.overview}</p>
              <button
                className="mt-2 bg-blue-500 text-white px-3 py-1 text-sm rounded-md"
                onClick={() => {
                  // Logic to play or open the Film in another modal
                  console.log(`Play Film: ${film.title}`);
                }}
              >
                Watch Now
              </button>
            </div>
          ))
        ) : (
          <p>No similar films found.</p>
        )}
      </div>
    </div>
  );
}
