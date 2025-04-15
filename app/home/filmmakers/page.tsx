'use client';

export const dynamic = "force-dynamic";

import FilmmakersSpotlight from "@/app/components/FilmMaker/FilmMakerSpotlights";


const FilmmakersPage = () => {


  return (
   <div>
    <h1 className="text-5xl font-semibold text-center pt-32">FilmMakers Behind the Scenes Page</h1>
    <FilmmakersSpotlight />
   </div>
  );
};

export default FilmmakersPage;
