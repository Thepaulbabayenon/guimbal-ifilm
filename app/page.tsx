import { getUserFromSession } from "@/app/auth/core/session";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import FilmPoster from "@/app/components/LandingPageComponents/FilmPoster";
import { LandingLogo } from "@/app/components/LandingPageComponents/LandingLogo";
import { FilmPosterCard } from "@/app/components/LandingPageComponents/FilmPosterCard";
import { getTopRatedFilms } from "@/app/api/getFilms";

export default async function Home() {
  const cookiesObject = Object.fromEntries(
    Array.from(cookies().getAll()).map(cookie => [cookie.name, cookie.value])
  );

  const user = await getUserFromSession(cookiesObject);

  if (user) {
    redirect("/home");
  }

  // Fetch the top 10 films
  const top10Films = await getTopRatedFilms(); 

  return (
    <main className="relative flex flex-col items-center justify-between w-full min-h-screen bg-black text-white overflow-hidden">
      
      {/* Background Film Poster Covering Entire Screen */}
      <div className="absolute inset-0 w-full h-full top-0 left-0">
        <FilmPoster />
        {/* Dark overlay for better readability */}
        <div className="absolute inset-0 bg-black/60"></div>
      </div>

      {/* Foreground Content */}
      <div className="relative z-10 flex flex-col items-center text-center w-full px-4 pt-12">
        <LandingLogo  />

        <h1 className="text-2xl sm:text-3xl font-extrabold text-white drop-shadow-lg">
          <span className="text-yellow-400">THE BANTAYAN FILM FESTIVAL</span>
        </h1>

        <p className="text-xs sm:text-sm text-yellow-400 mt-2 max-w-xl leading-relaxed px-4">
          A COMMUNITY OF FILMMAKERS SINCE 2005
        </p>

        <a
          href="/sign-in"
          className="mt-6 px-6 py-3 bg-yellow-500 text-black font-semibold rounded-full shadow-lg hover:bg-yellow-400 transition-all duration-300 transform hover:scale-105"
        >
          Get Started
        </a>
      </div>

      {/* TOP FILMS SECTION */}
      <div className="relative z-10 flex flex-col items-center text-center w-full mt-8 px-4">
        <h2 className="text-3xl sm:text-4xl text-yellow-400 font-bold">BEST FILMS</h2>
        <p className="mt-2 text-xs sm:text-sm text-yellow-400 text-center px-4">
          Experience the rich tapestry of regional storytelling through powerful short films
        </p>
      </div>

      {/* Grid Layout for Film Posters */}
      <div className="relative z-10 grid grid-cols-5 gap-2 w-full px-4 max-w-md py-6">
        {top10Films.map((film) => (
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