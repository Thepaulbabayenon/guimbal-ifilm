export const dynamic = "force-dynamic"; // Force dynamic rendering

import { clerkClient, currentUser } from "@clerk/nextjs/server";
import UserManagementClient from "./UserManagementClient";
import { checkRole } from "@/app/utils/roles"; // ✅ Import on Server Only

const UserManagementServer = async ({ search }: { search?: string }) => {
  try {
    const user = await currentUser();
    const currentUserId = user?.id ?? "";
    
    // ✅ Check if the current user is an admin (server-side)
    const isAdmin = await checkRole("admin");

    const userResponse = await clerkClient.users.getUserList({
      query: search || undefined,
    });

    const users = userResponse.data.map((user) => ({
      id: user.id,
      firstName: user.firstName ?? "Unknown",
      lastName: user.lastName ?? "User",
      emailAddresses: user.emailAddresses.map((email: { emailAddress: string }) => ({
        emailAddress: email.emailAddress,
      })),
    }));

    return <UserManagementClient users={users} currentUserId={currentUserId} isAdmin={isAdmin} />;
  } catch (error) {
    console.error("Error fetching users:", error);
    return <p className="text-red-500">Failed to load users.</p>;
  }
};

export default UserManagementServer;
