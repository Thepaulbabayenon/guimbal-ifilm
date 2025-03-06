import { db } from "@/app/db/drizzle";
import { users } from "@/app/db/schema";
import { eq, like, or } from "drizzle-orm";
import { useAuth } from "@/app/auth/nextjs/useUser";
import UserManagementClient from "./UserManagementClient";
import { redirect } from "next/navigation";

// Define user type that matches your application's user structure
type UserWithRole = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: "admin" | "user";
  name?: string;
};

const UserManagementServer = async ({ search }: { search?: string }) => {
  try {
    // Get the current user and ensure they're an admin
    const currentUser = await useAuth({ withFullUser: true });
    
    if (!currentUser) {
      return redirect("/sign-in");
    }
    
    // Use non-null assertion or provide a default value
    const currentUserId = currentUser.user?.id ?? '';
    const isAdmin = currentUser.user?.role === "admin";
    
    // If not an admin, redirect or show access denied
    if (!isAdmin) {
      return (
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <h2 className="text-xl font-semibold text-red-700">Access Denied</h2>
          <p className="text-red-600 mt-2">
            You do not have administrative privileges to access this page.
          </p>
        </div>
      );
    }
    
    // Fetch users with search filtering if provided
    let fetchedUsers;
    
    if (search) {
      // Search for users matching the search term
      fetchedUsers = await db.query.users.findMany({
        where: or(
          like(users.name, `%${search}%`),
          like(users.email, `%${search}%`)
        ),
      });
    } else {
      // Fetch all users
      fetchedUsers = await db.query.users.findMany();
    }
    
    // Transform the users to the format expected by the client
    const transformedUsers = fetchedUsers.map((user) => {
      // Split the name into first and last name
      const nameParts = user.name?.split(' ') || ['Unknown', 'User'];
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';
      
      return {
        id: user.id,
        firstName,
        lastName,
        email: user.email,
        emailAddresses: [{ emailAddress: user.email }], // Format for client component
        role: user.role,
        name: user.name
      };
    });

    return (
      <UserManagementClient 
        users={transformedUsers} 
        currentUserId={currentUserId} 
        isAdmin={isAdmin} 
      />
    );
  } catch (error) {
    console.error("Error fetching users:", error);
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h2 className="text-xl font-semibold text-red-700">Error</h2>
        <p className="text-red-600 mt-2">
          Failed to load users. Please try again later.
        </p>
        <p className="text-red-500 mt-1 text-sm">
          {error instanceof Error ? error.message : "Unknown error occurred"}
        </p>
      </div>
    );
  }
};

export default UserManagementServer;