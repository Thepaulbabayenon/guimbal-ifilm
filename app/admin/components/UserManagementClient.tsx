"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  emailAddresses: { emailAddress: string }[];
  role: "admin" | "user";
  name?: string;
};

interface UserManagementClientProps {
  users: User[];
  currentUserId: string;
  isAdmin: boolean;
}

const UserManagementClient = ({ 
  users, 
  currentUserId, 
  isAdmin 
}: UserManagementClientProps) => {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isUpdateUserModalOpen, setIsUpdateUserModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/admin/users?search=${encodeURIComponent(searchQuery)}`);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setIsUpdateUserModalOpen(true);
  };

  const handleDeletePrompt = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete user');
      }
      
      // Refresh the page to update the user list
      router.refresh();
      setIsDeleteModalOpen(false);
    } catch (error) {
      console.error('Error deleting user:', error);
      alert('Failed to delete user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateRole = async (userId: string, newRole: "admin" | "user") => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${userId}/role`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ role: newRole }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update user role');
      }
      
      // Refresh the page to update the user list
      router.refresh();
    } catch (error) {
      console.error('Error updating user role:', error);
      alert('Failed to update user role. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateUser = async (updatedUser: Partial<User>) => {
    if (!selectedUser) return;

    setIsLoading(true);
    try {
      const response = await fetch(`/api/users/${selectedUser.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedUser),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update user');
      }
      
      // Refresh the page to update the user list
      router.refresh();
      setIsUpdateUserModalOpen(false);
    } catch (error) {
      console.error('Error updating user:', error);
      alert('Failed to update user. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">User Management</h1>
      
      <form onSubmit={handleSearch} className="mb-6 flex">
        <input
          type="text"
          placeholder="Search by name or email..."
          className="px-4 py-2 border rounded-l w-full text-black"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <button 
          type="submit"
          className="bg-blue-500 hover:bg-blue-700 text-black px-4 py-2 rounded-r"
        >
          Search
        </button>
      </form>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border">
          <thead className="bg-gray-100">
            <tr>
              <th className="py-2 px-4 border text-left text-black">Name</th>
              <th className="py-2 px-4 border text-left text-black">Email</th>
              <th className="py-2 px-4 border text-left text-black">Role</th>
              <th className="py-2 px-4 border text-left text-black">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className={user.id === currentUserId ? "bg-blue-50" : ""}>
                <td className="py-2 px-4 border text-black">
                  {user.firstName} {user.lastName}
                </td>
                <td className="py-2 px-4 border text-black">
                  {user.email || user.emailAddresses[0]?.emailAddress}
                </td>
                <td className="py-2 px-4 border text-black">
                  <select
                    value={user.role}
                    onChange={(e) => handleUpdateRole(user.id, e.target.value as "admin" | "user")}
                    disabled={user.id === currentUserId || isLoading}
                    className="border rounded py-1 px-2 w-full"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td className="py-2 px-4 border flex gap-2">
                  <button 
                    className="text-blue-500 hover:text-blue-700 px-2 py-1"
                    onClick={() => handleEditUser(user)}
                    disabled={isLoading}
                  >
                    Edit
                  </button>
                  {user.id !== currentUserId && (
                    <button 
                      className="text-red-500 hover:text-red-700 px-2 py-1"
                      onClick={() => handleDeletePrompt(user)}
                      disabled={isLoading}
                    >
                      Delete
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan={4} className="py-4 px-4 border text-center text-gray-500">
                  No users found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Confirm Deletion</h3>
            <p className="mb-4">
              Are you sure you want to delete the user <span className="font-semibold">{selectedUser.firstName} {selectedUser.lastName}</span>?
              This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
                onClick={() => setIsDeleteModalOpen(false)}
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded"
                onClick={handleDeleteUser}
                disabled={isLoading}
              >
                {isLoading ? "Deleting..." : "Delete User"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {isUpdateUserModalOpen && selectedUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Edit User</h3>
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.currentTarget);
                const updatedUser = {
                  name: formData.get('name') as string,
                  email: formData.get('email') as string,
                };
                handleUpdateUser(updatedUser);
              }}
            >
              <div className="mb-4">
                <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  defaultValue={selectedUser.name || `${selectedUser.firstName} ${selectedUser.lastName}`}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  defaultValue={selectedUser.email || selectedUser.emailAddresses[0]?.emailAddress}
                  className="w-full px-3 py-2 border rounded-md"
                  required
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded"
                  onClick={() => setIsUpdateUserModalOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded"
                  disabled={isLoading}
                >
                  {isLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagementClient;