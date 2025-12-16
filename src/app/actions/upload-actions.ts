
'use server'

import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid';

export async function saveFile(data: FormData) {
  const file: File | null = data.get('file') as unknown as File
  if (!file) {
    return { success: false, error: 'No file uploaded.' };
  }

  try {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    const fileExtension = file.name.split('.').pop();
    const filename = `${uuidv4()}.${fileExtension}`;
    
    const uploadDir = join(process.cwd(), 'public/images');
    const path = join(uploadDir, filename);

    await mkdir(uploadDir, { recursive: true });
    await writeFile(path, buffer);
    
    const publicUrl = `/images/${filename}`;
    
    return { success: true, url: publicUrl };

  } catch (error) {
    console.error('File upload failed:', error);
    return { success: false, error: 'File upload failed.' };
  }
}
