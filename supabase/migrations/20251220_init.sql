-- Enable required extensions
create extension if not exists "pgcrypto";

-- Profiles table for plan and retention metadata
create table if not exists public.profiles (
  id uuid primary key references auth.users on delete cascade,
  plan text not null default 'free',
  max_graphs integer not null default 20,
  retention_days integer not null default 365,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Graphs table
create table if not exists public.graphs (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references auth.users on delete cascade,
  title text not null default 'Untitled Graph',
  data jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  expires_at timestamptz
);

-- Share links table
create table if not exists public.share_links (
  id uuid primary key default gen_random_uuid(),
  graph_id uuid not null references public.graphs on delete cascade,
  token uuid not null default gen_random_uuid(),
  created_by uuid not null default auth.uid() references auth.users on delete cascade,
  created_at timestamptz not null default now(),
  expires_at timestamptz not null default (now() + interval '7 days')
);

create unique index if not exists share_links_token_idx on public.share_links (token);

-- Updated-at trigger
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists set_graphs_updated_at on public.graphs;
create trigger set_graphs_updated_at
before update on public.graphs
for each row execute procedure public.set_updated_at();

drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
before update on public.profiles
for each row execute procedure public.set_updated_at();

-- Expiry defaults on insert
create or replace function public.set_graph_expiry()
returns trigger
language plpgsql
as $$
begin
  if new.expires_at is null then
    new.expires_at = now() + interval '1 year';
  end if;
  return new;
end;
$$;

drop trigger if exists set_graphs_expiry on public.graphs;
create trigger set_graphs_expiry
before insert on public.graphs
for each row execute procedure public.set_graph_expiry();

-- Quota enforcement helper
create or replace function public.can_create_graph(user_id uuid)
returns boolean
language sql
stable
as $$
  select count(*) < coalesce((select max_graphs from public.profiles where id = user_id), 20)
  from public.graphs
  where owner_id = user_id;
$$;

-- RLS
alter table public.profiles enable row level security;
alter table public.graphs enable row level security;
alter table public.share_links enable row level security;

drop policy if exists "Profiles are self-viewable" on public.profiles;
create policy "Profiles are self-viewable"
  on public.profiles for select
  using (auth.uid() = id);

drop policy if exists "Profiles are self-editable" on public.profiles;
create policy "Profiles are self-editable"
  on public.profiles for update
  using (auth.uid() = id);

drop policy if exists "Profiles can be created" on public.profiles;
create policy "Profiles can be created"
  on public.profiles for insert
  with check (auth.uid() = id);

drop policy if exists "Graphs are owner-only" on public.graphs;
create policy "Graphs are owner-only"
  on public.graphs for select
  using (auth.uid() = owner_id);

drop policy if exists "Graphs insert under quota" on public.graphs;
create policy "Graphs insert under quota"
  on public.graphs for insert
  with check (auth.uid() = owner_id and public.can_create_graph(auth.uid()));

drop policy if exists "Graphs update by owner" on public.graphs;
create policy "Graphs update by owner"
  on public.graphs for update
  using (auth.uid() = owner_id);

drop policy if exists "Graphs delete by owner" on public.graphs;
create policy "Graphs delete by owner"
  on public.graphs for delete
  using (auth.uid() = owner_id);

drop policy if exists "Share links owner access" on public.share_links;
create policy "Share links owner access"
  on public.share_links for select
  using (auth.uid() = created_by);

drop policy if exists "Share links insert by owner" on public.share_links;
create policy "Share links insert by owner"
  on public.share_links for insert
  with check (auth.uid() = created_by);

drop policy if exists "Share links delete by owner" on public.share_links;
create policy "Share links delete by owner"
  on public.share_links for delete
  using (auth.uid() = created_by);

-- RPC to fetch shared graph data
create or replace function public.get_shared_graph(share_token uuid)
returns table (
  id uuid,
  title text,
  data jsonb,
  updated_at timestamptz
)
language sql
security definer
set search_path = public
as $$
  select g.id, g.title, g.data, g.updated_at
  from public.share_links s
  join public.graphs g on g.id = s.graph_id
  where s.token = share_token
    and s.expires_at > now();
$$;

grant execute on function public.get_shared_graph(uuid) to anon, authenticated;
