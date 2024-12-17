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
import { relations, sql } from 'drizzle-orm';
import z from 'zod';

export interface UserJSON {
  id: string;
  email_addresses: { email_address: string }[]; // Assuming email_addresses is an array of objects
  image_url?: string; // Optional as it may not always be present
  name?: string; // If name is available
}

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

// Film Table
export const film = pgTable('film', {
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
  rank: integer('rank').default(sql`0`).notNull(),  // Default rank
});

// UserInteractions Table (Existing)
export const userInteractions = pgTable(
  'userInteractions',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    filmId: integer('filmId')
      .notNull()
      .references(() => film.id, { onDelete: 'cascade' }),
    ratings: integer('ratings').notNull(),
    timestamp: timestamp('timestamp').defaultNow().notNull(),
  },
  (userInteractions) => ({
    primaryKey: primaryKey({
      columns: [userInteractions.userId, userInteractions.filmId],
    }),
  })
);

export const watchedFilms = pgTable(
  'watchedFilms',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    filmId: integer('filmId')
      .notNull()
      .references(() => film.id, { onDelete: 'cascade' }),
    timestamp: timestamp('timestamp').defaultNow().notNull(),
  },
  (watchedFilms) => ({
    primaryKey: primaryKey({
      columns: [watchedFilms.userId, watchedFilms.filmId],
    }),
  })
);

// WatchLists Table
export const watchLists = pgTable('watchLists', {
  id: uuid('id').primaryKey(), // No default value
  userId: text('userId').notNull(),
  filmId: integer('filmId').notNull(),
  isFavorite: boolean('isFavorite').default(false),
  // ... other fields
});

// Recommendations Table (New)
export const filmRecommendations = pgTable('filmRecommendations', {
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),  // User receiving the recommendation
  filmId: integer('filmId')
    .notNull()
    .references(() => film.id, { onDelete: 'cascade' }),  // Film being recommended
  recommendedBy: text('recommendedBy')
    .notNull() // User who recommended the film
    .references(() => users.id, { onDelete: 'cascade' }),
  timestamp: timestamp('timestamp').defaultNow().notNull(),  // When the recommendation was made
});


// UserRatings Table (New)
export const userRatings = pgTable(
  'userRatings',
  {
    id: serial('id'), // Regular column, not a primary key
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    filmId: integer('filmId')
      .notNull()
      .references(() => film.id, { onDelete: 'cascade' }),
    rating: integer('rating').notNull(),
    timestamp: timestamp('timestamp').defaultNow().notNull(),
  },
  (userRatings) => ({
    primaryKey: primaryKey({
      columns: [userRatings.userId, userRatings.filmId],
    }),
  })
);

// Zod Schema for Inserting Films
export const insertFilmSchema = z.object({
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

export const filmRelations = relations(film, ({ many }) => ({
  watchLists: many(watchLists),
  userRatings: many(userRatings), // New relation
}));

export const userInteractionRelations = relations(userInteractions, ({ one }) => ({
  user: one(users, {
    fields: [userInteractions.userId],
    references: [users.id],
  }),
  film: one(film, {
    fields: [userInteractions.filmId],
    references: [film.id],
  }),
}));

export const watchListRelations = relations(watchLists, ({ one }) => ({
  film: one(film, {
    fields: [watchLists.filmId],
    references: [film.id],
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
  film: one(film, {
    fields: [userRatings.filmId],
    references: [film.id],
  }),
}));
