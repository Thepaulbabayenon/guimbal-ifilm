import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export default function Home() {
  // Retrieve authentication information from Clerk
  const { userId } = auth();

  // If the user is authenticated, redirect to the home page
  if (userId) {
    redirect("/home");
  }

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100 p-6">
      <h1 className="text-4xl font-bold text-gray-900">Welcome to The Bantayan Film Festival</h1>
      <p className="text-lg text-gray-700 mt-4 text-center">
        Experience the magic of cinema with incredible films and storytelling.
      </p>
      <a
        href="/sign-in"
        className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition"
      >
        Sign In to Continue
      </a>
    </main>
  );
}
