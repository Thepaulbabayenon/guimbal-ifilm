'use client'
import { useState } from 'react'
import { uploadToS3 } from '@/lib/s3'
import { generateUploadUrl } from '../_actions'
import { film } from "@/app/db/schema"

interface FilmFormProps {
  initialData?: typeof film.$inferSelect | null
}

interface Film {
  id: number;
  title: string;
  overview: string;
  age: number;
  duration: number;
  category: string;
  videoSource: string;
  trailer: string;
  producer: string;
  director: string;
  studio: string;
  imageString?: string;
}

export default function FilmForm({ initialData }: FilmFormProps) {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    overview: initialData?.overview || '',
    age: initialData?.age || 0,
    duration: initialData?.duration || 0,
    category: initialData?.category || 'film',
    videoSource: initialData?.videoSource || '',
    trailer: initialData?.trailer || '',
    producer: initialData?.producer || '',
    director: initialData?.director || '',
    studio: initialData?.studio || '',
  })

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) {
      setImageFile(e.target.files[0])
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUploading(true)
    
    try {
      let imageUrl = initialData?.imageString
      
      if (imageFile) {
        const uploadUrl = await generateUploadUrl(imageFile.name)
        await uploadToS3(uploadUrl, imageFile)
        imageUrl = uploadUrl.split('?')[0]
      }

      const formPayload = {
        ...formData,
        imageString: imageUrl,
        age: Number(formData.age),
        duration: Number(formData.duration),
        id: initialData?.id
      }

      const response = await fetch('/api/admin/films', {
        method: initialData ? 'PUT' : 'POST', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formPayload)
      })

      if (!response.ok) {
        console.error('Error:', await response.text())
        throw new Error('Failed to save film')
      }
      
      window.location.reload()
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (filmId: number) => {
    const response = await fetch('/api/admin/films', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ filmId })
    })

    if (!response.ok) {
      console.error('Error deleting film:', await response.text())
    } else {
      // Optionally, update the UI or reload the page after deletion
      window.location.reload()
    }
  }

  const selectedFilm: Film | null = null;
  const films: Film[] = [];

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4 border rounded-lg">
      <div className="grid grid-cols-2 gap-4">
        {/* ... your form inputs ... */}
        <section className="mb-12">
          <h2 className="text-2xl font-semibold mb-4">Film Management</h2>
          <div className="mt-6 grid gap-4">
            {films.map((filmItem: Film) => (
              <div key={filmItem.id} className="p-4 border rounded-lg flex items-center justify-between">
                <div>
                  <h3 className="font-medium">{filmItem.title}</h3>
                  <p className="text-sm text-gray-600">
                    {filmItem.category} • {filmItem.duration} mins
                  </p>
                </div>
                <div className="flex gap-2">
                  <a
                    href={`/admin?filmId=${filmItem.id}`}
                    className="px-3 py-1 bg-yellow-600 text-white rounded hover:bg-yellow-700"
                  >
                    Edit
                  </a>
                  <button
                    onClick={() => handleDelete(filmItem.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
        {/* ... remaining form elements ... */}
      </div>
    </form>
  )
}
