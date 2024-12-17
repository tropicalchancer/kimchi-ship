// src/components/ProjectForm.tsx

import React, { useState } from 'react'
import { X } from 'lucide-react'
import { supabase } from '../../shared/services/supabase'
import type { Project } from '../types/project'; // Using an absolute path (requires `baseUrl` in `tsconfig.json`)
// or



interface ProjectFormProps {
  userId: string
  onSuccess?: (project: Project) => void
  onCancel?: () => void
}

export const ProjectForm: React.FC<ProjectFormProps> = ({
  userId,
  onSuccess,
  onCancel
}) => {
  // Rest of your code stays exactly the same
  const [formData, setFormData] = useState({
    name: '',
    hashtag: '',
    pitch: '',
    description: '',
    website: '',
    emoji: '',
    is_private: false,
    topics: [] as string[]
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)



  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name.trim()) return

    setIsSubmitting(true)
    setError(null)

    try {
      const { data, error: submitError } = await supabase
        .from('projects')
        .insert({
          name: formData.name.trim(),
          hashtag: formData.hashtag.trim() || null,
          pitch: formData.pitch.trim() || null,
          description: formData.description.trim() || null,
          website: formData.website.trim() || null,
          emoji: formData.emoji.trim() || null,
          is_private: formData.is_private,
          topics: formData.topics,
          user_id: userId,
          status: 'active'
        })
        .select()
        .single()

      if (submitError) throw submitError
      if (data && onSuccess) {
        onSuccess(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project')
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle topic management
  const handleTopicAdd = (topic: string) => {
    if (formData.topics.length < 5 && !formData.topics.includes(topic)) {
      setFormData(prev => ({
        ...prev,
        topics: [...prev.topics, topic]
      }))
    }
  }

  const handleTopicRemove = (topicToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      topics: prev.topics.filter(topic => topic !== topicToRemove)
    }))
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Project name field */}
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700">
          Project Name *
        </label>
        <input
          type="text"
          id="name"
          value={formData.name}
          onChange={e => setFormData(prev => ({ ...prev, name: e.target.value }))}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
          required
        />
      </div>

      {/* Hashtag field */}
      <div>
        <label htmlFor="hashtag" className="block text-sm font-medium text-gray-700">
          Hashtag
        </label>
        <input
          type="text"
          id="hashtag"
          value={formData.hashtag}
          onChange={e => setFormData(prev => ({ ...prev, hashtag: e.target.value }))}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
          placeholder="For tagging todos"
        />
      </div>

      {/* Pitch field */}
      <div>
        <label htmlFor="pitch" className="block text-sm font-medium text-gray-700">
          Pitch
        </label>
        <input
          type="text"
          id="pitch"
          value={formData.pitch}
          onChange={e => setFormData(prev => ({ ...prev, pitch: e.target.value }))}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
          placeholder="One, short sentence"
        />
      </div>

      {/* Description field */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
          Description
        </label>
        <textarea
          id="description"
          value={formData.description}
          onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
          placeholder="Longer description for project page"
        />
      </div>

      {/* Website field */}
      <div>
        <label htmlFor="website" className="block text-sm font-medium text-gray-700">
          Website
        </label>
        <input
          type="url"
          id="website"
          value={formData.website}
          onChange={e => setFormData(prev => ({ ...prev, website: e.target.value }))}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
          placeholder="https://"
        />
      </div>

      {/* Emoji field */}
      <div>
        <label htmlFor="emoji" className="block text-sm font-medium text-gray-700">
          Emoji
        </label>
        <input
          type="text"
          id="emoji"
          value={formData.emoji}
          onChange={e => setFormData(prev => ({ ...prev, emoji: e.target.value }))}
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:ring-blue-500"
          placeholder="Instead of a logo"
        />
      </div>

      {/* Topics field */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Topics (up to 5)
        </label>
        <div className="mt-1 flex flex-wrap gap-2">
          {formData.topics.map(topic => (
            <span 
              key={topic}
              className="inline-flex items-center bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm"
            >
              {topic}
              <button
                type="button"
                onClick={() => handleTopicRemove(topic)}
                className="ml-1 text-blue-600 hover:text-blue-800"
              >
                <X size={14} />
              </button>
            </span>
          ))}
          {formData.topics.length < 5 && (
            <input
              type="text"
              placeholder="Add topic"
              className="border-none focus:ring-0 text-sm p-0"
              onKeyPress={e => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  const input = e.target as HTMLInputElement;
                  if (input.value.trim()) {
                    handleTopicAdd(input.value.trim());
                    input.value = '';
                  }
                }
              }}
            />
          )}
        </div>
      </div>

      {/* Privacy toggle */}
      <div className="flex items-center">
        <input
          type="checkbox"
          id="is_private"
          checked={formData.is_private}
          onChange={e => setFormData(prev => ({ ...prev, is_private: e.target.checked }))}
          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
        />
        <label htmlFor="is_private" className="ml-2 block text-sm text-gray-700">
          Hide from guests
        </label>
      </div>

      {/* Error message */}
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}

      {/* Form buttons */}
      <div className="flex justify-end gap-3">
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-gray-700 hover:text-gray-900"
          >
            Cancel
          </button>
        )}
        <button
          type="submit"
          disabled={isSubmitting}
          className="bg-blue-500 text-white px-4 py-2 rounded-full hover:bg-blue-600 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Creating...' : 'Create Project'}
        </button>
      </div>
    </form>
  )
}

export default ProjectForm