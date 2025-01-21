'use client'; // Mark this component as client-side

import { FilmCard } from "@/app/components/FilmCard";
import { getFilmsByCategory } from "@/app/api/getFilms"; // Function to get films by category
import { useParams } from "next/navigation"; // For accessing the category from the URL
import Image from "next/image";
import { useEffect, useState } from "react"; // Import useState for state management

// Define the structure of the Film object
interface Film {
  id: number;
  title: string;
  imageString?: string;
  age: number;
  overview: string;
  duration: number;
  release: string | number;
  trailer: string;
  category: string;
}

export default function CategoryFilms() {
  const { category } = useParams(); // Get the selected category from the URL

  // Ensure category is a string (it could be a string[] in some cases)
  const categoryString = Array.isArray(category) ? category[0] : category;

  const [films, setFilms] = useState<Film[]>([]); // State for films
  const [loading, setLoading] = useState<boolean>(true); // State for loading
  const [error, setError] = useState<string | null>(null); // State for error

  // Fetch films based on category
  useEffect(() => {
    const fetchFilms = async () => {
      try {
        const data: Film[] = await getFilmsByCategory(categoryString); // Fetch data
        setFilms(data);
      } catch (error) {
        console.error("Error fetching category films:", error);
        setError("Error fetching films in this category. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchFilms();
  }, [categoryString]); // Dependency on categoryString

  if (loading) {
    return <p>Loading...</p>; // Display loading state
  }

  if (error) {
    return <p>{error}</p>; // Display error if fetching fails
  }

  if (!films || films.length === 0) {
    return (
      <div className="items-center justify-center flex flex-col">
        <h1 className="text-gray-400 text-4xl font-bold underline mt-10 px-5 sm:px-0 pt-9">
          Films in {categoryString}
        </h1>
        <p>No films found in this category.</p>
      </div>
    );
  }

  return (
    <div className="recently-added-container mb-20">
      <div className="items-center justify-center flex">
        <h1 className="text-gray-400 text-4xl font-bold items-center justify-center mt-10 px-5 sm:px-0 pt-9">
          Films in "{categoryString}" Category
        </h1>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 px-5 sm:px-0 mt-10 gap-6">
        {films.map((film: Film) => ( // Explicitly type the 'film' variable
          <div key={film.id} className="relative h-60">
            <Image
              src={film.imageString as string}
              alt="Film"
              width={500}
              height={400}
              className="rounded-sm absolute w-full h-full object-cover"
            />
            <div className="h-60 relative z-10 w-full transform transition duration-500 hover:scale-125 opacity-0 hover:opacity-100">
              <div className="bg-gradient-to-b from-transparent via-black/50 to-black z-10 w-full h-full rounded-lg flex items-center justify-center">
                <Image
                  src={film.imageString as string}
                  alt="Film"
                  width={800}
                  height={800}
                  className="absolute w-full h-full -z-10 rounded-lg object-cover"
                />
                {film && (
                  <FilmCard
                    key={film.id}
                    age={film.age}
                    filmId={film.id}
                    overview={film.overview}
                    time={film.duration}
                    title={film.title}
                    year={parseInt(film.release.toString())}
                    trailerUrl={film.trailer}
                    initialRatings={0}
                    watchList={false}
                    category={film.category || "Uncategorized"}
                  />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
