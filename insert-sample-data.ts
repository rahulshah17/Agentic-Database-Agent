
        import { db } from "./src/db/index.node.js";
        import { songs } from "./src/db/schema.js";

        const sampleData = [
        { title: "Song Title 1", artist: "Artist 1", album: "Album 1" },
  { title: "Song Title 2", artist: "Artist 2", album: "Album 2" },
  { title: "Song Title 3", artist: "Artist 3", album: "Album 3" }
        ];

        async function insertData() {
            for (const row of sampleData) {
            await db.insert(songs).values(row);
            }
            console.log(" Data inserted into the table!");
        }

        insertData().catch(console.error).finally(() => process.exit(0));
    