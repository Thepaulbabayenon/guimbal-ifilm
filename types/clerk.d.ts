// types/clerk.d.ts
import { UserResource } from '@clerk/nextjs';

declare module '@clerk/nextjs' {
  interface UserResource {
    privateMetadata?: {
      favoriteGenres?: string;
      contentPreferences?: string;
    };
  }
}
