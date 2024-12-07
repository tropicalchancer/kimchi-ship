import React, { useState, useEffect } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

type Project = Database['public']['Tables']['projects']['Row'];
type Post = Database['public']['Tables']['posts']['Row'];

interface ProjectWithPosts extends Project {
  posts: Post[];
  _count: {
    posts: number;
  };
}

const Projects = () => {
  const [projects, setProjects] = useState<ProjectWithPosts[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDesc, setNewProjectDesc] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      
      // Fetch projects with post counts and latest posts
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          posts (
            id,
            content,
            created_at,
            user_id
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const projectsWithCounts = data?.map(project => ({
        ...project,
        _count: {
          posts: project.posts?.length || 0
        }
      })) || [];

      setProjects(projectsWithCounts);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load projects');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    try {
      setCreating(true);
      
      const { data: project, error } = await supabase
        .from('projects')
        .insert({
          name: newProjectName.trim(),
          description: newProjectDesc.trim() || null,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) throw error;

      if (project) {
        setProjects([{ ...project, posts: [], _count: { posts: 0 } }, ...projects]);
        setShowCreateModal(false);
        setNewProjectName('');
        setNewProjectDesc('');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
    } finally {
      setCreating(false);
    }
  };

  if (loading) {
    return (
      <div className="p-4 flex items-center justify-center min-h-[200px]">
        <Loader2 className="w-6 h-6 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-6 px-4">
        <h1 className="text-2xl font-bold">Projects</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors inline-flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Project
        </button>
      </div>

      {/* Project List */}
      <div className="space-y-4">
        {projects.map(project => (
          <div key={project.id} className="bg-white rounded-lg border p-4 hover:border-gray-300 transition-colors">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-lg font-medium">{project.name}</h3>
                {project.description && (
                  <p className="text-gray-600 mt-1">{project.description}</p>
                )}
                <div className="mt-2 text-sm text-gray-500">
                  {project._count.posts} updates
                </div>
              </div>
              <Link
                to={`/projects/${project.id}`}
                className="text-blue-500 hover:text-blue-600 text-sm"
              >
                View Details →
              </Link>
            </div>
          </div>
        ))}
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