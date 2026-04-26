-- Correr esto en el SQL Editor de Supabase
-- Si ya corriste el SQL anterior, podés correr solo desde "-- NUEVO" para abajo

create table if not exists public.links (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  url text not null,
  title text not null default '',
  source_type text not null default 'web',
  space text not null default 'other',
  tags text[] default '{}',
  read boolean default false,
  created_at timestamptz default now()
);

alter table public.links enable row level security;

do $$ begin
  if not exists (select 1 from pg_policies where tablename='links' and policyname='Users can view own links') then
    create policy "Users can view own links" on public.links for select using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='links' and policyname='Users can insert own links') then
    create policy "Users can insert own links" on public.links for insert with check (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='links' and policyname='Users can update own links') then
    create policy "Users can update own links" on public.links for update using (auth.uid() = user_id);
  end if;
  if not exists (select 1 from pg_policies where tablename='links' and policyname='Users can delete own links') then
    create policy "Users can delete own links" on public.links for delete using (auth.uid() = user_id);
  end if;
end $$;

-- NUEVO: espacios personalizados
create table if not exists public.custom_spaces (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  emoji text default '📁',
  created_at timestamptz default now()
);

alter table public.custom_spaces enable row level security;

create policy "Users can manage own spaces" on public.custom_spaces for all using (auth.uid() = user_id);

-- NUEVO: tableros de cliente compartibles
create table if not exists public.client_boards (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  name text not null,
  description text default '',
  share_token text unique default encode(gen_random_bytes(16), 'hex'),
  created_at timestamptz default now()
);

alter table public.client_boards enable row level security;

create policy "Users can manage own boards" on public.client_boards for all using (auth.uid() = user_id);
create policy "Anyone can view shared board by token" on public.client_boards for select using (true);

-- NUEVO: links dentro de tableros de cliente
create table if not exists public.board_links (
  id uuid default gen_random_uuid() primary key,
  board_id uuid references public.client_boards(id) on delete cascade not null,
  user_id uuid references auth.users(id) on delete cascade not null,
  url text not null,
  title text not null default '',
  category text default 'General',
  source_type text default 'web',
  created_at timestamptz default now()
);

alter table public.board_links enable row level security;

create policy "Users can manage own board links" on public.board_links for all using (auth.uid() = user_id);
create policy "Anyone can view board links" on public.board_links for select using (true);
