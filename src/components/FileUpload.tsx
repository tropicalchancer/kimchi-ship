import { useState } from 'react';
import { AlertCircle } from 'lucide-react'; //i removed Upload which was before alertcircle before
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

type User = Database['public']['Tables']['users']['Row'];

interface FileUploadProps {
  user: User;
  onUploadComplete: (url: string) => void;
  onError: (error: string) => void;
}

const FileUpload = ({ user, onUploadComplete, onError }: FileUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = async (file: File) => {
    try {
      if (!file) return;
      
      setUploading(true);
      setError(null);

      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file');
      }
      
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error('Error uploading file: ' + uploadError.message);
      }

      const { data: urlData } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        throw new Error('Error getting public URL');
      }

      onUploadComplete(urlData.publicUrl);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during upload';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setUploading(false);
      setIsDragging(false);
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      handleFileUpload(file);
    }
  };

  // Updated drag handlers to prevent default behavior
  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      setIsDragging(true);
    }
  };

  const handleDragOut = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileUpload(file);
      e.dataTransfer.clearData();
    }
  };

  return (
    <div className="relative">
      <div
        onDragEnter={handleDragIn}
        onDragLeave={handleDragOut}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          rounded-lg transition-all duration-200
          ${isDragging ? 'bg-blue-50 border-2 border-dashed border-blue-300 p-4' : ''}
        `}
      >
<label 
  className={`
    flex items-center justify-center w-10 h-10 rounded-full 
    ${uploading 
      ? 'bg-gray-100 cursor-not-allowed' 
      : isDragging
        ? 'bg-blue-100'
        : 'bg-blue-50 hover:bg-blue-100 cursor-pointer'
    }
    transition-colors
  `}
>
  <span className="text-xl">🖼️</span>
  <input
    type="file"
    accept="image/*"
    onChange={handleFileChange}
    disabled={uploading}
    className="hidden"
  />
</label>


      </div>

      {error && (
        <div className="absolute top-full mt-2 w-full">
          <div className="flex items-center gap-2 text-red-500 text-sm bg-red-50 p-2 rounded">
            <AlertCircle className="w-4 h-4" />
            <span>{error}</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;