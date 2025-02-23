// components/WatchHistory.tsx
import { auth } from "@clerk/nextjs/server";  // This is valid only in Server Components
import { db } from "@/app/db/drizzle";
import { eq } from "drizzle-orm";
import { watchedFilms, film } from "@/app/db/schema";

type WatchHistoryEntry = {
  filmId: number;
  currentTimestamp: number | null;
  film: {
    imageString: string;
    title: string;
    duration: number;
  };
};

export async function WatchHistory() {
  const { userId } = auth();  // Ensure auth() is called in a Server Component context
  if (!userId) return null;

  const history: WatchHistoryEntry[] = await db.query.watchedFilms.findMany({
    where: eq(watchedFilms.userId, userId),
    with: {
      film: true,
    },
    orderBy: (watchedFilms, { desc }) => [desc(watchedFilms.timestamp)],
  });

  return (
    <section>
      <h2>Watch History</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {history.map((entry) => (
          <div key={entry.filmId} className="relative">
            <img
              src={entry.film.imageString || '/default-image.jpg'}
              alt={entry.film.title}
              className="rounded-lg"
            />
            <div className="absolute bottom-0 left-0 right-0 bg-black/70 p-2">
              <p className="text-sm truncate">{entry.film.title}</p>
              <progress
                value={entry.currentTimestamp ?? 0}
                max={entry.film.duration ?? 0}
                className="w-full"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
