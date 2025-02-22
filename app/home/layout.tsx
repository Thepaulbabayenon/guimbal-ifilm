import { ReactNode } from "react";
import { redirect } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { currentUser } from "@clerk/nextjs/server";
import { CategoryProvider } from "../context/categoryContext";

export default async function HomeLayout({
  children,
}: {
  children: ReactNode;
}) {
  try {
    const user = await currentUser();
    
    if (!user) {
      console.log("User not found, redirecting...");
      return redirect("/sign-in");
    }

    return (
      <div className="flex flex-col min-h-screen">
        <CategoryProvider>
          <Navbar />
        </CategoryProvider>
        <main className="flex-grow w-full max-w-10xl mx-auto sm:px-6 lg:px-8">
          {children}
        </main>
        <Footer />
      </div>
    );
  } catch (error) {
    console.error("Error fetching currentUser:", error);
    return redirect("/sign-in");
  }
}

