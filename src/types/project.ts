// src/types/project.ts

import { Database } from '../lib/database.types'

// Use the type from the database.types.ts file (Approach 1 - Recommended)
export type Project = Database['public']['Tables']['projects']['Row']
