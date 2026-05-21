alter table public.support_work_logs
  drop constraint if exists support_work_logs_approval_status_check;

alter table public.support_work_logs
  add constraint support_work_logs_approval_status_check
  check (approval_status in ('Pending', 'Approved', 'Rejected'));
