alter table public.support_contracts
  add column if not exists duration_days integer not null default 30,
  add column if not exists critical_response_definition text,
  add column if not exists normal_response_definition text,
  add column if not exists low_response_definition text;

create table if not exists public.support_contract_renewals (
  id uuid primary key default gen_random_uuid(),
  support_contract_id uuid not null references public.support_contracts(id) on delete cascade,
  renewal_date timestamptz not null default now(),
  duration_days integer not null default 30,
  notes text,
  created_at timestamptz not null default now()
);

create index if not exists support_contract_renewals_contract_id_idx
  on public.support_contract_renewals(support_contract_id);

alter table public.support_contract_renewals enable row level security;

grant select, insert, update, delete on table public.support_contract_renewals to authenticated;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'support_contract_renewals'
      and policyname = 'Authenticated users can manage support contract renewals'
  ) then
    create policy "Authenticated users can manage support contract renewals"
      on public.support_contract_renewals
      for all
      to authenticated
      using (true)
      with check (true);
  end if;
end $$;
