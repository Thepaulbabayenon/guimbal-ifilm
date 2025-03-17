import axios from "axios";

const pendingRatingRequests = new Map<string, Promise<any>>();

export async function getFilmRating(filmId: string | number): Promise<any> {
  const url = `/api/films/${filmId}/average-rating`;
  
  // Return existing promise if this request is in flight
  if (pendingRatingRequests.has(url)) {
    return pendingRatingRequests.get(url);
  }
  
  const promise = fetch(url)
    .then(res => res.json())
    .finally(() => pendingRatingRequests.delete(url));
  
  pendingRatingRequests.set(url, promise);
  return promise;
}

// In filmService.js (add this function)

export const getFilmWithUserData = async (filmId: string | number, userId: string) => {
  try {
    // Single API call that returns film details, watchlist status, and user rating
    const response = await axios.get(`/api/films/${filmId}/details`, {
      params: { userId }
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching film data:", error);
    throw error;
  }
};
