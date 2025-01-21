'use client';
import { useState, ChangeEvent, FormEvent } from 'react';
import toast, { Toaster } from 'react-hot-toast';

type FormData = {
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

export default function FilmUploadModal() {
  const [formData, setFormData] = useState<FormData>({
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
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [imageUploadProgress, setImageUploadProgress] = useState<number>(0);
  const [videoUploadProgressTrailer, setVideoUploadProgressTrailer] = useState<number>(0);
  const [videoUploadProgressSource, setVideoUploadProgressSource] = useState<number>(0);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file && file.type.startsWith('image/')) {
      setImageFile(file);
    } else {
      toast.error('Only image files are allowed for the thumbnail.');
    }
  };

  const handleVideoChange = (e: ChangeEvent<HTMLInputElement>, type: 'trailer' | 'source') => {
    const file = e.target.files ? e.target.files[0] : null;
    if (file && file.type === 'video/mp4') {
      if (type === 'trailer') {
        setVideoFileTrailer(file);
      } else {
        setVideoFileSource(file);
      }
    } else {
      toast.error('Only MP4 video files are allowed.');
    }
  };

  const uploadFileWithProgress = (
    file: File,
    uploadURL: string,
    onProgress: (progress: number) => void
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      xhr.open('PUT', uploadURL);
      xhr.setRequestHeader('Content-Type', file.type);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status === 200) {
          resolve();
        } else {
          reject(new Error(`Failed to upload file: ${xhr.statusText}`));
        }
      };

      xhr.onerror = () => {
        reject(new Error('An error occurred during the upload.'));
      };

      xhr.send(file);
    });
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!imageFile || !videoFileTrailer || !videoFileSource) {
      toast.error('Please upload all required files.');
      return;
    }

    setIsLoading(true);
    setImageUploadProgress(0);
    setVideoUploadProgressTrailer(0);
    setVideoUploadProgressSource(0);
    toast.loading('Uploading data...');

    try {
      // Step 1: Request signed URLs from the backend
      const res = await fetch('/api/files/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          fileNameImage: imageFile.name,
          fileTypeImage: imageFile.type,
          fileNameVideo: videoFileTrailer.name,
          fileTypeVideo: videoFileTrailer.type,
        }),
      });

      if (!res.ok) {
        throw new Error('Failed to get signed upload URLs from the server.');
      }

      const { uploadURLImage, uploadURLVideo } = await res.json();

      // Step 2: Upload files directly to S3 using the signed URLs
      await uploadFileWithProgress(imageFile, uploadURLImage, setImageUploadProgress);
      await uploadFileWithProgress(videoFileTrailer, uploadURLVideo, setVideoUploadProgressTrailer);

      toast.dismiss();
      toast.success('Film uploaded successfully!');
    } catch (error) {
      console.error('Error during film upload:', error);
      toast.dismiss();
      toast.error('An error occurred during the upload process. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="film-upload-modal">
       <Toaster />
       <form onSubmit={handleSubmit} className="upload-form">
        <h2>Upload Film</h2>

        {/* Other form fields for film metadata */}
        <div>
          <label htmlFor="title">Title</label>
           <input
            type="text"
            id="title"
            name="title"
            onChange={handleChange}
            value={formData.title}
            required
          />
        </div>

        <div>
          <label htmlFor="age">Age</label>
          <input
            type="number"
            id="age"
            name="age"
            placeholder="Age"
            onChange={handleChange}
            value={formData.age}
            required
          />
        </div>

        <div>
          <label htmlFor="duration">Duration (in minutes)</label>
          <input
            type="number"
            id="duration"
            name="duration"
            placeholder="Duration"
            onChange={handleChange}
            value={formData.duration}
            required
          />
        </div>

        <div>
          <label htmlFor="overview">Overview</label>
          <textarea
            id="overview"
            name="overview"
            placeholder="Overview"
            onChange={handleChange}
            value={formData.overview}
            required
          />
        </div>

        <div>
          <label htmlFor="release">Release Year</label>
          <input
            type="number"
            id="release"
            name="release"
            placeholder="Release Year"
            onChange={handleChange}
            value={formData.release}
            required
          />
        </div>

        <div>
          <label htmlFor="category">Category</label>
          <input
            type="text"
            id="category"
            name="category"
            placeholder="Category"
            onChange={handleChange}
            value={formData.category}
            required
          />
        </div>

        <div>
          <label htmlFor="producer">Producer</label>
          <input
            type="text"
            id="producer"
            name="producer"
            placeholder="Producer"
            onChange={handleChange}
            value={formData.producer}
            required
          />
        </div>

        <div>
          <label htmlFor="director">Director</label>
          <input
            type="text"
            id="director"
            name="director"
            placeholder="Director"
            onChange={handleChange}
            value={formData.director}
            required
          />
        </div>

        <div>
          <label htmlFor="coDirector">Co-Director</label>
          <input
            type="text"
            id="coDirector"
            name="coDirector"
            placeholder="Co-Director"
            onChange={handleChange}
            value={formData.coDirector}
            required
          />
        </div>

        <div>
          <label htmlFor="studio">Studio</label>
          <input
            type="text"
            id="studio"
            name="studio"
            placeholder="Studio"
            onChange={handleChange}
            value={formData.studio}
            required
          />
        </div>

        <div>
          <label htmlFor="imageFile">Image</label>
          <input type="file" id="imageFile" accept="image/*" onChange={handleImageChange} required />
        </div>

        <div>
          <label htmlFor="trailerVideo"> Trailer </label>
          <input
            type="file"
            id="trailerVideo"
            accept="video/mp4"
            onChange={(e) => handleVideoChange(e, 'trailer')}
            required
          />
        </div>
        <div>
          <label htmlFor="sourceVideo"> Film </label>
          <input
            type="file"
            id="sourceVideo"
            accept="video/mp4"
            onChange={(e) => handleVideoChange(e, 'source')}
            required
          />
        </div>

        {isLoading && (
          <div>
            <p>Image Upload Progress: {imageUploadProgress}%</p>
            <progress value={imageUploadProgress} max="100"></progress>

            <p>Trailer Video Upload Progress: {videoUploadProgressTrailer}%</p>
            <progress value={videoUploadProgressTrailer} max="100"></progress>

            <p>Source Video Upload Progress: {videoUploadProgressSource}%</p>
            <progress value={videoUploadProgressSource} max="100"></progress>
          </div>
        )}

        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Uploading...' : 'Upload'}
        </button>
      </form>
    </div>
  );
}
