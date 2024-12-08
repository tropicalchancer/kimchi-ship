import { useState } from 'react';
import { Database } from '../lib/database.types';
import { supabase } from '../lib/supabase';
import HashtagAutoComplete from './HashtagAutoComplete';
import FileUpload from './FileUpload';
import { LogOut } from 'lucide-react';

type Tables = Database['public']['Tables'];
type DbUser = Tables['users']['Row'];
type DbPost = Tables['posts']['Row'];
type DbProject = Tables['projects']['Row'];

interface PostWithUserAndProject extends DbPost {
  users: DbUser | null; // Allow null
  projects?: DbProject | null;
}

interface PostCreationFormProps {
  user: DbUser | null; // Allow null
  onPostCreated: (post: PostWithUserAndProject) => void;
}

const PostCreationForm = ({ user, onPostCreated }: PostCreationFormProps) => {
  const [newPost, setNewPost] = useState('');
  const [linkedProjectId, setLinkedProjectId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => prev + 1);
    const items = e.dataTransfer.items;
    if (items && items.length > 0) {
      if (items[0].kind === 'file') {
        setIsDragging(true);
      }
    }
  };

  const handleDragOut = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter((prev) => prev - 1);
    if (dragCounter - 1 === 0) {
      setIsDragging(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(0);
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (!file || !file.type.startsWith('image/')) {
      console.error('Please drop an image file');
      return;
    }

    try {
      if (file.size > 5 * 1024 * 1024) {
        throw new Error('File size must be less than 5MB');
      }

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}${Date.now()}.${fileExt}`;
      const filePath = `${user?.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw new Error('Error uploading file');
      }

      const { data: urlData } = supabase.storage
        .from('uploads')
        .getPublicUrl(filePath);

      if (!urlData?.publicUrl) {
        throw new Error('Error getting public URL');
      }

      setImageUrl(urlData.publicUrl);
    } catch (err) {
      console.error('Upload error:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const authUserId = sessionData?.session?.user.id;

      if (authUserId !== user?.id) {
        throw new Error('Authenticated user ID does not match frontend user ID');
      }

      const postData = {
        content: `✅ ${newPost}`,
        user_id: authUserId,
        project_id: linkedProjectId,
        image_url: imageUrl,
      };

      const { data: post, error } = await supabase
        .from('posts')
        .insert(postData)
        .select(`
          id,
          content,
          created_at,
          updated_at,
          image_url,
          project_id,
          user_id,
          users (
            id,
            full_name,
            avatar_url,
            current_streak,
            email
          ),
          projects (
            id,
            name,
            description
          )
        `)
        .single();

      if (error) throw error;

      if (post) {
        onPostCreated({
          ...post,
          users: post.users || null, // Handle missing user
        } as PostWithUserAndProject);
        setNewPost('');
        setLinkedProjectId(null);
        setImageUrl(null);
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  return (
    <div className="mb-8 bg-white rounded-lg p-4 shadow-sm border">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div
          onDragEnter={handleDragIn}
          onDragLeave={handleDragOut}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={(e) => e.stopPropagation()}
          className={`
            relative rounded-lg transition-all duration-300
            ${isDragging ? 'bg-blue-50 border-2 border-dashed border-blue-300' : ''}
          `}
        >
          <HashtagAutoComplete
            value={newPost}
            onChange={(value: string) => {
              setNewPost(value);
            }}
            onProjectLink={(projectId: string | null) => {
              setLinkedProjectId(projectId);
            }}
          />
          {isDragging && (
            <div
              className="absolute inset-0 flex items-center justify-center bg-blue-50 bg-opacity-90 rounded-lg pointer-events-none"
            >
              <p className="text-blue-500">Drop image here</p>
            </div>
          )}
        </div>
        <div className="flex justify-between items-center">
          <FileUpload
            user={user}
            onUploadComplete={(url) => setImageUrl(url)}
            onError={(error) => console.error('Upload error:', error)}
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors"
          >
            Post
          </button>
        </div>
        {imageUrl && (
          <div className="relative mt-2">
            <img
              src={imageUrl}
              alt="Upload preview"
              className="max-h-48 rounded-lg border"
            />
            <button
              onClick={() => setImageUrl(null)}
              className="absolute top-2 right-2 p-1 bg-black/50 rounded-full text-white hover:bg-black/70"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default PostCreationForm;
