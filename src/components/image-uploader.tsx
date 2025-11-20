
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
  url?: string;
  error?: string;
  uploadTask?: UploadTask;
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

    const newFiles: UploadingFile[] = acceptedFiles.map(file => ({
      id: `${file.name}-${file.lastModified}-${file.size}`,
      file,
      progress: 0,
    }));
    
    setUploadingFiles(prev => [...prev, ...newFiles]);

    newFiles.forEach(fileWrapper => {
      const storageRef = ref(storage, `${folder}/${Date.now()}-${fileWrapper.file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, fileWrapper.file);

       setUploadingFiles(prev => 
         prev.map(f => f.id === fileWrapper.id ? {...f, uploadTask} : f)
       );

      uploadTask.on('state_changed',
        (snapshot) => {
          const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
          setUploadingFiles(prev => 
            prev.map(f => f.id === fileWrapper.id ? { ...f, progress } : f)
          );
        },
        (error) => {
           if (error.code === 'storage/canceled') {
            // This is an intentional cancellation, so we don't show an error toast.
            // The file is already removed from the `uploadingFiles` state by the `cancelUpload` function.
            return;
          }
          console.error("Upload Error:", error);
          setUploadingFiles(prev => prev.filter(f => f.id !== fileWrapper.id));
          toast({
            variant: 'destructive',
            title: 'Upload Failed',
            description: `Could not upload ${fileWrapper.file.name}.`,
          });
        },
        () => {
          getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
            onChange([...value, downloadURL]);
            setUploadingFiles(prev => prev.filter(f => f.id !== fileWrapper.id));
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

    onChange(value.filter(url => url !== urlToRemove));

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
            // This is okay, it might have been a placeholder or manual URL
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
  
  const cancelUpload = (fileId: string) => {
    const fileWrapper = uploadingFiles.find(f => f.id === fileId);
    if(fileWrapper?.uploadTask){
        fileWrapper.uploadTask.cancel();
    }
    setUploadingFiles(prev => prev.filter(f => f.id !== fileId));
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
