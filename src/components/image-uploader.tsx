
'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject, type UploadTask } from 'firebase/storage';
import { useFirebaseApp } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, UploadCloud, FileImage } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
  task: UploadTask;
  source: 'local';
}

interface ImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
}

export function ImageUploader({ value: urls, onChange, folder = 'products' }: ImageUploaderProps) {
  const app = useFirebaseApp();
  const storage = app ? getStorage(app) : null;
  const { toast } = useToast();
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  
  // Use a ref to hold the tasks to avoid issues with stale state in callbacks
  const uploadTasksRef = useRef<Map<string, UploadTask>>(new Map());

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (!storage) {
      toast({
        variant: 'destructive',
        title: 'Storage not configured',
        description: 'Firebase Storage is not available to upload files.',
      });
      return;
    }

    const newUploads = acceptedFiles.map(file => {
      const id = `${file.name}-${Date.now()}`;
      const storageRef = ref(storage, `${folder}/${id}-${file.name}`);
      const task = uploadBytesResumable(storageRef, file);
      
      uploadTasksRef.current.set(id, task);
      
      return { id, file, progress: 0, task, source: 'local' as const };
    });
    
    setUploadingFiles(prev => [...prev, ...newUploads]);

    newUploads.forEach(upload => {
      upload.task.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadingFiles(prev => prev.map(f => f.id === upload.id ? { ...f, progress } : f));
        },
        (error) => {
          if (error.code !== 'storage/canceled') {
            console.error("Upload Error:", error);
            toast({
              variant: 'destructive',
              title: 'Upload Failed',
              description: `Could not upload ${upload.file.name}.`,
            });
          }
          setUploadingFiles(prev => prev.filter(f => f.id !== upload.id));
          uploadTasksRef.current.delete(upload.id);
        },
        () => {
          getDownloadURL(upload.task.snapshot.ref).then((downloadURL) => {
            onChange([...urls, downloadURL]);
            setUploadingFiles(prev => prev.filter(f => f.id !== upload.id));
            uploadTasksRef.current.delete(upload.id);
          });
        }
      );
    });

  }, [storage, folder, onChange, toast, urls]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'] },
    multiple: true
  });
  
  const removeImage = (urlToRemove: string) => {
    if (!storage) return;

    onChange(urls.filter(url => url !== urlToRemove));

    // Do not delete from storage if it's not a Firebase URL
    if (!urlToRemove.includes('firebasestorage.googleapis.com')) {
      return;
    }

    try {
      const imageRef = ref(storage, urlToRemove);
      deleteObject(imageRef).then(() => {
        toast({
          title: 'Image Removed',
          description: 'The image has been deleted from storage.',
        });
      }).catch((error) => {
        if (error.code !== 'storage/object-not-found') {
            console.warn("Could not delete from storage:", error);
        }
      });
    } catch(e) {
      console.warn("Error parsing URL for deletion:", e);
    }
  };

  const cancelUpload = (uploadId: string) => {
    const task = uploadTasksRef.current.get(uploadId);
    if (task) {
      task.cancel();
      uploadTasksRef.current.delete(uploadId);
    }
    setUploadingFiles(prev => prev.filter(f => f.id !== uploadId));
  }
  
  return (
    <div className="space-y-4">
      <div {...getRootProps()} className={cn("group cursor-pointer rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-8 text-center transition-colors", isDragActive && "border-primary bg-primary/10")}>
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
            <UploadCloud className={cn("h-12 w-12", isDragActive && "text-primary")} />
            {isDragActive ? (
                <p className="text-lg font-semibold text-primary">Drop the files here...</p>
            ) : (
                <>
                    <p className="text-lg font-semibold">Drag & drop images here, or click to select</p>
                    <p className="text-sm">Supports JPEG, PNG, GIF, WebP</p>
                </>
            )}
        </div>
      </div>
      
       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {urls.map((url, index) => (
              <div key={url} className="relative aspect-square">
                  <Image src={url} alt={`Uploaded image ${index + 1}`} fill sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw" className="rounded-md object-cover" />
                    <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => removeImage(url)}>
                      <X className="h-4 w-4" />
                    </Button>
                    {index === 0 && <div className="absolute bottom-0 left-0 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-br-md rounded-tl-md">Cover</div>}
              </div>
          ))}
          {uploadingFiles.map((upload) => (
            <div key={upload.id} className="relative aspect-square">
                <div className="flex flex-col items-center justify-center h-full w-full rounded-md bg-muted p-2">
                    <FileImage className="h-10 w-10 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground mt-2 truncate w-full text-center">{upload.file.name}</p>
                    <Progress value={upload.progress} className="h-2 mt-2 w-full" />
                </div>
                 <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => cancelUpload(upload.id)}>
                    <X className="h-4 w-4" />
                 </Button>
            </div>
          ))}
       </div>
    </div>
  );
}
