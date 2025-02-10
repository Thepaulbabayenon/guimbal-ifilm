// types.d.ts or any other type definition file in your project
import { User } from "@clerk/nextjs";

// Extend the User type to include isAdmin
declare module "@clerk/nextjs" {
  interface User {
    isAdmin: boolean;  // Add the isAdmin property
  }
}
