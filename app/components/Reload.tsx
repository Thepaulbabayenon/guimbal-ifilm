'use client';
import { useState } from "react";

export default function ReloadComponent() {
  const [key, setKey] = useState(0);

  const handleReload = () => {
    setKey(prevKey => prevKey + 1); // Increment key to force re-render
  };

  return (
    <div>
      <button onClick={handleReload} className="p-2 bg-blue-500 text-white rounded">
        Reload Component
      </button>
      <Content key={key} />
    </div>
  );
}

function Content() {
  return (
    <div className="mt-4 p-4 border rounded">
      <p>Loaded at: {new Date().toLocaleTimeString()}</p>
    </div>
  );
}
