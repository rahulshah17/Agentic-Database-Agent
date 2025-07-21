import { pgTable, serial, varchar, timestamp, text, integer, boolean, pgEnum } from "drizzle-orm/pg-core";

export const songs = pgTable("songs", {
  id: serial("id").primaryKey(),
  title: varchar("title", { length: 255 }),
  artist: varchar("artist", { length: 255 }),
  album: varchar("album", { length: 255 }),
  played_at: timestamp("played_at"),
});

export const albums = pgTable("albums", {
  id: serial("id").primaryKey(),
  album_name: varchar("album_name", { length: 255 }),
});

export const film_industries = pgTable("film_industries", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }),
});

export const grammy = pgTable("grammy", {
  id: serial("id").primaryKey(),
  song_title: varchar("song_title", { length: 255 }),
});

