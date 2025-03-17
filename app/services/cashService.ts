// Simple in-memory cache
const cache = {
    films: new Map<string, { data: any; expiry: number }>(),
    ratings: new Map<string, { data: number; expiry: number }>(),
    watchlists: new Map<string, { data: any; expiry: number }>(),
  
    // Cache expiration time (5 minutes)
    EXPIRY: 5 * 60 * 1000,
  
    // Get cached film data with expiration check
    getFilms(key: string | number): any | null {
      const keyStr = String(key);
      const item = this.films.get(keyStr);
      if (!item) return null;
  
      if (Date.now() > item.expiry) {
        this.films.delete(keyStr);
        return null;
      }
  
      return item.data;
    },
  
    // Set film data in cache with expiration
    setFilms(key: string | number, data: any): void {
      const keyStr = String(key);
      const expiry = Date.now() + this.EXPIRY;
      this.films.set(keyStr, { data, expiry });
    },
  
    // Get film rating with expiration check
    getRating(filmId: string | number): number | null {
      const filmIdStr = String(filmId);
      const item = this.ratings.get(filmIdStr);
      if (!item) return null;
  
      if (Date.now() > item.expiry) {
        this.ratings.delete(filmIdStr);
        return null;
      }
  
      return item.data;
    },
  
    // Set film rating in cache with expiration
    setRating(filmId: string | number, rating: number): void {
      const filmIdStr = String(filmId);
      const expiry = Date.now() + this.EXPIRY;
      this.ratings.set(filmIdStr, { data: rating, expiry });
    },
  
    // Clear specific film data from cache
    invalidateFilm(filmId: string | number): void {
      const filmIdStr = String(filmId);
      this.films.delete(filmIdStr);
      this.ratings.delete(filmIdStr);
    },
  
    // Get watchlist status
    getWatchlistStatus(userId: string | number): any | null {
      const key = `watchlist-${String(userId)}`;
      const item = this.watchlists.get(key);
      if (!item) return null;
  
      if (Date.now() > item.expiry) {
        this.watchlists.delete(key);
        return null;
      }
  
      return item.data;
    },
  
    // Set watchlist data
    setWatchlistStatus(userId: string | number, data: any): void {
      const key = `watchlist-${String(userId)}`;
      const expiry = Date.now() + this.EXPIRY;
      this.watchlists.set(key, { data, expiry });
    },
  
    // Invalidate watchlist when it changes
    invalidateWatchlist(userId: string | number): void {
      const key = `watchlist-${String(userId)}`;
      this.watchlists.delete(key);
    }
  };

 


const cleanupInterval = 15 * 60 * 1000;

export const startCacheCleanup = () => {
  setInterval(() => {
    const now = Date.now();
    
    // Clean up films cache
    cache.films.forEach((value, key) => {
      if (now > value.expiry) {
        cache.films.delete(key);
      }
    });
    
    // Clean up ratings cache
    cache.ratings.forEach((value, key) => {
      if (now > value.expiry) {
        cache.ratings.delete(key);
      }
    });
    
    // Clean up watchlists cache
    cache.watchlists.forEach((value, key) => {
      if (now > value.expiry) {
        cache.watchlists.delete(key);
      }
    });
    
    console.log('Cache cleanup completed');
  }, cleanupInterval);
};
  
  export default cache;
  

  