import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

config({ path: '.env' }); // or .env.local

const client = postgres(process.env.DATABASE_URL!);
export const db = drizzle(client, { schema }); // added {skipLibCheck: true} in tsconfig.json becausethere are 70 errors when building with drizzle for some reason

