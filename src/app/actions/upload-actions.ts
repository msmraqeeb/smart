
'use server'

import { writeFile } from 'fs/promises'
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
  const path = join(process.cwd(), 'public/images', filename);
  
  await writeFile(path, buffer);
  console.log(`Open ${path} to see the uploaded file.`);
  
  const protocol = process.env.NODE_ENV === 'production' ? 'https' : 'http';
  const host = process.env.HOST || 'localhost:9002';
  const fullUrl = `${protocol}://${host}/images/${filename}`;

  // Return the public URL
  return fullUrl;
}
