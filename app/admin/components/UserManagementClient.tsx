"use client";

import { useState, useEffect } from "react";
import { setRole, removeRole } from "@/app/action";
import { checkRole } from "@/app/utils/roles";

interface User {
  id: string;
  firstName?: string;
  lastName?: string;
  emailAddresses?: { emailAddress: string }[];
  role?: string;
}

const UserManagementClient = ({ 
  users = [], 
  currentUserId, 
  isAdmin // ✅ Pass as a prop instead of using useState
}: { 
  users?: User[], 
  currentUserId: string, 
  isAdmin: boolean 
}) => {
  const [userList, setUserList] = useState<User[]>(users || []);
  const [loadingActions, setLoadingActions] = useState<{ [key: string]: boolean }>({});

  const handleRoleChange = async (userId: string, role?: string) => {
    if (!isAdmin) {
      alert("You are not authorized to change roles.");
      return;
    }
  
    setLoadingActions((prev) => ({ ...prev, [userId]: true }));
  
    // ✅ Ensure FormData is properly created
    const formData = new FormData();
    formData.append("id", userId);
    if (role) formData.append("role", role);
  
    try {
      if (role) {
        await setRole(formData); // ✅ Pass correct FormData
      } else {
        await removeRole(formData); // ✅ Pass correct FormData
      }
  
      // Update UI optimistically
      setUserList((prevUsers) =>
        prevUsers.map((user) =>
          user.id === userId ? { ...user, role: role ?? undefined } : user
        )
      );
    } catch (error) {
      console.error("Error updating role:", error);
    } finally {
      setLoadingActions((prev) => ({ ...prev, [userId]: false }));
    }
  };
  

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">User Management</h2>
      {userList.length === 0 ? (
        <p>No users found.</p>
      ) : (
        <div className="grid gap-4">
          {userList.map((user) => (
            <div key={user.id} className="p-4 border rounded-lg flex justify-between">
              <div>
                <h3 className="font-medium">
                  {user.firstName ?? "Unknown"} {user.lastName ?? "User"}
                </h3>
                <p className="text-sm text-gray-600">
                  {user.emailAddresses?.[0]?.emailAddress ?? "No Email"}
                </p>
                <p className="text-xs text-gray-500">
                  Role: <span className={user.role === "admin" ? "text-red-500 font-semibold" : ""}>
                    {user.role ?? "User"}
                  </span>
                </p>
              </div>
              {isAdmin && user.id !== currentUserId && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleRoleChange(user.id, "admin")}
                    className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                    disabled={loadingActions[user.id]}
                  >
                    {loadingActions[user.id] ? "Processing..." : "Make Admin"}
                  </button>
                  <button
                    onClick={() => handleRoleChange(user.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                    disabled={loadingActions[user.id]}
                  >
                    {loadingActions[user.id] ? "Processing..." : "Remove Role"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserManagementClient;
