'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { Artifact, ClientTask, ClientTaskStatus, Meeting, SupportContract, SupportContractRenewal, SupportWorkLog } from '../../lib/types'

// ─── Inline SVG Icons ────────────────────────────────────────────────────────
const Icons = {
  logout: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/>
    </svg>
  ),
  back: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
    </svg>
  ),
  plus: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
      <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
    </svg>
  ),
  client: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  ),
  project: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  milestone: (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
    </svg>
  ),
  deliverable: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
    </svg>
  ),
  folder: (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  upload: (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/>
    </svg>
  ),
  meeting: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="17" rx="3"/><path d="M8 2v4M16 2v4M3 10h18"/><path d="M8 15h4M8 18h8"/>
    </svg>
  ),
  chevronRight: (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6"/>
    </svg>
  ),
}

type ClientCard = {
  id: string
}

const PROJECT_VALUE_PAYMENT_TERM = '__PROJECT_VALUE__'

type DashboardSection = 'projects' | 'clients' | 'teams' | 'requests' | 'support' | 'artifacts' | 'client-tasks' | 'meetings'

type SupportContractForm = {
  client_id: string
  project_id: string
  name: string
  start_date: string
  end_date: string
  duration_days: string
  status: string
  monthly_support_fee: string
  included_hours_per_month: string
  hours_rollover: boolean
  max_accumulated_hours: string
  extra_hour_rate: string
  approval_required_for_extra_hours: boolean
  critical_response_hours: string
  normal_response_hours: string
  low_response_hours: string
  critical_response_definition: string
  normal_response_definition: string
  low_response_definition: string
  included_scope: string[]
  excluded_scope: string[]
  project_manager_id: string
  support_engineer_id: string
  developer_id: string
  designer_id: string
  renewal_reminder_days: string
  auto_renewal: boolean
  internal_notes: string
}

type SupportWorkLogForm = {
  title: string
  description: string
  team_member_id: string
  work_date: string
  time_spent_hours: string
  charged_hours: string
  charge_per_hour: string
  priority: string
  status: string
}

type ClientTaskForm = {
  client_id: string
  project_id: string
  title: string
  creation_date: string
  due_date: string
  status: ClientTaskStatus
}

type MeetingForm = {
  client_id: string
  project_id: string
  meeting_date: string
  meeting_time: string
  moms: string
}

const supportIncludedScopeOptions = [
  'Bug fixes',
  'App maintenance',
  'Server monitoring',
  'Others',
]

const emptySupportContractForm: SupportContractForm = {
  client_id: '',
  project_id: '',
  name: '',
  start_date: '',
  end_date: '',
  duration_days: '30',
  status: 'Active',
  monthly_support_fee: '',
  included_hours_per_month: '',
  hours_rollover: false,
  max_accumulated_hours: '',
  extra_hour_rate: '',
  approval_required_for_extra_hours: true,
  critical_response_hours: '',
  normal_response_hours: '',
  low_response_hours: '',
  critical_response_definition: '',
  normal_response_definition: '',
  low_response_definition: '',
  included_scope: [],
  excluded_scope: [],
  project_manager_id: '',
  support_engineer_id: '',
  developer_id: '',
  designer_id: '',
  renewal_reminder_days: '30',
  auto_renewal: false,
  internal_notes: '',
}

const emptySupportWorkLogForm: SupportWorkLogForm = {
  title: '',
  description: '',
  team_member_id: '',
  work_date: new Date().toISOString().slice(0, 10),
  time_spent_hours: '',
  charged_hours: '',
  charge_per_hour: '',
  priority: 'Normal',
  status: 'Open',
}

const emptyClientTaskForm: ClientTaskForm = {
  client_id: '',
  project_id: '',
  title: '',
  creation_date: new Date().toISOString().slice(0, 10),
  due_date: '',
  status: 'Not Started',
}

const emptyMeetingForm: MeetingForm = {
  client_id: '',
  project_id: '',
  meeting_date: new Date().toISOString().slice(0, 10),
  meeting_time: '',
  moms: '',
}

const getNaturalOrderKey = (item: any) => {
  const createdTime = Date.parse(item.created_at || '')
  return Number.isNaN(createdTime) ? 0 : createdTime
}

const sortDeliverables = (items: any[]) => [...items].sort((a, b) => {
  const createdDiff = getNaturalOrderKey(a) - getNaturalOrderKey(b)
  if (createdDiff !== 0) return createdDiff
  return String(a.title || a.id || '').localeCompare(String(b.title || b.id || ''))
})

