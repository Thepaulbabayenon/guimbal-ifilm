'use client';

import { useUser } from "@/app/auth/nextjs/useUser"; // Import the correct useUser hook

export function ProfileHeader() {
  const { user, isLoading } = useUser(); // Now using the custom hook

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (!user) {
    return <div>No user found. Please log in.</div>;
  }

  // Safely access properties
  const isAdmin = user.role;
  const fullName = user.name || "Anonymous Viewer";
  const email = user.id || "No id provided";
   

  return (
    <div className="profile-header">
      <img
        src={user.image || "/default-avatar.jpg"}
        alt="Profile"
        className="avatar"
        width={120}
        height={120}
      />
      <div>
        <h1>{fullName}</h1>
        <p className="text-muted">{email}</p>
        <div className="badges">
          {isAdmin && <span className="badge-admin">Admin</span>}
        </div>
      </div>
    </div>
  );
}
