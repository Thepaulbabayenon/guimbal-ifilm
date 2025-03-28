import { useUser } from "@/app/auth/nextjs/useUser";

/**
 * Check if the current user has a specific role
 * @param role The role to check for
 * @returns Boolean indicating if user has the role
 */
export async function checkRole(role: string): Promise<boolean> {
  try {
    const currentUser = await useUser(); 
    
    if (!currentUser?.user) {
      return false;
    }
    
    return currentUser.user.role === role; 
  } catch (error) {
    console.error("Error checking user role:", error);
    return false;
  }
}

/**
 * Helper function to verify if a user is an admin
 * Can be used in middleware or server components
 * @returns Boolean indicating if current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  return checkRole("admin");
}

/**
 * Check if current user can manage a specific user
 * An admin can manage any user except themselves
 * @param userId The ID of the user to manage
 * @returns Boolean indicating if current user can manage the specified user
 */
export async function canManageUser(userId: string): Promise<boolean> {
  try {
    const currentUser = await useUser(); // Replacing `getCurrentUser` with `useUser`
    
    if (!currentUser?.user) {
      return false;
    }
    
    // Admin can manage any user except themselves
    if (currentUser.user.role === "admin" && currentUser.user.id !== userId) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error("Error checking user management permission:", error);
    return false;
  }
}
