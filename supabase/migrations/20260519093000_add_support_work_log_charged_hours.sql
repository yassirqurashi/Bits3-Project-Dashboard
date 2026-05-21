alter table public.support_work_logs
  add column if not exists charged_hours numeric(10,2) not null default 0;
