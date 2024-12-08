import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

type Project = Database['public']['Tables']['projects']['Row'];

interface Props {
  value: string;
  onChange: (value: string) => void;
  onProjectLink: (projectId: string | null) => void;
}

const HashtagAutoComplete = ({ value, onChange, onProjectLink }: Props) => {
  const [suggestions, setSuggestions] = useState<Project[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const fetchProjects = async (searchTerm: string = '') => {
    console.log('Fetching projects with search term:', searchTerm);
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .ilike('name', `${searchTerm}%`)
        .order('name')
        .limit(10);

      if (error) {
        console.error('Supabase error:', error);
        return;
      }

      console.log('Fetched projects:', data);
      setSuggestions(data || []);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setSuggestions([]);
    }
  };

  useEffect(() => {
    const checkForHashtag = () => {
      const beforeCursor = value.slice(0, cursorPosition);
      console.log('Current text before cursor:', beforeCursor);
      
      // Check if we just typed a #
      if (beforeCursor.endsWith('#')) {
        console.log('Hash detected, fetching all projects');
        fetchProjects();
        return;
      }

      // Check if we're in the middle of typing a hashtag
      const hashIndex = beforeCursor.lastIndexOf('#');
      if (hashIndex !== -1) {
        const searchTerm = beforeCursor.slice(hashIndex + 1).toLowerCase();
        console.log('In hashtag, searching for:', searchTerm);
        fetchProjects(searchTerm);
      } else {
        console.log('No hashtag found, hiding suggestions');
        setShowSuggestions(false);
      }
    };

    checkForHashtag();
  }, [value, cursorPosition]);

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const newPosition = e.target.selectionStart || 0;
    console.log('Text changed:', newValue, 'Cursor at:', newPosition);
    
    onChange(newValue);
    setCursorPosition(newPosition);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleClick = () => {
    const newPosition = textareaRef.current?.selectionStart || 0;
    console.log('Clicked, cursor at:', newPosition);
    setCursorPosition(newPosition);
  };

  const handleSuggestionClick = (project: Project) => {
    console.log('Selected project:', project);
    const beforeHashtag = value.slice(0, cursorPosition).replace(/#\w*$/, '');
    const afterHashtag = value.slice(cursorPosition);
    const newValue = `${beforeHashtag}#${project.name}${afterHashtag}`;
    
    onChange(newValue);
    onProjectLink(project.id);
    setShowSuggestions(false);
    textareaRef.current?.focus();
  };

  // Debug render
  console.log('Rendering with showSuggestions:', showSuggestions, 'suggestions:', suggestions.length);

  return (
    <div className="relative w-full">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        onClick={handleClick}
        onFocus={handleClick}
        className="w-full p-2 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        rows={3}
        placeholder="Share what you shipped today... Use # to mention a project"
      />
      
      {showSuggestions && (
        <div className="absolute z-50 w-full mt-1 bg-white border rounded-lg shadow-lg max-h-64 overflow-y-auto">
          {suggestions.length === 0 ? (
            <div className="px-4 py-2 text-gray-500">No projects found</div>
          ) : (
            suggestions.map((project) => (
              <button
                key={project.id}
                onClick={() => handleSuggestionClick(project)}
                className="w-full px-4 py-2 text-left hover:bg-blue-500 hover:text-white focus:bg-blue-500 focus:text-white focus:outline-none flex items-center gap-3"
              >
                <div className="w-8 h-8 flex items-center justify-center bg-gray-100 rounded">
                  <span className="text-sm">📦</span>
                </div>
                <span>#{project.name}</span>
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default HashtagAutoComplete;