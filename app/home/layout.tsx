import { ReactNode } from "react";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import Navbar from "@/app/components/Navbar";
import Footer from "@/app/components/Footer";
import { getUserFromSession, COOKIE_SESSION_KEY } from "@/app/auth/core/session"; 
import { CategoryProvider } from "../context/categoryContext";

export const dynamic = "force-dynamic"; 

export default async function HomeLayout({
  children,
}: {
  children: ReactNode;
}) {
  try {
    // Get cookies using the next/headers API
    const cookieStore = await cookies();  // Add await here
    const sessionCookie = cookieStore.get(COOKIE_SESSION_KEY);
    
    // Create a cookie object to pass to getUserFromSession
    const cookiesObj = {
      [COOKIE_SESSION_KEY]: sessionCookie?.value || "",
    };
    
    const user = await getUserFromSession(cookiesObj);

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