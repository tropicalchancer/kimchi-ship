// FileUpload.tsx
import { useState } from 'react';
import { Upload, AlertCircle } from 'lucide-react';
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

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0];
      if (!file) return;
      
      // Reset states
      setUploading(true);
      setError(null);

      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        throw new Error('Please upload an image file');
      }
      
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        throw new Error('File size must be less than 5MB');
      }

      // Create a unique file path
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (uploadError) {
        throw new Error('Error uploading file: ' + uploadError.message);
      }

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        throw new Error('Error getting public URL');
      }

      // Notify parent component
      onUploadComplete(urlData.publicUrl);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during upload';
      setError(errorMessage);
      onError(errorMessage);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="relative">
      <label 
        className={`
          flex items-center gap-2 px-4 py-2 rounded-full 
          ${uploading 
            ? 'bg-gray-100 cursor-not-allowed' 
            : 'bg-blue-50 hover:bg-blue-100 cursor-pointer'
          }
          transition-colors
        `}
      >
        <Upload className="w-4 h-4" />
        <span className="text-sm">
          {uploading ? 'Uploading...' : 'Add Image'}
        </span>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          disabled={uploading}
          className="hidden"
        />
      </label>

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