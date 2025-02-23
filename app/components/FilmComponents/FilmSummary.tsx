import { useState } from "react";

const FilmSummary = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [summary, setSummary] = useState("");

  async function fetchSummary() {
    const res = await fetch("/api/ai", {
      method: "POST",
      body: JSON.stringify({ type: "summary", title, description }),
    });
    const data = await res.json();
    setSummary(data.summary);
  }

  return (
    <div className="p-6 bg-gray-800 text-white rounded-lg">
      <input className="w-full p-2 my-2 bg-gray-700 rounded" placeholder="Film Title" onChange={(e) => setTitle(e.target.value)} />
      <textarea className="w-full p-2 my-2 bg-gray-700 rounded" placeholder="Film Description" onChange={(e) => setDescription(e.target.value)} />
      <button className="p-2 bg-blue-600 rounded" onClick={fetchSummary}>Generate Summary</button>
      {summary && <p className="mt-4">{summary}</p>}
    </div>
  );
};

export default FilmSummary;
