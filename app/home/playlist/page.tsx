'use client';

export const dynamic = "force-dynamic";

import { usePlaylists } from "@/hooks/usePlaylists";

const PlaylistsPage = () => {
  const { playlists, loading } = usePlaylists();

  return (
    <div className="p-6 text-white bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-4">User Playlists</h1>
      {loading ? (
        <p>Loading playlists...</p>
      ) : (
        <ul>
          {playlists.map((playlist) => (
            <li key={playlist.id} className="p-4 bg-gray-800 rounded-lg mb-2">
              <h3 className="font-bold">{playlist.title}</h3>
              <p className="text-gray-400">{playlist.isPublic ? "Public" : "Private"}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default PlaylistsPage;
