// app/upload/page.tsx
export const dynamic = "force-dynamic"; // Forces the API to run on every request

import FilmUploadModal from '@/app/components/Modal/FilmUploadModal';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Upload Film | Admin Dashboard',
  description: 'Upload and manage films in the admin dashboard',
};

export default function AdminUploadPage() {
  return (
    <div className="bg-gray-50 min-h-screen p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Upload New Film</h1>
          <p className="text-gray-600">
            Add a new film to the catalog by completing the form below.
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
          {/* Instructions */}
          <div className="mb-6 p-4 bg-blue-50 rounded-md border border-blue-100">
            <h2 className="text-blue-800 font-medium text-lg mb-2">Upload Guidelines</h2>
            <ul className="list-disc pl-5 text-blue-700 text-sm space-y-1">
              <li>Ensure all film details are accurate and complete</li>
              <li>Supported formats: MP4, MOV, AVI (max 5GB)</li>
              <li>Posters should be high resolution (min 1000x1500px)</li>
              <li>All uploaded content must comply with content guidelines</li>
            </ul>
          </div>

          {/* Upload Form */}
          <div className="mt-4">
            <FilmUploadModal />
          </div>
        </div>

        {/* Additional Help Section */}
        <div className="mt-6 text-center text-sm text-gray-500">
          Need help with uploading? Check the <span className="text-blue-600 hover:underline cursor-pointer">documentation</span> or 
          contact <span className="text-blue-600 hover:underline cursor-pointer">technical support</span>.
        </div>
      </div>
    </div>
  );
}