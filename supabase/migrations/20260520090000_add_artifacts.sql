create table if not exists public.artifacts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  description text,
  creation_date date,
  file_url text not null,
  file_name text,
  approval_status text not null default 'Pending Approval'
    check (approval_status in ('Pending Approval', 'Approved')),
  approved_at timestamptz,
  approved_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists artifacts_client_id_idx on public.artifacts(client_id);
create index if not exists artifacts_project_id_idx on public.artifacts(project_id);
create index if not exists artifacts_approval_status_idx on public.artifacts(approval_status);

alter table public.artifacts enable row level security;

grant select, insert, update, delete on public.artifacts to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'artifacts'
      and policyname = 'Authenticated users can manage artifacts'
  ) then
    create policy "Authenticated users can manage artifacts"
      on public.artifacts
      for all
      to authenticated
      using (true)
      with check (true);
  end if;
end $$;

insert into storage.buckets (id, name, public)
values ('artifacts', 'artifacts', true)
on conflict (id) do update set public = true;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Authenticated users can read artifacts'
  ) then
    create policy "Authenticated users can read artifacts"
      on storage.objects
      for select
      to authenticated
      using (bucket_id = 'artifacts');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Authenticated users can upload artifacts'
  ) then
    create policy "Authenticated users can upload artifacts"
      on storage.objects
      for insert
      to authenticated
      with check (bucket_id = 'artifacts');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Authenticated users can update artifacts'
  ) then
    create policy "Authenticated users can update artifacts"
      on storage.objects
      for update
      to authenticated
      using (bucket_id = 'artifacts')
      with check (bucket_id = 'artifacts');
  end if;

  if not exists (
    select 1 from pg_policies
    where schemaname = 'storage'
      and tablename = 'objects'
      and policyname = 'Authenticated users can delete artifacts'
  ) then
    create policy "Authenticated users can delete artifacts"
      on storage.objects
      for delete
      to authenticated
      using (bucket_id = 'artifacts');
  end if;
end $$;
