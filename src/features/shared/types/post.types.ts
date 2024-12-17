// src/features/shared/types/post.types.ts
import { Database } from './database.types';

type Tables = Database['public']['Tables'];
type DbUser = Tables['users']['Row'];
type DbPost = Tables['posts']['Row'];
type DbProject = Tables['projects']['Row'];

// Base definitions
export interface PostWithUser extends DbPost {
  users: DbUser | null;
}

export interface PostWithUserAndProject extends PostWithUser {
  projects?: DbProject | null;
}
