import Image from "next/image";
import { db } from "@/db/drizzle";
import { FilmCard } from "./FilmCard";
import { auth } from "@clerk/nextjs/server";
import { and, asc, eq, avg } from "drizzle-orm"; // Ensure that avg() is imported
import { accounts, film, userRatings } from "@/db/schema";

// Fetch film data and calculate average ratings
async function getData(userId: string) {
  // Get films and calculate average rating for each film
  const userFilms = await db
    .select({
      id: film.id,
      overview: film.overview,
      title: film.title,
      WatchList: {
        userId: accounts.userId,
        filmId: film.id,
      },
      imageString: film.imageString,
      youtubeString: film.youtubeString,
      age: film.age,
      release: film.release,
      duration: film.duration,
      // Aggregation to calculate average rating using avg()
      averageRating: avg(userRatings.rating).as('averageRating'), // Using avg() to calculate the average
    })
    .from(film)
    .leftJoin(accounts, eq(accounts.userId, userId))
    .leftJoin(userRatings, eq(userRatings.filmId, film.id))
    .groupBy(film.id, accounts.userId) // Group by both film.id and accounts.userId
    .orderBy(asc(avg(userRatings.rating))) // Order by the calculated average rating
    .limit(4); // Limit the results to top 4

  return userFilms;
}

export default async function RecentlyAdded() {
  const { userId } = auth(); // Get the user ID from the authentication context

  // Get films with their average ratings in ascending order
  const data = await getData(userId as string);

  return (
    <div className="recently-added-container mb-20">
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 mt-8 gap-6">
        {data.map((film) => (
          <div key={film.id} className="relative h-48">
            <Image
              src={film.imageString}
              alt="film"
              width={500}
              height={400}
              className="rounded-sm absolute w-full h-full object-cover"
            />
            <div className="h-60 relative z-10 w-full transform transition duration-500 hover:scale-125 opacity-0 hover:opacity-100">
              <div className="bg-gradient-to-b from-transparent via-black/50 to-black z-10 w-full h-full rounded-lg flex items-center justify-center border">
                <Image
                  src={film.imageString}
                  alt="Film"
                  width={800}
                  height={800}
                  className="absolute w-full h-full -z-10 rounded-lg object-cover"
                />
                <FilmCard
                  filmId={film.id}
                  overview={film.overview}
                  title={film.title}
                  watchListId={film.WatchList?.filmId.toString() || ""}
                  youtubeUrl={film.youtubeString}
                  watchList={film.WatchList?.userId ? parseInt(film.WatchList.userId, 10) > 0 : false}
                  key={film.id}
                  age={film.age}
                  time={film.duration}
                  year={film.release}
                  initialRatings={Number(film.averageRating) || 0} // Ensure that averageRating is always a number
                />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
