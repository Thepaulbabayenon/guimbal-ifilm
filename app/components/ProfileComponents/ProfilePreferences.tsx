'use client';

import { useUser } from "@clerk/nextjs";
import { updatePreferences } from "@/app/actions/preferences";
import { useFormState } from "react-dom";

// Define types for user metadata
interface PublicMetadata {
  isAdmin?: boolean;
}

interface PrivateMetadata {
  favoriteGenres?: string;
  contentPreferences?: string;
}

interface User {
  id: string;
  imageUrl?: string;
  fullName?: string;
  primaryEmailAddress?: { emailAddress: string };
  publicMetadata?: PublicMetadata;
  privateMetadata?: PrivateMetadata;
  createdAt?: Date;
}

export function ProfilePreferences() {
  const { user } = useUser() as { user: User | null };

  if (!user) return null;

  const privateMetadata = user.privateMetadata ?? {};

  // Handle form submission
  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.target as HTMLFormElement);

    // Assuming the updatePreferences expects two arguments: prevState and formData
    const prevState = {}; // This can be your initial state or previous state, depending on your use case.
    
    const result = await updatePreferences(prevState, formData);
    console.log(result); // Log the result of the form submission
  };

  return (
    <section>
      <h2 className="text-2xl font-bold mb-4">Preferences</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input type="hidden" name="userId" value={user.id} />
        
        <div className="form-group">
          <label>Favorite Genres</label>
          <input
            name="favoriteGenres"
            defaultValue={privateMetadata.favoriteGenres || ""}
            className="input-field"
          />
        </div>

        <div className="form-group">
          <label>Content Preferences</label>
          <select 
            name="contentPreferences"
            defaultValue={privateMetadata.contentPreferences || "all"}
            className="select-field"
          >
            <option value="all">All Content</option>
            <option value="family">Family Friendly</option>
            <option value="mature">Mature Content</option>
          </select>
        </div>

        <button type="submit" className="btn-primary">
          Save Preferences
        </button>
      </form>
    </section>
  );
}
