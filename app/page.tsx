// app/page.tsx or app/page.jsx
import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default function Home() {
  // Retrieve authentication information from Clerk
  const { userId } = auth()

  // If there's no userId, the user is not authenticated
  if (!userId) {
    redirect("/sign-in");
  } else {
    redirect("/home");
  }
}
