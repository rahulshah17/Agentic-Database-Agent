
        import { db } from "./src/db/index.node.js";
        import { albums } from "./src/db/schema.js";

        const sampleData = [
        { album_name: "Made for you" },
  { album_name: "Popular albums" }
        ];

        async function insertData() {
            for (const row of sampleData) {
            await db.insert(albums).values(row);
            }
            console.log(" Data inserted into the table!");
        }

        insertData().catch(console.error).finally(() => process.exit(0));
    