
'use client';

import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { saveFile } from '@/app/actions/upload-actions';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { X, UploadCloud, FileImage, ShieldAlert } from 'lucide-react';
import Image from 'next/image';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface UploadingFile {
  id: string;
  file: File;
  progress: number;
}

interface ImageUploaderProps {
  value: string[];
  onChange: (urls: string[]) => void;
  maxFiles?: number;
}

export function ImageUploader({ value: urls = [], onChange, maxFiles }: ImageUploaderProps) {
  const { toast } = useToast();
  
  const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
  
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (maxFiles && (urls.length + acceptedFiles.length) > maxFiles) {
        toast({
            variant: 'destructive',
            title: 'File limit exceeded',
            description: `You can only upload a maximum of ${maxFiles} files.`,
        });
        return;
    }
    
    const newUploads = acceptedFiles.map(file => ({
      id: `${file.name}-${Date.now()}`,
      file,
      progress: 0,
    }));

    setUploadingFiles(prev => [...prev, ...newUploads]);

    const uploadPromises = newUploads.map(async (upload) => {
        try {
            const formData = new FormData();
            formData.append('file', upload.file);

            setUploadingFiles(prev => prev.map(f => f.id === upload.id ? { ...f, progress: 50 } : f));

            const result = await saveFile(formData);
            
            if (!result.success || !result.url) {
                throw new Error(result.error || 'Upload failed');
            }
            
            setUploadingFiles(prev => prev.map(f => f.id === upload.id ? { ...f, progress: 100 } : f));
            
            setTimeout(() => {
              setUploadingFiles(prev => prev.filter(f => f.id !== upload.id));
            }, 500);

            return result.url;

        } catch (error: any) {
            console.error("Upload Error:", error);
            toast({
              variant: 'destructive',
              title: 'Upload Failed',
              description: error.message || `Could not upload ${upload.file.name}.`,
            });
            setUploadingFiles(prev => prev.filter(f => f.id !== upload.id));
            return null;
        }
    });

    const uploadedUrls = (await Promise.all(uploadPromises)).filter((url): url is string => url !== null);
    
    if (uploadedUrls.length > 0) {
      const newUrls = [...urls, ...uploadedUrls];
      onChange(newUrls);
    }

  }, [onChange, toast, urls, maxFiles]);
  
  const isLimitReached = maxFiles ? urls.length >= maxFiles : false;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'] },
    multiple: true,
    disabled: isLimitReached
  });
  
  const removeImage = (urlToRemove: string) => {
    onChange(urls.filter(url => url !== urlToRemove));
  };
  
  return (
    <div className="space-y-4">
      <div {...getRootProps()} className={cn("group rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 p-8 text-center transition-colors", 
        !isLimitReached && "cursor-pointer hover:border-primary hover:bg-primary/10",
        isDragActive && !isLimitReached && "border-primary bg-primary/10",
        isLimitReached && "cursor-not-allowed opacity-50"
      )}>
        <input {...getInputProps()} />
         <div className="flex flex-col items-center justify-center gap-4 text-muted-foreground">
           {isLimitReached ? (
                <>
                    <ShieldAlert className="h-12 w-12 text-destructive" />
                    <p className="text-lg font-semibold text-destructive">Maximum files reached</p>
                    <p className="text-sm">{`You have uploaded the maximum of ${maxFiles} files.`}</p>
                </>
           ) : isDragActive ? (
                <>
                    <UploadCloud className="h-12 w-12 text-primary" />
                    <p className="text-lg font-semibold text-primary">Drop the files here...</p>
                </>
            ) : (
                <>
                    <UploadCloud className="h-12 w-12" />
                    <p className="text-lg font-semibold">Drag & drop images here, or click to select</p>
                    <p className="text-sm">Supports JPEG, PNG, GIF, WebP</p>
                </>
            )}
        </div>
      </div>

       <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {urls && urls.map((url, index) => (
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
            </div>
          ))}
       </div>
    </div>
  );
}
