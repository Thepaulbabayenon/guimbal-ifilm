'use client';
import { useState, useEffect } from "react";
import { db } from "@/app/db/drizzle";
import { film } from "@/app/db/schema";
import { eq } from "drizzle-orm";
import { useRouter } from "next/navigation"; 

interface SimilarFilmsProps {
  category: string;
}

export default function SimilarFilms({ category }: SimilarFilmsProps) {
  const [similarFilms, setSimilarFilms] = useState<any[]>([]);
  const router = useRouter(); 

  useEffect(() => {
    const fetchSimilarFilms = async () => {
      const films = await db
        .select()
        .from(film)
        .where(eq(film.category, category))
        .limit(6);
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
                src={film.imageUrl} 
                alt={film.title}
                className="w-full h-auto rounded-lg mb-2"
              />
              <h4 className="text-md font-semibold line-clamp-1">{film.title}</h4>
              <p className="text-sm text-gray-600 line-clamp-2">{film.overview}</p>
              <button
                className="mt-2 bg-blue-500 text-white px-3 py-1 text-sm rounded-md"
                onClick={() => router.push(`/home/films/${film.id}`)} 
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
