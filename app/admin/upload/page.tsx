// app/upload/page.tsx
export const dynamic = "force-dynamic"; // Forces the API to run on every request

import FilmUploadModal from '@/app/components/VideoUpload/FilmUploadModal';


export default function AdminUploadPage() {
  return (
    <div
    >
      <h1>Upload a Film</h1>
      <FilmUploadModal />
    </div>
  );
}
