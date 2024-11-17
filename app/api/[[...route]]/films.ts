import { Hono } from 'hono';
import { db } from '@/db/drizzle';
import { film, watchLists } from '@/db/schema'; // Make sure to import the watchLists schema
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, desc } from 'drizzle-orm';
import { currentUser } from '@clerk/nextjs/server';
import { sql } from 'drizzle-orm/sql';

const app = new Hono();

// GET route to fetch films
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
          id: film.id,
          imageString: film.imageString,
          title: film.title,
          age: film.age,
          duration: film.duration,
          overview: film.overview,
          release: film.release,
          videoSource: film.videoSource,
          category: film.category,
          youtubeString: film.youtubeString,
          createdAt: film.createdAt,
          rank: film.rank,
        })
        .from(film)
        .where(id ? eq(film.id, Number(id)) : undefined) 
        .orderBy(desc(film.createdAt));

      return c.json({ data });
    } catch (error) {
      console.error('Error handling GET / route:', error);
      return c.json({ error: 'Internal Server Error' }, 500);
    }
  }
);

// DELETE route to delete a film
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

      const filmToDelete = db.$with('film_to_delete').as(
        db.select({ id: film.id }).from(film)
          .where(eq(film.id, Number(id))) 
      );

      const [data] = await db
        .with(filmToDelete)
        .delete(film)
        .where(
          eq(film.id, sql`(select id from film_to_delete)`) 
        )
        .returning({
          id: film.id,
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
    filmId: z.number().int().positive(), // Validate filmId is a positive integer
    isFavorite: z.boolean().optional().default(false), // Optional boolean, default to false
  })),
  async (c) => {
    try {
      const user = currentUser();
      const { userId, filmId, isFavorite } = c.req.valid('json');

      if (!user) {
        return c.json({ error: 'Unauthorized' }, 401);
      }

      // Add to the watchlist
      const newWatchlistEntry = await db.insert(watchLists).values({
        id: crypto.randomUUID(), // Generate a new UUID for the watchlist entry
        userId, // User ID from request
        filmId, // Film ID from request
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

