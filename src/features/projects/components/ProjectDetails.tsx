import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, MessageSquare } from 'lucide-react';
import { supabase } from '../../shared/services/supabase';
import { Database } from '../../shared/types/database.types';

type User = Database['public']['Tables']['users']['Row'];
type Project = Database['public']['Tables']['projects']['Row'];
type Post = Database['public']['Tables']['posts']['Row'];

interface ProjectDetailsProps {
  user: User | null;
}

interface ProjectWithPosts extends Project {
  posts: Post[];
  users: {
    full_name: string;
    avatar_url: string | null;
  };
}

const ProjectDetails: React.FC<ProjectDetailsProps> = ({ user }) => {
  const { projectId } = useParams();
  const [project, setProject] = useState<ProjectWithPosts | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProject = async () => {
      if (!projectId) return;
      
      try {
        setLoading(true);
        
        const { data, error } = await supabase
          .from('projects')
          .select(`
            *,
            posts (
              id,
              content,
              created_at,
              user_id
            ),
            users (
              full_name,
              avatar_url
            )
          `)
          .eq('id', projectId)
          .single();

        if (error) throw error;
        setProject(data as ProjectWithPosts);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    fetchProject();
  }, [projectId]);

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleDateString();
  };

  const canEdit = user && project && user.id === project.user_id;

  if (loading) {
    return (
      <div className="p-4">
        <div className="animate-pulse">Loading project details...</div>
      </div>
    );
  }

  if (error || !project) {
    return (
      <div className="p-4">
        <div className="text-red-500">
          {error || 'Project not found'}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Link 
          to="/projects" 
          className="text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="text-2xl font-bold">{project.name}</h1>
        {canEdit && (
          <button className="text-blue-500 hover:text-blue-600 text-sm">
            Edit Project
          </button>
        )}
      </div>

      {/* Project Details */}
      <div className="bg-white rounded-lg p-6 shadow-sm border space-y-4">
        <p className="text-gray-600">{project.description}</p>
        
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4" />
            <span>Created {formatDate(project.created_at)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            <span>{project.posts?.length || 0} updates</span>
          </div>
        </div>
      </div>

      {/* Project Updates */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Project Updates</h2>
        {project.posts && project.posts.length > 0 ? (
          project.posts.map(post => (
            <div key={post.id} className="bg-white rounded-lg p-4 shadow-sm border">
              <p>{post.content}</p>
              <div className="text-sm text-gray-500 mt-2">
                {formatDate(post.created_at)}
              </div>
            </div>
          ))
        ) : (
          <div className="text-gray-500">No updates yet</div>
        )}
      </div>
    </div>
  );
};

export default ProjectDetails;