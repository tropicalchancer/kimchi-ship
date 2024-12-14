import React, { useState, useEffect } from 'react';
import { Plus, Loader2, Package } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';
import TimeAgo from './TimeAgo';

type Tables = Database['public']['Tables'];
type Project = Tables['projects']['Row'];
type Post = Tables['posts']['Row'];
type User = Tables['users']['Row'];

type PostWithUser = Post & {
  users: User | null;
};

type ProjectWithNestedPosts = Project & {
  posts: PostWithUser[];
};

interface ProjectWithPosts extends ProjectWithNestedPosts {
  _count: {
    posts: number;
  };
}

interface ProjectsProps {
  user: User | null;
}

const Projects: React.FC<ProjectsProps> = ({ user }) => {
  const { projectId } = useParams();
  const [projects, setProjects] = useState<ProjectWithPosts[]>([]);
  const [selectedProject, setSelectedProject] = useState<ProjectWithPosts | null>(null);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    if (projectId) {
      const project = projects.find(p => p.id === projectId);
      setSelectedProject(project || null);
    }
  }, [projectId, projects]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          posts (
            *,
            users (
              id,
              full_name,
              avatar_url,
              current_streak
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const projectsWithCounts = (data || []).map(project => ({
        ...project,
        posts: (project.posts || [])
          .filter((post): post is PostWithUser => post !== null)
          .sort((a, b) => 
            new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime()
          ),
        _count: {
          posts: project.posts?.length || 0
        }
      })) as ProjectWithPosts[];

      setProjects(projectsWithCounts);
    } catch (err) {
      console.error('Failed to load projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim() || !user?.id) return;

    try {
      setCreating(true);
      
      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          name: newProjectName.trim(),
          description: newProjectDesc.trim() || null,
          user_id: user.id,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      if (project) {
        const newProject: ProjectWithPosts = {
          ...project,
          posts: [],
          _count: { posts: 0 }
        };
        setProjects([newProject, ...projects]);
        setShowCreateModal(false);
        setNewProjectName('');
        setNewProjectDesc('');
      }
    } catch (err) {
      console.error('Failed to create project:', err);
    } finally {
      setCreating(false);
    }
  };
 
  // const formatDate = (dateString: string | null): string => {
  //   if (!dateString) return '';
  //   return new Date(dateString).toLocaleDateString();
  // };
  

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Projects List */}
      <div className="w-80 border-r bg-white">
        <div className="p-4 border-b flex justify-between items-center">
          <h2 className="text-xl font-semibold">Projects</h2>
          <button
            onClick={() => setShowCreateModal(true)}
            className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="divide-y">
          {projects.map(project => (
            <button
              key={project.id}
              onClick={() => setSelectedProject(project)}
              className={`w-full p-4 text-left hover:bg-gray-50 flex items-center gap-3 ${
                selectedProject?.id === project.id ? 'bg-blue-50' : ''
              }`}
            >
              <Package className="w-5 h-5 text-gray-500" />
              <div>
                <div className="font-medium">{project.name}</div>
                <div className="text-sm text-gray-500">
                  {project._count.posts} updates
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Project Details and Posts */}
      <div className="flex-1 p-6">
        {selectedProject ? (
          <div>
            <div className="mb-6">
              <h1 className="text-2xl font-bold">{selectedProject.name}</h1>
              {selectedProject.description && (
                <p className="text-gray-600 mt-2">{selectedProject.description}</p>
              )}
            </div>

            <div className="space-y-4">
              {selectedProject.posts.map(post => (
                <div key={post.id} className="bg-white rounded-lg p-4 shadow-sm">
                  <div className="flex gap-3">
                    <Link 
                      to={`/profile/${post.users?.id}`}
                      className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center"
                    >
                      {post.users?.avatar_url ? (
                        <img 
                          src={post.users.avatar_url} 
                          alt={post.users.full_name || 'User'} 
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        post.users?.full_name?.[0] || 'A'
                      )}
                    </Link>
                    <div>
                      <div className="flex items-center gap-2">
                        <Link 
                          to={`/profile/${post.users?.id}`}
                          className="font-medium hover:text-gray-600"
                        >
                          {post.users?.full_name || 'Anonymous'}
                        </Link>
                        {(post.users?.current_streak ?? 0) > 0 && (
                          <span className="text-sm text-gray-500">
                            {post.users?.current_streak} 🌶️
                          </span>
                        )}
                      </div>
                      <div className="mt-1">{post.content}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        <TimeAgo date={post.created_at} />
                      </div>
                    </div>
                  </div>
                </div>
              ))}

              {selectedProject.posts.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  No updates yet. Share your progress by using #{selectedProject.name} in your post.
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center text-gray-500 mt-10">
            Select a project to view updates
          </div>
        )}
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-lg w-full">
            <h2 className="text-xl font-bold mb-4">Create New Project</h2>
            <form onSubmit={handleCreateProject} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  placeholder="Enter project name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">
                  Description (optional)
                </label>
                <textarea
                  value={newProjectDesc}
                  onChange={(e) => setNewProjectDesc(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                  rows={3}
                  placeholder="Enter project description"
                />
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating || !newProjectName.trim()}
                  className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
                >
                  {creating ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Project'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Projects;