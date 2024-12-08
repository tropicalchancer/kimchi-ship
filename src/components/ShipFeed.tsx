import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import PostCard from './PostCard';
import PostCreationForm from './PostCreationForm';
import FeedHeader from './FeedHeader';

type Tables = Database['public']['Tables'];
type DbUser = Tables['users']['Row'];
type DbPost = Tables['posts']['Row'];
type DbProject = Tables['projects']['Row'];

interface PostWithUserAndProject extends DbPost {
  users: DbUser;
  projects?: DbProject | null;
}

type Props = {
  user: DbUser | null;
};

const ShipFeed = ({ user }: Props) => {
  const [posts, setPosts] = useState<PostWithUserAndProject[]>([]);
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
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPosts(data || []);
    } catch (error) {
      console.error('Error fetching posts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost: PostWithUserAndProject) => {
    setPosts([newPost, ...posts]);
  };

  if (loading) {
    return <div className="max-w-2xl mx-auto p-4">Loading...</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <FeedHeader user={user} />

      {user ? (
        <PostCreationForm 
          user={user} 
          onPostCreated={handlePostCreated} 
        />
      ) : (
        <div className="mb-8 bg-white rounded-lg p-4 shadow-sm border">
          <p>Please sign in to post updates</p>
        </div>
      )}

      <div className="space-y-4">
        {posts.map((post) => (
          <PostCard key={post.id} post={post} />
        ))}
      </div>
    </div>
  );
};

export default ShipFeed;