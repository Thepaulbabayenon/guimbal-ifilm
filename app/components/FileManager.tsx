// components/FileManager.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { FolderIcon, FileIcon, TrashIcon, UploadIcon, FolderPlusIcon } from "lucide-react";

interface File {
  key: string;
  lastModified?: Date;
  size?: number;
  url?: string;
}

export default function FileManager() {
  const [files, setFiles] = useState<File[]>([]);
  const [currentPrefix, setCurrentPrefix] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchFiles = async (prefix: string = "") => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/files?prefix=${encodeURIComponent(prefix)}`);
      if (!response.ok) throw new Error("Failed to fetch files");
      const data = await response.json();
      setFiles(data.files);
    } catch (err) {
      setError("Error loading files. Please try again.");
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles(currentPrefix);
  }, [currentPrefix]);

  const handleNavigateToFolder = (folderPath: string) => {
    setCurrentPrefix(folderPath);
  };

  const handleNavigateUp = () => {

    const pathParts = currentPrefix.split("/");
    pathParts.pop(); 
    if (pathParts[pathParts.length - 1] === "") pathParts.pop(); 
    setCurrentPrefix(pathParts.join("/"));
  };

  const handleDeleteFile = async (key: string) => {
    if (!confirm("Are you sure you want to delete this file?")) return;
    
    try {
      const response = await fetch("/api/files", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      
      if (!response.ok) throw new Error("Failed to delete file");
      
      // Remove the file from state
      setFiles(files.filter(file => file.key !== key));
    } catch (err) {
      setError("Error deleting file. Please try again.");
      console.error(err);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    try {
      // Get presigned URL for upload
      const urlResponse = await fetch("/api/files/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          filename: selectedFile.name,
          contentType: selectedFile.type
        }),
      });
      
      if (!urlResponse.ok) throw new Error("Failed to get upload URL");
      const { uploadUrl, key } = await urlResponse.json();
      
      // Upload directly to S3 using the presigned URL
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": selectedFile.type },
        body: selectedFile,
      });
      
      if (!uploadResponse.ok) throw new Error("Failed to upload file");
      
      // Refresh the file list
      fetchFiles(currentPrefix);
      
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      setError("Error uploading file. Please try again.");
      console.error(err);
    }
  };

  const handleCreateFolder = async () => {
    const folderName = prompt("Enter folder name:");
    if (!folderName) return;
    
    // In S3, folders are just objects with a trailing slash
    const folderKey = `${currentPrefix ? currentPrefix + "/" : ""}${folderName}/`;
    
    try {
      // Create an empty object with a trailing slash to represent a folder
      const response = await fetch("/api/files/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          filename: "",
          contentType: "application/x-directory"
        }),
      });
      
      if (!response.ok) throw new Error("Failed to get upload URL");
      const { uploadUrl } = await response.json();
      
      // Upload empty file to create folder
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": "application/x-directory" },
        body: "",
      });
      
      if (!uploadResponse.ok) throw new Error("Failed to create folder");
      
      // Refresh the file list
      fetchFiles(currentPrefix);
    } catch (err) {
      setError("Error creating folder. Please try again.");
      console.error(err);
    }
  };

  const formatFileSize = (bytes?: number) => {
    if (bytes === undefined) return "—";
    if (bytes === 0) return "0 Bytes";
    
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const formatDate = (date?: Date) => {
    if (!date) return "—";
    return new Date(date).toLocaleString();
  };

  // Extract folders and files from the flat S3 structure
  const folders = new Set<string>();
  const fileItems: File[] = [];
  
  files.forEach(file => {
    // Skip the current prefix itself
    if (file.key === currentPrefix) return;
    
    const relativePath = currentPrefix ? file.key.slice(currentPrefix.length + 1) : file.key;
    
    if (relativePath.includes("/")) {
      // This is an item inside a folder
      const folderName = relativePath.split("/")[0] + "/";
      folders.add(folderName);
    } else {
      // This is a file in the current directory
      fileItems.push(file);
    }
  });

  return (
    <div className="bg-white rounded-lg shadow-lg p-6 max-w-6xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-semibold text-gray-800">File Manager</h2>
        <div className="flex gap-2">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            className="hidden"
            id="file-upload"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
          >
            <UploadIcon size={16} />
            Upload
          </button>
          <button
            onClick={handleCreateFolder}
            className="flex items-center gap-1 bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            <FolderPlusIcon size={16} />
            New Folder
          </button>
        </div>
      </div>
      
      {/* Breadcrumb navigation */}
      <div className="flex items-center mb-4 text-sm">
        <button 
          onClick={() => setCurrentPrefix("")}
          className="text-blue-600 hover:underline"
        >
          Home
        </button>
        
        {currentPrefix.split("/").filter(Boolean).map((part, index, array) => (
          <div key={index} className="flex items-center">
            <span className="mx-2 text-gray-400">/</span>
            <button
              onClick={() => {
                const newPrefix = array.slice(0, index + 1).join("/");
                setCurrentPrefix(newPrefix);
              }}
              className="text-blue-600 hover:underline"
            >
              {part}
            </button>
          </div>
        ))}
      </div>
      
      {/* Go up button */}
      {currentPrefix && (
        <button
          onClick={handleNavigateUp}
          className="mb-4 text-sm flex items-center gap-1 text-gray-600 hover:text-blue-600"
        >
          <span>↑ Up to parent directory</span>
        </button>
      )}
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {isLoading ? (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-12 gap-4 px-6 py-3 bg-gray-50 border-b border-gray-200">
            <div className="col-span-6 font-medium text-gray-700">Name</div>
            <div className="col-span-2 font-medium text-gray-700">Size</div>
            <div className="col-span-3 font-medium text-gray-700">Last Modified</div>
            <div className="col-span-1 font-medium text-gray-700 text-right">Actions</div>
          </div>
          
          {/* Folders */}
          {Array.from(folders).map(folder => (
            <div 
              key={folder}
              className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-200 hover:bg-gray-50"
            >
              <div className="col-span-6 flex items-center">
                <FolderIcon size={20} className="text-yellow-500 mr-2" />
                <button
                  onClick={() => handleNavigateToFolder(`${currentPrefix ? currentPrefix + "/" : ""}${folder.slice(0, -1)}`)}
                  className="text-blue-600 hover:underline"
                >
                  {folder}
                </button>
              </div>
              <div className="col-span-2">—</div>
              <div className="col-span-3">—</div>
              <div className="col-span-1">—</div>
            </div>
          ))}
          
          {/* Files */}
          {fileItems.map(file => (
            <div 
              key={file.key}
              className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-200 hover:bg-gray-50"
            >
              <div className="col-span-6 flex items-center">
                <FileIcon size={20} className="text-gray-500 mr-2" />
                <a
                  href={file.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline truncate"
                >
                  {file.key.split("/").pop()}
                </a>
              </div>
              <div className="col-span-2 text-gray-600">{formatFileSize(file.size)}</div>
              <div className="col-span-3 text-gray-600">{formatDate(file.lastModified)}</div>
              <div className="col-span-1 text-right">
                <button 
                  onClick={() => handleDeleteFile(file.key)}
                  className="text-red-600 hover:text-red-800"
                >
                  <TrashIcon size={18} />
                </button>
              </div>
            </div>
          ))}
          
          {folders.size === 0 && fileItems.length === 0 && (
            <div className="px-6 py-8 text-center text-gray-500">
              No files or folders found in this directory.
            </div>
          )}
        </div>
      )}
    </div>
  );
}