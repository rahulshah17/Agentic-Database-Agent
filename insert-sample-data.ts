
        import { db } from "./src/db/index.node.js";
        import { songs } from "./src/db/schema.js";

        const sampleData = [
        { title: "Highest in the room", artist: null, album: null }
        ];

        async function insertData() {
            for (const row of sampleData) {
            await db.insert(songs).values(row);
            }
            console.log(" Data inserted into the table!");
        }

        insertData().catch(console.error).finally(() => process.exit(0));
    