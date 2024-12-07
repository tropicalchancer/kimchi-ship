import React from 'react'
import { Archive, Globe } from 'lucide-react' // Removed ExternalLink since we're using Globe

// Type definition for a project
interface Project {
  id: string
  name: string
  description: string | null
  hashtag: string | null
  slug: string | null
  pitch: string | null
  website: string | null
  emoji: string | null
  logo_url: string | null
  header_url: string | null
  is_private: boolean
  topics: string[]
  user_id: string
  status: 'active' | 'completed' | 'archived'
  created_at: string | null // Updated to allow null values
}

interface ProjectCardProps {
  project: Project
  isOwner: boolean
  onArchive?: (projectId: string) => void
}

export const ProjectCard: React.FC<ProjectCardProps> = ({
  project,
  isOwner,
  onArchive
}) => {
  const formattedDate = project.created_at
    ? new Date(project.created_at).toLocaleDateString()
    : 'Unknown Date' // Fallback for null created_at

  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-medium text-lg">{project.name}</h3>
          {project.description && (
            <p className="text-gray-600 mt-1">{project.description}</p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {project.website && (
            <a
              href={project.website}
              target="_blank"
              rel="noopener noreferrer"
              className="text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Visit project website"
            >
              <Globe size={18} />
            </a>
          )}

          {isOwner && onArchive && (
            <button
              onClick={() => onArchive(project.id)}
              className="text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Archive project"
            >
              <Archive size={18} />
            </button>
          )}
        </div>
      </div>

      <div className="mt-2 text-sm text-gray-500">
        Created {formattedDate}
      </div>
    </div>
  )
}

export default ProjectCard