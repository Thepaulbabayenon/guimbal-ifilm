import axios from "axios";

export async function addToWatchlist(formData: FormData) {
  try {
    const response = await fetch("/api/watchlist/add", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error("Failed to add to watchlist");
    }

    return await response.json();
  } catch (error) {
    console.error("Error adding to watchlist:", error);
    throw error;
  }
}

export async function deleteFromWatchlist(watchListId: string) {
  try {
    // Construct the request body with watchListId, assuming it's passed directly as an argument
    const response = await fetch("/api/watchlist/delete", {
      method: "DELETE",  // DELETE method for deletion
      headers: {
        "Content-Type": "application/json",  // Send data as JSON
      },
      body: JSON.stringify({ watchListId }),  // Send the watchListId as a JSON object
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
async function getWatchListIdForMovie(movieId: number, userId: string): Promise<string | null> {
  try {
    // Make an API call to get the watchListId (you need to implement this API endpoint)
    const response = await axios.get(`/api/watchlist/${userId}/${movieId}`);
    
    if (response.data && response.data.watchListId) {
      return response.data.watchListId; // Return the watchListId
    }
    
    return null; // Return null if no watchListId is found
  } catch (error) {
    console.error("Error fetching watchListId for movie:", error);
    return null; // Handle error case, return null
  }
}
