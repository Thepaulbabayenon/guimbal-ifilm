// types.d.ts or another type definition file in your project
import { UserResource } from "@clerk/nextjs";

// Extend the UserResource interface to include `isAdmin`
declare module "@clerk/nextjs" {
  interface UserResource {
    isAdmin: boolean;
  }
}
