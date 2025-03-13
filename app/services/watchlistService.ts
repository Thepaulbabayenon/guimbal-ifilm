let watchlistPromise: Promise<any> | null = null;
let watchlistData: any = null;
let lastFetchTime: number = 0;

export function getWatchlist(userId: string | number): Promise<any> {
  const url = `/api/watchlist?userId=${userId}`;
  const now = Date.now();

  // Return cached data if available and recent
  if (watchlistData && now - lastFetchTime < 30000) { // 30-second cache
    return Promise.resolve(watchlistData);
  }

  // Return existing promise if request is in flight
  if (watchlistPromise) return watchlistPromise;

  watchlistPromise = fetch(url)
    .then(res => res.json())
    .then((data: any) => {
      watchlistData = data;
      lastFetchTime = now;
      return data;
    })
    .finally(() => {
      watchlistPromise = null;
    });

  return watchlistPromise;
}
