
'use server'

import admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import { firebaseConfig } from '@/firebase/config';

// Load service account credentials from environment variables
// This is more secure than including the file directly
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY!);

// Initialize Firebase Admin SDK if not already initialized
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: firebaseConfig.storageBucket
  });
}

const bucket = admin.storage().bucket();

export async function saveFile(data: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const file: File | null = data.get('file') as unknown as File;
    if (!file) {
      return { success: false, error: 'No file uploaded.' };
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const fileExtension = file.name.split('.').pop() || 'tmp';
    const filename = `${uuidv4()}.${fileExtension}`;
    const destination = `images/${filename}`;

    const blob = bucket.file(destination);
    
    // Create a write stream and upload the buffer
    await new Promise((resolve, reject) => {
      const blobStream = blob.createWriteStream({
        resumable: false,
        metadata: {
          contentType: file.type,
        },
      });

      blobStream.on('error', (err) => {
        console.error('Blob stream error:', err);
        reject(err);
      });

      blobStream.on('finish', () => {
        resolve(true);
      });

      blobStream.end(buffer);
    });

    // Make the file public and get its URL
    await blob.makePublic();
    const downloadURL = blob.publicUrl();
    
    return { success: true, url: downloadURL };

  } catch (e: any) {
    console.error('File upload to Firebase Storage failed with Admin SDK:', e);
    return { success: false, error: e.message || 'File upload failed.' };
  }
}
