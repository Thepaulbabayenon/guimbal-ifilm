import { Hono } from 'hono';
import { db } from '@/db/drizzle';
import { userRatings } from '@/db/schema';
import { clerkMiddleware, getAuth } from '@hono/clerk-auth';
import { zValidator } from '@hono/zod-validator';
import { z } from 'zod';
import { eq, and } from 'drizzle-orm';

// Define the 'ratings' routes
const ratingsApp = new Hono();

ratingsApp.get('/', clerkMiddleware(), async (c) => {
  const auth = getAuth(c);
  if (!auth?.userId) return c.json({ error: 'Unauthorized' }, 401);

  const data = await db
    .select({ id: userRatings.id, movieId: userRatings.movieId, rating: userRatings.rating })
    .from(userRatings)
    .where(eq(userRatings.userId, auth.userId));

  return c.json({ data });
});

ratingsApp.get('/:id', zValidator('param', z.object({ id: z.string() })), clerkMiddleware(), async (c) => {
  const auth = getAuth(c);
  const { id } = c.req.valid('param');
  if (!id || !auth?.userId) return c.json({ error: 'Unauthorized or Missing id' }, 400);

  const data = await db
    .select({ id: userRatings.id, movieId: userRatings.movieId, rating: userRatings.rating })
    .from(userRatings)
    .where(and(eq(userRatings.userId, auth.userId), eq(userRatings.movieId, parseInt(id, 10))));

  if (!data) return c.json({ error: 'Not found' }, 404);

  return c.json({ data });
});

ratingsApp.post('/', clerkMiddleware(), zValidator('json', z.object({
  movieId: z.string(),
  rating: z.number().min(1).max(5),
})), async (c) => {
  const auth = getAuth(c);
  const values = c.req.valid('json');

  if (!auth?.userId) return c.json({ error: 'Unauthorized' }, 401);

  const result = await db
    .insert(userRatings)
    .values({ userId: auth.userId, movieId: parseInt(values.movieId, 10), rating: values.rating })
    .onConflictDoUpdate({ target: [userRatings.movieId, userRatings.userId], set: { rating: values.rating } })
    .returning();

  return c.json({ data: result });
});

ratingsApp.delete('/:id', clerkMiddleware(), zValidator('param', z.object({ id: z.string() })), async (c) => {
  const auth = getAuth(c);
  const { id } = c.req.valid('param');
  if (!id || !auth?.userId) return c.json({ error: 'Unauthorized or Missing id' }, 400);

  const data = await db
    .delete(userRatings)
    .where(and(eq(userRatings.userId, auth.userId), eq(userRatings.movieId, parseInt(id, 10))))
    .returning();

  if (!data) return c.json({ error: 'Not found' }, 404);

  return c.json({ data });
});

ratingsApp.patch('/:id', clerkMiddleware(), zValidator('param', z.object({ id: z.string() })), zValidator('json', z.object({ rating: z.number().min(1).max(5) })), async (c) => {
  const auth = getAuth(c);
  const { id } = c.req.valid('param');
  const values = c.req.valid('json');

  if (!id || !auth?.userId) return c.json({ error: 'Unauthorized or Missing id' }, 400);

  const data = await db
    .update(userRatings)
    .set({ rating: values.rating })
    .where(and(eq(userRatings.userId, auth.userId), eq(userRatings.movieId, parseInt(id, 10))))
    .returning();

  if (!data) return c.json({ error: 'Not found' }, 404);

  return c.json({ data });
});

export default ratingsApp;
export type RatingsAppType = typeof ratingsApp;
