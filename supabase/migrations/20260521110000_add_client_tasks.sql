create table if not exists public.client_tasks (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  project_id uuid references public.projects(id) on delete set null,
  title text not null,
  creation_date date,
  due_date date,
  status text not null default 'Not Started' check (status in ('Not Started', 'In Progress', 'Completed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists client_tasks_client_id_idx on public.client_tasks(client_id);
create index if not exists client_tasks_project_id_idx on public.client_tasks(project_id);
create index if not exists client_tasks_status_idx on public.client_tasks(status);

alter table public.client_tasks enable row level security;

grant select, insert, update, delete on table public.client_tasks to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'client_tasks'
      and policyname = 'Authenticated users can manage client tasks'
  ) then
    create policy "Authenticated users can manage client tasks"
      on public.client_tasks
      for all
      to authenticated
      using (true)
      with check (true);
  end if;
end $$;
