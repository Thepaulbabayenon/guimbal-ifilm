import { NextResponse } from "next/server";
import { getUserData } from "@/app/api/getUser"; 


export const dynamic = "force-dynamic";
  
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userEmail = searchParams.get("email");

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
