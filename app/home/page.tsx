// pages/home/page.tsx
"use client";

import { useEffect, useState } from "react";
import { FilmSlider } from "../components/FilmSliders/FilmSlider";
import { FilmSliderComedy } from "../components/FilmSliders/FilmSliderComedy";
import { FilmSliderDrama } from "../components/FilmSliders/FilmSliderDrama";
import { FilmSliderFolklore } from "../components/FilmSliders/FilmSliderFolklore";
import { FilmSliderHorror } from "../components/FilmSliders/FilmSliderHorror";
import { FilmSliderReco } from "../components/FilmSliders/FilmSliderReco";
import FilmVideo from "../components/FilmComponents/FilmVideo";
import RecentlyAdded from "../components/RecentlyAdded";
import { useUser } from "@/app/auth/nextjs/useUser";
import { TextLoop } from "@/components/ui/text-loop";
import { LoadingSpinner } from "@/app/components/LoadingSpinner";
import { AccessDenied } from "@/app/components/AccessDenied";

export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useUser();
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      setUserId(user.id);
    }
  }, [user]);

  // Loading State
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Access Denied State
  if (!isAuthenticated) {
    return <AccessDenied />;
  }

  return (
    <div className="pt-[4rem] lg:pt-[5rem] p-5 lg:p-0">
      <FilmVideo />

      <h1 className="text-3xl font-bold text-gray-400">
        <TextLoop
          className="overflow-y-clip"
          transition={{
            type: "spring",
            stiffness: 900,
            damping: 80,
            mass: 10,
          }}
          variants={{
            initial: { y: 20, rotateX: 90, opacity: 0, filter: "blur(4px)" },
            animate: { y: 0, rotateX: 0, opacity: 1, filter: "blur(0px)" },
            exit: { y: -20, rotateX: -90, opacity: 0, filter: "blur(4px)" },
          }}
        >
          <span>BEST FILMS</span>
          <span>TOP MOVIES</span>
          <span>AWARD WINNERS</span>
        </TextLoop>
      </h1>

      <RecentlyAdded />

      {[{ title: "POPULAR FILMS", component: <FilmSlider /> },
        { title: "COMEDY FILMS", component: <FilmSliderComedy /> },
        { title: "DRAMA FILMS", component: <FilmSliderDrama /> },
        { title: "FOLKLORE FILMS", component: <FilmSliderFolklore /> },
        { title: "HORROR FILMS", component: <FilmSliderHorror /> },
        { title: "RECOMMENDED FOR YOU", component: userId ? <FilmSliderReco userId={userId} /> : <FilmSlider /> } // Fallback if no userId
      ].map(({ title, component }) => (
        <div key={title} className="mt-6">
          <h1 className="text-3xl font-bold text-gray-400">
            <TextLoop
              className="overflow-y-clip"
              transition={{
                type: "spring",
                stiffness: 900,
                damping: 80,
                mass: 10,
              }}
              variants={{
                initial: { y: 20, rotateX: 90, opacity: 0, filter: "blur(4px)" },
                animate: { y: 0, rotateX: 0, opacity: 1, filter: "blur(0px)" },
                exit: { y: -20, rotateX: -90, opacity: 0, filter: "blur(4px)" },
              }}
            >
              <span>{title}</span>
              <span>{title.replace("FILMS", "MOVIES")}</span>
              <span>{title.replace("FILMS", "CINEMA")}</span>
            </TextLoop>
          </h1>
          {component}
        </div>
      ))}
    </div>
  );
}
