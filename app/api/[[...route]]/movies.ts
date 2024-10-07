import { Hono } from 'hono';
import { db } from '@/db/drizzle';
import { movie, watchLists } from '@/db/schema'; // Make sure to import the watchLists schema
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, desc } from 'drizzle-orm';
import { currentUser } from '@clerk/nextjs/server';
import { sql } from 'drizzle-orm/sql';

const app = new Hono();

// GET route to fetch movies
app.get(
  '/',
  zValidator('query', z.object({
    id: z.string().optional(),
  })),
  async (c) => {
    try {
      const user = currentUser();
      const { id } = c.req.valid('query');

      if (!user) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const data = await db
        .select({
          id: movie.id,
          imageString: movie.imageString,
          title: movie.title,
          age: movie.age,
          duration: movie.duration,
          overview: movie.overview,
          release: movie.release,
          videoSource: movie.videoSource,
          category: movie.category,
          youtubeString: movie.youtubeString,
          createdAt: movie.createdAt,
          rank: movie.rank,
        })
        .from(movie)
        .where(id ? eq(movie.id, Number(id)) : undefined) 
        .orderBy(desc(movie.createdAt));

      return c.json({ data });
    } catch (error) {
      console.error('Error handling GET / route:', error);
      return c.json({ error: 'Internal Server Error' }, 500);
    }
  }
);

// DELETE route to delete a movie
app.delete(
  '/:id',
  zValidator('param', z.object({
    id: z.string(),
  })),
  async (c) => {
    try {
      const user = currentUser();
      const { id } = c.req.valid('param');

      if (!user) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      const movieToDelete = db.$with('movie_to_delete').as(
        db.select({ id: movie.id }).from(movie)
          .where(eq(movie.id, Number(id))) 
      );

      const [data] = await db
        .with(movieToDelete)
        .delete(movie)
        .where(
          eq(movie.id, sql`(select id from movie_to_delete)`) 
        )
        .returning({
          id: movie.id,
        });

      if (!data) {
        return c.json({ error: 'Not found' }, 404);
      }

      return c.json({ data });
    } catch (error) {
      console.error('Error handling DELETE /:id route:', error);
      return c.json({ error: 'Internal Server Error' }, 500);
    }
  }
);

// POST route to add to watchlist
app.post(
  '/watchlist/add',
  zValidator('json', z.object({
    userId: z.string().uuid(), // Validate userId is a UUID
    movieId: z.number().int().positive(), // Validate movieId is a positive integer
    isFavorite: z.boolean().optional().default(false), // Optional boolean, default to false
  })),
  async (c) => {
    try {
      const user = currentUser();
      const { userId, movieId, isFavorite } = c.req.valid('json');

      if (!user) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      // Add to the watchlist
      const newWatchlistEntry = await db.insert(watchLists).values({
        id: crypto.randomUUID(), // Generate a new UUID for the watchlist entry
        userId, // User ID from request
        movieId, // Movie ID from request
        isFavorite, // Favorite status from request
      });

      return c.json({ data: newWatchlistEntry }, 201);
    } catch (error) {
      console.error('Error handling POST /watchlist/add route:', error);
      return c.json({ error: 'Internal Server Error' }, 500);
    }
  }
);

app.onError((err, c) => {
  console.error('Unhandled Error:', err);
  return c.json({ error: 'Internal Server Error' }, 500);
});

app.notFound((c) => {
  return c.json({ error: 'Not Found' }, 404);
});

export default app;

