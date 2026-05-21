create table if not exists public.support_contracts (
  id uuid primary key default gen_random_uuid(),
  client_id uuid not null references public.clients(id) on delete cascade,
  project_id uuid not null references public.projects(id) on delete cascade,
  name text not null,
  start_date date,
  end_date date,
  status text not null default 'Active' check (status in ('Active', 'Expired', 'Suspended', 'Pending Renewal')),
  monthly_support_fee numeric(12,2) not null default 0,
  included_hours_per_month numeric(10,2) not null default 0,
  hours_rollover boolean not null default false,
  max_accumulated_hours numeric(10,2) not null default 0,
  extra_hour_rate numeric(12,2) not null default 0,
  approval_required_for_extra_hours boolean not null default true,
  critical_response_hours numeric(10,2) not null default 0,
  normal_response_hours numeric(10,2) not null default 0,
  low_response_hours numeric(10,2) not null default 0,
  included_scope text[] not null default '{}',
  excluded_scope text[] not null default '{}',
  project_manager_id uuid references public.team_members(id) on delete set null,
  support_engineer_id uuid references public.team_members(id) on delete set null,
  developer_id uuid references public.team_members(id) on delete set null,
  designer_id uuid references public.team_members(id) on delete set null,
  renewal_reminder_days integer not null default 30,
  auto_renewal boolean not null default false,
  internal_notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.support_work_logs (
  id uuid primary key default gen_random_uuid(),
  support_contract_id uuid not null references public.support_contracts(id) on delete cascade,
  title text not null,
  description text,
  team_member_id uuid references public.team_members(id) on delete set null,
  work_date date,
  time_spent_hours numeric(10,2) not null default 0,
  priority text not null default 'Normal' check (priority in ('Critical', 'Normal', 'Low')),
  status text not null default 'Open' check (status in ('Open', 'In Progress', 'Completed', 'Closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists support_contracts_client_id_idx on public.support_contracts(client_id);
create index if not exists support_contracts_project_id_idx on public.support_contracts(project_id);
create index if not exists support_contracts_status_idx on public.support_contracts(status);
create index if not exists support_work_logs_contract_id_idx on public.support_work_logs(support_contract_id);
create index if not exists support_work_logs_team_member_id_idx on public.support_work_logs(team_member_id);

alter table public.support_contracts enable row level security;
alter table public.support_work_logs enable row level security;

grant select, insert, update, delete on table public.support_contracts to authenticated;
grant select, insert, update, delete on table public.support_work_logs to authenticated;

create policy "Authenticated users can manage support contracts"
  on public.support_contracts
  for all
  to authenticated
  using (true)
  with check (true);

create policy "Authenticated users can manage support work logs"
  on public.support_work_logs
  for all
  to authenticated
  using (true)
  with check (true);
