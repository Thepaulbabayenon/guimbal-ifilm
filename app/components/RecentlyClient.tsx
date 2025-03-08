"use client";

import { useUser } from "@/app/auth/nextjs/useUser";
import Image from "next/image";
import { FilmCard } from "@/app/components/FilmComponents/FilmCard";

// Define TypeScript type for Film
interface Film {
  id: number;
  title: string;
  imageUrl: string | null;
  overview: string;
  duration: number;
  releaseYear: number;
  trailerUrl: string | null;
  ageRating: string;
  category?: string;
}

// Define props for RecentlyClient
interface RecentlyClientProps {
  films: Film[] | null;
}

export default function RecentlyClient({ films }: RecentlyClientProps) {
  const { user } = useUser();
  const userId = user?.id || null;

  if (!userId) {
    return (
      <div className="flex items-center justify-center h-screen text-center">
        <h1 className="text-gray-400 text-4xl font-bold underline mt-10 px-5 sm:px-0">
          Recently Added Films
        </h1>
        <p className="text-lg text-gray-300 mt-4">Please log in to view your films.</p>
      </div>
    );
  }

  if (!films || films.length === 0) {
    return (
      <div className="flex items-center justify-center h-screen text-center">
        <h1 className="text-gray-400 text-4xl font-bold underline mt-10 px-5 sm:px-0">
          Recently Added Films
        </h1>
        <p className="text-lg text-gray-300 mt-4">No films found in the database.</p>
      </div>
    );
  }

  return (
    <div className="recently-added-container mb-20">
      <div className="flex items-center justify-center">
        <h1 className="text-gray-400 text-4xl font-bold mt-10 px-5 sm:px-0">
          Recently Added Films
        </h1>
      </div>

      {/* Film Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 px-5 sm:px-0 mt-10 gap-6">
        {films.map((film) => (
          <div key={film.id} className="relative h-60">
            {/* Film Thumbnail */}
            <Image
              src={film.imageUrl || "/fallback.jpg"}
              alt={film.title || "Film Thumbnail"}
              width={500}
              height={400}
              className="rounded-sm absolute w-full h-full object-cover"
            />

            {/* Overlay */}
            <div className="h-60 relative z-10 w-full transform transition duration-500 hover:scale-125 opacity-0 hover:opacity-100">
              <div className="bg-gradient-to-b from-transparent via-black/50 to-black z-10 w-full h-full rounded-lg flex items-center justify-center">
                <Image
                  src={film.imageUrl || "/fallback.jpg"}
                  alt={film.title || "Film Thumbnail"}
                  width={800}
                  height={800}
                  className="absolute w-full h-full -z-10 rounded-lg object-cover"
                />
               <FilmCard
                key={film.id}
                ageRating={parseInt(film.ageRating, 10) || 0} 
                filmId={film.id}
                overview={film.overview}
                time={film.duration}
                title={film.title}
                releaseYear={film.releaseYear}
                trailerUrl={film.trailerUrl || ""} 
                initialRatings={0}
                watchList={false}
                category={film.category || "Uncategorized"}
                    />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
