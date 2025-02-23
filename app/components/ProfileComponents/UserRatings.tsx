// components/UserRatings.tsx
import { auth } from "@clerk/nextjs/server";  // This is valid only in Server Components
import { db } from "@/app/db/drizzle";
import { eq } from "drizzle-orm";
import { userRatings, film } from "@/app/db/schema";

export async function UserRatings() {
  const { userId } = auth();  // Ensure auth() is called in a Server Component context
  if (!userId) return null;

  const ratings = await db.query.userRatings.findMany({
    where: eq(userRatings.userId, userId),
    with: { film: true },
    orderBy: (ratings, { desc }) => [desc(ratings.timestamp)],
  });

  return (
    <section>
      <h2>Your Ratings</h2>
      <div className="space-y-4">
        {ratings.map((rating) => (
          <div key={rating.filmId} className="rating-item">
            <h3>{rating.film.title}</h3>
            <div className="stars">
              {[...Array(5)].map((_, i) => (
                <span key={i} className={i < rating.rating ? "filled" : ""}>
                  ★
                </span>
              ))}
            </div>
            <time className="text-sm text-muted">
              {rating.timestamp.toLocaleDateString()}
            </time>
          </div>
        ))}
      </div>
    </section>
  );
}
