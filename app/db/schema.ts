import { relations, sql } from "drizzle-orm";
import {
  boolean,
  doublePrecision,
  integer,
  pgEnum,
  pgTable,
  primaryKey,
  real,
  serial,
  text,
  timestamp,
  uuid,
  varchar,
} from "drizzle-orm/pg-core";
import z from "zod";

// ===== Enums =====
export const userRoles = ["admin", "user"] as const;
export type UserRole = (typeof userRoles)[number];
export const userRoleEnum = pgEnum("user_roles", userRoles);

export const oAuthProviders = ["discord", "github", "google"] as const;
export type OAuthProvider = (typeof oAuthProviders)[number];
export const oAuthProviderEnum = pgEnum("oauth_providers", oAuthProviders);

// ===== User Tables =====
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  password: text("password"),
  username: text("username"),
  salt: text("salt"),
  role: userRoleEnum("role").notNull().default("user"),
  emailVerified: timestamp("email_verified", { withTimezone: true }),
  image: text("image"),
  // Add 2FA fields
  twoFactorSecret: text("two_factor_secret"),
  twoFactorEnabled: boolean("two_factor_enabled").notNull().default(false),
  twoFactorBackupCodes: text("two_factor_backup_codes").array(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const userOAuthAccounts = pgTable(
  "user_oauth_accounts",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    provider: oAuthProviderEnum("provider").notNull(),
    providerAccountId: text("provider_account_id").notNull(),
    refresh_token: text("refresh_token"),
    access_token: text("access_token"),
    expires_at: integer("expires_at"),
    token_type: text("token_type"),
    scope: text("scope"),
    id_token: text("id_token"),
    session_state: text("session_state"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => ({
    primaryKey: primaryKey({ columns: [t.provider, t.providerAccountId] }),
  })
);

// Add a new table for 2FA sessions
export const twoFactorSessions = pgTable("two_factor_sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  verified: boolean("verified").notNull().default(false),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const sessions = pgTable("sessions", {
  id: uuid("id").primaryKey().defaultRandom(),
  sessionToken: text("session_token").notNull().unique(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  expires: timestamp("expires", { withTimezone: true }).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const verificationTokens = pgTable(
  "verificationToken",
  {
    identifier: text("identifier").notNull(),
    token: text("token").notNull(),
    expires: timestamp("expires", { withTimezone: true }).notNull(),
  },
  (verificationToken) => ({
    primaryKey: primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  })
);

// ===== Content Tables =====
export const film = pgTable("films", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }).notNull(),
  imageUrl: varchar("image_url", { length: 1000 }).notNull(),
  overview: text("overview").notNull(),
  duration: doublePrecision("duration").notNull(),
  releaseYear: integer("release_year").notNull(),
  ageRating: integer("age_rating").notNull(),
  videoSource: varchar("video_source", { length: 1000 }).notNull(),
  trailerUrl: varchar("trailer_url", { length: 1000 }).notNull(),
  category: varchar("category", { length: 100 }).notNull(),
  director: varchar("director", { length: 255 }),
  coDirector: varchar("co_director", { length: 255 }),
  producer: varchar("producer", { length: 255 }),
  studio: varchar("studio", { length: 255 }),
  rank: integer("rank").default(0),
  averageRating: real("average_rating"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
    uploadedBy: uuid("uploader_by").references(() => users.id, { onDelete: "cascade" })
});



// UserInteractions Table (Existing)
export const userInteractions = pgTable(
  'userInteractions',
  {
    userId: uuid('userId')  // Changed text to uuid to match users.id type
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

export const genres = pgTable("genres", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull().unique(),
});

export const filmGenres = pgTable(
  "film_genres", 
  {
    filmId: integer("film_id")
      .notNull()
      .references(() => film.id, { onDelete: "cascade" }),
    genreId: integer("genre_id")
      .notNull()
      .references(() => genres.id, { onDelete: "cascade" }),
  },
  (t) => ({
    primaryKey: primaryKey({ columns: [t.filmId, t.genreId] }),
  })
);

// ===== User Interaction Tables =====
export const userRatings = pgTable(
  "user_ratings",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    filmId: integer("film_id")
      .notNull()
      .references(() => film.id, { onDelete: "cascade" }),
    rating: integer("rating").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => ({
    primaryKey: primaryKey({ columns: [t.userId, t.filmId] }),
  })
);

export const watchedFilms = pgTable(
  "watched_films",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    filmId: integer("film_id")
      .notNull()
      .references(() => film.id, { onDelete: "cascade" }),
    watchedAt: timestamp("watched_at", { withTimezone: true }).notNull().defaultNow(),
    currentTimestamp: doublePrecision("current_timestamp").default(0), // Last played position in seconds
    completedWatching: boolean("completed_watching").default(false),
  },
  (t) => ({
    primaryKey: primaryKey({ columns: [t.userId, t.filmId] }),
  })
);

export const watchLists = pgTable(
  "watch_lists",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    filmId: integer("film_id")
      .notNull()
      .references(() => film.id, { onDelete: "cascade" }),
    isFavorite: boolean("is_favorite").default(false),
    addedAt: timestamp("added_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    primaryKey: primaryKey({ columns: [t.userId, t.filmId] }),
  })
);

export const comments = pgTable("comments", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  filmId: integer("film_id")
    .notNull()
    .references(() => film.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});


const emailSchema = z.string().email("Invalid email format").regex(
  /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
  "Invalid email address"
);

export const signInSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, "Password is required"),
});

