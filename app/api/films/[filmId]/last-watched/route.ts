import { NextApiRequest, NextApiResponse } from "next";
import { LastWatchedTime } from "../../../../../types/film"; // Assuming this is in types

// Mock functions to simulate saving and retrieving last watched time
const saveLastWatchedTime = async (userId: string, filmId: number, time: number): Promise<void> => {
  // Save to database or persistent storage
  console.log(`Saving last watched time for user ${userId} on film ${filmId}: ${time}s`);
};

const getLastWatchedTime = async (userId: string, filmId: number): Promise<number> => {
  // Simulate fetching from database or persistent storage
  console.log(`Fetching last watched time for user ${userId} on film ${filmId}`);
  return 120;  // Returning a mock value of 120 seconds
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { userId } = req.query;
  const { filmId } = req.query;

  if (req.method === "POST") {
    const { time } = req.body;
    await saveLastWatchedTime(userId as string, Number(filmId), time);
    return res.status(200).json({ message: "Last watched time saved" });
  }

  if (req.method === "GET") {
    const lastWatchedTime = await getLastWatchedTime(userId as string, Number(filmId));
    return res.status(200).json({ lastWatchedTime });
  }

  res.status(405).json({ error: "Method Not Allowed" });
}
