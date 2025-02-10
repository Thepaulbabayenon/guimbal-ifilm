export const dynamic = "force-dynamic"; // Force dynamic rendering

import { currentUser } from "@clerk/nextjs/server";
import { clerkClient } from "@clerk/clerk-sdk-node";
import UserManagementClient from "./UserManagementClient";
import { checkRole } from "@/app/utils/roles";
import type { User } from "@clerk/backend"; // Import Clerk User Type

const UserManagementServer = async ({ search }: { search?: string }) => {
  try {
    const user = await currentUser();
    const currentUserId = user?.id ?? "";

    // ✅ Check if the current user is an admin (server-side)
    const isAdmin = await checkRole("admin");

    // ✅ Correct usage of Clerk API
    const usersResponse = await clerkClient.users.getUserList({
      query: search || undefined,
    });

    // ✅ Fix: Access `data` property and define types explicitly
    const users = usersResponse.data.map((user: User) => ({
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
