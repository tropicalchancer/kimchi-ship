import { Database } from '../lib/database.types';
import PostCard from './PostCard';

type Tables = Database['public']['Tables'];
type DbUser = Tables['users']['Row'];
type DbPost = Tables['posts']['Row'];
type DbProject = Tables['projects']['Row'];

interface PostWithUserAndProject extends DbPost {
  users: DbUser;
  projects?: DbProject | null;
}

interface PostsListProps {
  posts: PostWithUserAndProject[];
}

const PostsList = ({ posts }: PostsListProps) => {
  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-lg p-4 shadow-sm border text-center text-gray-500">
        No posts yet. Be the first to share what you've shipped!
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post) => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  );
};

export default PostsList;