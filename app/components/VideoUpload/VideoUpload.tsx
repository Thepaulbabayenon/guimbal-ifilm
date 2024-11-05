'use client';

import { CldUploadWidget } from "next-cloudinary";
import React, { useCallback } from "react";
import { TbVideoPlus } from 'react-icons/tb';

declare global {
  var cloudinary: any;
}

const uploadPreset = "novknavc"; // Change this to your video upload preset

interface VideoUploadProps {
  onChange: (value: string) => void;
  value: string;
}

const VideoUpload: React.FC<VideoUploadProps> = ({ onChange, value }) => {
  const handleUpload = useCallback((result: any) => {
    onChange(result.info.secure_url);
  }, [onChange]);

  return (
    <CldUploadWidget
      onUpload={handleUpload}
      uploadPreset={uploadPreset}
      options={{
        maxFiles: 1,
        resourceType: "video", // Specify that we're uploading videos
      }}
    >
      {({ open }) => {
        return (
          <div
            onClick={() => open?.()}
            className="relative flex flex-col items-center justify-center gap-4 p-20 transition border-2 border-dashed cursor-pointer hover:opacity-70 border-neutral-300 text-neutral-600"
          >
            <TbVideoPlus size={50} />
            <div className="text-lg font-semibold">Click to upload video</div>
            {value && (
              <div className="absolute inset-0 w-full h-full">
                <video
                  className="w-full h-full object-cover"
                  controls
                  src={value}
                />
              </div>
            )}
          </div>
        );
      }}
    </CldUploadWidget>
  );
}

export default VideoUpload;

