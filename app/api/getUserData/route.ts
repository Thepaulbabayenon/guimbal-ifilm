import { NextResponse } from "next/server";
import { getUserData } from "@/app/api/getUser"; // Ensure this path is correct

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const userEmail = url.searchParams.get("email");

    console.log("Request URL:", req.url);  // Log the full URL
    console.log("User email parameter:", userEmail);  // Log the extracted email

    if (!userEmail) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 });
    }

    const data = await getUserData(userEmail);
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error("Error fetching user data:", error);
    return NextResponse.json({ error: "Failed to fetch user data" }, { status: 500 });
  }
}

