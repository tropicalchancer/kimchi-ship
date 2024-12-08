import { useState, useEffect } from 'react';
import { LogOut } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import HashtagAutoComplete from './HashtagAutoComplete';
import FileUpload from './FileUpload';
import TimeAgo from './TimeAgo';

type Props = {
  user: Database['public']['Tables']['users']['Row'] | null;
};

type DbPost = Database['public']['Tables']['posts']['Row'];
type DbUser = Database['public']['Tables']['users']['Row'];

interface PostWithUser extends DbPost {
  users: DbUser;
}

const ShipFeed = ({ user }: Props) => {
  const [posts, setPosts] = useState<PostWithUser[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [signingOut, setSigningOut] = useState(false);
  const [linkedProjectId, setLinkedProjectId] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragCounter, setDragCounter] = useState(0);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id,
          content,
          created_at,
          image_url,
          project_id,
          user_id,
          users (
            id,
            full_name,
            avatar_url,
            current_streak,
            email
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts((data as PostWithUser[]) || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSignOut = async () => {
    try {
      setSigningOut(true);
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
    } finally {
      setSigningOut(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() || !user) return;

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const authUserId = sessionData?.session?.user.id;

      console.log('Authenticated user ID:', authUserId);
      console.log('Frontend user ID:', user?.id);

      if (authUserId !== user?.id) {
        throw new Error('Authenticated user ID does not match frontend user ID');
      }

      const postData = {
        content: newPost,
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
          image_url,
          project_id,
          user_id,
          users (
            id,
            full_name,
            avatar_url,
            current_streak,
            email
          )
        `)
        .single();

      if (error) throw error;

      if (post) {
        setPosts([post as PostWithUser, ...posts]);
        setNewPost('');
        setLinkedProjectId(null);
        setImageUrl(null);
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragIn = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(prev => prev + 1);
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
    setDragCounter(prev => prev - 1);
    if (dragCounter - 1 === 0) {
      setIsDragging(false);
    }
  };

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragCounter(0);
    setIsDragging(false);

    if (!user) return;

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
      const filePath = `${user.id}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('uploads')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
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

  if (loading) {
    return <div className="max-w-2xl mx-auto p-4">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-start">
          <div>

          </div>
          {user && (
            <button
              onClick={handleSignOut}
              disabled={signingOut}
              className="text-gray-500 hover:text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors"
              aria-label="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Post Form */}
      {user ? (
        <div className="mb-8 bg-white rounded-lg p-4 shadow-sm border">
      
          <form onSubmit={handleSubmit} className="space-y-4">
            <div
              onDragEnter={handleDragIn}
              onDragLeave={handleDragOut}
              onDragOver={handleDrag}
              onDrop={handleDrop}
              onClick={e => e.stopPropagation()}
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
      ) : (
        <div className="mb-8 bg-white rounded-lg p-4 shadow-sm border">
          <p>Please sign in to post updates</p>
        </div>
      )}

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex gap-3">
              <Link 
                to={`/profile/${post.user_id}`}
                className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center hover:opacity-90"
              >
                {post.users?.avatar_url ? (
                  <img 
                    src={post.users.avatar_url} 
                    alt={post.users.full_name || 'User avatar'} 
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  post.users?.full_name?.[0] || 'A'
                )}
              </Link>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <Link 
                    to={`/profile/${post.user_id}`}
                    className="font-medium hover:text-gray-600"
                  >
                    {post.users?.full_name || 'Anonymous'}
                  </Link>
                  {(post.users?.current_streak ?? 0) > 0 && (
                    <span className="text-sm text-gray-500">
                      {post.users.current_streak} 🌶️
                    </span>
                  )}
                </div>
                <div className="font-medium">{post.content}</div>
                {post.image_url && (
                  <img
                    src={post.image_url}
                    alt="Uploaded content"
                    className="mt-2 rounded-lg border"
                  />
                )}
                <div className="text-gray-500 text-sm mt-1">
                  <TimeAgo date={post.created_at} />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ShipFeed;