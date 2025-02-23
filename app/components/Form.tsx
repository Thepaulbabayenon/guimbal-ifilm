import { useState } from "react";

// ✅ Define a Type for Preferences
type Preferences = {
  genres: string[];
  moods: string[];
  themes: string[];
};

const QuizForm = ({ onSubmit }: { onSubmit: (data: Preferences) => void }) => {
  // ✅ Set the correct state type
  const [preferences, setPreferences] = useState<Preferences>({
    genres: [],
    moods: [],
    themes: [],
  });

  return (
    <div className="p-6 bg-gray-800 text-white rounded-lg">
      <h2 className="text-xl font-bold">Personalized Film Quiz</h2>
      <div>
        <label>Favorite Genres:</label>
        <select
          multiple
          onChange={(e) =>
            setPreferences({
              ...preferences,
              genres: Array.from(e.target.selectedOptions, (option) => option.value),
            })
          }
        >
          <option value="drama">Drama</option>
          <option value="action">Action</option>
          <option value="comedy">Comedy</option>
        </select>
      </div>

      <button
        className="mt-4 p-2 bg-blue-600 rounded"
        onClick={() => onSubmit(preferences)}
      >
        Save Preferences
      </button>
    </div>
  );
};

export default QuizForm;
