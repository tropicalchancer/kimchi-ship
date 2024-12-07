import React, { useState, useEffect, useCallback } from 'react'
import ProjectForm from '../components/ProjectForm'
import ProjectCard from '../components/ProjectCard'
import { supabase } from '../lib/supabase'
import type { Project } from '../types/project'

interface ProjectsPageProps {
  userId: string
}

const ProjectsPage: React.FC<ProjectsPageProps> = ({ userId }) => {
  const [showForm, setShowForm] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchProjects = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })

      if (error) throw error
      setProjects(data || [])
    } catch (err) {
      console.error('Error fetching projects:', err)
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  useEffect(() => {
    if (userId) {
      fetchProjects()
    }
  }, [userId, fetchProjects])

  const handleProjectCreated = (newProject: Project) => {
    setProjects([newProject, ...projects])
    setShowForm(false)
  }

  const handleArchive = async (projectId: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .update({ status: 'archived' })
        .eq('id', projectId)

      if (error) throw error

      setProjects(projects.filter(p => p.id !== projectId))
    } catch (err) {
      console.error('Failed to archive project:', err)
    }
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        Loading projects...
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">My Projects</h1>
        <button
          onClick={() => setShowForm(true)}
          className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors"
        >
          Create New Project
        </button>
      </div>

      {showForm && (
        <div className="mb-6">
          <ProjectForm
            userId={userId}
            onSuccess={handleProjectCreated}
            onCancel={() => setShowForm(false)}
          />
        </div>
      )}

      <div className="space-y-4">
        {projects.map(project => (
          <ProjectCard
            key={project.id}
            project={project}
            isOwner={project.user_id === userId}
            onArchive={handleArchive}
          />
        ))}
      </div>
    </div>
  )
}

export default ProjectsPage