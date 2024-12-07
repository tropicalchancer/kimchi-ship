# Kimchi Ship Setup Guide

## Project Context
Kimchi Ship is a React/TypeScript web application that lets users share updates about what they've "shipped" (completed/launched). Key features include:
- User authentication
- Post creation and viewing
- Streak tracking (🌶️)
- Project organization

## Project Structure
```
kimchi-ship/
├── src/
│   ├── lib/
│   │   ├── supabase.ts       # Supabase client configuration
│   │   └── database.types.ts # Generated TypeScript types
│   ├── components/
│   │   ├── Auth.tsx         # Authentication component
│   │   └── ShipFeed.tsx     # Main feed component
│   ├── App.tsx              # Root component
│   └── index.css            # Contains Tailwind directives
├── .env.example             # Example environment variables
├── .env.local               # Local environment variables (create this)
├── package.json
└── README.md
```

## Technical Requirements
- Node.js
- npm
- Supabase account
- Git

## Setup Steps

### 1. Local Project Setup
```bash
# Clone the repository
git clone <repository-url>
cd kimchi-ship

# Install dependencies
npm install
```

### 2. Supabase Setup
1. Go to supabase.com and create an account
2. Create a new project
3. Once the project is created, run this SQL in the SQL Editor to set up the database schema:

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table (updated with streak info)
create table public.users (
  id uuid primary key default uuid_generate_v4(),
  email text unique not null,
  full_name text not null,
  avatar_url text,
  current_streak int default 0,
  longest_streak int default 0,
  last_post_date date,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Projects table
create table public.projects (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  description text,
  user_id uuid references public.users(id) on delete cascade not null,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Posts table
create table public.posts (
  id uuid primary key default uuid_generate_v4(),
  content text not null,
  user_id uuid references public.users(id) on delete cascade not null,
  project_id uuid references public.projects(id) on delete set null,
  image_url text,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Hashtags table
create table public.hashtags (
  id uuid primary key default uuid_generate_v4(),
  name text unique not null,
  created_at timestamp with time zone default now()
);

-- Posts to hashtags junction table
create table public.posts_hashtags (
  post_id uuid references public.posts(id) on delete cascade,
  hashtag_id uuid references public.hashtags(id) on delete cascade,
  primary key (post_id, hashtag_id)
);

-- Streak history table for analytics
create table public.streak_history (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references public.users(id) on delete cascade not null,
  streak_date date not null,
  streak_count int not null,
  created_at timestamp with time zone default now()
);

-- Function to update streaks
create or replace function public.update_streak()
returns trigger as $$
declare
  last_post_timestamp timestamp;
  days_since_last_post int;
begin
  -- Get the user's last post timestamp before this one
  select created_at into last_post_timestamp
  from public.posts
  where user_id = new.user_id
    and created_at < new.created_at
  order by created_at desc
  limit 1;

  -- Update the user's streak
  update public.users
  set 
    last_post_date = current_date,
    current_streak = case
      when last_post_date = current_date - interval '1 day' then current_streak + 1
      when last_post_date = current_date then current_streak
      else 1
    end,
    longest_streak = greatest(
      longest_streak,
      case
        when last_post_date = current_date - interval '1 day' then current_streak + 1
        when last_post_date = current_date then current_streak
        else 1
      end
    ),
    updated_at = now()
  where id = new.user_id;

  -- Record streak history
  insert into public.streak_history (user_id, streak_date, streak_count)
  select 
    new.user_id,
    current_date,
    users.current_streak
  from public.users
  where id = new.user_id;

  return new;
end;
$$ language plpgsql security definer;

-- Trigger for streak updates
create trigger update_streak_trigger
after insert on public.posts
for each row execute function public.update_streak();

-- Function to check and reset broken streaks (run daily)
create or replace function public.check_broken_streaks()
returns void as $$
begin
  update public.users
  set current_streak = 0
  where last_post_date < current_date - interval '1 day'
    and current_streak > 0;
end;
$$ language plpgsql security definer;

-- Enable Row Level Security
alter table public.users enable row level security;
alter table public.projects enable row level security;
alter table public.posts enable row level security;
alter table public.hashtags enable row level security;
alter table public.posts_hashtags enable row level security;
alter table public.streak_history enable row level security;

-- Policies
create policy "Users can read all users"
  on public.users for select
  using (true);

create policy "Users can update their own profile"
  on public.users for update
  using (auth.uid() = id);

create policy "Users can insert their own profile"
  on public.users for insert
  with check (auth.uid() = id);

create policy "Users can read all posts"
  on public.posts for select
  using (true);

create policy "Users can insert their own posts"
  on public.posts for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own posts"
  on public.posts for update
  using (auth.uid() = user_id);

create policy "Users can delete their own posts"
  on public.posts for delete
  using (auth.uid() = user_id);

create policy "Users can read all streak history"
  on public.streak_history for select
  using (true);

create policy "System can insert streak history"
  on public.streak_history for insert
  with check (auth.uid() = user_id);

-- Create indexes
create index streak_history_user_id_idx on public.streak_history(user_id);
create index streak_history_date_idx on public.streak_history(streak_date);
create index posts_user_id_idx on public.posts(user_id);
create index posts_project_id_idx on public.posts(project_id);
create index posts_created_at_idx on public.posts(created_at desc);
create index hashtags_name_idx on public.hashtags(name);
```

4. In Supabase dashboard:
   - Go to Authentication -> URL Configuration
   - Add `http://localhost:5174` to the Site URL and Redirect URLs

5. Get your Supabase credentials:
   - Go to Project Settings -> API
   - Copy the Project URL and anon key

### 3. Environment Setup
1. Create a `.env.local` file in the project root
2. Add your Supabase credentials:
```
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Run the Project
```bash
npm run dev
```

The app should now be running at http://localhost:5174

## Testing
1. Create an account using email/password
2. Try creating a post
3. Check if your streak info appears
4. Verify posts appear in the feed

## Common Issues & Solutions
- If you see 406 errors, check your RLS policies in Supabase
- If TypeScript errors appear, try running `npm install` again
- If authentication doesn't work, verify your Supabase URL configuration

## Dependencies
```json
{
  "@supabase/auth-ui-react": "latest",
  "@supabase/auth-ui-shared": "latest",
  "@supabase/supabase-js": "latest",
  "react": "latest",
  "react-dom": "latest",
  "lucide-react": "latest"
}
```

Note: An AI assistant can use this document to help you with setup. Just share this document with the AI and ask for help with any specific step.
