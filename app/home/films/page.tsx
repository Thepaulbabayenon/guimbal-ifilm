// home/films/page.tsx
'use client';
import { getAllFilms } from "@/app/api/getFilms";
import FilmLayout from "@/app/components/FilmLayout";

export default async function Watchlist() {
  try {
    const data = await getAllFilms();

    if (!data || data.length === 0) {
      return (
        <div className="items-center justify-center flex flex-col">
          <h1 className="text-gray-400 text-4xl font-bold underline mt-10 px-5 sm:px-0 pt-9">
            Films
          </h1>
          <p>No films found.</p>
        </div>
      );
    }

    return (
      <FilmLayout
        title="All Films"
        films={data}
        loading={false}
        error={null}
      />
    );
  } catch (error) {
    console.error("Error fetching watchlist data:", error);
    return (
      <FilmLayout
        title="Films"
        films={[]}
        loading={false}
        error="Error fetching film data. Please try again later."
      />
    );
  }
}
