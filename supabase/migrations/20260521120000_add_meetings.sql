create table if not exists public.meetings (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  meeting_date date not null,
  meeting_time time not null,
  moms text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists meetings_client_id_idx on public.meetings(client_id);
create index if not exists meetings_project_id_idx on public.meetings(project_id);
create index if not exists meetings_meeting_date_idx on public.meetings(meeting_date);

alter table public.meetings enable row level security;

grant select, insert, update, delete on table public.meetings to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'meetings'
      and policyname = 'Authenticated users can manage meetings'
  ) then
    create policy "Authenticated users can manage meetings"
      on public.meetings
      for all
      to authenticated
      using (true)
      with check (true);
  end if;
end $$;
