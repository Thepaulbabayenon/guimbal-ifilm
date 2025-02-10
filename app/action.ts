'use server';
import axios from "axios";
import { checkRole } from '@/app/utils/roles'
import { clerkClient } from '@clerk/nextjs/server'

const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;

export const addToWatchlist = async ({
  filmId,
  pathname,
  userId,
}: {
  filmId: number;
  pathname: string;
  userId: string | undefined;
}) => {
  // Handle the case where userId is undefined
  if (!userId) {
    throw new Error("User is not logged in");
  }

  try {
    const response = await fetch(`${baseUrl}/api/watchlist`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ filmId, pathname, userId }), // Pass userId in the body
    });

    if (!response.ok) {
      throw new Error("Failed to add to watchlist");
    }

    return await response.json();
  } catch (error) {
    console.error("Error adding to watchlist:", error);
    throw error;
  }
};



export async function deleteFromWatchlist(watchListId: string) {
  try {
    const response = await fetch(`${baseUrl}/api/watchlist/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ watchListId }),
    });

    if (!response.ok) {
      throw new Error("Failed to delete from watchlist");
    }

    return await response.json();
  } catch (error) {
    console.error("Error deleting from watchlist:", error);
    throw error;
  }
}



// Define the function to fetch the watchListId from the backend
export async function getWatchListIdForFilm(filmId: number, userId: string): Promise<string | null> {
  try {
    // Make an API call to get the watchListId (you need to implement this API endpoint)
    const response = await axios.get(`/api/watchlist/${userId}/${filmId}`);
    
    if (response.data && response.data.watchListId) {
      return response.data.watchListId; // Return the watchListId
    }
    
    return null; // Return null if no watchListId is found
  } catch (error) {
    console.error("Error fetching watchListId for movie:", error);
    return null; // Handle error case, return null
  }
}


// Modify setRole to return Promise<void>
export async function setRole(formData: FormData): Promise<void> {
  const client = await clerkClient();

  // Check that the user trying to set the role is an admin
  if (!checkRole('admin')) {
    throw new Error('Not Authorized');
  }

  try {
    await client.users.updateUserMetadata(formData.get('id') as string, {
      publicMetadata: { role: formData.get('role') },
    });
    // Return void since it's a form action
    return;
  } catch (err) {
    console.error('Error setting role:', err);
    throw new Error('Failed to set role');
  }
}

// Modify removeRole to return Promise<void>
export async function removeRole(formData: FormData): Promise<void> {
  const client = await clerkClient();

  try {
    await client.users.updateUserMetadata(formData.get('id') as string, {
      publicMetadata: { role: null },
    });
    // Return void since it's a form action
    return;
  } catch (err) {
    console.error('Error removing role:', err);
    throw new Error('Failed to remove role');
  }
}

export { checkRole };
