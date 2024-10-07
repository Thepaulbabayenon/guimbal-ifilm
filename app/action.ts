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
  
  export async function deleteFromWatchlist(formData: FormData) {
    try {
      const response = await fetch("/api/watchlist/delete", {
        method: "POST",
        body: formData,
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
  