
'use server'

import admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import { firebaseConfig } from '@/firebase/config';

// Lazy initialization function to safely get the Firebase Admin app
function initFirebaseAdmin() {
  if (admin.apps.length) {
    return admin.app();
  }

  const serviceAccountKey = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;

  if (!serviceAccountKey) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not set. Please configure it in your Vercel project settings.');
  }

  let serviceAccount;
  try {
    serviceAccount = JSON.parse(serviceAccountKey);
  } catch (error) {
    throw new Error('FIREBASE_SERVICE_ACCOUNT_KEY environment variable is not a valid JSON string.');
  }

  return admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: firebaseConfig.storageBucket
  });
}

export async function saveFile(data: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    // Initialize Firebase Admin only when this action is called
    const app = initFirebaseAdmin();
    console.log(`[Upload] Using config bucket: ${firebaseConfig.storageBucket}`);
    const bucket = app.storage().bucket(firebaseConfig.storageBucket);

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
    console.error('File upload to Firebase Storage failed:', e);
    // Return the specific error message to the client
    return { success: false, error: e.message || 'File upload failed.' };
  }
}
