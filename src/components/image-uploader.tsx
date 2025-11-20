'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { getStorage, ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage';
import { useFirebaseApp } from '@/firebase';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, UploadCloud, FileImage } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

type UploadedFile = {
  file: File;
  progress: number;
  url?: string;
  error?: string;
  uploadTask?: ReturnType<typeof uploadBytesResumable>;
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

  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [initialUrls, setInitialUrls] = useState<string[]>([]);
  
  useEffect(() => {
    // Sync external value with initialUrls, but only once
    if (value && value.length > 0 && initialUrls.length === 0) {
      setInitialUrls(value);
    }
  }, [value, initialUrls]);


  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (!storage) {
      toast({
        variant: 'destructive',
        title: 'Storage not configured',
        description: 'Firebase Storage is not available to upload files.',
      });
      return;
    }

    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      file,
      progress: 0,
    }));

    setUploadedFiles(prev => [...prev, ...newFiles]);

    newFiles.forEach(fileWrapper => {
      const storageRef = ref(storage, `${folder}/${Date.now()}-${fileWrapper.file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, fileWrapper.file);

      fileWrapper.uploadTask = uploadTask;

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadedFiles(prev => prev.map(f => f.file === fileWrapper.file ? { ...f, progress } : f));
        },
        (error) => {
          console.error("Upload Error:", error);
          setUploadedFiles(prev => prev.map(f => f.file === fileWrapper.file ? { ...f, error: error.message } : f));
          toast({
            variant: 'destructive',
            title: 'Upload Failed',
            description: `Could not upload ${fileWrapper.file.name}.`,
          });
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            setUploadedFiles(prev => prev.map(f => f.file === fileWrapper.file ? { ...f, url: downloadURL } : f));
            onChange([...value, downloadURL]);
          });
        }
      );
    });
  }, [storage, folder, onChange, value, toast]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif'] },
    multiple: true
  });

  const removeImage = (urlToRemove: string) => {
    if (!storage) return;

    // Remove from UI state first for responsiveness
    onChange(value.filter(url => url !== urlToRemove));
    setInitialUrls(prev => prev.filter(url => url !== urlToRemove));

    try {
      const imageRef = ref(storage, urlToRemove);
      deleteObject(imageRef).then(() => {
        toast({
          title: 'Image Removed',
          description: 'The image has been deleted from storage.',
        });
      }).catch((error) => {
        console.error("Error deleting file from storage:", error);
        if (error.code === 'storage/object-not-found') {
            // This is okay, it might have been a placeholder URL
        } else {
            toast({
                variant: 'destructive',
                title: 'Deletion Failed',
                description: 'Could not remove the image from storage. It may have already been deleted.',
            });
        }
      });
    } catch(e) {
      console.error("Error parsing URL for deletion:", e);
    }
  };
  
  const cancelUpload = (fileToCancel: File) => {
    const fileWrapper = uploadedFiles.find(f => f.file === fileToCancel);
    if(fileWrapper?.uploadTask){
        fileWrapper.uploadTask.cancel();
    }
    setUploadedFiles(prev => prev.filter(f => f.file !== fileToCancel));
  };
  
  const allImageUrls = [...initialUrls];
  
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
      
       {(initialUrls.length > 0 || uploadedFiles.length > 0) && (
         <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {initialUrls.map((url, index) => (
                <div key={url} className="relative aspect-square">
                    <Image src={url} alt={`Uploaded image ${index + 1}`} layout="fill" className="rounded-md object-cover" />
                     <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => removeImage(url)}>
                        <X className="h-4 w-4" />
                     </Button>
                     {index === 0 && <div className="absolute bottom-0 left-0 bg-primary text-primary-foreground text-xs font-bold px-2 py-1 rounded-br-md rounded-tl-md">Cover</div>}
                </div>
            ))}
            {uploadedFiles.map((fileWrapper) => (
              <div key={fileWrapper.file.name} className="relative aspect-square rounded-md border bg-muted/20">
                {fileWrapper.progress < 100 && !fileWrapper.error && (
                    <div className="flex h-full flex-col items-center justify-center gap-2 text-sm text-muted-foreground">
                        <FileImage className="h-8 w-8" />
                        <p className="max-w-full truncate px-2">{fileWrapper.file.name}</p>
                        <Progress value={fileWrapper.progress} className="w-4/5 h-2" />
                    </div>
                )}
                {fileWrapper.url && (
                    <Image src={fileWrapper.url} alt={fileWrapper.file.name} layout="fill" className="rounded-md object-cover" />
                )}
                {fileWrapper.error && <div className="p-2 text-xs text-destructive-foreground bg-destructive rounded-md h-full flex items-center justify-center">{fileWrapper.error}</div>}
                 <Button variant="destructive" size="icon" className="absolute -top-2 -right-2 h-6 w-6 rounded-full" onClick={() => fileWrapper.url ? removeImage(fileWrapper.url) : cancelUpload(fileWrapper.file)}>
                    <X className="h-4 w-4" />
                 </Button>
              </div>
            ))}
         </div>
       )}

    </div>
  );
}
