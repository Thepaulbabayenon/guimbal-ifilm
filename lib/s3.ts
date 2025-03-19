// lib/s3-client.ts
import { S3Client, ListObjectsV2Command, GetObjectCommand, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

// Create an S3 client
// IMPORTANT: Don't hardcode credentials in production code
// Use environment variables loaded from .env.local
export const s3Client = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export interface S3Object {
  key: string;
  lastModified?: Date;
  size?: number;
  type?: string;
  url?: string;
}

export async function listFiles(prefix = ""): Promise<S3Object[]> {
  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_BUCKET_NAME,
      Prefix: prefix,
    });
    
    const { Contents = [] } = await s3Client.send(command);
    
    return Contents.map((item) => ({
      key: item.Key!,
      lastModified: item.LastModified,
      size: item.Size,
    }));
  } catch (error) {
    console.error("Error listing files:", error);
    throw error;
  }
}

export async function getSignedFileUrl(key: string, expiresIn = 3600): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    });
    
    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch (error) {
    console.error("Error generating signed URL:", error);
    throw error;
  }
}

export async function uploadFile(key: string, file: Buffer, contentType: string): Promise<void> {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      Body: file,
      ContentType: contentType,
    });
    
    await s3Client.send(command);
  } catch (error) {
    console.error("Error uploading file:", error);
    throw error;
  }
}

export async function deleteFile(key: string): Promise<void> {
  try {
    const command = new DeleteObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
    });
    
    await s3Client.send(command);
  } catch (error) {
    console.error("Error deleting file:", error);
    throw error;
  }
}

// Generate a presigned URL for uploading directly from browser
export async function getPresignedUploadUrl(key: string, contentType: string, expiresIn = 3600): Promise<string> {
  try {
    const command = new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: key,
      ContentType: contentType,
    });
    
    return await getSignedUrl(s3Client, command, { expiresIn });
  } catch (error) {
    console.error("Error generating presigned upload URL:", error);
    throw error;
  }
}