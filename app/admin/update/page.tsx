// app/upload/page.tsx
import FilmUpdateModal from '@/app/components/VideoUpload/FilmUpdateModal';


export default function AdminUploadPage() {
  return (
    <div>
      <h1>Upload a Film</h1>
      <FilmUpdateModal />
    </div>
  );
}
