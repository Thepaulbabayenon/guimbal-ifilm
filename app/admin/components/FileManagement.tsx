import { db } from '@/app/db/drizzle';
import { film } from '@/app/db/schema';
import { eq } from 'drizzle-orm';
import FilmForm from './FilmForm';
import Link from 'next/link';
import DeleteButton from './DeleteButton';

const FilmManagement = async ({ films, filmId }: { films: any[]; filmId?: string }) => {
  // Ensure filmId is a valid number
  const parsedFilmId = filmId && !isNaN(Number(filmId)) ? parseInt(filmId) : null;

  // Fetch selected film only if filmId is valid
  const selectedFilm = parsedFilmId
    ? await db.query.film.findFirst({
        where: eq(film.id, parsedFilmId),
      })
    : null;

  return (
    <section className="mb-12">
      <h2 className="text-2xl font-semibold mb-4">Film Management</h2>
      <FilmForm initialData={selectedFilm} />
      <div className="mt-6 grid gap-4">
        {films.map((filmItem) => (
          <div key={filmItem.id} className="p-4 border rounded-lg flex items-center justify-between">
            <div>
              <h3 className="font-medium">{filmItem.title}</h3>
              <p className="text-sm text-gray-600">
                {filmItem.category} • {filmItem.duration} mins
              </p>
            </div>
            <div className="flex gap-2">
              <Link
                href={`/admin?filmId=${filmItem.id}`}
                className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
              >
                Edit
              </Link>
              <DeleteButton filmId={filmItem.id} />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FilmManagement;
