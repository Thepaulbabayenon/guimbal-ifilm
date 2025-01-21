'use client';
import { useState, ChangeEvent, FormEvent } from 'react';
import toast, { Toaster } from 'react-hot-toast';

export default function FilmUploadModal() {
  const [formData, setFormData] = useState({
    title: '',
    age: '',
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
  const [videoFileTrailer, setVideoFileTrailer] = useState<File | null>(null);
  const [videoFileSource, setVideoFileSource] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>, type: 'image' | 'trailer' | 'source') => {
    const file = e.target.files ? e.target.files[0] : null;

    if (!file) return;

    if (type === 'image' && file.type.startsWith('image/')) {
      setImageFile(file);
    } else if (type === 'trailer' && file.type === 'video/mp4') {
      setVideoFileTrailer(file);
    } else if (type === 'source' && file.type === 'video/mp4') {
      setVideoFileSource(file);
    } else {
      toast.error(`Invalid file type for ${type}.`);
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!imageFile || !videoFileTrailer || !videoFileSource) {
      toast.error('Please upload all required files.');
      return;
    }

    setUploading(true);
    toast.loading('Uploading...');

    const formDataToSend = new FormData();
    Object.keys(formData).forEach((key) => formDataToSend.append(key, formData[key as keyof typeof formData]));
    formDataToSend.append('image', imageFile);
    formDataToSend.append('trailer', videoFileTrailer);
    formDataToSend.append('source', videoFileSource);

    try {
      const response = await fetch('/api/files/upload', {
        method: 'POST',
        body: formDataToSend,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      toast.dismiss();
      toast.success('Film uploaded successfully!');
    } catch (error) {
      toast.dismiss();
      toast.error('An error occurred during the upload.');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="film-upload-modal">
      <Toaster />
      <h1>Upload Film</h1>

      <form onSubmit={handleSubmit}>
        {/* Form fields */}
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={handleInputChange}
          className='bg-blue-600'
          required
        />
        <input
          type="number"
          name="age"
          placeholder="Age"
          value={formData.age}
          onChange={handleInputChange}
          className='bg-blue-600'
          required
        />
        <input
          type="number"
          name="duration"
          placeholder="Duration (minutes)"
          value={formData.duration}
          onChange={handleInputChange}
          className='bg-blue-600'
          required
        />
        <textarea
          name="overview"
          placeholder="Overview"
          value={formData.overview}
          onChange={handleInputChange}
          className='bg-blue-600'
          required
        />
        <input
          type="number"
          name="release"
          placeholder="Release Year"
          value={formData.release}
          onChange={handleInputChange}
          className='bg-blue-600'
          required
        />
        <input
          type="text"
          name="category"
          placeholder="Category"
          value={formData.category}
          onChange={handleInputChange}
          className='bg-blue-600'
          required
        />
        <input
          type="text"
          name="producer"
          placeholder="Producer"
          value={formData.producer}
          onChange={handleInputChange}
          className='bg-blue-600'
          required
        />
        <input
          type="text"
          name="director"
          placeholder="Director"
          value={formData.director}
          onChange={handleInputChange}
          className='bg-blue-600'
          required
        />
        <input
          type="text"
          name="coDirector"
          placeholder="Co-Director"
          value={formData.coDirector}
          onChange={handleInputChange}
          className='bg-blue-600'
          required
        />
        <input
          type="text"
          name="studio"
          placeholder="Studio"
          value={formData.studio}
          onChange={handleInputChange}
          required
        />

        {/* File inputs */}
        <label>
          Upload Thumbnail Image:
          <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'image')} required />
        </label>
        <label>
          Upload Trailer Video:
          <input type="file" accept="video/mp4" onChange={(e) => handleFileChange(e, 'trailer')} required />
        </label>
        <label>
          Upload Full Film Video:
          <input type="file" accept="video/mp4" onChange={(e) => handleFileChange(e, 'source')} required />
        </label>

        <button type="submit" disabled={uploading}>
          {uploading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
    </div>
  );
}
