// src/types/project.ts

// src/shared/types/post.types.ts
import { Database } from '../../shared/types/database.types';

type Tables = Database['public']['Tables'];
type DbUser = Tables['users']['Row'];
type DbPost = Tables['posts']['Row'];
type DbProject = Tables['projects']['Row'];

export interface PostWithUserAndProject extends DbPost {
  users: DbUser | null;
  projects?: DbProject | null;
}


export interface PostWithUserAndProject extends PostWithUser {
  projects?: DbProject | null;
}

export interface ProjectLinkProps {
  projectId: string;
  projectName: string;
  className?: string;
}

// Additional helper types for component props
export interface PostProps {
  user: DbUser | null;
}