import { NextRequest, NextResponse } from "next/server";
import { db } from "@/app/db/drizzle"; // Import your Drizzle instance
import { users } from "@/app/db/schema"; // Import users schema
import { eq } from "drizzle-orm"; // Import necessary operators

export async function GET(_req: NextRequest) {
  try {
    // Fetch all users from the database
    const usersData = await db.select().from(users);

    if (usersData.length === 0) {
      return NextResponse.json({ message: "No users found" }, { status: 404 });
    }

    return NextResponse.json({ rows: usersData }); // Return users as JSON
  } catch (error) {
    console.error("Error fetching users:", error);
    return NextResponse.json({ message: "Error fetching users" }, { status: 500 });
  }
}
