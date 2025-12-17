
'use server'

import { v4 as uuidv4 } from 'uuid';

export async function saveFile(data: FormData): Promise<{ success: boolean; url?: string; error?: string }> {
  try {
    const file: File | null = data.get('file') as unknown as File;
    if (!file) {
      return { success: false, error: 'No file uploaded.' };
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      return { success: false, error: 'Supabase credentials are not configured.' };
    }

    const fileExtension = file.name.split('.').pop() || 'tmp';
    const filename = `${uuidv4()}.${fileExtension}`;
    const bucket = 'images'; // Explicit bucket name

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // upload via REST API
    // https://supabase.com/docs/reference/api/storage-upload
    const uploadUrl = `${supabaseUrl}/storage/v1/object/${bucket}/${filename}`;

    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${supabaseKey}`,
        'Content-Type': file.type,
        'x-upsert': 'false'
      },
      body: buffer
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('Supabase REST upload failed:', response.status, response.statusText, errorData);
      return { success: false, error: errorData.message || `Upload failed with status ${response.status}` };
    }

    // Construct public URL
    // https://supabase.com/docs/guides/storage/serving/downloads#public-buckets
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/${bucket}/${filename}`;

    return { success: true, url: publicUrl };

  } catch (e: any) {
    console.error('File upload to Supabase Storage failed:', e);
    return { success: false, error: e.message || 'File upload failed.' };
  }
}
