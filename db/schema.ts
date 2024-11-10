// /app/db/schema.ts

import {
  pgTable,
  serial,
  text,
  varchar,
  integer,
  timestamp,
  doublePrecision,
  primaryKey,
  boolean,
  uuid,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';
import z from 'zod';

// Users Table
export const users = pgTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').notNull().unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
  isAdmin: boolean('isAdmin').default(false),
});

// Accounts Table
export const accounts = pgTable(
  'account',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => ({
    compoundKey: primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  })
);

// Sessions Table
export const sessions = pgTable('session', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

// VerificationTokens Table
export const verificationTokens = pgTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (verificationToken) => ({
    compositePk: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  })
);

// Authenticators Table
export const authenticators = pgTable(
  'authenticator',
  {
    credentialID: text('credentialID').notNull().unique(),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    providerAccountId: text('providerAccountId').notNull(),
    credentialPublicKey: text('credentialPublicKey').notNull(),
    counter: integer('counter').notNull(),
    credentialDeviceType: text('credentialDeviceType').notNull(),
    credentialBackedUp: boolean('credentialBackedUp').notNull(),
    transports: text('transports'),
  },
  (authenticator) => ({
    compositePK: primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  })
);

// Movie Table
export const movie = pgTable('movie', {
  id: serial('id').primaryKey(),
  imageString: varchar('imageString').notNull(),
  title: varchar('title').notNull(),
  age: integer('age').notNull(),
  duration: doublePrecision('duration').notNull(),
  overview: text('overview').notNull(),
  release: integer('release').notNull(),
  videoSource: varchar('videoSource').notNull(),
  category: varchar('category').notNull(),
  youtubeString: varchar('youtubeString').notNull(),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  rank: integer('rank').notNull(),
});

// UserInteractions Table (Existing)
export const userInteractions = pgTable(
  'userInteractions',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    movieId: integer('movieId')
      .notNull()
      .references(() => movie.id, { onDelete: 'cascade' }),
    ratings: integer('ratings').notNull(),
    timestamp: timestamp('timestamp').defaultNow().notNull(),
  },
  (userInteractions) => ({
    primaryKey: primaryKey({
      columns: [userInteractions.userId, userInteractions.movieId],
    }),
  })
);

export const watchedMovies = pgTable(
  'watchedMovies',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    movieId: integer('movieId')
      .notNull()
      .references(() => movie.id, { onDelete: 'cascade' }),
    timestamp: timestamp('timestamp').defaultNow().notNull(),
  },
  (watchedMovies) => ({
    primaryKey: primaryKey({
      columns: [watchedMovies.userId, watchedMovies.movieId],
    }),
  })
);

// WatchLists Table
export const watchLists = pgTable('watchLists', {
  id: uuid('id').primaryKey(), // No default value
  userId: text('userId').notNull(),
  movieId: integer('movieId').notNull(),
  isFavorite: boolean('isFavorite').default(false),
  // ... other fields
});

// UserRatings Table (New)
// UserRatings Table (New)
export const userRatings = pgTable(
  'userRatings',
  {
    id: serial('id'), // This is now just a regular column, not a primary key
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    movieId: integer('movieId')
      .notNull()
      .references(() => movie.id, { onDelete: 'cascade' }),
    rating: integer('rating').notNull(),
    timestamp: timestamp('timestamp').defaultNow().notNull(),
  },
  (userRatings) => ({
    // Composite primary key on 'userId' and 'movieId'
    primaryKey: primaryKey({
      columns: [userRatings.userId, userRatings.movieId],
    }),
  })
);




// Zod Schema for Inserting Movies
export const insertMovieSchema = z.object({
  imageString: z.string().min(1),
  title: z.string().min(1),
  age: z.number().int().positive(),
  duration: z.number().positive(),
  overview: z.string().min(1),
  release: z.number().int().positive(),
  videoSource: z.string().min(1),
  category: z.string().min(1),
  youtubeString: z.string().min(1),
  rank: z.number().int().positive(),
});

// Relations Definitions
export const accountRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessionRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const userRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  authenticators: many(authenticators),
  watchLists: many(watchLists),
  userRatings: many(userRatings), // New relation
}));

export const movieRelations = relations(movie, ({ many }) => ({
  watchLists: many(watchLists),
  userRatings: many(userRatings), // New relation
}));

export const userInteractionRelations = relations(userInteractions, ({ one }) => ({
  user: one(users, {
    fields: [userInteractions.userId],
    references: [users.id],
  }),
  movie: one(movie, {
    fields: [userInteractions.movieId],
    references: [movie.id],
  }),
}));

export const watchListRelations = relations(watchLists, ({ one }) => ({
  movie: one(movie, {
    fields: [watchLists.movieId],
    references: [movie.id],
  }),
  user: one(users, {
    fields: [watchLists.userId],
    references: [users.id],
  }),
}));

export const authenticatorRelations = relations(authenticators, ({ one }) => ({
  user: one(users, {
    fields: [authenticators.userId],
    references: [users.id],
  }),
}));

export const userRatingsRelations = relations(userRatings, ({ one }) => ({
  user: one(users, {
    fields: [userRatings.userId],
    references: [users.id],
  }),
  movie: one(movie, {
    fields: [userRatings.movieId],
    references: [movie.id],
  }),
}));
