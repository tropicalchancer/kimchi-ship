// src/types/project.ts

import { Database } from '../lib/database.types'

// Base types from database schema
export type Project = Database['public']['Tables']['projects']['Row']
export type Post = Database['public']['Tables']['posts']['Row']
export type User = Database['public']['Tables']['users']['Row']

// Extended types for components
export interface PostWithUser extends Post {
  users: User;
  updated_at: string | null; // Explicitly define as string | null to match Post type
}

export interface PostWithUserAndProject extends PostWithUser {
  projects?: Project | null;
}

export interface ProjectLinkProps {
  projectId: string;
  projectName: string;
  className?: string;
}

// Additional helper types for component props
export interface PostProps {
  user: User | null;
}