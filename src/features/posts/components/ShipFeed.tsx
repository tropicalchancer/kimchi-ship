import { useState, useEffect } from 'react';
import { supabase } from '../../shared/services/supabase';
import { Database } from '../../shared/types/database.types';
import { PostWithUserAndProject } from '../../shared/types/post.types'; // Importing the unified type
import PostCreationForm from './PostCreationForm';
import FeedHeader from './FeedHeader';
import PostsList from './PostsList';
import FeedLoadingSkeleton from './FeedLoadingSkeleton';
import AuthGate from '../../auth/components/AuthGate';

type Tables = Database['public']['Tables'];
type DbUser = Tables['users']['Row'];

type Props = {
  user: DbUser | null;
};

const ShipFeed = ({ user }: Props) => {
  const [posts, setPosts] = useState<PostWithUserAndProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    try {
      setError(null);
      const { data, error: supabaseError } = await supabase
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
            email,
            created_at,
            last_post_date,
            longest_streak
          ),
          projects (
            id,
            name,
            description
          )
        `)
        .order('created_at', { ascending: false });

      if (supabaseError) throw supabaseError;

      const typedPosts = (data || []).map(post => ({
        ...post,
        users: post.users || null,
        projects: post.projects || null
      })) as PostWithUserAndProject[];

      setPosts(typedPosts);
    } catch (err) {
      console.error('Error fetching posts:', err);
      setError(err instanceof Error ? err : new Error('Failed to fetch posts'));
    } finally {
      setLoading(false);
    }
  };

  const handlePostCreated = (newPost: PostWithUserAndProject) => {
    setPosts([newPost, ...posts]);
  };

  if (loading) {
    return <FeedLoadingSkeleton />;
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg">
          <h2 className="font-bold mb-2">Error Loading Feed</h2>
          <p>{error.message}</p>
          <button 
            onClick={() => fetchPosts()}
            className="mt-2 text-sm underline hover:no-underline"
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <FeedHeader user={user} />

      <AuthGate user={user}>
        <PostCreationForm 
          user={user} 
          onPostCreated={handlePostCreated} 
        />
      </AuthGate>

      <PostsList posts={posts} />
    </div>
  );
};

export default ShipFeed;
