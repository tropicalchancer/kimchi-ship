import React, { useState, useRef, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { Database } from '../lib/database.types';

type Project = Database['public']['Tables']['projects']['Row'];

interface HashtagAutoCompleteProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
}

const HashtagAutoComplete: React.FC<HashtagAutoCompleteProps> = ({
  value,
  onChange,
  className = '',
  placeholder = 'Share what you shipped today... Use # to tag a project'
}) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchProjects = async () => {
      const { data } = await supabase
        .from('projects')
        .select('*')
        .order('name');
      setProjects(data || []);
    };

    fetchProjects();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    const position = e.target.selectionStart || 0;
    
    onChange(newValue);
    setCursorPosition(position);

    // Check if we're in a hashtag context
    const textBeforeCursor = newValue.slice(0, position);
    const hashtagMatch = textBeforeCursor.match(/#[\w-]*$/);
    
    setShowSuggestions(!!hashtagMatch);
  };

  const getFilteredProjects = () => {
    const textBeforeCursor = value.slice(0, cursorPosition);
    const hashtagMatch = textBeforeCursor.match(/#([\w-]*)$/);
    const searchTerm = hashtagMatch?.[1]?.toLowerCase() || '';

    return projects.filter(project => 
      project.name.toLowerCase().includes(searchTerm)
    );
  };

  const handleProjectSelect = (projectName: string) => {
    const textBeforeCursor = value.slice(0, cursorPosition);
    const textAfterCursor = value.slice(cursorPosition);
    const hashtagStartIndex = textBeforeCursor.lastIndexOf('#');
    
    const newText = 
      textBeforeCursor.slice(0, hashtagStartIndex) + 
      `#${projectName} ` + 
      textAfterCursor;
    
    onChange(newText);
    setShowSuggestions(false);
    textareaRef.current?.focus();
  };

  const filteredProjects = getFilteredProjects();

  return (
    <div className="relative w-full">
      <textarea
        ref={textareaRef}
        value={value}
        onChange={handleInputChange}
        className={`w-full p-2 border rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
        rows={3}
        placeholder={placeholder}
      />
      
      {showSuggestions && filteredProjects.length > 0 && (
        <div 
          ref={suggestionsRef}
          className="absolute z-10 w-64 mt-1 bg-white border rounded-lg shadow-lg max-h-60 overflow-y-auto"
        >
          {filteredProjects.map(project => (
            <button
              key={project.id}
              className="w-full px-4 py-2 text-left hover:bg-gray-100 focus:bg-gray-100 focus:outline-none"
              onClick={() => handleProjectSelect(project.name)}
            >
              #{project.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default HashtagAutoComplete;