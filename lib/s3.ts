// lib/s3.ts
export async function uploadToS3(url: string, file: File) {
    const response = await fetch(url, {
      method: 'PUT',
      body: file,
      headers: { 'Content-Type': file.type },
    })
  
    if (!response.ok) {
      throw new Error('Failed to upload file to S3')
    }
  }