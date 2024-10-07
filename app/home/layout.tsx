
import { ReactNode } from "react";
import { redirect } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { currentUser } from "@clerk/nextjs/server";

export default async function HomeLayout({
  children,
}: {
  children: ReactNode;
}) {

  if (!currentUser) {
    return redirect("/sign-in");
  }

  return (
    <>
     <Navbar/>
      <main className="w-full max-w-10xl mx-auto sm:px-6 lg:px-8">
        {children}
      </main>
      <Footer />
    </>
  );
}
