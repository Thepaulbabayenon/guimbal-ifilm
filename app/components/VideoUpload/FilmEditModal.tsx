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

// Define a progress event type
interface ProgressEvent {
  loaded: number;
  total?: number;
}

const FilmEditModal: React.FC<FilmEditModalProps> = ({ film, onClose }) => {
  // Convert existing date to just year for initial state
  const initialReleaseYear = film.release ? new Date(film.release).getFullYear().toString() : "";
  
  const [formData, setFormData] = useState({ 
    ...film,
    // Override the release with just the year
    release: initialReleaseYear
  });
  const [image, setImage] = useState<File | null>(null);
  const [video, setVideo] = useState<File | null>(null);
  const [trailer, setTrailer] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [uploadProgress, setUploadProgress] = useState({
    image: 0,
    video: 0,
    trailer: 0
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: "image" | "video" | "trailer") => {
    const file = e.target.files?.[0] || null;
    if (type === "image") setImage(file);
    if (type === "video") setVideo(file);
    if (type === "trailer") setTrailer(file);
  };

  // Function to upload file with progress tracking
  const uploadFileWithProgress = async (
    url: string, 
    file: File, 
    folder: "image" | "video" | "trailer"
  ): Promise<Response> => {
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.open('PUT', url, true);
      xhr.setRequestHeader('Content-Type', file.type);
      
      xhr.upload.onprogress = (e: ProgressEvent) => {
        if (e.total) {
          const progress = Math.round((e.loaded * 100) / e.total);
          setUploadProgress(prev => ({ ...prev, [folder]: progress }));
        }
      };
      
      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          resolve(new Response(null, { status: xhr.status }));
        } else {
          reject(new Error(`HTTP Error: ${xhr.status}`));
        }
      };
      
      xhr.onerror = () => reject(new Error('Network Error'));
      xhr.send(file);
    });
  };

  // Function to get pre-signed URL and upload file directly to S3
  const uploadFileDirectly = async (file: File, folder: "image" | "video" | "trailer"): Promise<string> => {
    if (!file) return "";

    try {
      // Get the release year from form data
      const releaseYear = parseInt(formData.release);

      // Request a pre-signed URL from your API
      const presignedResponse = await fetch('/api/admin/films/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
          fileSize: file.size,
          folder: folder === "image" ? "img" : folder === "video" ? "videos" : "trailers",
          releaseYear
        })
      });

      if (!presignedResponse.ok) {
        const error = await presignedResponse.json();
        throw new Error(error.error || 'Failed to get upload URL');
      }

      const { uploadUrl, fileUrl } = await presignedResponse.json();

      // Upload the file directly to S3 using our custom function with progress tracking
      const uploadResponse = await uploadFileWithProgress(uploadUrl, file, folder);

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to storage');
      }

      return fileUrl;
    } catch (error) {
      console.error(`Error uploading ${folder}:`, error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage("");

    try {
      // Upload files directly to S3 if present
      let imageUrl = formData.imageString || "";
      let videoUrl = formData.videoSource || "";
      let trailerUrl = formData.trailer || "";

      if (image) {
        setMessage("Uploading image...");
        imageUrl = await uploadFileDirectly(image, "image");
      }

      if (video) {
        setMessage("Uploading video...");
        videoUrl = await uploadFileDirectly(video, "video");
      }

      if (trailer) {
        setMessage("Uploading trailer...");
        trailerUrl = await uploadFileDirectly(trailer, "trailer");
      }

      // Now update the film record with URLs (smaller payload)
      const updateData = {
        // Don't include id twice
        ...formData,
        id: film.id, // This will overwrite the id from formData
        imageUrl,
        videoSource: videoUrl,
        trailerUrl
      };

      setMessage("Updating film details...");
      const response = await fetch(`/api/admin/films/update`, {
        method: "PUT",
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      });

      const result = await response.json();
      if (response.ok) {
        setMessage("Film updated successfully!");
      } else {
        setMessage(result.error || "Failed to update film.");
      }
    } catch (error: unknown) {
      // Properly type the error
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      setMessage(`An error occurred: ${errorMessage}`);
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
          <input name="ageRating" type="number" value={formData.ageRating} onChange={handleChange} className="w-full p-2 border rounded text-sm" placeholder="Age Rating" />
          <input name="duration" type="number" value={formData.duration} onChange={handleChange} className="w-full p-2 border rounded text-sm" placeholder="Duration (min)" />
          <textarea name="overview" value={formData.overview} onChange={handleChange} className="w-full p-2 border rounded text-sm" placeholder="Overview"></textarea>
          
          {/* Changed from date input to number input for release year */}
          <input 
            name="release" 
            type="number" 
            value={formData.release} 
            onChange={handleChange} 
            className="w-full p-2 border rounded text-sm" 
            placeholder="Release Year" 
            min="1900" 
            max="2099" 
            step="1"
          />
          
          <input name="category" value={formData.category} onChange={handleChange} className="w-full p-2 border rounded text-sm" placeholder="Category (all lowercase)" />
          <input name="producer" value={formData.producer} onChange={handleChange} className="w-full p-2 border rounded text-sm" placeholder="Producer" />
          <input name="director" value={formData.director} onChange={handleChange} className="w-full p-2 border rounded text-sm" placeholder="Director" />
          <input name="coDirector" value={formData.coDirector} onChange={handleChange} className="w-full p-2 border rounded text-sm" placeholder="Co-Director" />
          <input name="studio" value={formData.studio} onChange={handleChange} className="w-full p-2 border rounded text-sm" placeholder="Studio" />

          {/* Image Upload */}
          <div>
            <label className="block text-xs font-medium">Film Poster:</label>
            {image ? (
              <div>
                <img src={URL.createObjectURL(image)} alt="Selected" className="w-20 h-20 object-cover mt-1" />
                {uploadProgress.image > 0 && uploadProgress.image < 100 && (
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress.image}%` }}></div>
                  </div>
                )}
              </div>
            ) : formData.imageString ? (
              <img src={formData.imageString} alt="Current" className="w-20 h-20 object-cover mt-1" />
            ) : null}
            <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, "image")} className="mt-1 text-xs" />
          </div>

          {/* Video Upload */}
          <div>
            <label className="block text-xs font-medium">Film Video:</label>
            {video ? (
              <div>
                <p className="text-xs">{video.name}</p>
                {uploadProgress.video > 0 && uploadProgress.video < 100 && (
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress.video}%` }}></div>
                  </div>
                )}
              </div>
            ) : formData.videoSource ? (
              <p className="text-xs">Current: {formData.videoSource}</p>
            ) : null}
            <input type="file" accept="video/*" onChange={(e) => handleFileChange(e, "video")} className="mt-1 text-xs" />
          </div>

          {/* Trailer Upload */}
          <div>
            <label className="block text-xs font-medium">Trailer:</label>
            {trailer ? (
              <div>
                <p className="text-xs">{trailer.name}</p>
                {uploadProgress.trailer > 0 && uploadProgress.trailer < 100 && (
                  <div className="w-full bg-gray-200 rounded-full h-2.5 mt-1">
                    <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress.trailer}%` }}></div>
                  </div>
                )}
              </div>
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