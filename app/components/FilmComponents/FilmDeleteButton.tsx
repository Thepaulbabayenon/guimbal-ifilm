import React from 'react';

interface Film {
  id: string;
  title: string;
  fileNameImage: string;
  fileNameVideo: string;
}

const FilmDeleteButton: React.FC<{ film: Film }> = ({ film }) => {
  const handleDelete = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete this film?');

    if (confirmDelete) {
      try {
        const response = await fetch('/api/files/delete', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            id: film.id,
            fileNameImage: film.fileNameImage,
            fileNameVideo: film.fileNameVideo,
          }),
        });

        const data = await response.json();
        if (response.ok) {
          alert('Film deleted successfully');
        } else {
          alert('Failed to delete the film');
        }
      } catch (err) {
        console.error('Error deleting film:', err);
        alert('An error occurred while deleting the film.');
      }
    }
  };

  return (
    <button
      onClick={handleDelete}
      className="bg-red-600 text-white py-2 px-4 rounded-lg"
    >
      Delete Film
    </button>
  );
};

export default FilmDeleteButton;
