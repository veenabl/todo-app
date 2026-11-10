-- Run this in Supabase → SQL Editor → New query

create table if not exists public.todos (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade default auth.uid(),
  title       text not null check (char_length(title) between 1 and 500),
  is_complete boolean not null default false,
  created_at  timestamptz not null default now()
);

create index if not exists todos_user_id_idx on public.todos (user_id, created_at desc);

-- Row Level Security: each user can only see and change their own todos
alter table public.todos enable row level security;

drop policy if exists "Users read own todos"   on public.todos;
drop policy if exists "Users insert own todos" on public.todos;
drop policy if exists "Users update own todos" on public.todos;
drop policy if exists "Users delete own todos" on public.todos;

create policy "Users read own todos"   on public.todos for select using (auth.uid() = user_id);
create policy "Users insert own todos" on public.todos for insert with check (auth.uid() = user_id);
create policy "Users update own todos" on public.todos for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "Users delete own todos" on public.todos for delete using (auth.uid() = user_id);
