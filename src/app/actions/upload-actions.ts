
'use server'

import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import 'dotenv/config';

export async function saveFile(data: FormData) {
  const file: File | null = data.get('file') as unknown as File
  if (!file) {
    throw new Error('No file uploaded.')
  }

  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)

  // Use a unique filename to prevent overwrites
  const filename = `${Date.now()}-${file.name.replace(/\s/g, '_')}`;
  const uploadDir = join(process.cwd(), 'public/images');
  const path = join(uploadDir, filename);

  // Ensure the upload directory exists
  try {
    await mkdir(uploadDir, { recursive: true });
  } catch (error) {
    console.error('Could not create upload directory.', error);
    throw new Error('Could not create upload directory.');
  }
  
  await writeFile(path, buffer);
  console.log(`Open ${path} to see the uploaded file.`);
  
  // Return the public path
  return `/images/${filename}`;
}
