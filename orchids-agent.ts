#!/usr/bin/env ts-node

const dotenv = require("dotenv");
dotenv.config({ path: ".env.local" });

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

async function main() {
    const query = process.argv.slice(2).join(" ");
    console.log(`Database Agent: Received query -> "${query}"`);

    // Enhanced query processing
    if (query.toLowerCase().includes("recently played")) {
        console.log("Creating 'recently_played' table...");

        const schemaPath = path.join("db", "schema.ts");
        const schemaCode = `
            import { pgTable, serial, varchar, timestamp } from "drizzle-orm/pg-core";

            export const recentlyPlayed = pgTable("recently_played", {
            id: serial("id").primaryKey(),
            songName: varchar("song_name", { length: 255 }).notNull(),
            artist: varchar("artist", { length: 255 }).notNull(),
            playedAt: timestamp("played_at").defaultNow(),
            });
        `;

        let schemaExists = false;
        if (fs.existsSync(schemaPath)) {
            const schemaContent = fs.readFileSync(schemaPath, "utf8");
            if (schemaContent.includes("export const recentlyPlayed")) {
                schemaExists = true;
            }
        }

        if (schemaExists) {
            console.log("'recently_played' schema already exists. Skipping append.");
        } else {
            fs.appendFileSync(schemaPath, schemaCode);
            console.log("Schema updated!");
        }

        console.log("Running migrations...");
        execSync("npx drizzle-kit generate && npx drizzle-kit push", {
            stdio: "inherit",
        });

        // Populate with sample data if requested
        if (query.toLowerCase().includes("populate") || query.toLowerCase().includes("sample")) {
            console.log("Populating with sample data...");
            await populateSampleData();
        }

        console.log("Creating API route...");
        const apiDir = path.join("app", "api", "recently-played");
        fs.mkdirSync(apiDir, { recursive: true });
        fs.writeFileSync(
            path.join(apiDir, "route.ts"),
            `
                import { NextResponse } from "next/server";
                import { db } from "@/db"; 
                import { recentlyPlayed } from "@/db/schema";

                export async function GET() 
                {
                const songs = await db.select().from(recentlyPlayed);
                return NextResponse.json(songs);
                }

                export async function POST(request: Request) {
                    const { songName, artist } = await request.json();
                    const newSong = await db.insert(recentlyPlayed).values({
                        songName,
                        artist,
                    }).returning();
                    return NextResponse.json(newSong[0]);
                }
            `
        );

        // Create frontend component
        console.log("Creating frontend component...");
        await createFrontendComponent();

        console.log("All done! Check /api/recently-played");
    } else if (query.toLowerCase().includes("playlist")) {
        console.log("Creating 'playlists' table...");
        // Add playlist functionality here
    } else if (query.toLowerCase().includes("user")) {
        console.log("Creating 'users' table...");
        // Add user functionality here
    } else {
        console.log("Query not recognized. Supported queries:");
        console.log("- 'recently played' (creates recently_played table and API)");
        console.log("- 'recently played populate' (creates table + sample data)");
        console.log("- 'playlist' (creates playlist management)");
        console.log("- 'user' (creates user management)");
    }
}

async function populateSampleData() {
    const sampleSongs = [
        { songName: "Bohemian Rhapsody", artist: "Queen" },
        { songName: "Hotel California", artist: "Eagles" },
        { songName: "Stairway to Heaven", artist: "Led Zeppelin" },
        { songName: "Imagine", artist: "John Lennon" },
        { songName: "Hey Jude", artist: "The Beatles" }
    ];

    // Create a data insertion script
    const dataScript = `
        import { db } from "@/db";
        import { recentlyPlayed } from "@/db/schema";

        const sampleSongs = ${JSON.stringify(sampleSongs, null, 2)};

        async function populateData() {
            for (const song of sampleSongs) {
                await db.insert(recentlyPlayed).values(song);
            }
            console.log("Sample data inserted!");
        }

        populateData().catch(console.error);
    `;

    fs.writeFileSync("populate-data.ts", dataScript);
    execSync("npx ts-node populate-data.ts", { stdio: "inherit" });
    fs.unlinkSync("populate-data.ts"); // Clean up
}

async function createFrontendComponent() {
    const componentDir = path.join("src", "components");
    fs.mkdirSync(componentDir, { recursive: true });
    
    fs.writeFileSync(
        path.join(componentDir, "RecentlyPlayed.tsx"),
        `
        'use client';

        import { useState, useEffect } from 'react';

        interface Song {
            id: number;
            songName: string;
            artist: string;
            playedAt: string;
        }

        export default function RecentlyPlayed() {
            const [songs, setSongs] = useState<Song[]>([]);
            const [loading, setLoading] = useState(true);

            useEffect(() => {
                fetch('/api/recently-played')
                    .then(res => res.json())
                    .then(data => {
                        setSongs(data);
                        setLoading(false);
                    })
                    .catch(err => {
                        console.error('Error fetching songs:', err);
                        setLoading(false);
                    });
            }, []);

            if (loading) return <div>Loading recently played songs...</div>;

            return (
                <div className="p-6">
                    <h2 className="text-2xl font-bold mb-4">Recently Played Songs</h2>
                    {songs.length === 0 ? (
                        <p>No songs played yet.</p>
                    ) : (
                        <div className="space-y-2">
                            {songs.map((song) => (
                                <div key={song.id} className="p-3 border rounded-lg">
                                    <div className="font-semibold">{song.songName}</div>
                                    <div className="text-gray-600">{song.artist}</div>
                                    <div className="text-sm text-gray-400">
                                        {new Date(song.playedAt).toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            );
        }
        `
    );
}

// Run the main function
main().catch(console.error);
