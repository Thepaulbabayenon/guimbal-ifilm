import { FC, useEffect, useState } from 'react';

interface ContinueWatchingProps {
  userId: string;
}

const ContinueWatching: FC<ContinueWatchingProps> = ({ userId }) => {
  const [films, setFilms] = useState([]);

  useEffect(() => {
    const fetchFilms = async () => {
      const response = await fetch(`/api/films/watched-films?userId=${userId}`);
      const data = await response.json();
      setFilms(data);
    };

    fetchFilms();
  }, [userId]);

  return (
    <div>
      <h2>Continue Watching</h2>
      <ul>
        {films.map((film: any) => (
          <li key={film.filmId}>
            <a href={`/films/${film.filmId}`}>Film ID: {film.filmId}</a>
            (Last watched: {Math.floor(film.currentTimestamp / 60)} mins)
          </li>
        ))}
      </ul>
    </div>
  );
};

export default ContinueWatching;
