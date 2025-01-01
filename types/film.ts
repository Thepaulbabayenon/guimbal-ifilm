export interface Film {
    id: number;
    title: string;
    age: number;
    duration: number;
    imageString: string;
    overview: string;
    release: number;
    videoSource: string;
    category: string;
    youtubeString: string;
    rank: number;  // External rating
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
  