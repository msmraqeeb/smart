
'use server'

import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { initializeFirebase } from "@/firebase";
import { v4 as uuidv4 } from 'uuid';

// Initialize Firebase Admin SDK
const { storage } = initializeFirebase();

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
    
    const storageRef = ref(storage, `images/${filename}`);

    const snapshot = await uploadBytes(storageRef, buffer, {
        contentType: file.type,
    });
    
    const downloadURL = await getDownloadURL(snapshot.ref);
    
    return { success: true, url: downloadURL };

  } catch (e: any) {
    console.error('File upload to Firebase Storage failed:', e);
    return { success: false, error: e.message || 'File upload failed.' };
  }
}
