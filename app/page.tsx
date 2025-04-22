import { getUserFromSession } from "@/app/auth/core/session";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { Suspense } from "react";
import { unstable_cache } from "next/cache";
import FilmPoster from "@/app/components/LandingPageComponents/FilmPoster";
import { LandingLogo } from "@/app/components/LandingPageComponents/LandingLogo";
import { FilmPosterCard } from "@/app/components/LandingPageComponents/FilmPosterCard";
import { getTopRatedFilms } from "@/app/api/getFilms";

// Cache the top rated films data for 1 hour
const getTopRatedFilmsCached = unstable_cache(
  async () => getTopRatedFilms(),
  ["top-rated-films"],
  { revalidate: 3600 } // 1 hour
);

export default async function Home() {
  const cookieStore = await cookies();
  const cookiesObject = Object.fromEntries(
    Array.from(cookieStore.getAll()).map(cookie => [cookie.name, cookie.value])
  );

  const user = await getUserFromSession(cookiesObject);

  if (user) {
    redirect("/home");
  }

  // Fetch the top 10 films with caching
  const top10Films = await getTopRatedFilmsCached();

  return (
    <main className="relative flex flex-col items-center justify-between w-full min-h-screen bg-black text-white overflow-hidden">
      
      {/* Background Film Poster with Suspense boundary */}
      <div className="absolute inset-0 w-full h-full">
        <Suspense fallback={<div className="absolute inset-0 bg-black"></div>}>
          <FilmPoster />
        </Suspense>
        {/* Dark overlay for better readability */}
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col items-center text-center w-full px-4 pt-12">
        <LandingLogo />

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow-lg">
          <span className="text-yellow-400">THE BANTAYAN FILM FESTIVAL</span>
        </h1>

        <p className="text-xs sm:text-sm text-yellow-400 mt-2 max-w-xl leading-relaxed px-4">
          A COMMUNITY OF FILMMAKERS SINCE 2005
        </p>

        <div className="relative mt-6">
          <a
            href="/sign-in"
            className="relative px-6 py-3 bg-yellow-500 text-black font-semibold rounded-full hover:bg-yellow-400 transition-all duration-300 mb-2"
            style={{
              boxShadow: "0 0 10px 2px rgba(255, 215, 0, 0.5)"
            }}
          >
            Get Started
          </a>
          <p className="text-xs mt-4">
            Google, Discord and Github sign-in only available using external browser
          </p>
        </div>
      </div>

      {/* TOP FILMS SECTION */}
      <div className="relative z-10 flex flex-col items-center text-center w-full mt-8 px-4">
        <h2 className="text-3xl sm:text-4xl text-yellow-400 font-bold">BEST FILMS</h2>
        <p className="mt-2 text-xs sm:text-sm text-yellow-400 text-center px-4">
          Experience the rich tapestry of regional storytelling through powerful short films
        </p>
      </div>

      {/* Grid Layout for Film Posters */}
      <div className="relative z-10 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 w-full px-4 max-w-6xl py-6">
        {top10Films.slice(0, 10).map((film) => (
          <FilmPosterCard 
            key={film.id} 
            filmId={film.id} 
            initialTitle={film.title}
            className="aspect-[2/3] w-full" 
          />
        ))}
      </div>
    </main>
  );
}
