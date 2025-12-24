-- Allow share RPC to bypass RLS while still enforcing token + expiry checks
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
set row_security = off
as $$
  select g.id, g.title, g.data, g.updated_at
  from public.share_links s
  join public.graphs g on g.id = s.graph_id
  where s.token = share_token
    and s.expires_at > now();
$$;

grant execute on function public.get_shared_graph(uuid) to anon, authenticated;
