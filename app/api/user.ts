import { db } from '@/db/drizzle'; // import your schema
import {users } from '@/db/schema'; // import your schema

async function fetchAllUsers() {
  const allUsers = await db.select().from(users);
  console.log(allUsers);  // This will log all users from the users table
}

fetchAllUsers();