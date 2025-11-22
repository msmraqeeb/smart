
'use server'

import { writeFile } from 'fs/promises'
import { join } from 'path'

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

  // Return the public URL
  return `/images/${filename}`;
}
