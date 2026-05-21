alter table public.support_work_logs
  add column if not exists charge_per_hour numeric(12,2) not null default 0;
