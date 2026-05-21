alter table public.support_contracts
  add column if not exists client_approval_status text not null default 'Approved'
    check (client_approval_status in ('Pending', 'Approved')),
  add column if not exists client_approved_at timestamptz,
  add column if not exists client_approved_by uuid references auth.users(id) on delete set null;

create index if not exists support_contracts_client_approval_status_idx
  on public.support_contracts(client_approval_status);
