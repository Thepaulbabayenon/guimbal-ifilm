'use client';

import { useUser } from "@clerk/nextjs";

// Define the correct type for the user metadata
interface PublicMetadata {
  isAdmin?: boolean;
}

interface User {
  imageUrl?: string;
  fullName?: string;
  primaryEmailAddress?: { emailAddress: string };
  publicMetadata?: PublicMetadata;
  createdAt?: Date;
}

export function ProfileHeader() {
  const { user } = useUser(); // No type argument is needed for useUser

  if (!user) {
    return <div>Loading...</div>; // Handle loading state when the user is not yet available
  }

  // Safely access properties and assign fallback values
  const isAdmin = user.publicMetadata?.isAdmin ?? false; // Default to false if undefined
  const fullName = user.fullName || "Anonymous Viewer"; // Default to "Anonymous Viewer" if undefined
  const email = user.primaryEmailAddress?.emailAddress || "No email provided"; // Default if no email
  const memberSince = user.createdAt?.toLocaleDateString() || "Unknown"; // Default if createdAt is undefined

  return (
    <div className="profile-header">
      <img 
        src={user.imageUrl || "/default-avatar.jpg"} 
        alt="Profile"
        className="avatar"
        width={120}
        height={120}
      />
      <div>
        <h1>{fullName}</h1>
        <p className="text-muted">{email}</p>
        <div className="badges">
          {isAdmin && (
            <span className="badge-admin">Admin</span>
          )}
          <span className="badge-member">
            Member since: {memberSince}
          </span>
        </div>
      </div>
    </div>
  );
}
