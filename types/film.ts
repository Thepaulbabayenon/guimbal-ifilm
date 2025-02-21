// src/types.ts
export interface Film {
  id: number;
  title: string;
  overview: string;
  watchList: boolean;
  trailerUrl: string;
  year: number;
  age: number;
  time: number;
  initialRatings: number;
  category: string;
  imageString: string;
  producer: string;
  director: string;
  coDirector: string;
  studio: string;
  averageRating: number | null;

  ageRating?: number;  // Example: 13, 18, etc.
  duration?: number;   // Example: 120 (minutes)
}


  export interface UserRating {
    userId: string;
    filmId: number;
    rating: number;
  }
  
  export interface AverageRating {
    filmId: number;
    averageRating: number;
  }
  
  export interface LastWatchedTime {
    userId: string;
    filmId: number;
    time: number;
  }
  
   export // Example: Update the UserResource type to include isAdmin
   interface UserResource {
     id: number;
     name: string;
     email: string;
     isAdmin: boolean; // Add this property
   }
   
   