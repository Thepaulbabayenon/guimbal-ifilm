import { Hono } from "hono";
import { createId } from "@paralleldrive/cuid2";
import { db } from "@/db/drizzle";
import { userRatings, users } from "@/db/schema";
import { clerkMiddleware, getAuth } from "@hono/clerk-auth";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { eq, and, inArray } from "drizzle-orm";

// Initialize Hono app
const app = new Hono();

// GET all ratings for a user (with Clerk authentication)
app.get("/", clerkMiddleware(), async (c) => {
  const auth = getAuth(c);

  if (!auth?.userId) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const data = await db
    .select({
      id: userRatings.id, // Ensure the 'id' field is present in the schema
      movieId: userRatings.movieId,
      rating: userRatings.rating,
    })
    .from(userRatings)
    .where(eq(userRatings.userId, auth.userId));

  return c.json({ data });
});

// GET a specific rating by movie ID
app.get(
  "/:id",
  zValidator("param", z.object({ id: z.string().optional() })),
  clerkMiddleware(),
  async (c) => {
    const auth = getAuth(c);
    const { id } = c.req.valid("param");

    if (!id) {
      return c.json({ error: "Missing id" }, 400);
    }

    if (!auth?.userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const [data] = await db
      .select({
        id: userRatings.id, // Ensure this column exists
        movieId: userRatings.movieId,
        rating: userRatings.rating,
      })
      .from(userRatings)
      .where(and(eq(userRatings.userId, auth.userId), eq(userRatings.movieId, parseInt(id, 10))));

    if (!data) {
      return c.json({ error: "Not found" }, 404);
    }

    return c.json({ data });
  }
);

// POST a new rating (create or update a rating for a movie)
app.post(
  "/",
  clerkMiddleware(),
  zValidator(
    "json",
    z.object({
      movieId: z.string(),
      rating: z.number().min(1).max(5),
    })
  ),
  async (c) => {
    const auth = getAuth(c);
    const values = c.req.valid("json");

    if (!auth?.userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    // Insert new rating or update if it exists
    const result = await db
      .insert(userRatings)
      .values({
        userId: auth.userId,
        movieId: parseInt(values.movieId, 10),  // Convert movieId to number
        rating: values.rating,
      })
      .onConflictDoUpdate({
        target: [userRatings.movieId, userRatings.userId],
        set: { rating: values.rating },
      })
      .returning();

    return c.json({ data: result });
  }
);

// DELETE ratings for a specific movie (bulk or by ID)
app.delete(
  "/:id",
  clerkMiddleware(),
  zValidator("param", z.object({ id: z.string().optional() })),
  async (c) => {
    const auth = getAuth(c);
    const { id } = c.req.valid("param");

    if (!id) {
      return c.json({ error: "Missing id" }, 400);
    }

    if (!auth?.userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const [data] = await db
      .delete(userRatings)
      .where(and(eq(userRatings.userId, auth.userId), eq(userRatings.movieId, parseInt(id, 10))))
      .returning();

    if (!data) {
      return c.json({ error: "Not found" }, 404);
    }

    return c.json({ data });
  }
);

// PATCH (update) the rating for a specific movie
app.patch(
  "/:id",
  clerkMiddleware(),
  zValidator("param", z.object({ id: z.string().optional() })),
  zValidator(
    "json",
    z.object({
      rating: z.number().min(1).max(5),
    })
  ),
  async (c) => {
    const auth = getAuth(c);
    const { id } = c.req.valid("param");
    const values = c.req.valid("json");

    if (!id) {
      return c.json({ error: "Missing id" }, 400);
    }

    if (!auth?.userId) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const [data] = await db
      .update(userRatings)
      .set({ rating: values.rating })
      .where(and(eq(userRatings.userId, auth.userId), eq(userRatings.movieId, parseInt(id, 10))))
      .returning();

    if (!data) {
      return c.json({ error: "Not found" }, 404);
    }

    return c.json({ data });
  }
);

export default app;
