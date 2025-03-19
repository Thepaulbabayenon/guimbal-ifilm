'use client';

import { useState } from 'react';

type DeleteButtonProps = {
  filmId: number;
};

const DeleteButton: React.FC<DeleteButtonProps> = ({ filmId }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/admin/films/delete`, {
        method: 'DELETE',
        body: JSON.stringify({ filmId }),
      });

      if (res.ok) {
        alert('Film deleted successfully');
        window.location.reload();
      } else {
        alert('Failed to delete film');
      }
    } catch (error) {
      console.error('Error deleting film:', error);
      alert('Failed to delete film');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <button
      onClick={handleDelete}
      className={`px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700 ${isDeleting ? 'opacity-50 cursor-not-allowed' : ''}`}
      disabled={isDeleting}
    >
      {isDeleting ? 'Deleting...' : 'Delete'}
    </button>
  );
};

export default DeleteButton;
