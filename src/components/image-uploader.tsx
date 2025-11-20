
'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject, type UploadTask } from 'firebase/storage';
import { useFirebaseApp } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, UploadCloud, FileImage } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type UploadingFile = {
  id: string; // Unique ID for each upload
  file: File;
  progress: number;
  uploadTask: UploadTask;
};

interface ImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  folder?: string;
}

export function ImageUploader({ value, onChange, folder = 'products' }: ImageUploaderProps) {
  const app = useFirebaseApp();
  const storage = app ? getStorage(app) : null;
  const { toast } = useToast();

  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  
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
      const uploadTask = uploadBytesResumable(storageRef, file);
      
      return { id, file, progress: 0, uploadTask };
    });

    setUploadingFiles(prev => [...prev, ...newUploads]);

    newUploads.forEach(upload => {
      upload.uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadingFiles(prev => 
            prev.map(f => f.id === upload.id ? { ...f, progress } : f)
          );
        },
        (error) => {
          // Ignore cancelled uploads, as the user initiated it
          if (error.code !== 'storage/canceled') {
            console.error("Upload Error:", error);
            toast({
              variant: 'destructive',
              title: 'Upload Failed',
              description: `Could not upload ${upload.file.name}.`,
            });
          }
          // Remove from uploading list on error or cancel
          setUploadingFiles(prev => prev.filter(f => f.id !== upload.id));
        },
        () => {
          // On successful upload, get the URL and update the form
          getDownloadURL(upload.uploadTask.snapshot.ref).then((downloadURL) => {
            onChange([...value, downloadURL]);
            // Remove from uploading list on success
            setUploadingFiles(prev => prev.filter(f => f.id !== upload.id));
          });
        }
      );
    });

  }, [storage, folder, onChange, toast, value]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif'] },
    multiple: true
  });

  const removeImage = (urlToRemove: string) => {
    if (!storage) return;

    // Immediately update the form state
    onChange(value.filter(url => url !== urlToRemove));

    // Attempt to delete from Firebase Storage
    try {
      const imageRef = ref(storage, urlToRemove);
      deleteObject(imageRef).then(() => {
        toast({
          title: 'Image Removed',
          description: 'The image has been deleted from storage.',
        });
      }).catch((error) => {
        // This can happen if the URL was manually added or already deleted, which is fine.
        console.warn("Could not delete file from storage:", error);
        if (error.code !== 'storage/object-not-found') {
            toast({
                variant: 'destructive',
                title: 'Deletion Failed',
                description: 'Could not remove the image from storage. It may have already been deleted.',
            });
        }
      });
    } catch(e) {
      // This can happen if the URL is not a valid storage URL (e.g. from an external site)
      console.warn("Error parsing URL for deletion:", e);
    }
  };
  
  const cancelUpload = (fileId: string) => {
    const fileToCancel = uploadingFiles.find(f => f.id === fileId);
    if (fileToCancel) {
      fileToCancel.uploadTask.cancel();
    }
    // The error handler for the upload task will remove it from the list
  };
  
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
                    <p className="text-sm">Supports JPEG, PNG, GIF</p>
                </>
            )}
        </div>
      </div>
      
       {(value.length > 0 || uploadingFiles.length > 0) && (
         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {value.map((url, index) => (
                <div key={url} className="relative aspect-square">
                    <Image src={url} alt={`Uploaded image ${index + 1}`} fill sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw" className="rounded-md object-cover" />
                     <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => removeImage(url)}>
                        <X className="h-4 w-4" />
                     </Button>
                     {index === 0 && <div className="absolute bottom-0 left-0 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-br-md rounded-tl-md">Cover</div>}
                </div>
            ))}
            {uploadingFiles.map((fileWrapper) => (
              <div key={fileWrapper.id} className="relative aspect-square rounded-md border bg-muted/20">
                <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
                    <FileImage className="h-8 w-8" />
                    <p className="max-w-full truncate px-2">{fileWrapper.file.name}</p>
                    <Progress value={fileWrapper.progress} className="w-4/5 h-2" />
                </div>
                 <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => cancelUpload(fileWrapper.id)}>
                    <X className="h-4 w-4" />
                 </Button>
              </div>
            ))}
         </div>
       )}

    </div>
  );
}