const getInitialDashboardSection = (): DashboardSection => {
  if (typeof window === 'undefined') return 'projects'

  const section = new URLSearchParams(window.location.search).get('section')
  if (section === 'clients' || section === 'teams' || section === 'requests' || section === 'projects' || section === 'support' || section === 'artifacts' || section === 'client-tasks' || section === 'meetings') {
    return section
  }

  return 'projects'
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --black: #111827;
    --white: #ffffff;
    --gray-50: #f8f7ff;
    --gray-100: #f0eefb;
    --gray-200: #e6e2f5;
    --gray-400: #9ca3af;
    --gray-600: #6b7280;
    --gray-800: #1f2937;
    --accent: #6d5dfc;
    --accent-2: #8b5cf6;
    --accent-light: #eeeaff;
    --success: #059669;
    --danger: #dc2626;
    --warning: #d97706;
    --radius: 14px;
    --radius-lg: 20px;
    --shadow-sm: 0 8px 24px rgba(45, 35, 120, 0.06);
    --shadow-md: 0 18px 45px rgba(45, 35, 120, 0.12);
    --shadow-lg: 0 28px 70px rgba(45, 35, 120, 0.16);
    --transition: 0.2s ease;
  }

  .pm-root {
    font-family: 'Inter', sans-serif;
    background:
      radial-gradient(circle at 18% 8%, rgba(109, 93, 252, 0.14), transparent 28%),
      radial-gradient(circle at 88% 0%, rgba(139, 92, 246, 0.14), transparent 26%),
      #f7f6fd;
    min-height: 100vh;
    color: var(--black);
    -webkit-font-smoothing: antialiased;
  }

  .pm-layout { display: flex; min-height: 100vh; }

  .pm-sidebar {
    width: 250px;
    background: rgba(255,255,255,0.82);
    backdrop-filter: blur(18px);
    border-right: 1px solid rgba(230,226,245,0.9);
    display: flex;
    flex-direction: column;
    position: fixed;
    top: 0; left: 0; bottom: 0;
    z-index: 100;
    box-shadow: 10px 0 35px rgba(45,35,120,0.05);
  }

  .pm-logo {
    padding: 22px 20px;
    border-bottom: 1px solid var(--gray-200);
  }

  .pm-logo-title {
    font-size: 20px;
    font-weight: 800;
    color: #15113b;
    letter-spacing: -0.04em;
    line-height: 1.1;
    display: flex;
    align-items: center;
    gap: 10px;
  }
  .pm-logo-title::before {
    content: '';
    width: 36px; height: 36px;
    border-radius: 12px;
    background: linear-gradient(135deg, var(--accent), var(--accent-2));
    box-shadow: 0 12px 28px rgba(109,93,252,0.28);
  }
  .pm-logo-sub { font-size: 11px; color: var(--gray-600); margin-top: 8px; padding-left: 46px; }

  .pm-nav { flex: 1; padding: 18px 12px; }
  .pm-nav-label { font-size: 10px; letter-spacing: 0.16em; text-transform: uppercase; color: #a4a0b8; padding: 0 14px; margin: 18px 0 8px; font-weight: 700; }
  .pm-nav-label:first-child { margin-top: 0; }
  .pm-nav-btn {
    width: 100%; display: flex; align-items: center; gap: 12px;
    padding: 12px 14px; background: transparent; border: none; border-radius: 14px;
    color: #6d6883; font-family: 'Inter', sans-serif; font-size: 14px; font-weight: 600;
    cursor: pointer; transition: all var(--transition); text-align: left;
  }
  .pm-nav-btn:hover { background: #f3f0ff; color: var(--accent); }
  .pm-nav-btn.active { background: linear-gradient(135deg, rgba(109,93,252,0.13), rgba(139,92,246,0.1)); color: var(--accent); box-shadow: inset 3px 0 0 var(--accent); }
  .pm-nav-btn .icon { opacity: 0.88; flex-shrink: 0; }

  .pm-sidebar-footer { padding: 16px 12px; border-top: 1px solid var(--gray-200); }
  .pm-logout-btn {
    width: 100%; display: flex; align-items: center; gap: 10px; padding: 12px 14px;
    background: #fff; border: 1px solid var(--gray-200); border-radius: 14px; color: #7f1d1d;
    font-family: 'Inter', sans-serif; font-size: 13px; font-weight: 600; cursor: pointer; transition: all var(--transition);
  }
  .pm-logout-btn:hover { border-color: #fecaca; background: #fff1f2; }

  .pm-main { margin-left: 250px; flex: 1; display: flex; flex-direction: column; }
  .pm-topbar {
    background: rgba(255,255,255,0.74); backdrop-filter: blur(18px); border-bottom: 1px solid rgba(230,226,245,0.8);
    padding: 0 28px; height: 72px; display: flex; align-items: center; justify-content: space-between;
    position: sticky; top: 0; z-index: 50;
  }
  .pm-topbar-left { display: flex; align-items: center; gap: 10px; }
  .pm-topbar-title { font-size: 20px; font-weight: 800; color: #15113b; letter-spacing: -0.03em; }
  .pm-breadcrumb { color: #8d89a6; font-size: 13px; font-weight: 600; }
  .pm-topbar-actions { display: flex; align-items: center; gap: 12px; }
  .pm-search { width: 340px; border: 1px solid transparent; background: #f3f1fb; border-radius: 16px; padding: 12px 16px; color: #6b7280; outline: none; font-size: 13px; }
  .pm-search:focus { border-color: rgba(109,93,252,0.28); background: #fff; box-shadow: 0 0 0 4px rgba(109,93,252,0.08); }
  .pm-topbar-badge { background: linear-gradient(135deg, var(--accent), var(--accent-2)); color: #fff; font-size: 12px; font-weight: 700; padding: 9px 13px; border-radius: 14px; box-shadow: 0 12px 24px rgba(109,93,252,0.22); }
  .pm-content { padding: 28px; flex: 1; }

  .pm-hero-banner {
    display: flex; align-items: center; justify-content: space-between; gap: 18px;
    color: #fff; border-radius: 22px; padding: 22px 24px; margin-bottom: 22px;
    background: linear-gradient(135deg, #5b4df1 0%, #7338e7 52%, #8b5cf6 100%);
    box-shadow: var(--shadow-lg); position: relative; overflow: hidden;
  }
  .pm-hero-banner::after { content: ''; position: absolute; width: 360px; height: 360px; right: -120px; top: -170px; background: rgba(255,255,255,0.11); border-radius: 50%; }
  .pm-hero-title { font-size: 18px; font-weight: 800; position: relative; z-index: 1; }
  .pm-hero-sub { font-size: 13px; opacity: 0.85; margin-top: 4px; position: relative; z-index: 1; }
  .pm-hero-pill { background: rgba(255,255,255,0.92); color: #4f46e5; padding: 10px 16px; border-radius: 14px; font-weight: 800; font-size: 13px; position: relative; z-index: 1; }

  .pm-stats-grid { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 16px; margin-bottom: 22px; }
  .pm-stat-card { background: rgba(255,255,255,0.86); border: 1px solid rgba(230,226,245,0.95); border-radius: 20px; padding: 20px; box-shadow: var(--shadow-sm); position: relative; overflow: hidden; }
  .pm-stat-card::after { content: ''; position: absolute; width: 92px; height: 92px; right: -25px; top: -25px; border-radius: 30px; background: rgba(109,93,252,0.09); transform: rotate(18deg); }
  .pm-stat-top { display: flex; align-items: center; justify-content: space-between; gap: 12px; margin-bottom: 10px; position: relative; z-index: 1; }
  .pm-stat-icon { width: 36px; height: 36px; border-radius: 14px; display: flex; align-items: center; justify-content: center; color: var(--accent); background: var(--accent-light); flex-shrink: 0; }
  .pm-stat-label { color: #6d6883; font-size: 12px; font-weight: 700; margin-bottom: 0; }
  .pm-stat-value { color: #15113b; font-size: 30px; font-weight: 800; letter-spacing: -0.05em; }
  .pm-stat-foot { color: var(--success); font-size: 12px; font-weight: 700; margin-top: 6px; }

  .pm-section { background: rgba(255,255,255,0.88); border: 1px solid rgba(230,226,245,0.95); border-radius: var(--radius-lg); margin-bottom: 20px; overflow: hidden; box-shadow: var(--shadow-sm); }
  .pm-section-header { display: flex; align-items: center; gap: 12px; padding: 18px 22px; border-bottom: 1px solid var(--gray-100); background: linear-gradient(180deg, #fff, #fbfaff); }
  .pm-section-icon { width: 38px; height: 38px; background: linear-gradient(135deg, var(--accent), var(--accent-2)); border-radius: 14px; display: flex; align-items: center; justify-content: center; color: #fff; flex-shrink: 0; box-shadow: 0 12px 24px rgba(109,93,252,0.22); }
  .pm-section-title { font-size: 15px; font-weight: 800; color: #15113b; }
  .pm-section-body { padding: 22px; }

  .pm-field { margin-bottom: 12px; }
  .pm-label { display: block; font-size: 11px; font-weight: 800; letter-spacing: 0.08em; text-transform: uppercase; color: #7c7694; margin-bottom: 7px; }
  .pm-input, .pm-select { width: 100%; padding: 12px 14px; border: 1px solid var(--gray-200); border-radius: 14px; font-family: 'Inter', sans-serif; font-size: 14px; color: var(--black); background: #fff; transition: all var(--transition); outline: none; }
  .pm-input:focus, .pm-select:focus { border-color: rgba(109,93,252,0.48); box-shadow: 0 0 0 4px rgba(109,93,252,0.10); }
  .pm-input::placeholder { color: #aaa5bb; }
  .pm-select { cursor: pointer; appearance: none; background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236d6883' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'/%3E%3C/svg%3E"); background-repeat: no-repeat; background-position: right 14px center; padding-right: 38px; }
  .pm-color-row { display: flex; gap: 12px; align-items: center; }
  .pm-color-field { display: flex; align-items: center; gap: 10px; flex: 1; padding: 10px 12px; border: 1px solid var(--gray-200); border-radius: 14px; background: #fff; }
  .pm-color-input { width: 30px; height: 30px; border: none; border-radius: 50%; padding: 0; cursor: pointer; background: none; overflow: hidden; }
  .pm-color-label { font-size: 12px; color: #6d6883; font-weight: 600; }
  .pm-file-upload { border: 1.5px dashed #cbc5ef; border-radius: 16px; padding: 20px; text-align: center; cursor: pointer; transition: all var(--transition); position: relative; background: #fbfaff; }
  .pm-file-upload:hover { border-color: var(--accent); background: #f5f2ff; }
  .pm-file-upload input[type="file"] { position: absolute; inset: 0; opacity: 0; cursor: pointer; width: 100%; height: 100%; }
  .pm-file-upload-text { font-size: 13px; color: #6d6883; margin-top: 7px; font-weight: 700; }
  .pm-file-upload-sub { font-size: 11px; color: #a4a0b8; margin-top: 3px; }

  .pm-btn { display: inline-flex; align-items: center; gap: 8px; padding: 12px 18px; border-radius: 14px; font-family: 'Inter', sans-serif; font-size: 13.5px; font-weight: 800; cursor: pointer; border: none; transition: all var(--transition); }
  .pm-btn-primary { background: linear-gradient(135deg, var(--accent), var(--accent-2)); color: #fff; box-shadow: 0 14px 30px rgba(109,93,252,0.23); }
  .pm-btn-primary:hover { transform: translateY(-1px); box-shadow: var(--shadow-md); }
  .pm-btn-outline { background: #fff; color: var(--accent); border: 1px solid #d8d2f7; }
  .pm-btn-outline:hover { border-color: var(--accent); background: #f5f2ff; }
  .pm-btn-sm { padding: 8px 14px; font-size: 12.5px; }
  .pm-form-row { display: flex; gap: 12px; align-items: flex-end; }
  .pm-form-row .pm-field { flex: 1; margin-bottom: 0; }

  .pm-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 16px; margin-top: 22px; }
  .pm-project-card { background: rgba(255,255,255,0.9); border: 1px solid var(--gray-200); border-radius: 20px; padding: 22px; cursor: pointer; transition: all var(--transition); position: relative; overflow: hidden; box-shadow: var(--shadow-sm); }
  .pm-project-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 5px; background: linear-gradient(90deg, var(--accent), var(--accent-2)); transform: scaleX(0); transform-origin: left; transition: transform var(--transition); }
  .pm-project-card:hover { border-color: #cbc5ef; box-shadow: var(--shadow-md); transform: translateY(-3px); }
  .pm-project-card:hover::before { transform: scaleX(1); }
  .pm-card-icon { color: var(--accent); margin-bottom: 16px; }
  .pm-card-name { font-size: 17px; font-weight: 800; color: #15113b; margin-bottom: 4px; letter-spacing: -0.02em; }
  .pm-card-client { font-size: 12.5px; color: #7c7694; margin-bottom: 16px; font-weight: 600; }
  .pm-card-meta { display: flex; align-items: center; justify-content: space-between; padding-top: 14px; border-top: 1px solid var(--gray-100); }
  .pm-card-stat { font-size: 12px; color: #6d6883; }
  .pm-card-stat strong { color: #15113b; font-weight: 800; }
  .pm-card-arrow { color: var(--accent); transition: transform var(--transition); }
  .pm-project-card:hover .pm-card-arrow { transform: translateX(4px); }

  .pm-back-btn { display: inline-flex; align-items: center; gap: 7px; font-size: 13px; color: var(--accent); background: #fff; border: 1px solid var(--gray-200); border-radius: 14px; cursor: pointer; padding: 10px 14px; margin-bottom: 20px; transition: all var(--transition); font-family: 'Inter', sans-serif; font-weight: 800; }
  .pm-back-btn:hover { background: #f5f2ff; border-color: #d8d2f7; }
  .pm-detail-header { display: flex; align-items: flex-start; justify-content: space-between; margin-bottom: 22px; }
  .pm-detail-title { font-size: 28px; font-weight: 800; color: #15113b; letter-spacing: -0.04em; }
  .pm-detail-client { font-size: 14px; color: #7c7694; margin-top: 5px; font-weight: 600; }

  .pm-milestone-card { background: rgba(255,255,255,0.9); border: 1px solid var(--gray-200); border-radius: 20px; margin-bottom: 14px; overflow: hidden; box-shadow: var(--shadow-sm); }
  .pm-milestone-header { display: flex; align-items: center; gap: 10px; padding: 16px 18px; border-bottom: 1px solid var(--gray-100); background: linear-gradient(180deg, #fff, #fbfaff); }
  .pm-milestone-icon { color: var(--accent); flex-shrink: 0; }
  .pm-milestone-title { font-weight: 800; font-size: 14px; color: #15113b; flex: 1; }
  .pm-milestone-body { padding: 16px 18px; }
  .pm-deliverable-item { display: flex; align-items: center; gap: 10px; padding: 11px 12px; background: #fbfaff; border-radius: 15px; margin-bottom: 8px; font-size: 13.5px; color: var(--gray-800); border: 1px solid var(--gray-100); }
  .pm-deliverable-item .del-icon { color: var(--accent); flex-shrink: 0; }
  .pm-inline-form { display: flex; gap: 8px; margin-top: 12px; }
  .pm-inline-form .pm-input { flex: 1; padding: 10px 12px; font-size: 13.5px; }

  .pm-empty { text-align: center; padding: 56px 24px; color: #a4a0b8; }
  .pm-empty-icon { opacity: 0.4; margin: 0 auto 12px; }
  .pm-empty-text { font-size: 14px; font-weight: 600; }
  .pm-divider { display: flex; align-items: center; gap: 12px; margin: 24px 0 20px; }
  .pm-divider-line { flex: 1; height: 1px; background: var(--gray-200); }
  .pm-divider-text { font-size: 10px; letter-spacing: 0.18em; text-transform: uppercase; color: #a4a0b8; font-weight: 800; }

  .pm-actions { display: flex; align-items: center; gap: 6px; margin-left: auto; flex-shrink: 0; }
  .pm-action-btn { border: 1px solid #ddd8f4; background: #fff; color: #6d6883; border-radius: 12px; padding: 7px 10px; font-family: 'Inter', sans-serif; font-size: 11.5px; font-weight: 800; cursor: pointer; transition: all var(--transition); }
  .pm-action-btn:hover { border-color: var(--accent); color: var(--accent); background: #f5f2ff; }
  .pm-action-btn.danger { color: var(--danger); border-color: #fecaca; }
  .pm-action-btn.danger:hover { background: #fff1f2; border-color: var(--danger); }
  .pm-upload-status { font-size: 12px; color: var(--success); margin-top: 8px; display: flex; align-items: center; gap: 6px; font-weight: 800; }

  .pm-client-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(310px, 1fr)); gap: 14px; }
  .pm-client-card { background: rgba(255,255,255,0.92); border: 1px solid rgba(230,226,245,0.95); border-radius: 18px; padding: 16px; display: grid; grid-template-columns: 46px minmax(0, 1fr); gap: 14px; align-items: center; box-shadow: var(--shadow-sm); min-height: 96px; overflow: hidden; }
  .pm-client-avatar, .pm-client-logo { width: 46px; height: 46px; border-radius: 14px; object-fit: cover; border: 1px solid rgba(230,226,245,0.95); flex-shrink: 0; }
  .pm-client-avatar { display: flex; align-items: center; justify-content: center; color: #fff; font-size: 17px; font-weight: 800; box-shadow: 0 12px 24px rgba(45,35,120,0.10); }
  .pm-client-info { min-width: 0; }
  .pm-client-top { display: flex; align-items: center; justify-content: space-between; gap: 10px; min-width: 0; }
  .pm-client-name { font-size: 14px; font-weight: 800; color: #15113b; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
  .pm-client-projects { font-size: 12px; color: #9a96ad; margin-top: 4px; font-weight: 600; }
  .pm-client-actions { display: flex; align-items: center; gap: 7px; flex-shrink: 0; }
  .pm-client-colors { display: flex; align-items: center; gap: 6px; margin-top: 12px; }
  .pm-color-dot { width: 13px; height: 13px; border-radius: 999px; border: 1px solid rgba(0,0,0,0.08); }

  .pm-progress-card { background: rgba(255,255,255,0.92); border: 1px solid rgba(230,226,245,0.95); border-radius: 20px; padding: 24px; margin-bottom: 24px; display: flex; align-items: center; gap: 28px; box-shadow: var(--shadow-sm); }
  .pm-gauge { width: 180px; height: 96px; position: relative; overflow: hidden; flex-shrink: 0; }
  .pm-gauge-track { position: absolute; inset: 0 0 auto 0; width: 180px; height: 180px; border-radius: 50%; background: conic-gradient(from 270deg, var(--accent) calc(var(--progress) * 1.8deg), #e6e4ee 0deg); }
  .pm-gauge-track::after { content: ''; position: absolute; left: 22px; top: 22px; width: 136px; height: 136px; border-radius: 50%; background: #fff; }
  .pm-progress-value { font-size: 36px; font-weight: 900; letter-spacing: -0.05em; line-height: 1; color: #15113b; font-family: 'Inter', sans-serif; }
  .pm-progress-label { font-size: 14px; color: #4f4a63; font-weight: 800; margin-top: 8px; }
  .pm-progress-sub { font-size: 12px; color: #9a96ad; margin-top: 6px; font-weight: 600; }
  .pm-support-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 14px; margin-bottom: 22px; }
  .pm-support-layout { display: grid; grid-template-columns: minmax(0, 1fr) 360px; gap: 18px; align-items: start; }
  .pm-support-form-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  .pm-support-form-grid.three { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .pm-support-checks { display: grid; grid-template-columns: repeat(auto-fit, minmax(210px, 1fr)); gap: 10px; }
  .pm-check-pill { display: flex; align-items: center; gap: 9px; padding: 11px 12px; background: #fbfaff; border: 1px solid var(--gray-200); border-radius: 14px; color: #4f4a63; font-size: 12.5px; font-weight: 800; cursor: pointer; }
  .pm-check-pill input { accent-color: var(--accent); }
  .pm-support-card { background: rgba(255,255,255,0.92); border: 1px solid rgba(230,226,245,0.95); border-radius: 20px; padding: 18px; box-shadow: var(--shadow-sm); cursor: pointer; transition: all var(--transition); }
  .pm-support-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); border-color: #cbc5ef; }
  .pm-support-card.active { border-color: var(--accent); box-shadow: 0 18px 45px rgba(109,93,252,0.14); }
  .pm-status-pill { display: inline-flex; align-items: center; border-radius: 999px; padding: 6px 9px; font-size: 11px; font-weight: 900; background: #f3f0ff; color: var(--accent); }
  .pm-status-pill.Active { background: #ecfdf5; color: #047857; }
  .pm-status-pill.Expired { background: #fff1f2; color: #be123c; }
  .pm-status-pill.Suspended { background: #fff7ed; color: #c2410c; }
  .pm-status-pill.Pending-Renewal { background: #eef2ff; color: #4338ca; }
  .pm-status-pill.Rejected { background: #fff1f2; color: #be123c; }
  .pm-status-pill.Approved { background: #ecfdf5; color: #047857; }
  .pm-status-pill.Pending { background: #fffbeb; color: #b45309; }
  .pm-status-pill.Not-Started { background: #f3f4f6; color: #4b5563; }
  .pm-status-pill.In-Progress { background: #eff6ff; color: #1d4ed8; }
  .pm-status-pill.Completed { background: #ecfdf5; color: #047857; }
  .pm-task-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 16px; }
  .pm-task-card { background: rgba(255,255,255,0.92); border: 1px solid rgba(230,230,240,0.9); border-radius: 18px; padding: 18px; box-shadow: 0 12px 34px rgba(80,65,180,0.07); display: grid; gap: 14px; min-width: 0; }
  .pm-task-card-top { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; min-width: 0; }
  .pm-task-title { font-size: 16px; font-weight: 900; color: #15113b; line-height: 1.25; overflow-wrap: anywhere; }
  .pm-task-meta { color: #6d6883; font-size: 13px; font-weight: 800; line-height: 1.45; margin-top: 6px; }
  .pm-task-date { color: #8a86a4; font-size: 12px; font-weight: 800; line-height: 1.45; }
  .pm-hours-bar { height: 8px; background: #eeeaf8; border-radius: 999px; overflow: hidden; margin-top: 10px; }
  .pm-hours-fill { height: 100%; border-radius: 999px; background: linear-gradient(135deg, var(--accent), var(--accent-2)); }
  .pm-work-log { padding: 14px; border: 1px solid var(--gray-200); border-radius: 16px; background: #fbfaff; display: grid; gap: 8px; margin-bottom: 10px; }

  @media (max-width: 980px) {
    .pm-sidebar { width: 82px; }
    .pm-logo-sub, .pm-nav-btn:not(.active) span + text { display: none; }
    .pm-main { margin-left: 82px; }
    .pm-search { display: none; }
    .pm-stats-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .pm-support-layout { grid-template-columns: 1fr; }
    .pm-support-form-grid, .pm-support-form-grid.three { grid-template-columns: 1fr; }
  }
  @media (max-width: 720px) {
    .pm-main { margin-left: 0; }
    .pm-sidebar { display: none; }
    .pm-content { padding: 18px; }
    .pm-form-row, .pm-color-row { flex-direction: column; align-items: stretch; }
    .pm-stats-grid { grid-template-columns: 1fr; }
    .pm-hero-banner { flex-direction: column; align-items: flex-start; }
  }
`

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [activeNav, setActiveNav] = useState<DashboardSection>(getInitialDashboardSection)
  const [projects, setProjects] = useState<any[]>([])
  const [clients, setClients] = useState<any[]>([])
  const [teamMembers, setTeamMembers] = useState<any[]>([])
  const [clientRequests, setClientRequests] = useState<any[]>([])
const [clientRequestMessages, setClientRequestMessages] = useState<any[]>([])

const [selectedRequest, setSelectedRequest] = useState<any | null>(null)

const [requestClientId, setRequestClientId] = useState('')
const [requestProjectId, setRequestProjectId] = useState('')
const [requestSubject, setRequestSubject] = useState('')
const [requestDescription, setRequestDescription] = useState('')
const [requestMessage, setRequestMessage] = useState('')
const [showRequestForm, setShowRequestForm] = useState(false)
const [requestFilter, setRequestFilter] = useState<'Open' | 'Closed'>('Open')
  const [projectTeamMembers, setProjectTeamMembers] = useState<any[]>([])
  const [selectedTeamMemberId, setSelectedTeamMemberId] = useState('')
  const [milestones, setMilestones] = useState<any[]>([])
  const [deliverables, setDeliverables] = useState<any[]>([])
  const [externalLinks, setExternalLinks] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [selectedProject, setSelectedProject] = useState<any | null>(null)
  const [supportContracts, setSupportContracts] = useState<SupportContract[]>([])
  const [supportWorkLogs, setSupportWorkLogs] = useState<SupportWorkLog[]>([])
  const [supportContractRenewals, setSupportContractRenewals] = useState<SupportContractRenewal[]>([])
  const [selectedSupportContract, setSelectedSupportContract] = useState<SupportContract | null>(null)
  const [editingSupportContract, setEditingSupportContract] = useState<SupportContract | null>(null)
  const [showSupportForm, setShowSupportForm] = useState(false)
  const [supportForm, setSupportForm] = useState<SupportContractForm>(emptySupportContractForm)
  const [supportWorkLogForm, setSupportWorkLogForm] = useState<SupportWorkLogForm>(emptySupportWorkLogForm)
  const [supportTodayTime] = useState(() => Date.now())
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
  const [artifactClientId, setArtifactClientId] = useState('')
  const [artifactProjectId, setArtifactProjectId] = useState('')
  const [artifactName, setArtifactName] = useState('')
  const [artifactDescription, setArtifactDescription] = useState('')
  const [artifactCreationDate, setArtifactCreationDate] = useState(() => new Date().toISOString().slice(0, 10))
  const [artifactFileUrl, setArtifactFileUrl] = useState('')
  const [artifactFileName, setArtifactFileName] = useState('')
  const [artifactUploading, setArtifactUploading] = useState(false)
  const [clientTasks, setClientTasks] = useState<ClientTask[]>([])
  const [clientTaskForm, setClientTaskForm] = useState<ClientTaskForm>(emptyClientTaskForm)
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [meetingForm, setMeetingForm] = useState<MeetingForm>(emptyMeetingForm)

  // CLIENT
  const [clientName, setClientName] = useState('')
  const [clientEmail, setClientEmail] = useState('')
  const [clientPassword, setClientPassword] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#0a0a0a')
  const [secondaryColor, setSecondaryColor] = useState('#c8a96e')
  const [uploadedFileName, setUploadedFileName] = useState('')
  const [teamName, setTeamName] = useState('')
  const [teamUsername, setTeamUsername] = useState('')
  const [teamPassword, setTeamPassword] = useState('')
  const [teamPictureUrl, setTeamPictureUrl] = useState('')
  const [teamUploadedFileName, setTeamUploadedFileName] = useState('')
  // PROJECT
  const [projectName, setProjectName] = useState('')
  const [projectClientId, setProjectClientId] = useState('')

  // MILESTONE
  const [milestoneTitle, setMilestoneTitle] = useState('')

  // EXTERNAL LINKS / CARDS
  const [externalTitle, setExternalTitle] = useState('')
  const [externalUrl, setExternalUrl] = useState('')
  const [externalIconUrl, setExternalIconUrl] = useState('')
  const [paymentName, setPaymentName] = useState('')
  const [paymentPercentage, setPaymentPercentage] = useState('')
  const [paymentStatus, setPaymentStatus] = useState('Pending')
  const [paymentDueUpon, setPaymentDueUpon] = useState('')
  const [projectValue, setProjectValue] = useState('')
  // DELIVERABLE (per milestone)
  const [deliverableTitles, setDeliverableTitles] = useState<
    Record<string, {
      title?: string
      start_date?: string
      end_date?: string
      status?: string
    }>
  >({})

  const loadData = async () => {
    const { data: p } = await supabase.from('projects').select('*, clients(*)')
    const { data: c } = await supabase.from('clients').select('*')
    const { data: tm } = await supabase.from('team_members').select('*')
    const { data: ptm } = await supabase.from('project_team_members').select('*')
    const { data: cr } = await supabase.from('client_requests').select('*')
const { data: crm } = await supabase.from('client_request_messages').select('*')
    const { data: m } = await supabase.from('milestones').select('*')
    const { data: d } = await supabase.from('deliverables').select('*')
    const { data: l } = await supabase.from('external_links').select('*')
    const { data: pay } = await supabase.from('payments').select('*')
    const { data: sc } = await supabase.from('support_contracts').select('*')
    const { data: swl } = await supabase.from('support_work_logs').select('*')
    const { data: scr } = await supabase.from('support_contract_renewals').select('*')
    const { data: art } = await supabase.from('artifacts').select('*')
    const { data: ct } = await supabase.from('client_tasks').select('*')
    const { data: mtg } = await supabase.from('meetings').select('*')
    setProjects(p || [])
    setClients(c || [])
    setTeamMembers(tm || [])
    setProjectTeamMembers(ptm || [])
    setClientRequests(cr || [])
setClientRequestMessages(crm || [])
    setMilestones(m || [])
    setDeliverables(d || [])
    setExternalLinks(l || [])
    setPayments(pay || [])
    setSupportContracts(sc || [])
    setSupportWorkLogs(swl || [])
    setSupportContractRenewals(scr || [])
    setArtifacts(art || [])
    setClientTasks(ct || [])
    setMeetings(mtg || [])
   }

  useEffect(() => {
    const init = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')
      await loadData()
      setLoading(false)
    }
    init()
  }, [])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      const section = new URLSearchParams(window.location.search).get('section')
      if (section === 'clients' || section === 'teams' || section === 'requests' || section === 'projects' || section === 'support' || section === 'artifacts' || section === 'client-tasks' || section === 'meetings') {
        setActiveNav(section)
        setSelectedProject(null)
      }
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [])

const createTeamMember = async () => {
  if (!teamName.trim()) return
  if (!teamUsername.trim()) return
  if (!teamPassword.trim()) return

  const { error } = await supabase.from('team_members').insert([{
    name: teamName,
    username: teamUsername,
    password: teamPassword,
    picture_url: teamPictureUrl,
  }])

  if (error) {
    alert(error.message)
    return
  }

  setTeamName('')
  setTeamUsername('')
  setTeamPassword('')
  setTeamPictureUrl('')
  setTeamUploadedFileName('')
  alert('Team member added successfully')
  await loadData()
}

  useEffect(() => {
    const savedProjectValue = payments.find(payment =>
      payment.project_id === selectedProject?.id && payment.term === PROJECT_VALUE_PAYMENT_TERM
    )

    setProjectValue(savedProjectValue?.due_upon || '')
  }, [selectedProject, payments])

  const saveProjectValue = async () => {
    if (!selectedProject) return

    const existingProjectValue = payments.find(payment =>
      payment.project_id === selectedProject.id && payment.term === PROJECT_VALUE_PAYMENT_TERM
    )

    const { error } = existingProjectValue
      ? await supabase
        .from('payments')
        .update({ due_upon: projectValue, amount: 0, is_paid: true })
        .eq('id', existingProjectValue.id)
      : await supabase
        .from('payments')
        .insert([{
          project_id: selectedProject.id,
          term: PROJECT_VALUE_PAYMENT_TERM,
          amount: 0,
          is_paid: true,
          due_upon: projectValue,
        }])

    if (error) {
      alert(error.message)
      return
    }

    await loadData()
    alert('Saved successfully')
  }

const editTeamMember = async (member: any) => {
  const name = prompt('Partner name', member.name || '')
  if (!name?.trim()) return

  const username = prompt('Username', member.username || '') || ''
  const password = prompt('Password', member.password || '') || ''
  const pictureUrl = prompt('Picture URL', member.picture_url || '') || ''

  const { error } = await supabase.from('team_members').update({
    name,
    username,
    password,
    picture_url: pictureUrl,
  }).eq('id', member.id)

  if (error) {
    alert(error.message)
    return
  }

  await loadData()
}



  const createClient = async () => {
    if (!clientName.trim()) return
    if (!clientEmail.trim()) {
      alert('Please enter the client email')
      return
    }
    if (!clientPassword.trim()) {
      alert('Please enter the client password')
      return
    }

    const res = await fetch('/api/create-client', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: clientName,
        email: clientEmail,
        password: clientPassword,
        logo_url: logoUrl,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
      }),
    })

    const result = await res.json()

    if (!res.ok) {
      alert(result.error || 'Failed to create client')
      return
    }

    setClientName('')
    setClientEmail('')
    setClientPassword('')
    setLogoUrl('')
    setUploadedFileName('')
    await loadData()
  }


  const editClient = (client: ClientCard) => {
    router.push(`/dashboard/clients/${client.id}/edit`)
  }

  const deleteClient = async (clientId: string) => {
    const ok = confirm('Delete this client and all related projects, milestones, and deliverables?')
    if (!ok) return

    const clientProjects = projects.filter(p => p.client_id === clientId)
    const projectIds = clientProjects.map(p => p.id)
    const milestoneIds = milestones.filter(m => projectIds.includes(m.project_id)).map(m => m.id)

    if (milestoneIds.length) {
      await supabase.from('deliverables').delete().in('milestone_id', milestoneIds)
      await supabase.from('milestones').delete().in('id', milestoneIds)
    }

    if (projectIds.length) {
      await supabase.from('projects').delete().in('id', projectIds)
    }

    await supabase.from('clients').delete().eq('id', clientId)
    setSelectedProject(null)
    await loadData()
  }

  const createProject = async () => {
    if (!projectName.trim() || !projectClientId) return
    await supabase.from('projects').insert([{ name: projectName, client_id: projectClientId }])
    setProjectName('')
    setProjectClientId('')
    await loadData()
  }


  const editProject = async (project: any) => {
    const name = prompt('Project name', project.name)
    if (!name?.trim()) return

    await supabase.from('projects').update({ name }).eq('id', project.id)
    if (selectedProject?.id === project.id) {
      setSelectedProject({ ...selectedProject, name })
    }
    await loadData()
  }

  const deleteProject = async (projectId: string) => {
    const ok = confirm('Delete this project and all related milestones and deliverables?')
    if (!ok) return

    const projectMilestoneIds = milestones.filter(m => m.project_id === projectId).map(m => m.id)

    if (projectMilestoneIds.length) {
      await supabase.from('deliverables').delete().in('milestone_id', projectMilestoneIds)
      await supabase.from('milestones').delete().in('id', projectMilestoneIds)
    }

    await supabase.from('projects').delete().eq('id', projectId)
    if (selectedProject?.id === projectId) setSelectedProject(null)
    await loadData()
  }

  const createMilestone = async () => {
    if (!milestoneTitle.trim() || !selectedProject) return
    await supabase.from('milestones').insert([{ title: milestoneTitle, project_id: selectedProject.id }])
    setMilestoneTitle('')
    await loadData()
  }


  const editMilestone = async (milestone: any) => {
    const title = prompt('Milestone title', milestone.title)
    if (!title?.trim()) return

    await supabase.from('milestones').update({ title }).eq('id', milestone.id)
    await loadData()
  }

  const deleteMilestone = async (milestoneId: string) => {
    const ok = confirm('Delete this milestone and its deliverables?')
    if (!ok) return

    await supabase.from('deliverables').delete().eq('milestone_id', milestoneId)
    await supabase.from('milestones').delete().eq('id', milestoneId)
    await loadData()
  }

  const createDeliverable = async (milestoneId: string) => {
    const data = deliverableTitles[milestoneId] || {}

    if (!data.title?.trim()) return

    await supabase.from('deliverables').insert([{
      title: data.title,
      milestone_id: milestoneId,
      start_date: data.start_date || null,
      end_date: data.end_date || null,
      status: data.status || 'Not started'
    }])

    setDeliverableTitles(prev => ({
      ...prev,
      [milestoneId]: {}
    }))

    await loadData()
  }


  const updateDeliverableField = async (deliverableId: string, field: 'start_date' | 'end_date' | 'status', value: string) => {
    const { error } = await supabase
      .from('deliverables')
      .update({ [field]: value || null })
      .eq('id', deliverableId)

    if (error) {
      alert(error.message)
      return
    }

    setDeliverables(prev => prev.map(deliverable =>
      deliverable.id === deliverableId
        ? { ...deliverable, [field]: value || null }
        : deliverable
    ))
  }

  const createExternalLink = async () => {
    if (!selectedProject) return
    if (!externalTitle.trim() || !externalUrl.trim()) return

    const normalizedUrl = externalUrl.startsWith('http://') || externalUrl.startsWith('https://')
      ? externalUrl
      : `https://${externalUrl}`

    const { error } = await supabase.from('external_links').insert([{
      project_id: selectedProject.id,
      title: externalTitle,
      url: normalizedUrl,
      icon_url: externalIconUrl || null,
    }])

    if (error) {
      console.error(error)
      alert(error.message)
      return
    }

    setExternalTitle('')
    setExternalUrl('')
    setExternalIconUrl('')
    await loadData()
  }

const deleteExternalLink = async (linkId: string) => {
  const ok = confirm('Delete this external link card?')
  if (!ok) return

  const { error } = await supabase
    .from('external_links')
    .delete()
    .eq('id', linkId)

  if (error) {
    alert(error.message)
    return
  }

  await loadData()
}
const closeClientRequest = async () => {
  if (!selectedRequest) return

  const ok = confirm('Close this request?')
  if (!ok) return

  const { error } = await supabase
    .from('client_requests')
    .update({ status: 'Closed' })
    .eq('id', selectedRequest.id)

  if (error) {
    alert(error.message)
    return
  }

  setSelectedRequest(null)
  await loadData()
}
const sendRequestMessage = async () => {
  if (!selectedRequest) return
  if (!requestMessage.trim()) return

  const { error } = await supabase.from('client_request_messages').insert([{
    request_id: selectedRequest.id,
    sender: 'admin',
    message: requestMessage,
  }])

  if (error) {
    alert(error.message)
    return
  }

  setRequestMessage('')
  await loadData()
} 
const createClientRequest = async () => {
  if (!requestClientId) return alert('Please select a client')
  if (!requestProjectId) return alert('Please select a project')
  if (!requestSubject.trim()) return alert('Please enter a subject')

  const { error } = await supabase.from('client_requests').insert([{
    client_id: requestClientId,
    project_id: requestProjectId,
    subject: requestSubject,
    description: requestDescription,
    status: 'Open',
    created_by: 'admin',
  }])

  if (error) {
    alert(error.message)
    return
  }

  setRequestClientId('')
  setRequestProjectId('')
  setRequestSubject('')
  setRequestDescription('')
  setShowRequestForm(false)

  alert('Request created successfully')

  await loadData()
}

  const setSupportField = (field: keyof SupportContractForm, value: string | boolean | string[]) => {
    setSupportForm(prev => ({ ...prev, [field]: value }))
  }

  const toggleSupportScope = (field: 'included_scope' | 'excluded_scope', value: string) => {
    setSupportForm(prev => {
      const current = prev[field]
      return {
        ...prev,
        [field]: current.includes(value)
          ? current.filter(item => item !== value)
          : [...current, value],
      }
    })
  }

  const getSupportLatestRenewalTime = (contractId: string) => {
    const renewalTimes = supportContractRenewals
      .filter(renewal => renewal.support_contract_id === contractId)
      .map(renewal => Date.parse(renewal.renewal_date || renewal.created_at || ''))
      .filter(time => !Number.isNaN(time))

    return renewalTimes.length > 0 ? Math.max(...renewalTimes) : null
  }

  const getSupportPeriodStartTime = (contract: SupportContract) => {
    const latestRenewalTime = getSupportLatestRenewalTime(contract.id)
    if (latestRenewalTime) return latestRenewalTime

    const contractStartTime = Date.parse(contract.created_at || contract.updated_at || '')
    return Number.isNaN(contractStartTime) ? 0 : contractStartTime
  }

  const isSupportLogInCurrentPeriod = (log: SupportWorkLog, periodStartTime: number) => {
    const logTime = Date.parse(log.created_at || log.work_date || '')
    return Number.isNaN(logTime) || logTime >= periodStartTime
  }

  const getSupportUsedHours = (contract: SupportContract) => {
    const periodStartTime = getSupportPeriodStartTime(contract)
    return supportWorkLogs
      .filter(log => log.support_contract_id === contract.id && log.approval_status === 'Approved' && isSupportLogInCurrentPeriod(log, periodStartTime))
    .reduce((sum, log) => sum + Number(log.time_spent_hours || 0), 0)
  }

  const getSupportHourSummary = (contract: SupportContract) => {
    const included = Number(contract.included_hours_per_month || 0)
    const used = getSupportUsedHours(contract)
    const remaining = Math.max(included - used, 0)
    const extra = Math.max(used - included, 0)

    return { included, used, remaining, extra }
  }

  const resetSupportForm = () => {
    setSupportForm(emptySupportContractForm)
    setEditingSupportContract(null)
    setShowSupportForm(false)
  }

  const startNewSupportContract = () => {
    setSelectedSupportContract(null)
    setEditingSupportContract(null)
    setSupportForm(emptySupportContractForm)
    setShowSupportForm(true)
  }

  const editSupportContract = (contract: SupportContract) => {
    setSelectedSupportContract(contract)
    setEditingSupportContract(contract)
    setSupportForm({
      client_id: contract.client_id || '',
      project_id: contract.project_id || '',
      name: contract.name || '',
      start_date: contract.start_date || '',
      end_date: contract.end_date || '',
      duration_days: String(contract.duration_days || '30'),
      status: contract.status || 'Active',
      monthly_support_fee: String(contract.monthly_support_fee || ''),
      included_hours_per_month: String(contract.included_hours_per_month || ''),
      hours_rollover: Boolean(contract.hours_rollover),
      max_accumulated_hours: String(contract.max_accumulated_hours || ''),
      extra_hour_rate: String(contract.extra_hour_rate || ''),
      approval_required_for_extra_hours: Boolean(contract.approval_required_for_extra_hours),
      critical_response_hours: String(contract.critical_response_hours || ''),
      normal_response_hours: String(contract.normal_response_hours || ''),
      low_response_hours: String(contract.low_response_hours || ''),
      critical_response_definition: contract.critical_response_definition || '',
      normal_response_definition: contract.normal_response_definition || '',
      low_response_definition: contract.low_response_definition || '',
      included_scope: contract.included_scope || [],
      excluded_scope: [],
      project_manager_id: contract.project_manager_id || '',
      support_engineer_id: contract.support_engineer_id || '',
      developer_id: contract.developer_id || '',
      designer_id: contract.designer_id || '',
      renewal_reminder_days: String(contract.renewal_reminder_days || '30'),
      auto_renewal: Boolean(contract.auto_renewal),
      internal_notes: contract.internal_notes || '',
    })
    setShowSupportForm(true)
  }

  const saveSupportContract = async () => {
    if (!supportForm.client_id) return alert('Please select a client')
    if (!supportForm.project_id) return alert('Please select a project')
    if (!supportForm.name.trim()) return alert('Please enter a support contract name')

    const payload = {
      client_id: supportForm.client_id,
      project_id: supportForm.project_id,
      name: supportForm.name,
      start_date: null,
      end_date: null,
      duration_days: Number(supportForm.duration_days || 0),
      status: supportForm.status,
      monthly_support_fee: Number(supportForm.monthly_support_fee || 0),
      included_hours_per_month: Number(supportForm.included_hours_per_month || 0),
      hours_rollover: supportForm.hours_rollover,
      max_accumulated_hours: Number(supportForm.max_accumulated_hours || 0),
      extra_hour_rate: Number(supportForm.extra_hour_rate || 0),
      approval_required_for_extra_hours: supportForm.approval_required_for_extra_hours,
      critical_response_hours: Number(supportForm.critical_response_hours || 0),
      normal_response_hours: Number(supportForm.normal_response_hours || 0),
      low_response_hours: Number(supportForm.low_response_hours || 0),
      critical_response_definition: supportForm.critical_response_definition || null,
      normal_response_definition: supportForm.normal_response_definition || null,
      low_response_definition: supportForm.low_response_definition || null,
      included_scope: supportForm.included_scope,
      excluded_scope: [],
      project_manager_id: null,
      support_engineer_id: null,
      developer_id: null,
      designer_id: null,
      renewal_reminder_days: Number(supportForm.renewal_reminder_days || 0),
      auto_renewal: supportForm.auto_renewal,
      internal_notes: supportForm.internal_notes || null,
    }

    const { data, error } = editingSupportContract
      ? await supabase.from('support_contracts').update(payload).eq('id', editingSupportContract.id).select().single()
      : await supabase.from('support_contracts').insert([{
        ...payload,
        client_approval_status: 'Pending',
        client_approved_at: null,
        client_approved_by: null,
      }]).select().single()

    if (error) {
      alert(error.message)
      return
    }

    resetSupportForm()
    await loadData()
    setSelectedSupportContract(data)
    alert('Support contract saved successfully')
  }

  const renewSupportContract = async (contract: SupportContract) => {
    const durationDays = Number(contract.duration_days || 30)
    if (!Number.isFinite(durationDays) || durationDays <= 0) {
      alert('Please set a valid contract duration before renewing')
      return
    }

    const { data: renewedContract, error: updateError } = await supabase
      .from('support_contracts')
      .update({
        duration_days: durationDays,
        status: 'Active',
        start_date: null,
        end_date: null,
      })
      .eq('id', contract.id)
      .select()
      .single()

    if (updateError) {
      alert(updateError.message)
      return
    }

    const { error: renewalError } = await supabase.from('support_contract_renewals').insert([{
      support_contract_id: contract.id,
      duration_days: durationDays,
      notes: `Renewed for ${durationDays} days`,
    }])

    if (renewalError) {
      alert(renewalError.message)
      return
    }

    await loadData()
    setSelectedSupportContract(renewedContract)
    alert('Support contract renewed successfully')
  }

  const deleteSupportContract = async (contractId: string) => {
    const ok = confirm('Delete this support contract and its work logs?')
    if (!ok) return

    const { error } = await supabase.from('support_contracts').delete().eq('id', contractId)

    if (error) {
      alert(error.message)
      return
    }

    setSelectedSupportContract(null)
    resetSupportForm()
    await loadData()
  }

  const createSupportWorkLog = async () => {
    if (!selectedSupportContract) return
    if (!supportWorkLogForm.title.trim()) return alert('Please enter an issue title')

    const { error } = await supabase.from('support_work_logs').insert([{
      support_contract_id: selectedSupportContract.id,
      title: supportWorkLogForm.title,
      description: supportWorkLogForm.description,
      team_member_id: null,
      work_date: supportWorkLogForm.work_date || null,
      time_spent_hours: Number(supportWorkLogForm.time_spent_hours || 0),
      charged_hours: Number(supportWorkLogForm.charged_hours || 0),
      charge_per_hour: Number(supportWorkLogForm.charge_per_hour || 0),
      priority: supportWorkLogForm.priority,
      status: supportWorkLogForm.status,
      approval_status: 'Pending',
    }])

    if (error) {
      alert(error.message)
      return
    }

    setSupportWorkLogForm(emptySupportWorkLogForm)
    await loadData()
    alert('Support work log added successfully')
  }

  const uploadArtifactFile = async (file: File) => {
    setArtifactUploading(true)

    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-')
    const filePath = `${artifactProjectId || 'unassigned'}/${Date.now()}-${safeName}`
    const { error: uploadError } = await supabase.storage
      .from('artifacts')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      setArtifactUploading(false)
      alert(uploadError.message)
      return
    }

    const { data } = supabase.storage.from('artifacts').getPublicUrl(filePath)
    setArtifactFileUrl(data.publicUrl)
    setArtifactFileName(file.name)
    setArtifactUploading(false)
  }

  const resetArtifactForm = () => {
    setArtifactClientId('')
    setArtifactProjectId('')
    setArtifactName('')
    setArtifactDescription('')
    setArtifactCreationDate(new Date().toISOString().slice(0, 10))
    setArtifactFileUrl('')
    setArtifactFileName('')
  }

  const createArtifact = async () => {
    if (!artifactClientId) return alert('Please select a client')
    if (!artifactProjectId) return alert('Please select a project')
    if (!artifactName.trim()) return alert('Please enter the artifact name')
    if (!artifactFileUrl) return alert('Please upload a file')

    const { error } = await supabase.from('artifacts').insert([{
      client_id: artifactClientId,
      project_id: artifactProjectId,
      name: artifactName,
      description: artifactDescription || null,
      creation_date: artifactCreationDate || null,
      file_url: artifactFileUrl,
      file_name: artifactFileName,
      approval_status: 'Pending Approval',
    }])

    if (error) {
      alert(error.message)
      return
    }

    resetArtifactForm()
    await loadData()
    alert('Artifact saved successfully')
  }

  const resetClientTaskForm = () => {
    setClientTaskForm(emptyClientTaskForm)
  }

  const createClientTask = async () => {
    if (!clientTaskForm.client_id) return alert('Please select a client')
    if (!clientTaskForm.title.trim()) return alert('Please enter a task title')

    const { error } = await supabase.from('client_tasks').insert([{
      client_id: clientTaskForm.client_id,
      project_id: clientTaskForm.project_id || null,
      title: clientTaskForm.title,
      creation_date: clientTaskForm.creation_date || null,
      due_date: clientTaskForm.due_date || null,
      status: clientTaskForm.status,
    }])

    if (error) {
      alert(error.message)
      return
    }

    resetClientTaskForm()
    await loadData()
    alert('Client task saved successfully')
  }

  const updateClientTaskStatus = async (taskId: string, status: ClientTaskStatus) => {
    const { error } = await supabase
      .from('client_tasks')
      .update({ status, updated_at: new Date().toISOString() })
      .eq('id', taskId)

    if (error) {
      alert(error.message)
      return
    }

    setClientTasks(prev => prev.map(task => task.id === taskId ? { ...task, status } : task))
  }

  const resetMeetingForm = () => {
    setMeetingForm(emptyMeetingForm)
  }

  const createMeeting = async () => {
    if (!meetingForm.client_id) return alert('Please select a client')
    if (!meetingForm.project_id) return alert('Please select a project')
    if (!meetingForm.meeting_date) return alert('Please select the meeting date')
    if (!meetingForm.meeting_time) return alert('Please select the meeting time')
    if (!meetingForm.moms.trim()) return alert('Please enter the MOMs')

    const { error } = await supabase.from('meetings').insert([{
      client_id: meetingForm.client_id,
      project_id: meetingForm.project_id,
      meeting_date: meetingForm.meeting_date,
      meeting_time: meetingForm.meeting_time,
      moms: meetingForm.moms,
    }])

    if (error) {
      alert(error.message)
      return
    }

    resetMeetingForm()
    await loadData()
    alert('Meeting saved successfully')
  }

  const assignTeamMember = async () => {
  if (!selectedProject) return
  if (!selectedTeamMemberId) return

  const { error } = await supabase
    .from('project_team_members')
    .insert([{
      project_id: selectedProject.id,
      team_member_id: selectedTeamMemberId,
    }])

  if (error) {
    alert(error.message)
    return
  }

  setSelectedTeamMemberId('')

  alert('Team member assigned successfully')

  await loadData()
}
  const createPayment = async () => {
  if (!selectedProject) return
  if (!paymentName.trim()) return

  const { error } = await supabase.from('payments').insert([{
    project_id: selectedProject.id,
    term: paymentName,
    amount: Number(paymentPercentage.replace('%', '')),
    is_paid: paymentStatus === 'Paid',
    due_upon: paymentDueUpon,
  }])

  if (error) {
    alert(error.message)
    return
  }

  setPaymentName('')
  setPaymentPercentage('')
  setPaymentStatus('Pending')
  setPaymentDueUpon('')

  await loadData()
} 
 const deleteDeliverable = async (deliverableId: string) => {
    const ok = confirm('Delete this deliverable?')
    if (!ok) return

    await supabase.from('deliverables').delete().eq('id', deliverableId)
    await loadData()
  }

if (loading) {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f7f5ff 0%, #ffffff 45%, #eee9ff 100%)',
      fontFamily: 'Inter, Arial, sans-serif',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        width: 360,
        height: 360,
        borderRadius: '50%',
        background: 'rgba(124, 77, 255, 0.16)',
        top: -120,
        left: -100,
        filter: 'blur(10px)',
      }} />

      <div style={{
        position: 'absolute',
        width: 420,
        height: 420,
        borderRadius: '50%',
        background: 'rgba(108, 92, 231, 0.14)',
        bottom: -160,
        right: -120,
        filter: 'blur(10px)',
      }} />

      <div style={{
        width: 420,
        padding: 38,
        borderRadius: 28,
        background: 'rgba(255,255,255,0.82)',
        backdropFilter: 'blur(18px)',
        boxShadow: '0 30px 80px rgba(80, 65, 180, 0.16)',
        border: '1px solid rgba(120,100,220,0.16)',
        textAlign: 'center',
        zIndex: 2,
      }}>
        <div style={{
          width: 64,
          height: 64,
          borderRadius: 20,
          margin: '0 auto 22px',
          background: 'linear-gradient(135deg, #6C5CE7, #8E6CFF)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#fff',
          fontSize: 30,
          fontWeight: 800,
          boxShadow: '0 16px 35px rgba(108,92,231,0.32)',
        }}>
          ✓
        </div>

        <div style={{
          fontSize: 24,
          fontWeight: 800,
          color: '#151236',
          marginBottom: 8,
        }}>
          Project Manager
        </div>

        <div style={{
          color: '#7b7894',
          fontSize: 15,
          marginBottom: 24,
        }}>
          Loading your workspace...
        </div>

        <div style={{
          height: 8,
          background: '#eeeaff',
          borderRadius: 999,
          overflow: 'hidden',
        }}>
          <div style={{
            height: '100%',
            width: '55%',
            borderRadius: 999,
            background: 'linear-gradient(135deg, #6C5CE7, #8E6CFF)',
          }} />
        </div>
      </div>
    </div>
  )
}


  const projectMilestones = selectedProject
    ? milestones.filter(m => m.project_id === selectedProject.id)
    : []

  const getProjectDeliverables = (projectId: string) => {
    const projectMilestoneIds = milestones
      .filter(m => m.project_id === projectId)
      .map(m => m.id)

    return deliverables.filter(d => projectMilestoneIds.includes(d.milestone_id))
  }

  const getProjectProgress = (projectId: string) => {
    const list = getProjectDeliverables(projectId)
    const total = list.length
    const completed = list.filter(d => d.status === 'Completed').length
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0

    return { total, completed, progress }
  }

  const projectDeliverables = selectedProject
    ? getProjectDeliverables(selectedProject.id)
    : []

  const completedDeliverables = projectDeliverables.filter(d => d.status === 'Completed').length
  const totalDeliverables = projectDeliverables.length
  const projectProgress = totalDeliverables > 0
    ? Math.round((completedDeliverables / totalDeliverables) * 100)
    : 0
  const activeSupportContracts = supportContracts.filter(contract => contract.status === 'Active' && (contract.client_approval_status || 'Approved') === 'Approved')
  const totalMonthlySupportRevenue = activeSupportContracts.reduce((sum, contract) => sum + Number(contract.monthly_support_fee || 0), 0)
  const totalIncludedSupportHours = supportContracts.reduce((sum, contract) => sum + Number(contract.included_hours_per_month || 0), 0)
  const totalUsedSupportHours = supportContracts.reduce((sum, contract) => sum + getSupportUsedHours(contract), 0)
  const getSupportContractExpiryDate = (contract: SupportContract) => {
    if (contract.end_date) return new Date(contract.end_date)
    const renewalDates = supportContractRenewals
      .filter(renewal => renewal.support_contract_id === contract.id)
      .map(renewal => Date.parse(renewal.renewal_date || renewal.created_at || ''))
      .filter(time => !Number.isNaN(time))
    const startTime = renewalDates.length > 0
      ? Math.max(...renewalDates)
      : Date.parse(contract.updated_at || contract.created_at || '')
    const expiryDate = new Date(Number.isNaN(startTime) ? supportTodayTime : startTime)
    expiryDate.setDate(expiryDate.getDate() + Number(contract.duration_days || 0))
    return expiryDate
  }
  const supportContractsNearExpiry = supportContracts.filter(contract => {
    const daysUntilExpiry = Math.ceil((getSupportContractExpiryDate(contract).getTime() - supportTodayTime) / (1000 * 60 * 60 * 24))
    const reminderDays = Number(contract.renewal_reminder_days || 30)
    return daysUntilExpiry >= 0 && daysUntilExpiry <= reminderDays
  }).length
  const selectedSupportLogs = selectedSupportContract
    ? supportWorkLogs
      .filter(log => log.support_contract_id === selectedSupportContract.id)
      .sort((a, b) => Date.parse(b.work_date || b.created_at || '') - Date.parse(a.work_date || a.created_at || ''))
    : []
  const selectedSupportRenewals = selectedSupportContract
    ? supportContractRenewals
      .filter(renewal => renewal.support_contract_id === selectedSupportContract.id)
      .sort((a, b) => Date.parse(b.renewal_date || b.created_at || '') - Date.parse(a.renewal_date || a.created_at || ''))
    : []
  const selectedSupportHours = selectedSupportContract ? getSupportHourSummary(selectedSupportContract) : null

  return (
    <div className="pm-root">
      <style>{styles}</style>
      <div className="pm-layout">

        {/* ── Sidebar ── */}
        <aside className="pm-sidebar">
          <div className="pm-logo">
            <div className="pm-logo-title">Project<br />Manager</div>
            <div className="pm-logo-sub">Admin Dashboard</div>
          </div>

          <nav className="pm-nav">
            <div className="pm-nav-label">Workspace</div>
            <button
              className={`pm-nav-btn ${activeNav === 'clients' ? 'active' : ''}`}
              onClick={() => { setActiveNav('clients'); setSelectedProject(null); setSelectedSupportContract(null) }}
            >
              <span className="icon">{Icons.client}</span>
              Clients
            </button>
            <button
              className={`pm-nav-btn ${activeNav === 'projects' ? 'active' : ''}`}
              onClick={() => { setActiveNav('projects'); setSelectedProject(null); setSelectedSupportContract(null) }}
            >
              <span className="icon">{Icons.project}</span>
              Projects
            </button>
<button
  className={`pm-nav-btn ${activeNav === 'teams' ? 'active' : ''}`}
  onClick={() => {
    setActiveNav('teams')
    setSelectedProject(null)
    setSelectedSupportContract(null)
  }}
>
  <span className="icon">{Icons.client}</span>
  Teams
</button>         
<button
  className={`pm-nav-btn ${activeNav === 'requests' ? 'active' : ''}`}
  onClick={() => {
    setActiveNav('requests')
    setSelectedProject(null)
    setSelectedRequest(null)
    setSelectedSupportContract(null)
  }}
>
  <span className="icon">{Icons.client}</span>
  Chats
</button>
<button
  className={`pm-nav-btn ${activeNav === 'support' ? 'active' : ''}`}
  onClick={() => {
    setActiveNav('support')
    setSelectedProject(null)
    setSelectedRequest(null)
  }}
>
  <span className="icon">{Icons.project}</span>
  Support Contracts
</button>
<button
  className={`pm-nav-btn ${activeNav === 'client-tasks' ? 'active' : ''}`}
  onClick={() => {
    setActiveNav('client-tasks')
    setSelectedProject(null)
    setSelectedRequest(null)
    setSelectedSupportContract(null)
  }}
>
  <span className="icon">{Icons.deliverable}</span>
  Clients Task
</button>
<button
  className={`pm-nav-btn ${activeNav === 'meetings' ? 'active' : ''}`}
  onClick={() => {
    setActiveNav('meetings')
    setSelectedProject(null)
    setSelectedRequest(null)
    setSelectedSupportContract(null)
  }}
>
  <span className="icon">{Icons.meeting}</span>
  Meetings
</button>
<button
  className={`pm-nav-btn ${activeNav === 'artifacts' ? 'active' : ''}`}
  onClick={() => {
    setActiveNav('artifacts')
    setSelectedProject(null)
    setSelectedRequest(null)
    setSelectedSupportContract(null)
  }}
>
  <span className="icon">{Icons.folder}</span>
  Artifacts
</button>
            </nav>

          <div className="pm-sidebar-footer">
            <button
              className="pm-logout-btn"
              onClick={async () => {
                await supabase.auth.signOut()
                router.push('/login')
              }}
            >
              {Icons.logout}
              Sign Out
            </button>
          </div>
        </aside>

        {/* ── Main Area ── */}
        <main className="pm-main">

          {/* Topbar */}
          <div className="pm-topbar">
            <div className="pm-topbar-left">
              <span className="pm-breadcrumb">Pages</span>
              <span className="pm-breadcrumb">›</span>
              <span className="pm-topbar-title">
                {selectedProject
                  ? selectedProject.name
                  : activeNav === 'projects'
                  ? 'Dashboard'
                  : activeNav === 'teams'
                  ? 'Teams'
                  : activeNav === 'requests'
                  ? 'Chats'
                  : activeNav === 'support'
                  ? 'Support Contracts'
                  : activeNav === 'client-tasks'
                  ? 'Clients Task'
                  : activeNav === 'meetings'
                  ? 'Meetings'
                  : activeNav === 'artifacts'
                  ? 'Artifacts'
                  : 'Clients'}
              </span>
            </div>
            <div className="pm-topbar-actions">
              <input className="pm-search" placeholder="Search clients, projects, milestones…" readOnly />
              <span className="pm-topbar-badge">
                {selectedProject
                  ? `${projectMilestones.length} milestone${projectMilestones.length !== 1 ? 's' : ''}`
                  : activeNav === 'projects'
                  ? `${projects.length} total`
                  : activeNav === 'support'
                  ? `${supportContracts.length} contracts`
                  : activeNav === 'client-tasks'
                  ? `${clientTasks.length} tasks`
                  : activeNav === 'meetings'
                  ? `${meetings.length} meetings`
                  : activeNav === 'artifacts'
                  ? `${artifacts.length} artifacts`
                  : `${clients.length} total`}
              </span>
            </div>
          </div>

          <div className="pm-content">

            {/* ═══════════ CLIENTS VIEW ═══════════ */}
            {activeNav === 'clients' && !selectedProject && (
              <>
                {/* Create Client */}
                <div className="pm-section">
                  <div className="pm-section-header">
                    <div className="pm-section-icon">{Icons.client}</div>
                    <span className="pm-section-title">New Client</span>
                  </div>
                  <div className="pm-section-body">
                    <div className="pm-field">
                      <label className="pm-label">Client Name</label>
                      <input
                        className="pm-input"
                        placeholder="Acme Corporation"
                        value={clientName}
                        onChange={e => setClientName(e.target.value)}
                      />
                    </div>

                    <div className="pm-field">
                      <label className="pm-label">Client Email / Username</label>
                      <input
                        className="pm-input"
                        placeholder="client@email.com"
                        value={clientEmail}
                        onChange={e => setClientEmail(e.target.value)}
                      />
                    </div>

                    <div className="pm-field">
                      <label className="pm-label">Client Password</label>
                      <input
                        type="password"
                        className="pm-input"
                        placeholder="••••••••"
                        value={clientPassword}
                        onChange={e => setClientPassword(e.target.value)}
                      />
                    </div>

                    <div className="pm-field">
                      <label className="pm-label">Logo</label>
                      <div className="pm-file-upload">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (!file) return
                            setUploadedFileName(file.name)
                            const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-')
                            const filePath = `logos/${Date.now()}-${safeName}`
                            const { error: uploadError } = await supabase.storage.from('client-logos').upload(filePath, file, { upsert: true })
                            if (uploadError) {
                              console.error(uploadError)
                              alert(uploadError.message)
                              return
                            }
                            const { data } = supabase.storage.from('client-logos').getPublicUrl(filePath)
                            setLogoUrl(data.publicUrl)
                          }}
                        />
                        <div style={{ color: '#5a5a5a' }}>{Icons.upload}</div>
                        <div className="pm-file-upload-text">
                          {uploadedFileName || 'Click to upload logo'}
                        </div>
                        <div className="pm-file-upload-sub">PNG, JPG, SVG up to 5MB</div>
                      </div>
                      {uploadedFileName && (
                        <div className="pm-upload-status">✓ {uploadedFileName} uploaded</div>
                      )}
                    </div>

                    <div className="pm-field">
                      <label className="pm-label">Brand Colors</label>
                      <div className="pm-color-row">
                        <div className="pm-color-field">
                          <input type="color" className="pm-color-input" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} />
                          <span className="pm-color-label">Primary · {primaryColor}</span>
                        </div>
                        <div className="pm-color-field">
                          <input type="color" className="pm-color-input" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} />
                          <span className="pm-color-label">Secondary · {secondaryColor}</span>
                        </div>
                      </div>
                    </div>

                    <button className="pm-btn pm-btn-primary" onClick={createClient}>
                      {Icons.plus} Save Client
                    </button>
                  </div>
                </div>

                {/* Clients List */}
                <div className="pm-divider">
                  <div className="pm-divider-line" />
                  <span className="pm-divider-text">All Clients</span>
                  <div className="pm-divider-line" />
                </div>

                {clients.length === 0 ? (
                  <div className="pm-empty">
                    <div className="pm-empty-icon">{Icons.client}</div>
                    <p className="pm-empty-text">No clients yet. Add your first client above.</p>
                  </div>
                ) : (
                  <div className="pm-client-grid">
                    {clients.map(c => (
                      <div key={c.id} className="pm-client-card">
                        {c.logo_url ? (
                          <img src={c.logo_url} alt={c.name} className="pm-client-logo" />
                        ) : (
                          <div className="pm-client-avatar" style={{ background: c.primary_color || '#0a0a0a' }}>
                            {c.name?.charAt(0)?.toUpperCase()}
                          </div>
                        )}

                        <div className="pm-client-info">
                          <div className="pm-client-top">
                            <div style={{ minWidth: 0 }}>
                              <div className="pm-client-name">{c.name}</div>
                              <div className="pm-client-projects">
                                {projects.filter(p => p.client_id === c.id).length} project(s)
                              </div>
                            </div>

                            <div className="pm-client-actions">
                              <button className="pm-action-btn" onClick={() => editClient(c)}>Edit</button>
                              <button className="pm-action-btn danger" onClick={() => deleteClient(c.id)}>Delete</button>
                            </div>
                          </div>

                          <div className="pm-client-colors">
                            <span className="pm-color-dot" style={{ background: c.primary_color || '#0a0a0a' }} />
                            <span className="pm-color-dot" style={{ background: c.secondary_color || '#c8a96e' }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}
{/* ═══════════ TEAMS VIEW ═══════════ */}
{activeNav === 'teams' && !selectedProject && (
  <>
    <div className="pm-section">
      <div className="pm-section-header">
        <div className="pm-section-icon">{Icons.client}</div>
        <span className="pm-section-title">New Team Member</span>
      </div>

      <div className="pm-section-body">
        <div className="pm-field">
          <label className="pm-label">Member Name</label>
          <input className="pm-input" value={teamName} onChange={e => setTeamName(e.target.value)} />
        </div>

        <div className="pm-field">
          <label className="pm-label">Username</label>
          <input className="pm-input" value={teamUsername} onChange={e => setTeamUsername(e.target.value)} />
        </div>

        <div className="pm-field">
          <label className="pm-label">Password</label>
          <input type="password" className="pm-input" value={teamPassword} onChange={e => setTeamPassword(e.target.value)} />
        </div>

        <button className="pm-btn pm-btn-primary" onClick={createTeamMember}>
          {Icons.plus} Save Team Member
        </button>
      </div>
    </div>
  <div className="pm-divider">
  <div className="pm-divider-line" />
  <span className="pm-divider-text">All Team Members</span>
  <div className="pm-divider-line" />
</div>

<div className="pm-client-grid">
  {teamMembers.map(member => (
    <div key={member.id} className="pm-client-card">
      {member.picture_url ? (
        <img src={member.picture_url} alt={member.name} className="pm-client-logo" />
      ) : (
        <div className="pm-client-avatar" style={{ background: '#6d5dfc' }}>
          {member.name?.charAt(0)?.toUpperCase()}
        </div>
      )}

      <div className="pm-client-info">
        <div className="pm-client-top">
          <div style={{ minWidth: 0 }}>
            <div className="pm-client-name">{member.name}</div>
            <div className="pm-client-projects">{member.username}</div>
          </div>

          <div className="pm-client-actions">
            <button className="pm-action-btn" onClick={() => editTeamMember(member)}>Edit</button>
          </div>
        </div>
      </div>
    </div>
  ))}
</div>
  </>
)}
{/* ═══════════ CLIENT TASKS VIEW ═══════════ */}
{activeNav === 'client-tasks' && !selectedProject && (
  <>
    <div className="pm-hero-banner">
      <div>
        <div className="pm-hero-title">Clients Task</div>
        <div className="pm-hero-sub">Assign action items to clients and track completion status from one place.</div>
      </div>
      <div className="pm-hero-pill">{clientTasks.length} task{clientTasks.length !== 1 ? 's' : ''}</div>
    </div>

    <div className="pm-section">
      <div className="pm-section-header">
        <div className="pm-section-icon">{Icons.plus}</div>
        <span className="pm-section-title">Add Client Task</span>
      </div>
      <div className="pm-section-body">
        <div className="pm-support-form-grid">
          <div className="pm-field">
            <label className="pm-label">Client</label>
            <select
              className="pm-select"
              value={clientTaskForm.client_id}
              onChange={(e) => setClientTaskForm(prev => ({ ...prev, client_id: e.target.value, project_id: '' }))}
            >
              <option value="">Select client...</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>
          <div className="pm-field">
            <label className="pm-label">Project</label>
            <select
              className="pm-select"
              value={clientTaskForm.project_id}
              onChange={(e) => setClientTaskForm(prev => ({ ...prev, project_id: e.target.value }))}
            >
              <option value="">No project selected</option>
              {projects.filter(project => project.client_id === clientTaskForm.client_id).map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>
          <div className="pm-field">
            <label className="pm-label">Task Name</label>
            <input
              className="pm-input"
              value={clientTaskForm.title}
              onChange={(e) => setClientTaskForm(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Complete App Store registration"
            />
          </div>
          <div className="pm-field">
            <label className="pm-label">Creation Date</label>
            <input
              type="date"
              className="pm-input"
              value={clientTaskForm.creation_date}
              onChange={(e) => setClientTaskForm(prev => ({ ...prev, creation_date: e.target.value }))}
            />
          </div>
          <div className="pm-field">
            <label className="pm-label">Due Date</label>
            <input
              type="date"
              className="pm-input"
              value={clientTaskForm.due_date}
              onChange={(e) => setClientTaskForm(prev => ({ ...prev, due_date: e.target.value }))}
            />
          </div>
          <div className="pm-field">
            <label className="pm-label">Status</label>
            <select
              className="pm-select"
              value={clientTaskForm.status}
              onChange={(e) => setClientTaskForm(prev => ({ ...prev, status: e.target.value as ClientTaskStatus }))}
            >
              <option value="Not Started">Not Started</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
        </div>
        <button className="pm-btn pm-btn-primary" style={{ marginTop: 16 }} onClick={createClientTask}>
          {Icons.plus} Add Task
        </button>
      </div>
    </div>

    <div className="pm-section">
      <div className="pm-section-header">
        <div className="pm-section-icon">{Icons.deliverable}</div>
        <span className="pm-section-title">Assigned Client Tasks</span>
      </div>
      <div className="pm-section-body">
        {clientTasks.length === 0 ? (
          <div className="pm-empty" style={{ marginTop: 0 }}>
            <p className="pm-empty-text">No client tasks yet. Add the first task above.</p>
          </div>
        ) : (
          <div className="pm-task-grid" style={{ marginTop: 0 }}>
            {[...clientTasks]
              .sort((a, b) => Date.parse(b.created_at || '') - Date.parse(a.created_at || ''))
              .map(task => {
                const client = clients.find(item => item.id === task.client_id)
                const project = projects.find(item => item.id === task.project_id)
                return (
                  <div key={task.id} className="pm-task-card">
                    <div className="pm-task-card-top">
                      <div style={{ minWidth: 0 }}>
                        <div className="pm-task-title">{task.title}</div>
                        <div className="pm-task-meta">{client?.name || 'Client'}{project ? ` • ${project.name}` : ''}</div>
                      </div>
                      <span className={`pm-status-pill ${String(task.status).replaceAll(' ', '-')}`}>{task.status}</span>
                    </div>
                    <div className="pm-task-date">
                      Created {task.creation_date ? new Date(task.creation_date).toLocaleDateString() : 'Not set'} • Due {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'Not set'}
                    </div>
                    <select
                      className="pm-select"
                      value={task.status}
                      onChange={(e) => updateClientTaskStatus(task.id, e.target.value as ClientTaskStatus)}
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                )
              })}
          </div>
        )}
      </div>
    </div>
  </>
)}
{/* ═══════════ MEETINGS VIEW ═══════════ */}
{activeNav === 'meetings' && !selectedProject && (
  <>
    <div className="pm-hero-banner">
      <div>
        <div className="pm-hero-title">Meetings</div>
        <div className="pm-hero-sub">Log meeting dates, times, and MOMs for each client project.</div>
      </div>
      <div className="pm-hero-pill">{meetings.length} meeting{meetings.length !== 1 ? 's' : ''}</div>
    </div>

    <div className="pm-section">
      <div className="pm-section-header">
        <div className="pm-section-icon">{Icons.meeting}</div>
        <span className="pm-section-title">Add Meeting Log</span>
      </div>
      <div className="pm-section-body">
        <div className="pm-support-form-grid">
          <div className="pm-field">
            <label className="pm-label">Client</label>
            <select
              className="pm-select"
              value={meetingForm.client_id}
              onChange={(e) => setMeetingForm(prev => ({ ...prev, client_id: e.target.value, project_id: '' }))}
            >
              <option value="">Select client...</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>
          <div className="pm-field">
            <label className="pm-label">Project</label>
            <select
              className="pm-select"
              value={meetingForm.project_id}
              onChange={(e) => setMeetingForm(prev => ({ ...prev, project_id: e.target.value }))}
            >
              <option value="">Select project...</option>
              {projects.filter(project => project.client_id === meetingForm.client_id).map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>
          <div className="pm-field">
            <label className="pm-label">Meeting Date</label>
            <input
              type="date"
              className="pm-input"
              value={meetingForm.meeting_date}
              onChange={(e) => setMeetingForm(prev => ({ ...prev, meeting_date: e.target.value }))}
            />
          </div>
          <div className="pm-field">
            <label className="pm-label">Meeting Time</label>
            <input
              type="time"
              className="pm-input"
              value={meetingForm.meeting_time}
              onChange={(e) => setMeetingForm(prev => ({ ...prev, meeting_time: e.target.value }))}
            />
          </div>
        </div>
        <div className="pm-field" style={{ marginTop: 16 }}>
          <label className="pm-label">MOMs</label>
          <textarea
            className="pm-input"
            value={meetingForm.moms}
            onChange={(e) => setMeetingForm(prev => ({ ...prev, moms: e.target.value }))}
            placeholder="Write meeting minutes, decisions, action items, and notes..."
            rows={7}
          />
        </div>
        <button className="pm-btn pm-btn-primary" style={{ marginTop: 16 }} onClick={createMeeting}>
          {Icons.plus} Add Meeting
        </button>
      </div>
    </div>

    <div className="pm-section">
      <div className="pm-section-header">
        <div className="pm-section-icon">{Icons.meeting}</div>
        <span className="pm-section-title">Meeting Logs</span>
      </div>
      <div className="pm-section-body">
        {meetings.length === 0 ? (
          <div className="pm-empty" style={{ marginTop: 0 }}>
            <p className="pm-empty-text">No meetings have been logged yet.</p>
          </div>
        ) : (
          <div className="pm-task-grid" style={{ marginTop: 0 }}>
            {[...meetings]
              .sort((a, b) => {
                const dateDiff = Date.parse(`${b.meeting_date}T${b.meeting_time || '00:00'}`) - Date.parse(`${a.meeting_date}T${a.meeting_time || '00:00'}`)
                if (dateDiff !== 0) return dateDiff
                return Date.parse(b.created_at || '') - Date.parse(a.created_at || '')
              })
              .map(meeting => {
                const client = clients.find(item => item.id === meeting.client_id)
                const project = projects.find(item => item.id === meeting.project_id)
                return (
                  <div key={meeting.id} className="pm-task-card">
                    <div className="pm-task-card-top">
                      <div style={{ minWidth: 0 }}>
                        <div className="pm-task-title">{project?.name || 'Project meeting'}</div>
                        <div className="pm-task-meta">{client?.name || 'Client'} • {new Date(meeting.meeting_date).toLocaleDateString()} • {meeting.meeting_time?.slice(0, 5)}</div>
                      </div>
                      <span className="pm-status-pill In-Progress">MOM</span>
                    </div>
                    <div className="pm-task-date" style={{ whiteSpace: 'pre-wrap', lineHeight: 1.55 }}>
                      {meeting.moms}
                    </div>
                  </div>
                )
              })}
          </div>
        )}
      </div>
    </div>
  </>
)}
{/* ═══════════ ARTIFACTS VIEW ═══════════ */}
{activeNav === 'artifacts' && !selectedProject && (
  <>
    <div className="pm-hero-banner">
      <div>
        <div className="pm-hero-title">Artifacts</div>
        <div className="pm-hero-sub">Upload project files for clients, track approval status, and keep documents linked to the right project.</div>
      </div>
      <div className="pm-hero-pill">{artifacts.length} artifact{artifacts.length !== 1 ? 's' : ''}</div>
    </div>

    <div className="pm-section">
      <div className="pm-section-header">
        <div className="pm-section-icon">{Icons.upload}</div>
        <span className="pm-section-title">New Artifact</span>
      </div>
      <div className="pm-section-body">
        <div className="pm-support-form-grid">
          <div className="pm-field">
            <label className="pm-label">Client Name</label>
            <select
              className="pm-select"
              value={artifactClientId}
              onChange={(e) => {
                setArtifactClientId(e.target.value)
                setArtifactProjectId('')
              }}
            >
              <option value="">Select client...</option>
              {clients.map(client => (
                <option key={client.id} value={client.id}>{client.name}</option>
              ))}
            </select>
          </div>
          <div className="pm-field">
            <label className="pm-label">Project</label>
            <select className="pm-select" value={artifactProjectId} onChange={(e) => setArtifactProjectId(e.target.value)}>
              <option value="">Select project...</option>
              {projects.filter(project => project.client_id === artifactClientId).map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>
          <div className="pm-field">
            <label className="pm-label">Artifact Name</label>
            <input className="pm-input" value={artifactName} onChange={(e) => setArtifactName(e.target.value)} placeholder="Final design handoff" />
          </div>
          <div className="pm-field">
            <label className="pm-label">Creation Date</label>
            <input type="date" className="pm-input" value={artifactCreationDate} onChange={(e) => setArtifactCreationDate(e.target.value)} />
          </div>
          <div className="pm-field">
            <label className="pm-label">Artifact Description</label>
            <textarea className="pm-input" rows={4} value={artifactDescription} onChange={(e) => setArtifactDescription(e.target.value)} placeholder="Short note about this file" />
          </div>
          <div className="pm-field">
            <label className="pm-label">File Upload</label>
            <input
              type="file"
              className="pm-input"
              disabled={artifactUploading}
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) uploadArtifactFile(file)
              }}
            />
            <div className="pm-card-client" style={{ marginTop: 8, marginBottom: 0 }}>
              {artifactUploading ? 'Uploading file...' : artifactFileName || 'No file uploaded yet'}
            </div>
          </div>
        </div>

        <button className="pm-btn pm-btn-primary" style={{ marginTop: 18 }} onClick={createArtifact} disabled={artifactUploading}>
          {Icons.plus} Add Artifact
        </button>
      </div>
    </div>

    <div className="pm-section">
      <div className="pm-section-header">
        <div className="pm-section-icon">{Icons.folder}</div>
        <span className="pm-section-title">Created Artifacts</span>
      </div>
      <div className="pm-section-body">
        {artifacts.length === 0 ? (
          <div className="pm-empty" style={{ marginTop: 0 }}>
            <div className="pm-empty-icon">{Icons.folder}</div>
            <p className="pm-empty-text">No artifacts yet. Upload the first project file above.</p>
          </div>
        ) : (
          <div className="pm-grid" style={{ marginTop: 0 }}>
            {artifacts.map(artifact => {
              const client = clients.find(item => item.id === artifact.client_id)
              const project = projects.find(item => item.id === artifact.project_id)

              return (
                <div key={artifact.id} className="pm-project-card">
                  <div className="pm-card-header">
                    <div className="pm-card-icon">{Icons.folder}</div>
                    <div className="pm-card-arrow">→</div>
                  </div>
                  <div className="pm-card-name">{artifact.name}</div>
                  <div className="pm-card-client">{client?.name || 'Client'} • {project?.name || 'Project'}</div>
                  {artifact.description && (
                    <div style={{ color: '#4f4a63', fontSize: 13, lineHeight: 1.45, marginBottom: 14 }}>{artifact.description}</div>
                  )}
                  <div className="pm-card-meta">
                    <span>Created {artifact.creation_date || 'Not set'}</span>
                    <span className={`pm-status-pill ${String(artifact.approval_status || '').replaceAll(' ', '-')}`}>{artifact.approval_status}</span>
                  </div>
                  {artifact.approved_at && (
                    <div className="pm-card-client" style={{ marginTop: 12, marginBottom: 0 }}>Approved {new Date(artifact.approved_at).toLocaleDateString()}</div>
                  )}
                  <div className="pm-actions" style={{ marginTop: 14 }}>
                    <a className="pm-action-btn" href={artifact.file_url} target="_blank" rel="noopener noreferrer">Download</a>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  </>
)}
{/* ═══════════ SUPPORT CONTRACTS VIEW ═══════════ */}
{activeNav === 'support' && !selectedProject && (
  <>
    <div className="pm-hero-banner">
      <div>
        <div className="pm-hero-title">Support Contract Management</div>
        <div className="pm-hero-sub">Manage post-deployment monthly support agreements, hours, SLA, scope, and renewal tracking.</div>
      </div>
      <button className="pm-hero-pill" style={{ border: 'none', cursor: 'pointer' }} onClick={startNewSupportContract}>
        {Icons.plus} New Contract
      </button>
    </div>

    <div className="pm-support-grid">
      <div className="pm-stat-card">
        <div className="pm-stat-top">
          <div className="pm-stat-label">Active Support Contracts</div>
          <div className="pm-stat-icon">{Icons.project}</div>
        </div>
        <div className="pm-stat-value">{activeSupportContracts.length}</div>
        <div className="pm-stat-foot">Live agreements</div>
      </div>
      <div className="pm-stat-card">
        <div className="pm-stat-top">
          <div className="pm-stat-label">Total Monthly Revenue</div>
          <div className="pm-stat-icon">{Icons.project}</div>
        </div>
        <div className="pm-stat-value" style={{ fontSize: 25 }}>{totalMonthlySupportRevenue.toLocaleString()}</div>
        <div className="pm-stat-foot">Active contracts only</div>
      </div>
      <div className="pm-stat-card">
        <div className="pm-stat-top">
          <div className="pm-stat-label">Total Included Hours</div>
          <div className="pm-stat-icon">{Icons.milestone}</div>
        </div>
        <div className="pm-stat-value">{totalIncludedSupportHours}</div>
        <div className="pm-stat-foot">Monthly allocation</div>
      </div>
      <div className="pm-stat-card">
        <div className="pm-stat-top">
          <div className="pm-stat-label">Total Used Hours</div>
          <div className="pm-stat-icon">{Icons.deliverable}</div>
        </div>
        <div className="pm-stat-value">{totalUsedSupportHours}</div>
        <div className="pm-stat-foot">From work logs</div>
      </div>
      <div className="pm-stat-card">
        <div className="pm-stat-top">
          <div className="pm-stat-label">Contracts Near Expiry</div>
          <div className="pm-stat-icon">{Icons.client}</div>
        </div>
        <div className="pm-stat-value">{supportContractsNearExpiry}</div>
        <div className="pm-stat-foot">Based on reminder days</div>
      </div>
    </div>

    {showSupportForm && (
      <div className="pm-section">
        <div className="pm-section-header">
          <div className="pm-section-icon">{Icons.plus}</div>
          <span className="pm-section-title">{editingSupportContract ? 'Edit Support Contract' : 'Create Support Contract'}</span>
          <button className="pm-action-btn" style={{ marginLeft: 'auto' }} onClick={resetSupportForm}>Cancel</button>
        </div>
        <div className="pm-section-body">
          <div className="pm-support-form-grid">
            <div className="pm-field">
              <label className="pm-label">Client</label>
              <select
                className="pm-select"
                value={supportForm.client_id}
                onChange={(e) => {
                  setSupportField('client_id', e.target.value)
                  setSupportField('project_id', '')
                }}
              >
                <option value="">Select client...</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>
            <div className="pm-field">
              <label className="pm-label">Project</label>
              <select className="pm-select" value={supportForm.project_id} onChange={(e) => setSupportField('project_id', e.target.value)}>
                <option value="">Select project...</option>
                {projects.filter(project => project.client_id === supportForm.client_id).map(project => (
                  <option key={project.id} value={project.id}>{project.name}</option>
                ))}
              </select>
            </div>
            <div className="pm-field">
              <label className="pm-label">Support Contract Name</label>
              <input className="pm-input" value={supportForm.name} onChange={(e) => setSupportField('name', e.target.value)} placeholder="Monthly support agreement" />
            </div>
            <div className="pm-field">
              <label className="pm-label">Contract Status</label>
              <select className="pm-select" value={supportForm.status} onChange={(e) => setSupportField('status', e.target.value)}>
                <option value="Active">Active</option>
                <option value="Expired">Expired</option>
                <option value="Suspended">Suspended</option>
                <option value="Pending Renewal">Pending Renewal</option>
              </select>
            </div>
            <div className="pm-field">
              <label className="pm-label">Contract Duration In Days</label>
              <input type="number" min="1" className="pm-input" value={supportForm.duration_days} onChange={(e) => setSupportField('duration_days', e.target.value)} placeholder="30" />
            </div>
          </div>

          <div className="pm-section" style={{ marginTop: 18 }}>
            <div className="pm-section-header">
              <div className="pm-section-icon">{Icons.project}</div>
              <span className="pm-section-title">Monthly Agreement Details</span>
            </div>
            <div className="pm-section-body">
              <div className="pm-support-form-grid three">
                <div className="pm-field">
                  <label className="pm-label">Monthly Support Fee</label>
                  <input className="pm-input" type="number" value={supportForm.monthly_support_fee} onChange={(e) => setSupportField('monthly_support_fee', e.target.value)} />
                </div>
                <div className="pm-field">
                  <label className="pm-label">Included Hours Per Month</label>
                  <input className="pm-input" type="number" value={supportForm.included_hours_per_month} onChange={(e) => setSupportField('included_hours_per_month', e.target.value)} />
                </div>
                <div className="pm-field">
                  <label className="pm-label">Maximum Accumulated Hours</label>
                  <input className="pm-input" type="number" value={supportForm.max_accumulated_hours} onChange={(e) => setSupportField('max_accumulated_hours', e.target.value)} />
                </div>
                <label className="pm-check-pill">
                  <input type="checkbox" checked={supportForm.hours_rollover} onChange={(e) => setSupportField('hours_rollover', e.target.checked)} />
                  Hours Rollover
                </label>
                <div className="pm-field">
                  <label className="pm-label">Extra Hour Rate</label>
                  <input className="pm-input" type="number" value={supportForm.extra_hour_rate} onChange={(e) => setSupportField('extra_hour_rate', e.target.value)} />
                </div>
                <label className="pm-check-pill">
                  <input type="checkbox" checked={supportForm.approval_required_for_extra_hours} onChange={(e) => setSupportField('approval_required_for_extra_hours', e.target.checked)} />
                  Approval Required For Extra Hours
                </label>
              </div>
            </div>
          </div>

          <div className="pm-section" style={{ marginTop: 18 }}>
            <div className="pm-section-header">
              <div className="pm-section-icon">{Icons.milestone}</div>
              <span className="pm-section-title">SLA Settings</span>
            </div>
            <div className="pm-section-body">
              <div className="pm-support-form-grid three">
                <div className="pm-field">
                  <label className="pm-label">Critical Response Time In Hours</label>
                  <input className="pm-input" type="number" value={supportForm.critical_response_hours} onChange={(e) => setSupportField('critical_response_hours', e.target.value)} />
                  <textarea className="pm-input" rows={2} style={{ marginTop: 8 }} value={supportForm.critical_response_definition} onChange={(e) => setSupportField('critical_response_definition', e.target.value)} placeholder="Definition for critical SLA" />
                </div>
                <div className="pm-field">
                  <label className="pm-label">Normal Response Time In Hours</label>
                  <input className="pm-input" type="number" value={supportForm.normal_response_hours} onChange={(e) => setSupportField('normal_response_hours', e.target.value)} />
                  <textarea className="pm-input" rows={2} style={{ marginTop: 8 }} value={supportForm.normal_response_definition} onChange={(e) => setSupportField('normal_response_definition', e.target.value)} placeholder="Definition for normal SLA" />
                </div>
                <div className="pm-field">
                  <label className="pm-label">Low Response Time In Hours</label>
                  <input className="pm-input" type="number" value={supportForm.low_response_hours} onChange={(e) => setSupportField('low_response_hours', e.target.value)} />
                  <textarea className="pm-input" rows={2} style={{ marginTop: 8 }} value={supportForm.low_response_definition} onChange={(e) => setSupportField('low_response_definition', e.target.value)} placeholder="Definition for low SLA" />
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginTop: 18 }}>
            <div className="pm-section" style={{ marginBottom: 0 }}>
              <div className="pm-section-header">
                <div className="pm-section-icon">{Icons.deliverable}</div>
                <span className="pm-section-title">Included Scope</span>
              </div>
              <div className="pm-section-body">
                <div className="pm-support-checks">
                  {supportIncludedScopeOptions.map(scope => (
                    <label key={scope} className="pm-check-pill">
                      <input type="checkbox" checked={supportForm.included_scope.includes(scope)} onChange={() => toggleSupportScope('included_scope', scope)} />
                      {scope}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pm-support-form-grid" style={{ marginTop: 18 }}>
            <div className="pm-section" style={{ marginBottom: 0 }}>
              <div className="pm-section-header">
                <div className="pm-section-icon">{Icons.milestone}</div>
                <span className="pm-section-title">Renewal Settings</span>
              </div>
              <div className="pm-section-body">
                <div className="pm-field">
                  <label className="pm-label">Renewal Reminder Days Before Expiry</label>
                  <input className="pm-input" type="number" value={supportForm.renewal_reminder_days} onChange={(e) => setSupportField('renewal_reminder_days', e.target.value)} />
                </div>
                <label className="pm-check-pill">
                  <input type="checkbox" checked={supportForm.auto_renewal} onChange={(e) => setSupportField('auto_renewal', e.target.checked)} />
                  Auto Renewal
                </label>
              </div>
            </div>
            <div className="pm-section" style={{ marginBottom: 0 }}>
              <div className="pm-section-header">
                <div className="pm-section-icon">{Icons.project}</div>
                <span className="pm-section-title">Internal Notes</span>
              </div>
              <div className="pm-section-body">
                <textarea className="pm-input" rows={5} value={supportForm.internal_notes} onChange={(e) => setSupportField('internal_notes', e.target.value)} placeholder="Admin-only notes. These do not appear in the client dashboard." />
              </div>
            </div>
          </div>

          <button className="pm-btn pm-btn-primary" style={{ marginTop: 18 }} onClick={saveSupportContract}>
            {editingSupportContract ? 'Save Changes' : 'Create Support Contract'}
          </button>
        </div>
      </div>
    )}

    <div className="pm-support-layout">
      <div className="pm-section">
        <div className="pm-section-header">
          <div className="pm-section-icon">{Icons.project}</div>
          <span className="pm-section-title">Support Contracts</span>
          <button className="pm-action-btn" style={{ marginLeft: 'auto' }} onClick={startNewSupportContract}>Create</button>
        </div>
        <div className="pm-section-body">
          {supportContracts.length === 0 ? (
            <div className="pm-empty" style={{ marginTop: 0 }}>
              <div className="pm-empty-icon">{Icons.folder}</div>
              <p className="pm-empty-text">No support contracts yet. Create the first signed monthly support agreement above.</p>
            </div>
          ) : (
            <div className="pm-grid" style={{ marginTop: 0 }}>
              {supportContracts.map(contract => {
                const hours = getSupportHourSummary(contract)
                const included = Math.max(hours.included, 1)
                const usage = Math.min((hours.used / included) * 100, 100)
                return (
                  <div key={contract.id} className={`pm-support-card ${selectedSupportContract?.id === contract.id ? 'active' : ''}`} onClick={() => setSelectedSupportContract(contract)}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start', marginBottom: 12 }}>
                      <div>
                        <div className="pm-card-name">{contract.name}</div>
                        <div className="pm-card-client">{clients.find(client => client.id === contract.client_id)?.name}</div>
                        <div className="pm-card-client">{projects.find(project => project.id === contract.project_id)?.name}</div>
                      </div>
                      <span className={`pm-status-pill ${String((contract.client_approval_status || 'Approved') === 'Pending' ? 'Pending Approval' : contract.status || '').replaceAll(' ', '-')}`}>
                        {(contract.client_approval_status || 'Approved') === 'Pending' ? 'Pending Approval' : contract.status}
                      </span>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>
                      <div>
                        <div className="pm-stat-label">Monthly Fee</div>
                        <div style={{ fontSize: 18, fontWeight: 900, color: '#15113b' }}>{Number(contract.monthly_support_fee || 0).toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="pm-stat-label">Duration</div>
                        <div style={{ fontSize: 13, fontWeight: 900, color: '#15113b' }}>{Number(contract.duration_days || 0)} days</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: '#6d6883', fontWeight: 800 }}>
                      {hours.used} used / {hours.included} included hours
                    </div>
                    <div className="pm-hours-bar">
                      <div className="pm-hours-fill" style={{ width: `${usage}%` }} />
                    </div>
                    <div className="pm-actions" style={{ marginTop: 14 }} onClick={(e) => e.stopPropagation()}>
                      <button className="pm-action-btn" onClick={() => editSupportContract(contract)}>Edit</button>
                      <button className="pm-action-btn" onClick={() => renewSupportContract(contract)}>Renew</button>
                      <button className="pm-action-btn danger" onClick={() => deleteSupportContract(contract.id)}>Delete</button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      <div className="pm-section">
        <div className="pm-section-header">
          <div className="pm-section-icon">{Icons.deliverable}</div>
          <span className="pm-section-title">Contract Detail</span>
        </div>
        <div className="pm-section-body">
          {!selectedSupportContract || !selectedSupportHours ? (
            <div className="pm-empty" style={{ marginTop: 0 }}>
              <p className="pm-empty-text">Select a support contract to view hours, SLA, scope, renewals, and logs.</p>
            </div>
          ) : (
            <>
              <div className="pm-card-name" style={{ marginBottom: 6 }}>{selectedSupportContract.name}</div>
              <div className="pm-card-client" style={{ marginBottom: 14 }}>
                Duration: {Number(selectedSupportContract.duration_days || 0)} days • Expires {getSupportContractExpiryDate(selectedSupportContract).toLocaleDateString()}
              </div>

              <div className="pm-support-form-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="pm-deliverable-item" style={{ marginBottom: 0 }}>
                  <div>
                    <div className="pm-stat-label">Included</div>
                    <strong>{selectedSupportHours.included}</strong>
                  </div>
                </div>
                <div className="pm-deliverable-item" style={{ marginBottom: 0 }}>
                  <div>
                    <div className="pm-stat-label">Used</div>
                    <strong>{selectedSupportHours.used}</strong>
                  </div>
                </div>
                <div className="pm-deliverable-item" style={{ marginBottom: 0 }}>
                  <div>
                    <div className="pm-stat-label">Remaining</div>
                    <strong>{selectedSupportHours.remaining}</strong>
                  </div>
                </div>
                <div className="pm-deliverable-item" style={{ marginBottom: 0 }}>
                  <div>
                    <div className="pm-stat-label">Extra</div>
                    <strong>{selectedSupportHours.extra}</strong>
                  </div>
                </div>
              </div>

              <div className="pm-hours-bar">
                <div className="pm-hours-fill" style={{ width: `${Math.min((selectedSupportHours.used / Math.max(selectedSupportHours.included, 1)) * 100, 100)}%` }} />
              </div>

              <div style={{ marginTop: 18, display: 'grid', gap: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 900, color: '#15113b' }}>SLA Response Times</div>
                <div className="pm-card-client">Critical: {selectedSupportContract.critical_response_hours || 0}h{selectedSupportContract.critical_response_definition ? ` • ${selectedSupportContract.critical_response_definition}` : ''}</div>
                <div className="pm-card-client">Normal: {selectedSupportContract.normal_response_hours || 0}h{selectedSupportContract.normal_response_definition ? ` • ${selectedSupportContract.normal_response_definition}` : ''}</div>
                <div className="pm-card-client">Low: {selectedSupportContract.low_response_hours || 0}h{selectedSupportContract.low_response_definition ? ` • ${selectedSupportContract.low_response_definition}` : ''}</div>
              </div>

              <div style={{ marginTop: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 900, color: '#15113b', marginBottom: 8 }}>Included Scope</div>
                {(selectedSupportContract.included_scope || []).length === 0 ? (
                  <div className="pm-card-client">No included scope selected.</div>
                ) : (
                  <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                    {selectedSupportContract.included_scope.map((scope: string) => (
                      <span key={scope} className="pm-status-pill">{scope}</span>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ marginTop: 18 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                  <div style={{ fontSize: 12, fontWeight: 900, color: '#15113b' }}>Renewal Log</div>
                  <button className="pm-action-btn" onClick={() => renewSupportContract(selectedSupportContract)}>Renew</button>
                </div>
                {selectedSupportRenewals.length === 0 ? (
                  <div className="pm-card-client">No renewals logged yet.</div>
                ) : selectedSupportRenewals.map(renewal => (
                  <div key={renewal.id} className="pm-deliverable-item" style={{ marginBottom: 8 }}>
                    <div>
                      <div className="pm-stat-label">{new Date(renewal.renewal_date || renewal.created_at).toLocaleDateString()}</div>
                      <strong>{Number(renewal.duration_days || 0)} days</strong>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>
    </div>

    {selectedSupportContract && (
      <div className="pm-section">
        <div className="pm-section-header">
          <div className="pm-section-icon">{Icons.plus}</div>
          <span className="pm-section-title">Work Log Entries</span>
        </div>
        <div className="pm-section-body">
          <div className="pm-support-form-grid three">
            <div className="pm-field">
              <label className="pm-label">Support Request / Issue Title</label>
              <input className="pm-input" value={supportWorkLogForm.title} onChange={(e) => setSupportWorkLogForm(prev => ({ ...prev, title: e.target.value }))} />
            </div>
            <div className="pm-field">
              <label className="pm-label">Creation Date</label>
              <input type="date" className="pm-input" value={supportWorkLogForm.work_date} onChange={(e) => setSupportWorkLogForm(prev => ({ ...prev, work_date: e.target.value }))} />
            </div>
            <div className="pm-field">
              <label className="pm-label">Time Required In Hours</label>
              <input type="number" className="pm-input" value={supportWorkLogForm.time_spent_hours} onChange={(e) => setSupportWorkLogForm(prev => ({ ...prev, time_spent_hours: e.target.value }))} />
            </div>
            <div className="pm-field">
              <label className="pm-label">Charged Hours</label>
              <input type="number" className="pm-input" value={supportWorkLogForm.charged_hours} onChange={(e) => setSupportWorkLogForm(prev => ({ ...prev, charged_hours: e.target.value }))} />
            </div>
            <div className="pm-field">
              <label className="pm-label">Charge Per Hour</label>
              <input type="number" className="pm-input" value={supportWorkLogForm.charge_per_hour} onChange={(e) => setSupportWorkLogForm(prev => ({ ...prev, charge_per_hour: e.target.value }))} />
            </div>
            <div className="pm-field">
              <label className="pm-label">Priority</label>
              <select className="pm-select" value={supportWorkLogForm.priority} onChange={(e) => setSupportWorkLogForm(prev => ({ ...prev, priority: e.target.value }))}>
                <option value="Critical">Critical</option>
                <option value="Normal">Normal</option>
                <option value="Low">Low</option>
              </select>
            </div>
            <div className="pm-field">
              <label className="pm-label">Status</label>
              <select className="pm-select" value={supportWorkLogForm.status} onChange={(e) => setSupportWorkLogForm(prev => ({ ...prev, status: e.target.value }))}>
                <option value="Open">Open</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
          </div>
          <div className="pm-field">
            <label className="pm-label">Description</label>
            <textarea className="pm-input" rows={4} value={supportWorkLogForm.description} onChange={(e) => setSupportWorkLogForm(prev => ({ ...prev, description: e.target.value }))} />
          </div>
          <button className="pm-btn pm-btn-primary" onClick={createSupportWorkLog}>{Icons.plus} Add Work Log</button>

          <div style={{ marginTop: 22 }}>
            {selectedSupportLogs.length === 0 ? (
              <div className="pm-empty" style={{ marginTop: 0 }}>
                <p className="pm-empty-text">No work logs added yet.</p>
              </div>
            ) : (
              selectedSupportLogs.map(log => (
                <div key={log.id} className="pm-work-log">
                  <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12 }}>
                    <div style={{ fontWeight: 900, color: '#15113b' }}>{log.title}</div>
                    <span className={`pm-status-pill ${String(log.approval_status || 'Pending').replaceAll(' ', '-')}`}>{log.approval_status || 'Pending'}</span>
                  </div>
                  <div className="pm-card-client">
                    {log.work_date || 'No creation date'} • {Number(log.time_spent_hours || 0)}h required • {Number(log.charged_hours || 0)}h charged • {Number(log.charge_per_hour || 0).toLocaleString()} per hour • {log.priority} • {log.status}
                  </div>
                  {log.description && <div style={{ color: '#4f4a63', fontSize: 13, lineHeight: 1.5 }}>{log.description}</div>}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    )}
  </>
)}
{/* ═══════════ CLIENTS REQUESTS VIEW ═══════════ */}
{activeNav === 'requests' && !selectedProject && !selectedRequest && (
  <>
    <div className="pm-section">
      <div className="pm-section-header">
        <div className="pm-section-icon">{Icons.client}</div>
        <span className="pm-section-title">Chats</span>
      </div>

      <div className="pm-section-body">
<div style={{ display: 'flex', gap: '12px', marginBottom: '20px' }}>

<button
  className={`pm-btn ${requestFilter === 'Open' ? 'pm-btn-primary' : 'pm-btn-outline'}`}
  onClick={() => setRequestFilter('Open')}
>
  Open chats
</button>
<button
  className={`pm-btn ${requestFilter === 'Closed' ? 'pm-btn-primary' : 'pm-btn-outline'}`}
  onClick={() => setRequestFilter('Closed')}
>
  Closed chats
</button>

<button
  className="pm-btn pm-btn-primary"
  style={{ marginLeft: 'auto' }}
  onClick={() => setShowRequestForm(!showRequestForm)}
>
    {Icons.plus} Add Chat
  </button>
</div>
<>
  {showRequestForm && (
    <div
      className="pm-section"
      style={{ marginBottom: '20px' }}
    >
      <div className="pm-section-header">
        <div className="pm-section-icon">{Icons.plus}</div>
        <span className="pm-section-title">
          New Chat
        </span>
      </div>

      <div className="pm-section-body">

        <div className="pm-field">
          <label className="pm-label">Client</label>

          <select
            className="pm-select"
            value={requestClientId}
            onChange={(e) => {
              setRequestClientId(e.target.value)
              setRequestProjectId('')
            }}
          >
            <option value="">Select client...</option>

            {clients.map(client => (
              <option key={client.id} value={client.id}>
                {client.name}
              </option>
            ))}
          </select>
        </div>

        <div className="pm-field">
          <label className="pm-label">Project</label>

          <select
            className="pm-select"
            value={requestProjectId}
            onChange={(e) => setRequestProjectId(e.target.value)}
          >
            <option value="">Select project...</option>

            {projects
              .filter(p => p.client_id === requestClientId)
              .map(project => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
          </select>
        </div>

        <div className="pm-field">
          <label className="pm-label">Subject</label>

          <input
            className="pm-input"
            value={requestSubject}
            onChange={(e) => setRequestSubject(e.target.value)}
          />
        </div>

        <div className="pm-field">
          <label className="pm-label">Description</label>

          <textarea
            className="pm-input"
            rows={5}
            value={requestDescription}
            onChange={(e) => setRequestDescription(e.target.value)}
          />
        </div>
<button
  className="pm-btn pm-btn-primary"
  onClick={createClientRequest}
>
          Send Request
        </button>

      </div>
    </div>
  )}

<div className="pm-grid">
  {clientRequests
.filter(req => req.status === requestFilter)
    .map(req => (
      <div
        key={req.id}
        className="pm-project-card"
        onClick={() => setSelectedRequest(req)}
      >
        <div className="pm-card-name">{req.subject}</div>

        <div className="pm-card-client">
          {clients.find(c => c.id === req.client_id)?.name}
        </div>

        <div className="pm-card-client">
          {projects.find(p => p.id === req.project_id)?.name}
        </div>
      </div>
    ))}
</div>
</>
      </div>
    </div>
  </>
)}            
{/* ═══════════ REQUEST DETAILS VIEW ═══════════ */}
{selectedRequest && (
  <div>

    <button
      className="pm-back-btn"
      onClick={() => setSelectedRequest(null)}
    >
      {Icons.back} Back to Requests
    </button>

    <div className="pm-section" style={{ marginBottom: '20px' }}>
      <div className="pm-section-header">
        <div className="pm-section-icon">{Icons.client}</div>

        <span className="pm-section-title">
          {selectedRequest.subject}
        </span>
      </div>

      <div className="pm-section-body">

        <div style={{ marginBottom: '12px' }}>
          <strong>Client:</strong>{' '}
          {clients.find(c => c.id === selectedRequest.client_id)?.name}
        </div>

        <div style={{ marginBottom: '12px' }}>
          <strong>Project:</strong>{' '}
          {projects.find(p => p.id === selectedRequest.project_id)?.name}
        </div>

        <div style={{ marginBottom: '12px' }}>
          <strong>Status:</strong>{' '}
          {selectedRequest.status}
        </div>

        <div>
          <strong>Description:</strong>

          <div style={{
            marginTop: '10px',
            background: '#f7f7f7',
            padding: '14px',
            borderRadius: '12px'
          }}>
            {selectedRequest.description}
          </div>
        </div>

      </div>
    </div>

    <div className="pm-section">
      <div className="pm-section-header">
        <div className="pm-section-icon">{Icons.client}</div>

        <span className="pm-section-title">
          Conversation
        </span>
      </div>

      <div className="pm-section-body">
<div style={{ marginBottom: '16px' }}>
  <button
    className="pm-btn pm-btn-outline"
    onClick={closeClientRequest}
  >
    Close Request
  </button>
</div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          marginBottom: '20px'
        }}>

          {clientRequestMessages
            .filter(msg => msg.request_id === selectedRequest.id)
            .map(msg => (
              <div
                key={msg.id}
                style={{
                  alignSelf:
                    msg.sender === 'admin'
                      ? 'flex-end'
                      : 'flex-start',

                  background:
                    msg.sender === 'admin'
                      ? '#6d5dfc'
                      : '#f1f1f1',

                  color:
                    msg.sender === 'admin'
                      ? '#fff'
                      : '#111',

                  padding: '12px 14px',
                  borderRadius: '16px',
                  maxWidth: '75%'
                }}
              >
                {msg.message}
              </div>
            ))}

        </div>

        <div style={{
          display: 'flex',
          gap: '10px'
        }}>
          <input
            className="pm-input"
            placeholder="Type a message..."
            value={requestMessage}
            onChange={(e) => setRequestMessage(e.target.value)}
          />

          <button
            className="pm-btn pm-btn-primary"
            onClick={sendRequestMessage}
          >
            Send
          </button>
        </div>

      </div>
    </div>

  </div>
)}
{/* ═══════════ PROJECTS VIEW ═══════════ */}
            {activeNav === 'projects' && !selectedProject && (
              <>
                <div className="pm-hero-banner">
                  <div>
                    <div className="pm-hero-title">Project Management Overview</div>
                    <div className="pm-hero-sub">Track clients, projects, milestones, and deliverables from one clean workspace.</div>
                  </div>
                  <div className="pm-hero-pill">Admin Dashboard</div>
                </div>

                <div className="pm-stats-grid">
                  <div className="pm-stat-card">
                    <div className="pm-stat-top">
                      <div className="pm-stat-label">Clients</div>
                      <div className="pm-stat-icon">{Icons.client}</div>
                    </div>
                    <div className="pm-stat-value">{clients.length}</div>
                    <div className="pm-stat-foot">Active workspace</div>
                  </div>
                  <div className="pm-stat-card">
                    <div className="pm-stat-top">
                      <div className="pm-stat-label">Projects</div>
                      <div className="pm-stat-icon">{Icons.project}</div>
                    </div>
                    <div className="pm-stat-value">{projects.length}</div>
                    <div className="pm-stat-foot">Total projects</div>
                  </div>
                  <div className="pm-stat-card">
                    <div className="pm-stat-top">
                      <div className="pm-stat-label">Milestones</div>
                      <div className="pm-stat-icon">{Icons.milestone}</div>
                    </div>
                    <div className="pm-stat-value">{milestones.length}</div>
                    <div className="pm-stat-foot">Project phases</div>
                  </div>
                  <div className="pm-stat-card">
                    <div className="pm-stat-top">
                      <div className="pm-stat-label">Deliverables</div>
                      <div className="pm-stat-icon">{Icons.deliverable}</div>
                    </div>
                    <div className="pm-stat-value">{deliverables.length}</div>
                    <div className="pm-stat-foot">Work items</div>
                  </div>
                </div>

                {/* Create Project */}
                <div className="pm-section">
                  <div className="pm-section-header">
                    <div className="pm-section-icon">{Icons.project}</div>
                    <span className="pm-section-title">New Project</span>
                  </div>
                  <div className="pm-section-body">
                    <div className="pm-form-row">
                      <div className="pm-field">
                        <label className="pm-label">Client</label>
                        <select className="pm-select" onChange={e => setProjectClientId(e.target.value)} value={projectClientId}>
                          <option value="">Select a client…</option>
                          {clients.map(c => (
                            <option key={c.id} value={c.id}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="pm-field">
                        <label className="pm-label">Project Name</label>
                        <input
                          className="pm-input"
                          placeholder="Website Redesign"
                          value={projectName}
                          onChange={e => setProjectName(e.target.value)}
                          onKeyDown={e => { if (e.key === 'Enter') createProject() }}
                        />
                      </div>
                      <button className="pm-btn pm-btn-primary" style={{ flexShrink: 0 }} onClick={createProject}>
                        {Icons.plus} Create
                      </button>
                    </div>
                  </div>
                </div>

                {/* Projects Grid */}
                <div className="pm-divider">
                  <div className="pm-divider-line" />
                  <span className="pm-divider-text">All Projects</span>
                  <div className="pm-divider-line" />
                </div>

                {projects.length === 0 ? (
                  <div className="pm-empty">
                    <div className="pm-empty-icon">{Icons.folder}</div>
                    <p className="pm-empty-text">No projects yet. Create your first project above.</p>
                  </div>
                ) : (
                  <div className="pm-grid">
                    {projects.map(p => (
                      <div key={p.id} className="pm-project-card" onClick={() => setSelectedProject(p)}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                          <div className="pm-card-icon">{Icons.folder}</div>
                          <div className="pm-actions" onClick={e => e.stopPropagation()}>
                            <button className="pm-action-btn" onClick={() => editProject(p)}>Edit</button>
                            <button className="pm-action-btn danger" onClick={() => deleteProject(p.id)}>Delete</button>
                          </div>
                        </div>
                        <div className="pm-card-name">{p.name}</div>
                        <div className="pm-card-client">{p.clients?.name}</div>
                        {(() => {
                          const stats = getProjectProgress(p.id)
                          return (
                            <div style={{ marginBottom: '14px' }}>
                              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#5a5a5a', marginBottom: '6px' }}>
                                <span>Progress</span>
                                <strong style={{ color: '#0a0a0a' }}>{stats.progress}%</strong>
                              </div>
                              <div style={{ height: '6px', background: '#efefef', borderRadius: '20px', overflow: 'hidden' }}>
                                <div style={{ width: `${stats.progress}%`, height: '100%', background: '#0a0a0a', borderRadius: '20px' }} />
                              </div>
                              <div style={{ fontSize: '11px', color: '#9e9e9e', marginTop: '5px' }}>
                                {stats.completed} completed out of {stats.total}
                              </div>
                            </div>
                          )
                        })()}
                        <div className="pm-card-meta">
                          <span className="pm-card-stat">
                            <strong>{milestones.filter(m => m.project_id === p.id).length}</strong> milestone{milestones.filter(m => m.project_id === p.id).length !== 1 ? 's' : ''}
                          </span>
                          <span className="pm-card-arrow">{Icons.chevronRight}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ═══════════ PROJECT DETAIL ═══════════ */}
            {selectedProject && (
              <div>
                <button className="pm-back-btn" onClick={() => setSelectedProject(null)}>
                  {Icons.back} Back to Projects
                </button>

                <div className="pm-detail-header">
                  <div>
                    <div className="pm-detail-title">{selectedProject.name}</div>
                    <div className="pm-detail-client">{selectedProject.clients?.name}</div>
                  </div>
                </div>

                <div className="pm-progress-card">
                  <div className="pm-gauge" aria-label={`Project progress ${projectProgress}%`}>
                    <div className="pm-gauge-track" style={{ ['--progress' as any]: projectProgress }} />
                  </div>

                  <div>
                    <div className="pm-progress-value">{projectProgress}%</div>
                    <div className="pm-progress-label">Project Progress</div>
                    <div className="pm-progress-sub">
                      {totalDeliverables === 0 ? 'No deliverables yet' : `${completedDeliverables} completed out of ${totalDeliverables} deliverables`}
                    </div>
                  </div>
                </div>

                {/* Add Milestone */}
                <div className="pm-section" style={{ marginBottom: '24px' }}>
                  <div className="pm-section-header">
                    <div className="pm-section-icon">{Icons.milestone}</div>
                    <span className="pm-section-title">Add Milestone</span>
                  </div>
                  <div className="pm-section-body">
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <input
                        className="pm-input"
                        placeholder="e.g. Phase 1 — Discovery"
                        value={milestoneTitle}
                        onChange={e => setMilestoneTitle(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') createMilestone() }}
                        style={{ flex: 1 }}
                      />
                      <button className="pm-btn pm-btn-primary" onClick={createMilestone}>
                        {Icons.plus} Add
                      </button>
                    </div>
                  </div>
                </div>
{/* Assigned Teams */}
<div className="pm-section" style={{ marginBottom: '24px' }}>
  <div className="pm-section-header">
    <div className="pm-section-icon">{Icons.client}</div>
    <span className="pm-section-title">Assigned Teams</span>
  </div>

  <div className="pm-section-body">

    <div className="pm-form-row" style={{ marginBottom: '18px' }}>
      <div className="pm-field">
        <label className="pm-label">Select Team Member</label>

        <select
          className="pm-select"
          value={selectedTeamMemberId}
          onChange={(e) => setSelectedTeamMemberId(e.target.value)}
        >
          <option value="">Select member...</option>

          {teamMembers.map(member => (
            <option key={member.id} value={member.id}>
              {member.name}
            </option>
          ))}
        </select>
      </div>

      <button
        className="pm-btn pm-btn-primary"
        style={{ height: '46px' }}
        onClick={assignTeamMember}
      >
        {Icons.plus} Assign
      </button>
    </div>

    <div className="pm-client-grid">
      {projectTeamMembers
        .filter(ptm => ptm.project_id === selectedProject.id)
        .map(ptm => {
          const member = teamMembers.find(
            m => m.id === ptm.team_member_id
          )

          if (!member) return null

          return (
            <div key={ptm.id} className="pm-client-card">
              <div
                className="pm-client-avatar"
                style={{ background: '#6d5dfc' }}
              >
                {member.name?.charAt(0)?.toUpperCase()}
              </div>

              <div className="pm-client-info">
                <div className="pm-client-name">
                  {member.name}
                </div>

                <div className="pm-client-projects">
                  {member.username}
                </div>
              </div>
            </div>
          )
        })}
    </div>

  </div>
</div>

{/* Payments */}
<div className="pm-section" style={{ marginBottom: '24px' }}>
  <div className="pm-section-header">
    <div className="pm-section-icon">{Icons.project}</div>
    <span className="pm-section-title">Payments</span>
    <div style={{ marginLeft: 'auto', background: '#ffffff', border: '1px solid rgba(230,226,245,0.95)', borderRadius: 14, padding: '9px 10px', minWidth: 260, boxShadow: '0 10px 24px rgba(45,35,120,0.06)' }}>
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#9a96ad', marginBottom: 6 }}>Project Value</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <input
          className="pm-input"
          placeholder="e.g. SAR 120,000"
          value={projectValue}
          onChange={(e) => setProjectValue(e.target.value)}
          style={{ height: 36, padding: '8px 10px', borderRadius: 11, fontSize: 13, fontWeight: 800 }}
        />
        <button
          className="pm-action-btn"
          onClick={saveProjectValue}
          style={{ height: 36, padding: '7px 12px', flexShrink: 0 }}
        >
          Save
        </button>
      </div>
    </div>
  </div>

  <div className="pm-section-body">

    <div className="pm-form-row" style={{ marginBottom: '12px' }}>
      <div className="pm-field">
        <label className="pm-label">Payment Name</label>
        <input
          className="pm-input"
          placeholder="Initial Payment"
          value={paymentName}
          onChange={(e) => setPaymentName(e.target.value)}
        />
      </div>

      <div className="pm-field">
        <label className="pm-label">Percentage</label>
        <input
          className="pm-input"
          placeholder="50%"
          value={paymentPercentage}
          onChange={(e) => setPaymentPercentage(e.target.value)}
        />
      </div>
    </div>

    <div className="pm-form-row" style={{ marginBottom: '18px' }}>
      <div className="pm-field">
        <label className="pm-label">Status</label>
        <select
          className="pm-select"
          value={paymentStatus}
          onChange={(e) => setPaymentStatus(e.target.value)}
        >
          <option value="Pending">Pending</option>
          <option value="Paid">Paid</option>
          <option value="Delayed">Delayed</option>
        </select>
      </div>

      <div className="pm-field">
        <label className="pm-label">Due Upon</label>
        <input
          className="pm-input"
          placeholder="Upon project approval"
          value={paymentDueUpon}
          onChange={(e) => setPaymentDueUpon(e.target.value)}
        />
      </div>
    </div>

    <button
      className="pm-btn pm-btn-primary"
      onClick={createPayment}
    >
      {Icons.plus} Add Payment
    </button>

    <div style={{ marginTop: '24px' }}>
      {payments
        .filter((p) => p.project_id === selectedProject.id && p.term !== PROJECT_VALUE_PAYMENT_TERM)
        .map((p) => (
          <div
            key={p.id}
            className="pm-deliverable-item"
            style={{ marginBottom: '10px' }}
          >
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>{p.term}</div>

              <div
                style={{
                  fontSize: '12px',
                  color: '#777',
                  marginTop: '4px'
                }}
              >
                {p.amount}% • {p.is_paid ? 'Paid' : 'Pending'} • {p.due_upon}
              </div>
            </div>
          </div>
        ))}
    </div>

  </div>
</div>

                {/* External Cards */}
                <div className="pm-section" style={{ marginBottom: '24px' }}>
                  <div className="pm-section-header">
                    <div className="pm-section-icon">{Icons.project}</div>
                    <span className="pm-section-title">External Cards</span>
                  </div>
                  <div className="pm-section-body">
                    <div className="pm-form-row" style={{ alignItems: 'stretch', flexWrap: 'wrap' }}>
                      <div className="pm-field" style={{ flex: 1, minWidth: '220px' }}>
                        <label className="pm-label">Card Name</label>
                        <input
                          className="pm-input"
                          placeholder="UI/UX Design File"
                          value={externalTitle}
                          onChange={e => setExternalTitle(e.target.value)}
                        />
                      </div>

                      <div className="pm-field" style={{ flex: 1, minWidth: '260px' }}>
                        <label className="pm-label">External URL</label>
                        <input
                          className="pm-input"
                          placeholder="https://..."
                          value={externalUrl}
                          onChange={e => setExternalUrl(e.target.value)}
                        />
                      </div>
                    </div>

                    <div className="pm-field">
                      <label className="pm-label">Card Picture</label>
                      <div className="pm-file-upload">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const file = e.target.files?.[0]
                            if (!file) return

                            const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-')
                            const filePath = `external-links/${Date.now()}-${safeName}`
                            const { error: uploadError } = await supabase.storage.from('client-logos').upload(filePath, file, { upsert: true })

                            if (uploadError) {
                              console.error(uploadError)
                              alert(uploadError.message)
                              return
                            }

                            const { data } = supabase.storage.from('client-logos').getPublicUrl(filePath)
                            setExternalIconUrl(data.publicUrl)
                          }}
                        />
                        <div style={{ color: '#5a5a5a' }}>{Icons.upload}</div>
                        <div className="pm-file-upload-text">
                          {externalIconUrl ? 'Image uploaded successfully' : 'Click to upload card image'}
                        </div>
                        <div className="pm-file-upload-sub">PNG, JPG, SVG up to 5MB</div>
                      </div>
                    </div>

                    <button className="pm-btn pm-btn-primary" onClick={createExternalLink}>
                      {Icons.plus} Add Card
                    </button>
                  </div>
                </div>

                {externalLinks.filter(link => link.project_id === selectedProject.id).length > 0 && (
                  <div className="pm-section" style={{ marginBottom: '24px' }}>
                    <div className="pm-section-header">
                      <div className="pm-section-icon">{Icons.project}</div>
                      <span className="pm-section-title">Project External Links</span>
                    </div>
                    <div className="pm-section-body">
                      <div className="pm-grid">
                        {externalLinks
                          .filter(link => link.project_id === selectedProject.id)
                          .map(link => (
                            <a
                              key={link.id}
                              href={link.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="pm-project-card"
                              style={{ textDecoration: 'none' }}
                            >
                              {link.icon_url ? (
                                <img
                                  src={link.icon_url}
                                  alt={link.title}
                                  style={{
                                    width: '48px',
                                    height: '48px',
                                    objectFit: 'cover',
                                    borderRadius: '12px',
                                    marginBottom: '14px',
                                  }}
                                />
                              ) : (
                                <div className="pm-card-icon">{Icons.project}</div>
                              )}
                              <div className="pm-card-name">{link.title}</div>
                              <div className="pm-card-client">Click to open external link</div>
                            <div style={{ marginTop: '12px' }}>
  <button
    className="pm-action-btn danger"
    onClick={(e) => {
      e.preventDefault()
      e.stopPropagation()
      deleteExternalLink(link.id)
    }}
  >
    Delete
  </button>
</div>
                            </a>
                          ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Milestones */}
                {projectMilestones.length === 0 ? (
                  <div className="pm-empty">
                    <div className="pm-empty-icon">{Icons.milestone}</div>
                    <p className="pm-empty-text">No milestones yet. Add your first milestone above.</p>
                  </div>
                ) : (
                  projectMilestones.map(m => {
                    const mDeliverables = sortDeliverables(deliverables.filter(d => d.milestone_id === m.id))
                    return (
                      <div key={m.id} className="pm-milestone-card">
                        <div className="pm-milestone-header">
                          <span className="pm-milestone-icon">{Icons.milestone}</span>
                          <span className="pm-milestone-title">{m.title}</span>
                          <div className="pm-actions">
                            <button className="pm-action-btn" onClick={() => editMilestone(m)}>Edit</button>
                            <button className="pm-action-btn danger" onClick={() => deleteMilestone(m.id)}>Delete</button>
                          </div>
                          <span style={{ fontSize: '12px', color: '#9e9e9e' }}>
                            {mDeliverables.length} deliverable{mDeliverables.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="pm-milestone-body">
                          {/* Deliverables list */}
                          {mDeliverables.map(d => (
                            <div key={d.id} className="pm-deliverable-item">
                              <span className="del-icon">{Icons.deliverable}</span>

                              <span style={{ flex: 1, fontWeight: 600 }}>
                                {d.title}
                              </span>

                              <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                marginLeft: 'auto',
                                flexWrap: 'wrap'
                              }}>
                                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#f3f0ff', color: '#5b4bff', padding: '4px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 800, whiteSpace: 'nowrap' }}>
                                  Start
                                  <input
                                    type="date"
                                    value={d.start_date || ''}
                                    onChange={(e) => updateDeliverableField(d.id, 'start_date', e.target.value)}
                                    style={{ border: 'none', background: 'transparent', color: '#5b4bff', fontSize: '11px', fontWeight: 800, outline: 'none', cursor: 'pointer', width: 104 }}
                                  />
                                </label>

                                <label style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#eef7ff', color: '#2563eb', padding: '4px 8px', borderRadius: '999px', fontSize: '11px', fontWeight: 800, whiteSpace: 'nowrap' }}>
                                  End
                                  <input
                                    type="date"
                                    value={d.end_date || ''}
                                    onChange={(e) => updateDeliverableField(d.id, 'end_date', e.target.value)}
                                    style={{ border: 'none', background: 'transparent', color: '#2563eb', fontSize: '11px', fontWeight: 800, outline: 'none', cursor: 'pointer', width: 104 }}
                                  />
                                </label>

                                <select
                                  value={d.status || 'Not started'}
                                  onChange={(e) => updateDeliverableField(d.id, 'status', e.target.value)}
                                  style={{
                                    fontSize: '11px',
                                    padding: '5px 8px',
                                    borderRadius: '20px',
                                    border: 'none',
                                    outline: 'none',
                                    background: d.status === 'Completed' ? '#e8f5e9' : d.status === 'Delayed' ? '#fdecea' : '#f3f3f3',
                                    color: d.status === 'Completed' ? '#2e7d32' : d.status === 'Delayed' ? '#c0392b' : '#5a5a5a',
                                    fontWeight: 800,
                                    whiteSpace: 'nowrap',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <option value="Not started">Not started</option>
                                  <option value="Completed">Completed</option>
                                  <option value="Delayed">Delayed</option>
                                </select>
                              </div>

                              <div className="pm-actions">
                                <button className="pm-action-btn danger" onClick={() => deleteDeliverable(d.id)}>Delete</button>
                              </div>
                            </div>
                          ))}

                          {/* Add deliverable */}
                          <div className="pm-inline-form" style={{ flexWrap: 'wrap' }}>
                            <input
                              className="pm-input"
                              placeholder="Deliverable name…"
                              value={deliverableTitles[m.id]?.title || ''}
                              onChange={e =>
                                setDeliverableTitles(prev => ({
                                  ...prev,
                                  [m.id]: { ...prev[m.id], title: e.target.value }
                                }))
                              }
                              style={{ flex: 2, minWidth: '220px' }}
                            />

                            <input
                              type="date"
                              className="pm-input"
                              value={deliverableTitles[m.id]?.start_date || ''}
                              onChange={e =>
                                setDeliverableTitles(prev => ({
                                  ...prev,
                                  [m.id]: { ...prev[m.id], start_date: e.target.value }
                                }))
                              }
                              style={{ flex: 1, minWidth: '150px' }}
                            />

                            <input
                              type="date"
                              className="pm-input"
                              value={deliverableTitles[m.id]?.end_date || ''}
                              onChange={e =>
                                setDeliverableTitles(prev => ({
                                  ...prev,
                                  [m.id]: { ...prev[m.id], end_date: e.target.value }
                                }))
                              }
                              style={{ flex: 1, minWidth: '150px' }}
                            />

                            <select
                              className="pm-select"
                              value={deliverableTitles[m.id]?.status || 'Not started'}
                              onChange={e =>
                                setDeliverableTitles(prev => ({
                                  ...prev,
                                  [m.id]: { ...prev[m.id], status: e.target.value }
                                }))
                              }
                              style={{ flex: 1, minWidth: '150px' }}
                            >
                              <option value="Not started">Not started</option>
                              <option value="Completed">Completed</option>
                              <option value="Delayed">Delayed</option>
                            </select>

                            <button
                              className="pm-btn pm-btn-outline pm-btn-sm"
                              onClick={() => createDeliverable(m.id)}
                            >
                              {Icons.plus} Add
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            )}

          </div>
        </main>
      </div>
    </div>
  )
}
