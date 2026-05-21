export type Deliverable = {
  id: string
  milestone_id: string
  title: string
  description: string | null
  status: 'pending' | 'in_progress' | 'completed' | 'delayed'
  due_date: string | null
  created_at: string
}

export type SupportContractStatus = 'Active' | 'Expired' | 'Suspended' | 'Pending Renewal'

export type SupportWorkLogPriority = 'Critical' | 'Normal' | 'Low'

export type SupportWorkLogStatus = 'Open' | 'In Progress' | 'Completed' | 'Closed'

export type SupportWorkLogApprovalStatus = 'Pending' | 'Approved' | 'Rejected'

export type SupportContract = {
  id: string
  client_id: string
  project_id: string
  name: string
  start_date: string | null
  end_date: string | null
  duration_days: number
  status: SupportContractStatus
  monthly_support_fee: number
  included_hours_per_month: number
  hours_rollover: boolean
  max_accumulated_hours: number
  extra_hour_rate: number
  approval_required_for_extra_hours: boolean
  critical_response_hours: number
  normal_response_hours: number
  low_response_hours: number
  critical_response_definition: string | null
  normal_response_definition: string | null
  low_response_definition: string | null
  included_scope: string[]
  excluded_scope: string[]
  project_manager_id: string | null
  support_engineer_id: string | null
  developer_id: string | null
  designer_id: string | null
  renewal_reminder_days: number
  auto_renewal: boolean
  internal_notes: string | null
  created_at: string
  updated_at: string
  client_approval_status: 'Pending' | 'Approved'
  client_approved_at: string | null
  client_approved_by: string | null
}

export type SupportContractRenewal = {
  id: string
  support_contract_id: string
  renewal_date: string
  duration_days: number
  notes: string | null
  created_at: string
}

export type SupportWorkLog = {
  id: string
  support_contract_id: string
  title: string
  description: string | null
  team_member_id: string | null
  work_date: string | null
  time_spent_hours: number
  charged_hours: number
  charge_per_hour: number
  priority: SupportWorkLogPriority
  status: SupportWorkLogStatus
  approval_status: SupportWorkLogApprovalStatus
  approved_at: string | null
  created_at: string
  updated_at: string
}

export type ArtifactApprovalStatus = 'Pending Approval' | 'Approved'

export type Artifact = {
  id: string
  client_id: string
  project_id: string
  name: string
  description: string | null
  creation_date: string | null
  file_url: string
  file_name: string | null
  approval_status: ArtifactApprovalStatus
  approved_at: string | null
  approved_by: string | null
  created_at: string
  updated_at: string
}

export type ClientTaskStatus = 'Not Started' | 'In Progress' | 'Completed'

export type ClientTask = {
  id: string
  client_id: string
  project_id: string | null
  title: string
  creation_date: string | null
  due_date: string | null
  status: ClientTaskStatus
  created_at: string
  updated_at: string
}

export type Meeting = {
  id: string
  client_id: string
  project_id: string
  meeting_date: string
  meeting_time: string
  moms: string
  created_at: string
  updated_at: string
}
