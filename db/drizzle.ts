import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from "./schema";

const sql = neon(process.env.DATABASE_URL! || "postgresql://neondb_owner:npg_Zm8QbThJ5WtP@ep-bold-field-a13x2ecv-pooler.ap-southeast-1.aws.neon.tech/neondb?sslmode=require");
export const db = drizzle(sql, { schema });
