-- Execute this entire file in your Supabase SQL Editor

-- 1. Enable extensions
create extension if not exists "uuid-ossp";

-- 2. Create tables
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  email text,
  xp integer default 0,
  streak integer default 0,
  last_active_date date,
  created_at timestamptz default now()
);

create table public.tasks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  steps jsonb default '[]'::jsonb,
  completed boolean default false,
  completed_at timestamptz,
  xp_value integer default 10,
  created_at timestamptz default now()
);

create table public.mood_logs (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  mood_level integer not null check (mood_level between 1 and 5),
  note text,
  date date default current_date,
  created_at timestamptz default now()
);

-- 3. Enable RLS
alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.mood_logs enable row level security;

-- 4. Create RLS Policies
create policy "Users can view own profile" 
on public.profiles for select 
using (auth.uid() = id);

create policy "Users can update own profile" 
on public.profiles for update 
using (auth.uid() = id);

create policy "Users can CRUD own tasks" 
on public.tasks for all 
using (auth.uid() = user_id);

create policy "Users can CRUD own mood logs" 
on public.mood_logs for all 
using (auth.uid() = user_id);

-- 5. Auto-profile trigger for auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$ language plpgsql security definer;

-- Drop trigger if it exists just in case
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Done!
