import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "./schema";


const sql = neon(process.env.DATABASE_URL! || "postgresql://neondb_owner:npg_Zm8QbThJ5WtP@ep-dark-paper-a1tw7seb-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require", {
  fetchOptions: {
    keepAlive: true,  
    idleTimeoutMillis: 100000, 
    connectionTimeoutMillis: 100000, 
  }
});

export const db = drizzle(sql, { schema });