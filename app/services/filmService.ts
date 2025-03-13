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
