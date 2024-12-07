import { useState, useEffect } from 'react';
import { Link } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

type Props = {
  user: Database['public']['Tables']['users']['Row'] | null;
}

type DbPost = Database['public']['Tables']['posts']['Row']
type DbUser = Database['public']['Tables']['users']['Row']

interface PostWithUser extends DbPost {
  users: DbUser;
}

const ShipFeed = ({ user }: Props) => {
  const [posts, setPosts] = useState<PostWithUser[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);

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
      setPosts(data as PostWithUser[] || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim() || !user) return;

    try {
      const postData = {
        content: newPost,
        user_id: user.id,
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
      }
    } catch (error) {
      console.error('Error creating post:', error);
    }
  };

  if (loading) {
    return <div className="max-w-2xl mx-auto p-4">Loading...</div>;
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <div className="max-w-2xl mx-auto p-4">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Kimchi Ship</h1>
        <p className="text-gray-600">Share what you shipped today</p>
        {user && (
          <p className="text-sm text-gray-500 mt-2">
            Current streak: {user.current_streak ?? 0} 🌶️
          </p>
        )}
      </div>

      {/* Post Form */}
      {user ? (
        <div className="mb-8 bg-white rounded-lg p-4 shadow-sm border">
          <h2 className="text-gray-600 mb-2">What did you ship?</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="flex gap-2">
              <textarea
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                className="flex-1 p-2 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                rows={3}
                placeholder="Share what you shipped today..."
              />
            </div>
            <div className="flex justify-between items-center">
              <button 
                type="button" 
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <Link size={20} />
              </button>
              <button
                type="submit"
                className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors"
              >
                Post
              </button>
            </div>
          </form>
        </div>
      ) : (
        <div className="mb-8 bg-white rounded-lg p-4 shadow-sm border">
          <p>Please sign in to post updates</p>
        </div>
      )}

      {/* Posts Feed */}
      <div className="space-y-4">
        {posts.map(post => (
          <div key={post.id} className="bg-white rounded-lg p-4 shadow-sm border">
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
                {post.users?.avatar_url ? (
                  <img 
                    src={post.users.avatar_url} 
                    alt={post.users.full_name || 'User avatar'} 
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  post.users?.full_name?.[0] || 'A'
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{post.users?.full_name || 'Anonymous'}</span>
                  {(post.users?.current_streak ?? 0) > 0 && (
                    <span className="text-sm text-gray-500">
                      {post.users.current_streak} 🌶️
                    </span>
                  )}
                </div>
                <div className="font-medium">{post.content}</div>
                <div className="text-gray-500 text-sm mt-1">
                  {formatDate(post.created_at)}
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