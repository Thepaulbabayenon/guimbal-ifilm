import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "./schema";

// Use a WebSocket-based fetch function for better connection stability
const sql = neon(process.env.DATABASE_URL! || "postgresql://neondb_owner:npg_Zm8QbThJ5WtP@ep-muddy-bonus-a1et2y61-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require", {
  fetchOptions: {
    keepAlive: true,  // Helps keep the connection open longer
    idleTimeoutMillis: 30000, // Increase timeout
    connectionTimeoutMillis: 60000, // Increase connection wait time
  }
});

export const db = drizzle(sql, { schema });