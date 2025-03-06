import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import {UpdateProvider} from "@/hooks/updateContext"
import { AuthProvider } from "./auth/nextjs/components/AuthProvider";


const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Thebantayanfilmfestival",
  description: "Guimbal iFIlm Society",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AuthProvider>
        <UpdateProvider>
        {children}
        </UpdateProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
