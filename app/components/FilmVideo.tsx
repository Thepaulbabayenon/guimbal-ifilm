import { db } from "@/db/drizzle";
import { film } from "@/db/schema"; // Ensure this import is correct
import { desc } from "drizzle-orm"; // Correct sorting utility
import FilmButtons from "./FilmButtons";

async function getRecommendedFilm() {
  try {
    const recommendedFilms = await db
      .select()
      .from(film)
      .orderBy(desc(film.rank)) // Correct column reference
      .limit(10); 

    if (recommendedFilms.length === 0) {
      throw new Error("No films available.");
    }

    // Select a random film from the top 10
    const randomIndex = Math.floor(Math.random() * recommendedFilms.length);
    return recommendedFilms[randomIndex];
  } catch (error) {
    console.error("Failed to fetch recommended films:", error);
    return null;
  }
}

export default async function FilmVideo() {
  const data = await getRecommendedFilm();

  if (!data) {
    return (
      <div className="h-[55vh] lg:h-[60vh] w-full flex justify-center items-center">
        <p className="text-white text-xl">No films available at the moment.</p>
      </div>
    );
  }

  return (
    <div className="h-[55vh] lg:h-[60vh] w-full flex justify-start items-center">
      <video
        poster={data.imageString}
        autoPlay
        muted
        loop
        src={data.videoSource}
        className="w-full absolute top-0 left-0 h-[60vh] object-cover -z-10 brightness-[60%]"
      ></video>

      <div className="absolute w-[90%] lg:w-[40%] mx-auto">
        <h1 className="text-white text-4xl md:text-5xl lg:text-6xl font-bold">
          {data.title}
        </h1>
        <p className="text-white text-lg mt-5 line-clamp-3">{data.overview}</p>
        <div className="flex gap-x-3 mt-4">
          <FilmButtons
            age={data.age as number}
            duration={data.duration as number}
            id={data.id as number}
            overview={data.overview as string}
            releaseDate={data.release as number}
            title={data.title as string}
            youtubeUrl={data.youtubeString as string}
            key={data.id}
          />
        </div>
      </div>
    </div>
  );
}
