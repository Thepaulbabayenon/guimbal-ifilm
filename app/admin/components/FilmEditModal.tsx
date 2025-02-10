'use client';
import React, { useState, useEffect } from 'react';
import { gsap } from 'gsap';

type FilmFormData = {
  fileNameImage: string;
  fileTypeImage: string;
  fileNameVideo: string;
  fileTypeVideo: string;
  fileNameTrailer: string;
  fileTypeTrailer: string;
  title: string;
  age: string;
  duration: string;
  overview: string;
  release: string;
  category: string;
  producer: string;
  director: string;
  coDirector: string;
  studio: string;
};

type FilmEditModalProps = {
  filmData: FilmFormData;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (updatedFilm: FilmFormData) => void;
};

const FilmEditModal: React.FC<FilmEditModalProps> = ({ filmData, isOpen, onClose, onUpdate }) => {
  const [formData, setFormData] = useState<FilmFormData>(filmData);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [trailerFile, setTrailerFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData(filmData); // Reset form with current film data when modal opens
      gsap.fromTo(
        '.modal-container',
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.3 }
      );
    }
  }, [isOpen, filmData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev: FilmFormData) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, files } = e.target;
    if (files?.[0]) {
      if (name === 'imageFile') {
        setImageFile(files[0]);
        setFormData((prev) => ({
          ...prev,
          fileNameImage: files[0].name,
          fileTypeImage: files[0].type,
        }));
      } else if (name === 'trailerFile') {
        setTrailerFile(files[0]);
        setFormData((prev) => ({
          ...prev,
          fileNameTrailer: files[0].name,
          fileTypeTrailer: files[0].type,
        }));
      } else if (name === 'videoFile') {
        setVideoFile(files[0]);
        setFormData((prev) => ({
          ...prev,
          fileNameVideo: files[0].name,
          fileTypeVideo: files[0].type,
        }));
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/files/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const { uploadURLImage, uploadURLVideo, uploadURLTrailer } = await response.json();

      // Upload files if new ones are selected
      if (imageFile && uploadURLImage) {
        await uploadFileWithProgress(uploadURLImage, imageFile);
      }
      if (videoFile && uploadURLVideo) {
        await uploadFileWithProgress(uploadURLVideo, videoFile);
      }
      if (trailerFile && uploadURLTrailer) {
        await uploadFileWithProgress(uploadURLTrailer, trailerFile);
      }

      setMessage('Film updated successfully!');
      onUpdate(formData);
      onClose();
    } catch (err) {
      console.error(err);
      setMessage('Failed to update the film.');
    } finally {
      setLoading(false);
    }
  };

  const uploadFileWithProgress = (url: string, file: File) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', url, true);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = (event.loaded / event.total) * 100;
          setProgress(Math.round(percent));
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve('File uploaded successfully');
        } else {
          reject(new Error('Failed to upload file'));
        }
      };

      xhr.onerror = () => reject(new Error('Error during file upload'));
      xhr.send(file);
    });
  };

  return (
    <>
      {isOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="modal-container relative bg-white rounded-lg shadow-lg max-w-md w-full p-4">
            <button onClick={onClose} className="absolute top-2 right-2 text-xl text-black hover:text-gray-900">
              &times;
            </button>

            <h2 className="text-xl font-semibold text-black text-center mb-4">Edit Film</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" name="title" value={formData.title} onChange={handleInputChange} required className="border rounded-lg p-1 w-full text-sm text-black" />
              <input type="number" name="age" value={formData.age} onChange={handleInputChange} required className="border rounded-lg p-1 w-full text-sm text-black" />
              <input type="number" name="duration" value={formData.duration} onChange={handleInputChange} required className="border rounded-lg p-1 w-full text-sm text-black" />
              <textarea name="overview" value={formData.overview} onChange={handleInputChange} required className="border rounded-lg p-1 w-full text-sm text-black" />
              <input type="number" name="release" value={formData.release} onChange={handleInputChange} required className="border rounded-lg p-1 w-full text-sm text-black" />

              <label className="block text-sm text-black">
                <span>Update Image:</span>
                <input type="file" name="imageFile" accept="image/*" onChange={handleFileChange} className="block w-full mt-1 text-sm" />
              </label>
              <label className="block text-sm text-black">
                <span>Update Trailer:</span>
                <input type="file" name="trailerFile" accept="video/*" onChange={handleFileChange} className="block w-full mt-1 text-sm" />
              </label>
              <label className="block text-sm text-black">
                <span>Update Film:</span>
                <input type="file" name="videoFile" accept="video/*" onChange={handleFileChange} className="block w-full mt-1 text-sm" />
              </label>

              <button type="submit" disabled={loading} className={`w-full py-2 px-4 text-white rounded-lg text-sm ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}>
                {loading ? 'Updating...' : 'Update'}
              </button>
            </form>

            {loading && (
              <div className="mt-4">
                <div className="h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 bg-blue-600 rounded-full"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-center text-sm text-black mt-2">{progress}%</p>
              </div>
            )}

            {message && <p className={`mt-4 text-center ${message.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>{message}</p>}
          </div>
        </div>
      )}
    </>
  );
};

export default FilmEditModal;
