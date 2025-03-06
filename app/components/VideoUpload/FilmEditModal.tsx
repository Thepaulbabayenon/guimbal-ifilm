"use client";

import { useState } from "react";

interface FilmEditModalProps {
  film: {
    id: number;
    title: string;
    ageRating: number;
    duration: number;
    overview: string;
    release: string;
    category: string;
    producer: string;
    director: string;
    coDirector: string;
    studio: string;
    imageString?: string;
    videoSource?: string;
    trailer?: string;
  };
  onClose: () => void;
}

const FilmEditModal: React.FC<FilmEditModalProps> = ({ film, onClose }) => {
  const [formData, setFormData] = useState({ ...film });
  const [image, setImage] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [trailer, setTrailer] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video" | "trailer") => {
    const file = e.target.files?.[0] || null;
    if (type === "image") setImage(file);
    if (type === "video") setVideo(file);
    if (type === "trailer") setTrailer(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    const form = new FormData();
    form.append("id", String(film.id));

    Object.entries(formData).forEach(([key, value]) => {
      form.append(key, typeof value === "number" ? String(value) : value);
    });

    if (image) form.append("image", image);
    if (video) form.append("video", video);
    if (trailer) form.append("trailer", trailer);

    try {
      const response = await fetch(`/api/admin/films/update`, {
        method: "PUT",
        body: form,
      });

      const result = await response.json();
      if (response.ok) {
        setMessage("Film updated successfully!");
      } else {
        setMessage(result.error || "Failed to update film.");
      }
    } catch (error) {
      setMessage("An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex text-black items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-4 rounded-lg shadow-lg w-80 max-h-[80vh] flex flex-col">
        <h2 className="text-lg font-semibold mb-2">Edit Film</h2>
        
        {/* Form with ID for reference */}
        <form id="editFilmForm" onSubmit={handleSubmit} className="space-y-3 overflow-y-auto flex-grow px-1">
          <input name="title" value={formData.title} onChange={handleChange} className="w-full p-2 border rounded text-sm" placeholder="Title" />
          <input name="age" type="number" value={formData.ageRating} onChange={handleChange} className="w-full p-2 border rounded text-sm" placeholder="Age Rating" />
          <input name="duration" type="number" value={formData.duration} onChange={handleChange} className="w-full p-2 border rounded text-sm" placeholder="Duration (min)" />
          <textarea name="overview" value={formData.overview} onChange={handleChange} className="w-full p-2 border rounded text-sm" placeholder="Overview"></textarea>
          <input name="release" type="date" value={formData.release} onChange={handleChange} className="w-full p-2 border rounded text-sm" />
          <input name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border rounded text-sm" placeholder="Category" />
          <input name="producer" value={formData.producer} onChange={handleChange} className="w-full p-2 border rounded text-sm" placeholder="Producer" />
          <input name="director" value={formData.director} onChange={handleChange} className="w-full p-2 border rounded text-sm" placeholder="Director" />
          <input name="coDirector" value={formData.coDirector} onChange={handleChange} className="w-full p-2 border rounded text-sm" placeholder="Co-Director" />
          <input name="studio" value={formData.studio} onChange={handleChange} className="w-full p-2 border rounded text-sm" placeholder="Studio" />

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-medium">Film Poster:</label>
            {image ? (
              <img src={URL.createObjectURL(image)} alt="Selected" className="w-20 h-20 object-cover mt-1" />
            ) : formData.imageString ? (
              <img src={formData.imageString} alt="Current" className="w-20 h-20 object-cover mt-1" />
            ) : null}
            <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "image")} className="mt-1 text-xs" />
          </div>

          {/* Video Upload */}
          <div>
            <label className="block text-xs font-medium">Film Video:</label>
            {video ? (
              <p className="text-xs">{video.name}</p>
            ) : formData.videoSource ? (
              <p className="text-xs">Current: {formData.videoSource}</p>
            ) : null}
            <input type="file" accept="video/*" onChange={(e) => handleFileChange(e, "video")} className="mt-1 text-xs" />
          </div>

          {/* Trailer Upload */}
          <div>
            <label className="block text-xs font-medium">Trailer:</label>
            {trailer ? (
              <p className="text-xs">{trailer.name}</p>
            ) : formData.trailer ? (
              <p className="text-xs">Current: {formData.trailer}</p>
            ) : null}
            <input type="file" accept="video/*" onChange={(e) => handleFileChange(e, "trailer")} className="mt-1 text-xs" />
          </div>
        </form>

        {/* Footer (Buttons & Message) */}
        <div className="mt-3">
          {message && <p className={`text-xs text-center ${message.includes("success") ? "text-green-500" : "text-red-500"}`}>{message}</p>}
          <div className="flex justify-end space-x-2 mt-2">
            <button type="button" onClick={onClose} className="px-3 py-1 bg-gray-300 text-sm rounded">Cancel</button>
            <button 
              type="submit" 
              form="editFilmForm" 
              disabled={loading} 
              className="px-3 py-1 bg-blue-500 text-white text-sm rounded"
            >
              {loading ? "Updating..." : "Update"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilmEditModal;