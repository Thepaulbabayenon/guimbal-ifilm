'use client';

import { useState, useEffect } from "react";

// Define the expected shape of a playlist item
type Playlist = {
  id: number;
  title: string;
  isPublic: boolean;
};

const Playlist = () => {
  const [playlists, setPlaylists] = useState<Playlist[]>([]); // ⬅️ Fix applied

  useEffect(() => {
    fetch("/api/playlists")
      .then((res) => res.json())
      .then((data: Playlist[]) => setPlaylists(data)); // ⬅️ Explicitly define the expected data type
  }, []);

  return (
    <div>
      {playlists.map((playlist) => (
        <div key={playlist.id} className="p-4 bg-gray-800 rounded-lg">
          <h3 className="text-white font-bold">{playlist.title}</h3>
          <span className="text-gray-400">{playlist.isPublic ? "Public" : "Private"}</span>
        </div>
      ))}
    </div>
  );
};

export default Playlist;
