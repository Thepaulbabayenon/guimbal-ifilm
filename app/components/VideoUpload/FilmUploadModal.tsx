'use client';
import React, { useState, useEffect } from 'react';
import { gsap } from 'gsap';

const FilmUploadModal = () => {
  const [formData, setFormData] = useState({
    fileNameImage: '',
    fileTypeImage: '',
    fileNameVideo: '',
    fileTypeVideo: '',
    fileTypeTrailer: '',
    fileNameTrailer: '',
    title: '',
    ageRating: '',
    duration: '',
    overview: '',
    release: '',
    category: '',
    producer: '',
    director: '',
    coDirector: '',
    studio: '',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [trailerFile, setTrailerFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0); // Track progress here
  const [message, setMessage] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
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
      }
       if (name === 'trailerFile') {
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

  // Function to reset the form
  const resetForm = () => {
    setFormData({
      fileNameImage: '',
      fileTypeImage: '',
      fileNameVideo: '',
      fileTypeVideo: '',
      fileNameTrailer: '',
      fileTypeTrailer: '',
      title: '',
      ageRating: '',
      duration: '',
      overview: '',
      release: '',
      category: '',
      producer: '',
      director: '',
      coDirector: '',
      studio: '',
    });
    setImageFile(null);
    setVideoFile(null);
    setTrailerFile(null); 
    setProgress(0);
  };

  // Function to upload file with progress tracking
  const uploadFileWithProgress = (url: string, file: File) => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', url, true);

      // Track progress
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const percent = (event.loaded / event.total) * 100;
          setProgress(Math.round(percent)); // Update progress state
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve('File uploaded successfully');
        } else {
          reject(new Error('Failed to upload file'));
        }
      };

      xhr.onerror = () => {
        reject(new Error('Error during file upload'));
      };

      xhr.send(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/films/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const { uploadURLImage, uploadURLVideo, uploadURLTrailer } = await response.json();

      // Upload image, video and trailer to S3 using signed URLs
      if (imageFile && uploadURLImage) {
        await uploadFileWithProgress(uploadURLImage, imageFile);
      }

      if (videoFile && uploadURLVideo) {
        await uploadFileWithProgress(uploadURLVideo, videoFile);
      }
      if (trailerFile && uploadURLTrailer) {
        await uploadFileWithProgress(uploadURLTrailer, trailerFile);
      }

      setMessage('Film uploaded successfully!');
      resetForm(); // Reset the form after successful upload
    } catch (err) {
      console.error(err);
      setMessage('Failed to upload the film.');
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

  useEffect(() => {
    if (isModalOpen) {
      gsap.fromTo(
        '.modal-container',
        { opacity: 0, scale: 0.9 },
        { opacity: 1, scale: 1, duration: 0.3 }
      );
    }
  }, [isModalOpen]);

  return (
    <>
      {/* Button to trigger the modal */}
      <button onClick={openModal} className="bg-blue-600 text-white p-2 rounded-lg text-sm">
        Upload Film
      </button>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="modal-container relative bg-white rounded-lg shadow-lg max-w-sm w-full p-4">
            {/* Close Button */}
            <button
              onClick={closeModal}
              className="absolute top-2 right-2 text-xl text-black hover:text-gray-900"
            >
              &times;
            </button>

            <h2 className="text-xl font-semibold text-black text-center mb-4">
              Upload a Film to Guimbal iFilm Society
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Metadata fields */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  placeholder="Title"
                  onChange={handleInputChange}
                  required
                  className="border rounded-lg p-1 w-full text-sm text-black"
                />
                <input
                  type="number"
                  name="ageRating"
                  value={formData.ageRating}
                  placeholder="Age"
                  onChange={handleInputChange}
                  required
                  className="border rounded-lg p-1 w-full text-sm text-black"
                />
                <input
                  type="number"
                  name="duration"
                  value={formData.duration}
                  placeholder="Duration (mins)"
                  onChange={handleInputChange}
                  required
                  className="border rounded-lg p-1 w-full text-sm text-black"
                />
              </div>
              <textarea
                name="overview"
                value={formData.overview}
                placeholder="Overview"
                onChange={handleInputChange}
                required
                className="border rounded-lg p-1 w-full text-sm text-black"
              />
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <input
                  type="number"
                  name="release"
                  value={formData.release}
                  placeholder="Release Year"
                  onChange={handleInputChange}
                  required
                  className="border rounded-lg p-1 w-full text-sm text-black"
                />
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  placeholder="Category"
                  onChange={handleInputChange}
                  required
                  className="border rounded-lg p-1 w-full text-sm text-black"
                />
                <input
                  type="text"
                  name="producer"
                  value={formData.producer}
                  placeholder="Producer"
                  onChange={handleInputChange}
                  required
                  className="border rounded-lg p-1 w-full text-sm text-black"
                />
                <input
                  type="text"
                  name="director"
                  value={formData.director}
                  placeholder="Director"
                  onChange={handleInputChange}
                  required
                  className="border rounded-lg p-1 w-full text-sm text-black"
                />
                <input
                  type="text"
                  name="coDirector"
                  value={formData.coDirector}
                  placeholder="Co-Director"
                  onChange={handleInputChange}
                  required
                  className="border rounded-lg p-1 w-full text-sm text-black"
                />
                <input
                  type="text"
                  name="studio"
                  value={formData.studio}
                  placeholder="Studio"
                  onChange={handleInputChange}
                  required
                  className="border rounded-lg p-1 w-full text-sm text-black"
                />
              </div>

              {/* File fields */}
              <div className="space-y-3">
                <label className="block text-sm text-black">
                  <span className="text-black">Upload Image:</span>
                  <input
                    type="file"
                    name="imageFile"
                    accept="image/*"
                    onChange={handleFileChange}
                    required
                    className="block w-full mt-1 text-sm"
                  />
                </label>
                <label className="block text-sm text-black">
                  <span className="text-black">Trailer:</span>
                  <input
                    type="file"
                    name="trailerFile"
                    accept="video/*"
                    onChange={handleFileChange}
                    required
                    className="block w-full mt-1 text-sm"
                  />
                </label>
                <label className="block text-sm text-black">
                  <span className="text-black">Film:</span>
                  <input
                    type="file"
                    name="videoFile"
                    accept="video/*"
                    onChange={handleFileChange}
                    required
                    className="block w-full mt-1 text-sm"
                  />
                </label>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 px-4 text-white rounded-lg text-sm ${loading ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'}`}
              >
                {loading ? 'Uploading...' : 'Upload'}
              </button>
            </form>

            {/* Progress Bar */}
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

            {message && (
              <p className={`mt-4 text-center ${message.includes('successfully') ? 'text-green-600' : 'text-red-600'}`}>
                {message}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
};


export default FilmUploadModal;
