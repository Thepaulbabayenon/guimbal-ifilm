'use client';

import React, { useState, useEffect } from 'react';
import { gsap } from 'gsap';

interface Film {
  id: string;
  title: string;
  age: number;
  duration: number;
  overview: string;
  release: string;
  category: string;
  producer: string;
  director: string;
  coDirector: string;
  studio: string;
}

const FilmUpdateModal = () => {
  const [films, setFilms] = useState<Film[]>([]);
  const [selectedFilm, setSelectedFilm] = useState<Film | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (isModalOpen) {
      fetchFilms();
    }
  }, [isModalOpen]);

  const fetchFilms = async () => {
    try {
      const response = await fetch('/api/admin/films');
      if (!response.ok) throw new Error('Failed to fetch films');
      const data = await response.json();
      setFilms(data);
    } catch (error) {
      console.error('Error fetching films:', error);
    }
  };

  const handleSelectFilm = (filmId: string) => {
    const film = films.find((f) => f.id === filmId);
    if (film) {
      setSelectedFilm({ ...film }); // Creates a new object to trigger re-render
    }
  };
  
  

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    if (!selectedFilm) return;
    
    setSelectedFilm((prevFilm) => ({
      ...prevFilm!,
      [e.target.name]: e.target.value,
    }));
  };
  

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFilm) return;

    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/films/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(selectedFilm),
      });

      if (!response.ok) throw new Error('Failed to update film');
      setMessage('Film updated successfully!');
    } catch (error) {
      console.error('Error updating film:', error);
      setMessage('Failed to update film.');
    } finally {
      setLoading(false);
    }
  };

  const closeModal = () => {
    gsap.to('.modal-container', {
      opacity: 0,
      scale: 0.9,
      duration: 0.3,
      onComplete: () => setIsModalOpen(false),
    });
  };

  const openModal = () => {
    setIsModalOpen(true);
    gsap.fromTo(
      '.modal-container',
      { opacity: 0, scale: 0.9 },
      { opacity: 1, scale: 1, duration: 0.3 }
    );
  };

  return (
    <>
      <button onClick={openModal} className="bg-blue-600 text-white p-2 rounded-lg text-sm">
        Update Film
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="modal-container relative bg-white rounded-lg shadow-lg max-w-sm w-full p-4">
            <button onClick={closeModal} className="absolute top-2 right-2 text-xl text-black hover:text-gray-900">
              &times;
            </button>
            <h2 className="text-xl font-semibold text-black text-center mb-4">Update Film</h2>

            <label className="block font-semibold">Select a Film:</label>
            <select 
              className="w-full p-2 border rounded mb-4" 
              onChange={(e) => handleSelectFilm(e.target.value)}
              value={selectedFilm ? selectedFilm.id : ""}
            >
              <option value="" disabled>-- Choose a film to update --</option>
              {films.map((film) => (
                <option key={film.id} value={film.id}>
                  {film.title}
                </option>
              ))}
            </select>


            {selectedFilm && (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" name="title" value={selectedFilm?.title || ""} onChange={handleInputChange} className="w-full p-2 border rounded" />
              <input type="number" name="age" value={selectedFilm?.age || ""} onChange={handleInputChange} className="w-full p-2 border rounded" />
              <input type="number" name="duration" value={selectedFilm?.duration || ""} onChange={handleInputChange} className="w-full p-2 border rounded" />
              <textarea name="overview" value={selectedFilm?.overview || ""} onChange={handleInputChange} className="w-full p-2 border rounded" />
              <input type="date" name="release" value={selectedFilm?.release || ""} onChange={handleInputChange} className="w-full p-2 border rounded" />
              <input type="text" name="category" value={selectedFilm?.category || ""} onChange={handleInputChange} className="w-full p-2 border rounded" />
              <input type="text" name="producer" value={selectedFilm?.producer || ""} onChange={handleInputChange} className="w-full p-2 border rounded" />
              <input type="text" name="director" value={selectedFilm?.director || ""} onChange={handleInputChange} className="w-full p-2 border rounded" />
              <input type="text" name="coDirector" value={selectedFilm?.coDirector || ""} onChange={handleInputChange} className="w-full p-2 border rounded" />
              <input type="text" name="studio" value={selectedFilm?.studio || ""} onChange={handleInputChange} className="w-full p-2 border rounded" />
              <button type="submit" className="w-full bg-blue-500 text-white font-semibold py-2 rounded" disabled={loading}>
                {loading ? 'Updating...' : 'Update Film'}
              </button>
              {message && <p className="text-green-600 font-semibold mt-2 text-center">{message}</p>}
            </form>
          )}
          </div>
        </div>
      )}
    </>
  );
};

export default FilmUpdateModal;
