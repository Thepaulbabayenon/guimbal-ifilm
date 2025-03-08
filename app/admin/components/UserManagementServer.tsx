import { db } from "@/app/db/drizzle";
import { users } from "@/app/db/schema";
import { like, or } from "drizzle-orm";


import UserManagementWrapper from "./UserManagementWrapper";

// Server component that fetches data but doesn't handle auth
const UserManagementServer = async ({ search }: { search?: string }) => {
  try {
   
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
    
      const nameParts = user.name?.split(' ') || ['Unknown', 'User'];
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || '';
      
      return {
        id: user.id,
        firstName,
        lastName,
        email: user.email,
        emailAddresses: [{ emailAddress: user.email }], 
        role: user.role,
        name: user.name
      };
    });

    // We only pass the data to the client component, which will handle auth
    return <UserManagementWrapper users={transformedUsers} />;
    
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