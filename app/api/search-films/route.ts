import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/db/drizzle"; // Your Drizzle connection
import { film } from "@/db/schema"; // Assuming film is your schema
import { sql } from "drizzle-orm"; // Import Drizzle SQL utilities

// Utility function to sanitize query input
const sanitizeQuery = (query: string) => {
  return query.trim().replace(/[^\w\s]/gi, ''); // Remove special characters, keeping alphanumeric and spaces
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ message: "Method not allowed" });
  }

  const { query, page = 1, limit = 10 } = req.query;

  // Log the incoming query parameter to debug
  console.log("Request parameters: ", req.query);

  // Validate query parameter
  if (!query || typeof query !== "string" || query.trim().length === 0) {
    console.error("Invalid query:", query); // Log the error if invalid query is received
    return res.status(400).json({ message: "Query parameter cannot be empty or invalid." });
  }

  const sanitizedQuery = sanitizeQuery(query as string);
  console.log("Sanitized query:", sanitizedQuery); // Log the sanitized query to check its value

  // Basic validation for pagination parameters (optional)
  const pageNumber = Math.max(Number(page), 1);
  const pageSize = Math.min(Math.max(Number(limit), 1), 50); // Max limit of 50 to prevent overload

  console.log("Pagination:", pageNumber, pageSize);

  try {
    // Fetch films with a case-insensitive title match using Drizzle's relational query builder
    const results = await db.query.film.findMany({
      where: (film, { ilike }) => ilike(film.title, `${sanitizedQuery}%`),
      limit: pageSize,
      offset: (pageNumber - 1) * pageSize,
    });

    console.log("films found:", results); // Log results for debugging

    // If no films are found
    if (results.length === 0) {
      return res.status(404).json({ message: "No films found matching your search." });
    }

    // Count the total number of matching films
    const countResults = await db.query.film.findMany({
      where: (film, { ilike }) => ilike(film.title, `${sanitizedQuery}%`),
      limit: 0, // No need to fetch data, just count rows
    });
    
    const totalResults = countResults.length;
    console.log("Total results count:", totalResults);

    // Respond with films and pagination metadata
    res.status(200).json({
      films: results,
      pagination: {
        currentPage: pageNumber,
        totalResults: totalResults,
        totalPages: Math.ceil(totalResults / pageSize),
      },
    });
  } catch (error) {
    console.error("Error fetching films:", error);
    res.status(500).json({ message: "Internal server error." });
  }
}
