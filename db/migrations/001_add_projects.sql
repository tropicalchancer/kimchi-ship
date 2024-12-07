-- Create projects table
create table if not exists public.projects (
    id uuid default uuid_generate_v4() primary key,
    name text not null,
    description text,
    user_id uuid references auth.users(id) not null,
    created_at timestamp with time zone default timezone('utc'::text, now()),
    updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- Add project_id to posts
alter table public.posts 
add column if not exists project_id uuid references public.projects(id);

-- Enable RLS
alter table public.projects enable row level security;

-- Policies
create policy "Projects are viewable by everyone"
    on public.projects
    for select
    using (true);

create policy "Authenticated users can create projects"
    on public.projects
    for insert
    with check (auth.uid() = user_id);

create policy "Users can update their own projects"
    on public.projects
    for update
    using (auth.uid() = user_id)
    with check (auth.uid() = user_id);

create policy "Users can delete their own projects"
    on public.projects
    for delete
    using (auth.uid() = user_id);

-- Indexes
create index if not exists projects_created_at_idx 
    on public.projects(created_at);

create index if not exists projects_user_id_idx 
    on public.projects(user_id);

create index if not exists posts_project_id_idx 
    on public.posts(project_id);