import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

// Create the connection
const connectionString = process.env.DATABASE_URL!;
if (!connectionString) {
  throw new Error('DATABASE_URL is not set. Check your .env.local file.');
}

const client = postgres(connectionString);
export const db = drizzle(client, { schema });
