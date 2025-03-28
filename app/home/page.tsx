// pages/home/page.tsx
"use client";

import { useEffect, useState } from "react";
import FilmSliderWrapper from "../components/FilmComponents/FilmsliderWrapper";
import FilmVideo from "../components/FilmComponents/FilmVideo";
import RecentlyAdded from "../components/RecentlyAdded";
import { useUser } from "@/app/auth/nextjs/useUser";
import { TextLoop } from "@/components/ui/text-loop";
import { LoadingSpinner } from "@/app/components/LoadingSpinner";
import { AccessDenied } from "@/app/components/AccessDenied";



export default function HomePage() {
  const { user, isAuthenticated, isLoading } = useUser();
  const [userId, setUserId] = useState<string | null>(null);
  const [recommendedFilms, setRecommendedFilms] = useState<any[]>([]);

  useEffect(() => {
    if (user) {
      setUserId(user.id);

     
      fetch(`/api/recommendations?userId=${user.id}`)
        .then((res) => res.json())
        .then((data) => setRecommendedFilms(data))
        .catch((err) => console.error("Error fetching recommendations:", err));
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

  
  const filmCategories = [
    { id: "popular", title: "POPULAR FILMS", categoryFilter: undefined, limit: 10 },
    { id: "comedy", title: "COMEDY FILMS", categoryFilter: "comedy", limit: 10 },
    { id: "drama", title: "DRAMA FILMS", categoryFilter: "drama", limit: 10 },
    { id: "folklore", title: "FOLKLORE FILMS", categoryFilter: "folklore", limit: 10 },
    { id: "horror", title: "HORROR FILMS", categoryFilter: "horror", limit: 10 },
    { id: "romance", title: "ROMANCE FILMS", categoryFilter: "romance", limit: 10 },
  ];

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

      {filmCategories.map((category) => (
        <div key={category.id} className="mt-6">
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
              <span>{category.title}</span>
              <span>{category.title.replace("FILMS", "MOVIES")}</span>
              <span>{category.title.replace("FILMS", "CINEMA")}</span>
            </TextLoop>
          </h1>
          <FilmSliderWrapper
            title={category.title}
            categoryFilter={category.categoryFilter}
            limit={category.limit}
          />
        </div>
      ))}
      {/* ✅ Recommended Films Section */}
      {recommendedFilms.length > 0 && (
        <div className="mt-6">
          <h1 className="text-3xl font-bold text-gray-400">RECOMMENDED FOR YOU</h1>
          <FilmSliderWrapper title="Recommended Films" films={recommendedFilms} />
        </div>
      )}
    </div>
  );
}