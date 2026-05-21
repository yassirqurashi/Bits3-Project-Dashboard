alter table public.support_work_logs
  add column if not exists approval_status text not null default 'Pending'
    check (approval_status in ('Pending', 'Approved')),
  add column if not exists approved_at timestamptz;

create index if not exists support_work_logs_approval_status_idx
  on public.support_work_logs(approval_status);
