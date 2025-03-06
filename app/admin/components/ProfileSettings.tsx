"use client";

import { useState } from "react";
import { useUser } from "@/app/auth/nextjs/useUser";

const ProfileSettings = () => {
  const { user, isLoading } = useUser();
  const [name, setName] = useState(user?.name || "");
  const [loading, setLoading] = useState(false);

  if (isLoading) {
    return <p>Loading...</p>;
  }

  if (!user) {
    return <p>Please log in to update your profile.</p>;
  }

  const updateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/auth/update-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: user.id, name }),
      });

      if (!res.ok) throw new Error("Failed to update profile");

      alert("Profile updated!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 border rounded-lg mt-6">
      <h2 className="text-2xl font-semibold mb-4">Update Profile</h2>
      <form onSubmit={updateProfile} className="space-y-4">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            type="text"
            className="w-full p-2 border rounded"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          {loading ? "Saving..." : "Save Changes"}
        </button>
      </form>
    </div>
  );
};

export default ProfileSettings;
