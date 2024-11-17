import { FilmCard } from "@/app/components/FilmCard";
import { getAllFilms } from "@/app/api/getFilms"; // Importing the new function
import { useUser } from "@clerk/nextjs"; // Import Clerk's hook
import Image from "next/image";

export default async function Watchlist() {
  // Use Clerk's useUser hook to get the current user's session

  try {
    // Use the getAllFilms function to fetch films
    const data = await getAllFilms();

    if (!data || data.length === 0) {
      return (
        <>
          <div className="items-center justify-center flex flex-col">
            <h1 className="text-gray-400 text-4xl font-bold underline mt-10 px-5 sm:px-0 pt-9">
              Films
            </h1>
            <p>No films found.</p>
          </div>
        </>
      );
    }

    return (
      <>
        <div className="recently-added-container mb-20"> {/* Add margin-bottom to this container */}
          <div className="items-center justify-center flex ">
            <h1 className="text-gray-400 text-4xl font-bold items-center justify-center mt-10 px-5 sm:px-0 pt-9">
              All Films
            </h1>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 px-5 sm:px-0 mt-10 gap-6">
            {data.map((film) => (
              <div key={film?.id} className="relative h-60">
                <Image
                  src={film?.imageString as string}
                  alt="Film"
                  width={500}
                  height={400}
                  className="rounded-sm absolute w-full h-full object-cover"
                />
                <div className="h-60 relative z-10 w-full transform transition duration-500 hover:scale-125 opacity-0 hover:opacity-100">
                  <div className="bg-gradient-to-b from-transparent via-black/50 to-black z-10 w-full h-full rounded-lg flex items-center justify-center">
                    <Image
                      src={film?.imageString as string}
                      alt="Film"
                      width={800}
                      height={800}
                      className="absolute w-full h-full -z-10 rounded-lg object-cover"
                    />

                    {film && (
                      <FilmCard
                        key={film?.id}
                        age={film?.age as number}
                        filmId={film?.id as number}
                        overview={film?.overview as string}
                        time={film?.duration as number}
                        title={film?.title as string}
                        year={parseInt(film?.release.toString())}
                        youtubeUrl={film?.youtubeString as string}
                        initialRatings={0}
                        watchList={false}
                      />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  } catch (error) {
    console.error("Error fetching watchlist data:", error);
    return (
      <>
        <h1 className="text-white text-4xl font-bold underline mt-10 px-5 sm:px-0">
          Films
        </h1>
        <p>Error fetching film data. Please try again later.</p>
      </>
    );
  }
}
