import React from "react";

interface FilmReleaseProps {
  year: number;
}

const FilmRelease: React.FC<FilmReleaseProps> = ({ year }) => {
  return (
    <div className="absolute top-5 left-5 bg-gray-800 text-white text-xs font-bold py-1 px-2 rounded-md shadow-md opacity-100">
      {year}
    </div>
  );
};

export default FilmRelease;
