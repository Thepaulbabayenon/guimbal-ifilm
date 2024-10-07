import * as React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  videoUrl: string | null; // Change type to string | null
}

export function Modal({ isOpen, onClose, videoUrl }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 z-50">
      <div className="bg-white p-4 rounded-lg relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-black text-2xl"
        >
          &times;
        </button>
        {videoUrl ? (
          <iframe
            width="560"
            height="315"
            src={videoUrl}
            title="Movie Player"
            frameBorder="0"
            allowFullScreen
          ></iframe>
        ) : (
          <p>No video available</p>
        )}
      </div>
    </div>
  );
}