export const signUpSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: emailSchema,
  username: z.string().min(1, "Username is required"),
  password: z
    .string()
    .min(6, "Password must be at least 6 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[@#$%^&*!]/, "Password must contain at least one special character (@#$%^&*!)"),
});

export const resetTokens = pgTable("reset_tokens", {
  id: text("id").primaryKey().default(sql`gen_random_uuid()`), // ✅ Generate UUID
  email: text("email").notNull(),
  token: text("token").unique().notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
})


export const commentVotes = pgTable(
  "comment_votes",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    commentId: integer("comment_id")
      .notNull()
      .references(() => comments.id, { onDelete: "cascade" }),
    voteType: varchar("vote_type", { length: 10 }).notNull(), // 'up' or 'down'
  },
  (t) => ({
    primaryKey: primaryKey({ columns: [t.userId, t.commentId] }),
  })
);

export const playlists = pgTable("playlists", {
  id: serial("id").primaryKey(),
  userId: uuid("user_id")
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),
  title: varchar("title", { length: 255 }).notNull(),
  description: text("description"),
  isPublic: boolean("is_public").default(true),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const playlistItems = pgTable(
  "playlist_items",
  {
    playlistId: integer("playlist_id")
      .notNull()
      .references(() => playlists.id, { onDelete: "cascade" }),
    filmId: integer("film_id")
      .notNull()
      .references(() => film.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    addedAt: timestamp("added_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    primaryKey: primaryKey({ columns: [t.playlistId, t.filmId] }),
  })
);

export const userPreferences = pgTable("user_preferences", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  favoriteGenres: text("favorite_genres"), // Stored as comma-separated values or JSON
  preferredMoods: text("preferred_moods"),
  themes: text("themes"),
  updateAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});

export const announcements = pgTable("announcements", {
  id: serial("id").primaryKey(),

  adminId: uuid("admin_id") // ✅ New column for tracking admin who created the announcement
    .notNull()
    .references(() => users.id, { onDelete: "cascade" }),

  title: varchar("title", { length: 255 }).notNull(),
  content: text("content").notNull(),
  isActive: boolean("is_active").default(true),
  
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});


export const dismissedAnnouncements = pgTable(
  "dismissed_announcements",
  {
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    announcementId: integer("announcement_id")
      .notNull()
      .references(() => announcements.id, { onDelete: "cascade" }),
    dismissedAt: timestamp("dismissed_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => ({
    primaryKey: primaryKey({ columns: [t.userId, t.announcementId] }),
  })
);

// ===== File Storage =====
export const files = pgTable("files", {
  id: serial("id").primaryKey(),
  fileName: varchar("file_name", { length: 255 }).notNull(),
  s3Url: varchar("s3_url", { length: 500 }).notNull(),
  uploadDate: timestamp("upload_date", { withTimezone: true }).notNull().defaultNow(),
  uploadedBy: uuid("uploaded_by").references(() => users.id, { onDelete: "set null" }),
  fileSize: integer("file_size"), // in bytes
  mimeType: varchar("mime_type", { length: 100 }),
});

// ===== Zod Schemas =====
export const insertFilmSchema = z.object({
  title: z.string().min(1),
  imageUrl: z.string().min(1),
  overview: z.string().min(1),
  duration: z.number().positive(),
  releaseYear: z.number().int().positive(),
  ageRating: z.string().optional(),
  videoSource: z.string().min(1),
  trailerUrl: z.string().optional(),
  category: z.string().min(1),
  director: z.string().optional(),
  coDirector: z.string().optional(),
  producer: z.string().optional(),
  studio: z.string().optional(),
  rank: z.number().int().positive().optional(),
});

// ===== Relations =====
export const userRelations = relations(users, ({ many }) => ({
  oAuthAccounts: many(userOAuthAccounts),
  sessions: many(sessions),
  ratings: many(userRatings),
  watchedFilms: many(watchedFilms),
  watchLists: many(watchLists),
  comments: many(comments),
  commentVotes: many(commentVotes),
  playlists: many(playlists),
  createdAnnouncements: many(announcements),  // Simplified relation without relationName
  dismissedAnnouncements: many(dismissedAnnouncements),
  uploadedFiles: many(files, { relationName: "uploadedFiles" }),
}));

export const userOAuthAccountRelations = relations(userOAuthAccounts, ({ one }) => ({
  user: one(users, {
    fields: [userOAuthAccounts.userId],
    references: [users.id],
  }),
}));

export const sessionRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const filmRelations = relations(film, ({ many, one}) => ({
  genres: many(filmGenres),
  ratings: many(userRatings),
  watchedBy: many(watchedFilms),
  inWatchLists: many(watchLists),
  comments: many(comments),
  inPlaylists: many(playlistItems),
  uploader: one(users, {
    fields: [film.uploadedBy],
    references: [users.id],
  }),
}));

export const genreRelations = relations(genres, ({ many }) => ({
  films: many(filmGenres),
}));

export const filmGenreRelations = relations(filmGenres, ({ one }) => ({
  film: one(film, {
    fields: [filmGenres.filmId],
    references: [film.id],
  }),
  genre: one(genres, {
    fields: [filmGenres.genreId],
    references: [genres.id],
  }),
}));

export const userRatingRelations = relations(userRatings, ({ one }) => ({
  user: one(users, {
    fields: [userRatings.userId],
    references: [users.id],
  }),
  film: one(film, {
    fields: [userRatings.filmId],
    references: [film.id],
  }),
}));

export const watchedFilmRelations = relations(watchedFilms, ({ one }) => ({
  user: one(users, {
    fields: [watchedFilms.userId],
    references: [users.id],
  }),
  film: one(film, {
    fields: [watchedFilms.filmId],
    references: [film.id],
  }),
}));

export const watchListRelations = relations(watchLists, ({ one }) => ({
  user: one(users, {
    fields: [watchLists.userId],
    references: [users.id],
  }),
  film: one(film, {
    fields: [watchLists.filmId],
    references: [film.id],
  }),
}));

export const commentRelations = relations(comments, ({ one, many }) => ({
  user: one(users, {
    fields: [comments.userId],
    references: [users.id],
  }),
  film: one(film, {
    fields: [comments.filmId],
    references: [film.id],
  }),
  votes: many(commentVotes),
}));

export const commentVoteRelations = relations(commentVotes, ({ one }) => ({
  user: one(users, {
    fields: [commentVotes.userId],
    references: [users.id],
  }),
  comment: one(comments, {
    fields: [commentVotes.commentId],
    references: [comments.id],
  }),
}));

export const playlistRelations = relations(playlists, ({ one, many }) => ({
  user: one(users, {
    fields: [playlists.userId],
    references: [users.id],
  }),
  items: many(playlistItems),
}));

export const playlistItemRelations = relations(playlistItems, ({ one }) => ({
  playlist: one(playlists, {
    fields: [playlistItems.playlistId],
    references: [playlists.id],
  }),
  film: one(film, {
    fields: [playlistItems.filmId],
    references: [film.id],
  }),
}));

export const userPreferenceRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}));

export const announcementRelations = relations(announcements, ({ one, many }) => ({
  admin: one(users, { 
    fields: [announcements.adminId],  
    references: [users.id],
  }),
  dismissedBy: many(dismissedAnnouncements),
}));

export const dismissedAnnouncementRelations = relations(dismissedAnnouncements, ({ one }) => ({
  user: one(users, {
    fields: [dismissedAnnouncements.userId],
    references: [users.id],
  }),
  announcement: one(announcements, {
    fields: [dismissedAnnouncements.announcementId],
    references: [announcements.id],
  }),
}));

export const fileRelations = relations(files, ({ one }) => ({
  uploader: one(users, {
    fields: [files.uploadedBy],
    references: [users.id],
    relationName: "uploadedFiles",
  }),
}));