import { Link } from 'react-router-dom';
import UserAvatar from '../../shared/components/UserAvatar';
import TimeAgo from '../../shared/components/TimeAgo';
import { Database } from '../../shared/types/database.types';

type Tables = Database['public']['Tables'];
type DbUser = Tables['users']['Row'];
type DbPost = Tables['posts']['Row'];
type DbProject = Tables['projects']['Row'];

interface PostWithUserAndProject extends DbPost {
  users: DbUser;
  projects?: DbProject | null;
}

interface PostCardProps {
  post: PostWithUserAndProject;
}

const PostCard = ({ post }: PostCardProps) => {
  const renderContent = () => {
    if (!post.project_id || !post.projects) {
      return post.content;
    }

    // Remove the project hashtag from content if it exists
    const projectTag = `#${post.projects.name}`;
    const cleanContent = post.content.replace(projectTag, '').trim();

    return (
      <>
        {cleanContent}{' '}
        <Link 
          to={`/projects/${post.project_id}`}
          className="text-blue-600 hover:underline"
        >
          {projectTag}
        </Link>
      </>
    );
  };

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border">
      <div className="flex gap-3">
        <Link to={`/profile/${post.user_id}`}>
          <UserAvatar user={post.users} size="sm" className="hover:opacity-90" />
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
          <div className="font-medium">
            {renderContent()}
          </div>
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
  );
};

export default PostCard;