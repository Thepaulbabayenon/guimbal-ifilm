import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/db/drizzle'; // Adjust path as needed
import { watchedFilms } from '@/db/schema'; // Adjust path as needed

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { userId, filmId } = req.body;

    if (!userId || !filmId) {
      return res.status(400).json({ error: 'Invalid request' });
    }

    try {
      await db.insert(watchedFilms).values({
        userId,
        filmId,
      });
      res.status(200).json({ message: 'Film marked as watched' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Failed to mark film as watched' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}
