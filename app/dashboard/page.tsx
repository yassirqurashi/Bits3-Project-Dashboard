'use client'

import { useEffect, useState, type CSSProperties } from 'react'
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
  team: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="8" cy="8" r="3.5"/><circle cx="17" cy="9" r="2.5"/><path d="M2.5 20a5.5 5.5 0 0 1 11 0"/><path d="M14.5 18.5a4 4 0 0 1 7 1.5"/>
    </svg>
  ),
  project: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
    </svg>
  ),
  chat: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12a8 8 0 0 1-8 8H7l-4 3v-6.2A8 8 0 1 1 21 12Z"/><path d="M8 10h8M8 14h5"/>
    </svg>
  ),
  support: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 3 4.5 6v5.5c0 4.6 3.1 7.9 7.5 9.5 4.4-1.6 7.5-4.9 7.5-9.5V6L12 3Z"/><path d="M9.5 12.5 11 14l3.7-4"/>
    </svg>
  ),
  task: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="4" y="3" width="16" height="18" rx="3"/><path d="m8 9 1.5 1.5L12 8"/><path d="M14 10h2.5"/><path d="m8 15 1.5 1.5L12 14"/><path d="M14 16h2.5"/>
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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
    </svg>
  ),
  artifact: (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H7a3 3 0 0 0-3 3v14a3 3 0 0 0 3 3h10a3 3 0 0 0 3-3V8Z"/><path d="M14 2v6h6"/><path d="M8 13h8M8 17h5"/>
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

const longDateFormatter = new Intl.DateTimeFormat('en-GB', {
  day: 'numeric',
  month: 'long',
  year: 'numeric',
})

const parseDateOnly = (value?: string | null) => {
  if (!value) return null
  const match = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (!match) return null
  const parsed = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]))
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

const formatDeliverableDate = (value?: string | null) => {
  const parsed = parseDateOnly(value)
  return parsed ? longDateFormatter.format(parsed) : 'Not set'
}

const toDateOnlyValue = (date: Date) => {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

type DeliverableDatePickerProps = {
  label: string
  value?: string | null
  onChange: (value: string) => void
  tone: 'start' | 'end'
  variant?: 'pill' | 'input'
  openUp?: boolean
  style?: CSSProperties
}

function DeliverableDatePicker({
  label,
  value,
  onChange,
  tone,
  variant = 'pill',
  style,
}: DeliverableDatePickerProps) {
  const selectedDate = parseDateOnly(value)
  const [open, setOpen] = useState(false)
  const [viewDate, setViewDate] = useState(() => {
    const base = selectedDate || new Date()
    return new Date(base.getFullYear(), base.getMonth(), 1)
  })

  useEffect(() => {
    if (!selectedDate) return
    setViewDate(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1))
  }, [value])

  const isStart = tone === 'start'
  const accent = isStart ? '#5b4bff' : '#2563eb'
  const surface = isStart ? '#f3f0ff' : '#eef7ff'
  const monthLabel = longDateFormatter.format(viewDate).replace(/^\d+\s/, '')
  const firstDay = new Date(viewDate.getFullYear(), viewDate.getMonth(), 1)
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate()
  const leadingDays = firstDay.getDay()
  const cells = [
    ...Array.from({ length: leadingDays }, () => null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ]

  const buttonStyle: CSSProperties = variant === 'input'
    ? {
        width: '100%',
        height: 54,
        border: '1px solid rgba(255,255,255,0.16)',
        borderRadius: 18,
        background: 'rgba(255,255,255,0.045)',
        color: value ? '#f5f7ff' : 'rgba(255,255,255,0.42)',
        padding: '0 18px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
        fontSize: 15,
        fontWeight: 850,
        cursor: 'pointer',
        textAlign: 'left',
      }
    : {
        border: 'none',
        borderRadius: 999,
        background: surface,
        color: accent,
        padding: '8px 12px',
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        minHeight: 36,
        fontSize: 12,
        fontWeight: 900,
        cursor: 'pointer',
        whiteSpace: 'nowrap',
      }

  return (
    <div style={{ position: 'relative', ...style }}>
      <button
        type="button"
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-label={`${label} deliverable date: ${formatDeliverableDate(value)}`}
        onClick={(event) => {
          event.stopPropagation()
          setOpen(current => !current)
        }}
        style={buttonStyle}
      >
        <span style={{ color: variant === 'input' ? 'rgba(255,255,255,0.62)' : accent }}>{label}</span>
        <span>{formatDeliverableDate(value)}</span>
      </button>

      {open && (
        <>
          <div
            onClick={() => setOpen(false)}
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(2, 6, 23, 0.2)',
              zIndex: 190,
            }}
          />
          <div
            role="dialog"
            aria-label={`${label} date picker`}
            onClick={event => event.stopPropagation()}
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 292,
              maxWidth: 'calc(100vw - 32px)',
              maxHeight: 'calc(100vh - 32px)',
              overflowY: 'auto',
              borderRadius: 22,
              background: '#ffffff',
              color: '#111827',
              border: '1px solid rgba(15,23,42,0.14)',
              boxShadow: '0 28px 80px rgba(0,0,0,0.36)',
              padding: 16,
              zIndex: 200,
            }}
          >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
            <button
              type="button"
              aria-label="Previous month"
              onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1))}
              style={{ border: 'none', background: '#f3f4f6', color: '#111827', borderRadius: 12, width: 38, height: 38, cursor: 'pointer', fontSize: 22, lineHeight: 1, fontWeight: 950 }}
            >
              ‹
            </button>
            <div style={{ fontSize: 16, fontWeight: 950, textAlign: 'center' }}>{monthLabel}</div>
            <button
              type="button"
              aria-label="Next month"
              onClick={() => setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1))}
              style={{ border: 'none', background: '#f3f4f6', color: '#111827', borderRadius: 12, width: 38, height: 38, cursor: 'pointer', fontSize: 22, lineHeight: 1, fontWeight: 950 }}
            >
              ›
            </button>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 8 }}>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(day => (
              <div key={day} style={{ color: '#6b7280', fontSize: 12, fontWeight: 900, textAlign: 'center' }}>{day}</div>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
            {cells.map((day, index) => {
              if (!day) return <div key={`blank-${index}`} />
              const date = new Date(viewDate.getFullYear(), viewDate.getMonth(), day)
              const dateValue = toDateOnlyValue(date)
              const selected = value === dateValue
              return (
                <button
                  key={dateValue}
                  type="button"
                  onClick={() => {
                    onChange(dateValue)
                    setOpen(false)
                  }}
                  style={{
                    border: 'none',
                    borderRadius: 12,
                    height: 34,
                    background: selected ? accent : '#f8fafc',
                    color: selected ? '#ffffff' : '#111827',
                    cursor: 'pointer',
                    fontSize: 14,
                    fontWeight: selected ? 950 : 800,
                  }}
                >
                  {day}
                </button>
              )
            })}
          </div>
        </div>
        </>
      )}
    </div>
  )
}

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

const isHexColor = (value: string) => /^#?([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/.test(value.trim())

const normalizeHexColor = (value: string, fallback: string) => {
  if (!isHexColor(value)) return fallback
  const hex = value.trim().replace('#', '')
  const normalized = hex.length === 3
    ? hex.split('').map(character => `${character}${character}`).join('')
    : hex

  return `#${normalized.toLowerCase()}`
}

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

const getDashboardSectionIcon = (section: DashboardSection) => {
  if (section === 'projects') return Icons.project
  if (section === 'teams') return Icons.team
  if (section === 'requests') return Icons.chat
  if (section === 'support') return Icons.support
  if (section === 'client-tasks') return Icons.task
  if (section === 'meetings') return Icons.meeting
  if (section === 'artifacts') return Icons.artifact
  return Icons.client
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
  .pm-color-code-input {
    border: none;
    outline: none;
    background: transparent;
    color: #3f3a52;
    font-family: 'Inter', sans-serif;
    font-size: 13px;
    font-weight: 850;
    min-width: 86px;
    width: 100%;
  }
  .pm-color-code-input::placeholder { color: #aaa4bc; }

  .pm-progress-card { background: rgba(255,255,255,0.92); border: 1px solid rgba(230,226,245,0.95); border-radius: 20px; padding: 24px; margin-bottom: 24px; display: flex; align-items: center; gap: 28px; box-shadow: var(--shadow-sm); }
  .pm-gauge { width: 190px; height: 112px; position: relative; flex-shrink: 0; }
  .pm-gauge-track { position: absolute; inset: 0; }
  .pm-gauge-track::after { content: none; }
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

  .pm-root {
    --black: #1f1f28;
    --gray-50: #f7f8fb;
    --gray-100: #edf0f4;
    --gray-200: #dde2e8;
    --gray-400: #9aa1ad;
    --gray-600: #5f6470;
    --gray-800: #2b2d35;
    --accent: #7047f6;
    --accent-2: #5f39df;
    --accent-light: #f0edff;
    --radius: 14px;
    --radius-lg: 18px;
    --shadow-sm: 0 10px 24px rgba(23, 28, 45, 0.04);
    --shadow-md: 0 16px 34px rgba(23, 28, 45, 0.08);
    --shadow-lg: 0 22px 48px rgba(23, 28, 45, 0.10);
    background: #f4f6f9;
  }

  .pm-layout {
    max-width: 1920px;
    margin: 0 auto;
    background: #fff;
    box-shadow: inset 0 0 0 1px rgba(17, 24, 39, 0.04);
  }

  .pm-sidebar {
    width: 268px;
    background: #ffffff;
    border-right: 1px solid #e7e9ee;
    box-shadow: none;
    backdrop-filter: none;
  }

  .pm-logo {
    min-height: 82px;
    padding: 22px 24px;
    border-bottom: 1px solid #e9ebf0;
  }

  .pm-logo-title {
    color: #181922;
    font-size: 18px;
    letter-spacing: -0.03em;
    gap: 12px;
  }

  .pm-logo-title::before {
    width: 34px;
    height: 34px;
    border-radius: 12px;
    background: linear-gradient(145deg, #7a52ff 0%, #5e38df 100%);
    box-shadow: 0 10px 20px rgba(112, 71, 246, 0.24);
  }

  .pm-logo-sub {
    display: none;
  }

  .pm-nav {
    padding: 20px 16px;
  }

  .pm-nav-label {
    color: #9aa1ad;
    font-size: 10px;
    letter-spacing: 0.13em;
    padding: 0 10px;
    margin: 18px 0 10px;
  }

  .pm-nav-btn {
    min-height: 44px;
    border-radius: 12px;
    color: #4f535d;
    font-size: 14px;
    font-weight: 650;
    padding: 11px 12px;
  }

  .pm-nav-btn:hover {
    background: #f6f4ff;
    color: #5f39df;
  }

  .pm-nav-btn.active {
    background: #efedff;
    color: #4d2fc6;
    box-shadow: none;
  }

  .pm-nav-btn .icon {
    width: 22px;
    display: inline-flex;
    justify-content: center;
  }

  .pm-sidebar-footer {
    padding: 16px;
    border-top: 1px solid #e9ebf0;
  }

  .pm-logout-btn {
    border-radius: 12px;
    border-color: #e7e9ee;
    box-shadow: none;
  }

  .pm-main {
    margin-left: 268px;
    background: #fbfcfe;
  }

  .pm-topbar {
    height: 82px;
    padding: 0 32px;
    background: rgba(251, 252, 254, 0.92);
    border-bottom: 1px solid #e7e9ee;
    backdrop-filter: blur(16px);
  }

  .pm-topbar-left {
    min-width: 240px;
  }

  .pm-breadcrumb {
    display: none;
  }

  .pm-topbar-title {
    color: #181922;
    font-size: 25px;
    letter-spacing: -0.045em;
  }

  .pm-topbar-title::before {
    content: '';
    display: inline-block;
    width: 18px;
    height: 22px;
    margin-right: 12px;
    vertical-align: -4px;
    border: 3px solid #5f39df;
    border-radius: 3px;
    box-shadow: inset 0 -6px 0 rgba(112, 71, 246, 0.16);
  }

  .pm-topbar-actions {
    flex: 1;
    justify-content: center;
    position: relative;
  }

  .pm-search {
    width: min(520px, 42vw);
    height: 46px;
    border-radius: 15px;
    background: #eef1f5;
    border: 1px solid transparent;
    text-align: center;
    color: #30333b;
    font-size: 14px;
  }

  .pm-search:focus {
    border-color: #d7d2fb;
    background: #fff;
    box-shadow: 0 0 0 4px rgba(112, 71, 246, 0.08);
  }

  .pm-topbar-badge {
    position: absolute;
    right: 0;
    background: #eef1f5;
    color: #292c35;
    border-radius: 999px;
    box-shadow: none;
    padding: 9px 13px;
  }

  .pm-content {
    padding: 30px 34px 44px;
  }

  .pm-hero-banner {
    color: #1f1f28;
    border-radius: 18px;
    padding: 20px 22px;
    background: #ffffff;
    border: 1px solid #e7e9ee;
    box-shadow: var(--shadow-sm);
  }

  .pm-hero-banner::after {
    display: none;
  }

  .pm-hero-title {
    color: #181922;
    font-size: 22px;
    letter-spacing: -0.04em;
  }

  .pm-hero-sub {
    color: #626774;
    opacity: 1;
  }

  .pm-hero-pill,
  button.pm-hero-pill {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #ffffff;
    background: linear-gradient(145deg, #774cf7, #5f39df);
    border: 1px solid rgba(95, 57, 223, 0.16);
    border-radius: 13px;
    box-shadow: 0 10px 22px rgba(112, 71, 246, 0.20);
  }

  .pm-stats-grid,
  .pm-support-grid {
    gap: 14px;
  }

  .pm-stat-card,
  .pm-section,
  .pm-project-card,
  .pm-milestone-card,
  .pm-client-card,
  .pm-progress-card,
  .pm-support-card,
  .pm-task-card {
    background: #ffffff;
    border: 1px solid #e7e9ee;
    border-radius: 18px;
    box-shadow: var(--shadow-sm);
  }

  .pm-stat-card {
    padding: 18px;
  }

  .pm-stat-card::after {
    display: none;
  }

  .pm-stat-icon,
  .pm-section-icon {
    border-radius: 12px;
    background: #efedff;
    color: #5f39df;
    box-shadow: none;
  }

  .pm-stat-label {
    color: #747986;
    font-size: 12px;
    font-weight: 750;
  }

  .pm-stat-value {
    color: #171922;
    font-size: 28px;
    letter-spacing: -0.04em;
  }

  .pm-stat-foot,
  .pm-card-client,
  .pm-task-meta,
  .pm-task-date,
  .pm-progress-sub {
    color: #777c88;
  }

  .pm-section {
    overflow: clip;
  }

  .pm-section-header {
    min-height: 68px;
    padding: 16px 22px;
    background: #ffffff;
    border-bottom: 1px solid #e9ebf0;
  }

  .pm-section-title,
  .pm-card-name,
  .pm-client-name,
  .pm-milestone-title,
  .pm-task-title,
  .pm-detail-title {
    color: #181922;
    letter-spacing: -0.025em;
  }

  .pm-section-body {
    padding: 22px;
  }

  .pm-input,
  .pm-select {
    min-height: 44px;
    border: 1px solid #dde2e8;
    border-radius: 13px;
    background-color: #ffffff;
    color: #252832;
    box-shadow: none;
  }

  .pm-input:focus,
  .pm-select:focus {
    border-color: #a999ff;
    box-shadow: 0 0 0 4px rgba(112, 71, 246, 0.10);
  }

  .pm-label {
    color: #7c818d;
    letter-spacing: 0.075em;
  }

  .pm-btn,
  .pm-action-btn,
  .pm-back-btn {
    border-radius: 13px;
  }

  .pm-btn-primary {
    background: linear-gradient(145deg, #774cf7, #5f39df);
    box-shadow: 0 11px 22px rgba(112, 71, 246, 0.20);
  }

  .pm-btn-primary:hover {
    transform: translateY(-1px);
    box-shadow: 0 14px 26px rgba(112, 71, 246, 0.26);
  }

  .pm-action-btn,
  .pm-btn-outline,
  .pm-back-btn {
    border-color: #dfe3ea;
    background: #ffffff;
    color: #333742;
  }

  .pm-action-btn:hover,
  .pm-btn-outline:hover,
  .pm-back-btn:hover {
    border-color: #bfb4ff;
    background: #f7f5ff;
    color: #5f39df;
  }

  .pm-project-card {
    padding: 20px;
  }

  .pm-project-card::before {
    height: 3px;
    background: #7047f6;
  }

  .pm-project-card:hover,
  .pm-support-card:hover,
  .pm-task-card:hover,
  .pm-client-card:hover,
  .pm-milestone-card:hover {
    border-color: #d7d2fb;
    transform: translateY(-2px);
    box-shadow: var(--shadow-md);
  }

  .pm-card-meta,
  .pm-milestone-header {
    border-color: #e9ebf0;
  }

  .pm-milestone-header,
  .pm-deliverable-item,
  .pm-check-pill,
  .pm-work-log {
    background: #fbfcfe;
  }

  .pm-status-pill {
    border-radius: 9px;
    padding: 6px 10px;
    font-size: 11px;
    font-weight: 800;
  }

  .pm-divider-line {
    background: #e7e9ee;
  }

  .pm-divider-text {
    color: #8c929e;
  }

  .pm-task-card {
    gap: 12px;
  }

  .pm-hours-bar {
    background: #edf0f4;
  }

  .pm-taskboard-shell {
    background: #ffffff;
    border: 1px solid #e7e9ee;
    border-radius: 18px;
    box-shadow: var(--shadow-sm);
    padding: 26px 28px;
    margin-bottom: 22px;
  }

  .pm-board-head {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18px;
    flex-wrap: wrap;
    padding-bottom: 20px;
    border-bottom: 1px solid #e9ebf0;
  }

  .pm-board-title-row {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .pm-board-icon {
    width: 22px;
    height: 22px;
    color: #5f39df;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .pm-board-title {
    font-size: 27px;
    font-weight: 850;
    letter-spacing: -0.055em;
    color: #181922;
  }

  .pm-board-sub {
    color: #6f7480;
    font-size: 13px;
    font-weight: 600;
    margin-top: 7px;
  }

  .pm-board-actions {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    justify-content: flex-end;
  }

  .pm-avatar-stack {
    display: flex;
    align-items: center;
    margin-right: 8px;
  }

  .pm-mini-avatar {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    border: 2px solid #fff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    background: #dfe7ff;
    color: #4d2fc6;
    font-size: 11px;
    font-weight: 850;
    margin-left: -8px;
    box-shadow: 0 6px 16px rgba(23, 28, 45, 0.10);
  }

  .pm-mini-avatar:first-child {
    margin-left: 0;
  }

  .pm-view-tabs {
    display: flex;
    align-items: center;
    gap: 28px;
    padding-top: 18px;
  }

  .pm-view-tab {
    border: 0;
    background: transparent;
    color: #3f424b;
    font-family: 'Inter', sans-serif;
    font-size: 15px;
    font-weight: 700;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 0 0 14px;
    cursor: default;
    position: relative;
  }

  .pm-view-tab.active {
    color: #5f39df;
  }

  .pm-view-tab.active::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: -1px;
    height: 3px;
    border-radius: 999px;
    background: #7047f6;
  }

  .pm-filter-row {
    display: grid;
    grid-template-columns: minmax(150px, 1fr) minmax(180px, 1.1fr) auto;
    gap: 12px;
    align-items: end;
    margin: 20px 0 0;
  }

  .pm-filter-row .pm-field {
    margin-bottom: 0;
  }

  .pm-project-list {
    background: #ffffff;
    border: 1px solid #e7e9ee;
    border-radius: 18px;
    box-shadow: var(--shadow-sm);
    overflow: hidden;
  }

  .pm-list-group {
    padding: 20px 24px 18px;
  }

  .pm-list-status {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    color: #3f424b;
    background: #eef1f3;
    padding: 7px 12px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 800;
    margin-bottom: 18px;
  }

  .pm-list-status::before {
    content: '';
    width: 13px;
    height: 13px;
    border-radius: 999px;
    border: 2px solid #727985;
    background: #fff;
  }

  .pm-list-table {
    display: grid;
    gap: 0;
  }

  .pm-list-row {
    display: grid;
    grid-template-columns: 34px minmax(120px, 1.25fr) minmax(105px, 0.9fr) minmax(120px, 0.9fr) minmax(110px, 0.8fr) minmax(100px, 0.65fr) minmax(132px, auto);
    gap: 12px;
    align-items: center;
    min-height: 62px;
    border-bottom: 1px solid #eceef2;
  }

  .pm-list-row:last-child {
    border-bottom: 0;
  }

  .pm-list-row.head {
    min-height: 34px;
    color: #7e8490;
    font-size: 12px;
    font-weight: 700;
  }

  .pm-list-row.item {
    cursor: pointer;
    transition: background 0.18s ease, transform 0.18s ease;
  }

  .pm-list-row.item:hover {
    background: #fbfaff;
  }

  .pm-list-check {
    width: 21px;
    height: 21px;
    border-radius: 999px;
    border: 2px solid #e1e5ea;
    display: inline-block;
  }

  .pm-list-name {
    color: #20222a;
    font-size: 15px;
    font-weight: 750;
  }

  .pm-list-muted {
    color: #747986;
    font-size: 13px;
    font-weight: 650;
  }

  .pm-list-progress {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .pm-list-bar {
    flex: 1;
    min-width: 70px;
    height: 7px;
    background: #edf0f4;
    border-radius: 999px;
    overflow: hidden;
  }

  .pm-list-fill {
    height: 100%;
    border-radius: 999px;
    background: #7047f6;
  }

  .pm-list-percent {
    color: #20222a;
    font-size: 12px;
    font-weight: 850;
    min-width: 32px;
    text-align: right;
  }

  .pm-list-add {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    margin-top: 14px;
    border: 0;
    background: transparent;
    color: #5f39df;
    font-size: 14px;
    font-weight: 800;
    cursor: pointer;
  }

  .pm-compact-stats {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 10px;
    margin: 18px 0 0;
  }

  @media (max-width: 1180px) {
    .pm-content {
      padding: 24px 22px 38px;
    }

    .pm-taskboard-shell {
      padding: 22px;
    }

    .pm-board-actions .pm-btn {
      padding: 10px 13px;
    }

    .pm-list-row {
      grid-template-columns: 30px minmax(120px, 1.2fr) minmax(100px, 0.9fr) minmax(110px, 0.9fr) minmax(90px, 0.7fr) minmax(118px, auto);
      gap: 10px;
    }
  }

  .pm-compact-stat {
    border: 1px solid #e9ebf0;
    border-radius: 14px;
    background: #fbfcfe;
    padding: 13px 14px;
  }

  .pm-compact-stat span {
    display: block;
    color: #7e8490;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .pm-compact-stat strong {
    display: block;
    color: #181922;
    font-size: 22px;
    font-weight: 900;
    letter-spacing: -0.04em;
    margin-top: 5px;
  }

  .pm-root {
    background:
      linear-gradient(180deg, #f7f8fb 0%, #f3f5f9 100%);
  }

  .pm-main {
    background:
      radial-gradient(circle at 78% 4%, rgba(112, 71, 246, 0.055), transparent 28%),
      #f7f8fb;
  }

  .pm-topbar {
    height: 88px;
    background: rgba(247, 248, 251, 0.96);
  }

  .pm-topbar-title {
    font-size: 28px;
  }

  .pm-content {
    padding: 34px 38px 52px;
  }

  .pm-sidebar {
    background: linear-gradient(180deg, #ffffff 0%, #fbfbfe 100%);
  }

  .pm-nav {
    padding-top: 24px;
  }

  .pm-nav-btn {
    min-height: 50px;
    padding: 13px 14px;
    margin-bottom: 5px;
  }

  .pm-nav-btn.active {
    background: linear-gradient(135deg, #f0edff 0%, #f8f7ff 100%);
    box-shadow: inset 4px 0 0 #7047f6;
  }

  .pm-taskboard-shell {
    border-radius: 24px;
    padding: 30px;
    margin-bottom: 26px;
    border-color: rgba(220, 224, 232, 0.95);
    background:
      linear-gradient(180deg, rgba(255,255,255,0.98) 0%, rgba(253,253,255,0.96) 100%);
    box-shadow: 0 24px 70px rgba(31, 35, 50, 0.08);
  }

  .pm-compact-stats {
    gap: 18px;
    margin: 0 0 26px;
  }

  .pm-compact-stat {
    min-height: 126px;
    border-radius: 22px;
    padding: 24px 24px 22px;
    background:
      radial-gradient(circle at 86% 18%, rgba(112, 71, 246, 0.10), transparent 34%),
      #ffffff;
    border-color: #e4e7ee;
    box-shadow: 0 15px 34px rgba(23, 28, 45, 0.055);
    position: relative;
    overflow: hidden;
    transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
  }

  .pm-compact-icon {
    position: absolute;
    right: 20px;
    top: 22px;
    width: 28px;
    height: 28px;
    border-radius: 0;
    background: transparent;
    color: #7047f6;
    display: inline-flex;
    align-items: center;
    justify-content: center;
  }

  .pm-compact-stat:hover {
    transform: translateY(-3px);
    border-color: #d6d0ff;
    box-shadow: 0 22px 46px rgba(112, 71, 246, 0.11);
  }

  .pm-compact-stat span {
    color: #7a808c;
    font-size: 12px;
    letter-spacing: 0.08em;
  }

  .pm-compact-stat strong {
    font-size: 38px;
    line-height: 1;
    margin-top: 16px;
  }

  .pm-filter-row {
    grid-template-columns: minmax(210px, 1fr) minmax(280px, 1.1fr) minmax(170px, 0.7fr) 136px;
    gap: 18px;
    padding-top: 4px;
  }

  .pm-filter-row .pm-label {
    margin-bottom: 10px;
  }

  .pm-filter-row .pm-input,
  .pm-filter-row .pm-select {
    min-height: 58px;
    border-radius: 18px;
    font-size: 15px;
    padding-left: 18px;
    background-color: #ffffff;
  }

  .pm-filter-row .pm-btn {
    min-height: 58px;
    justify-content: center;
    border-radius: 18px;
    font-size: 14px;
  }

  .pm-project-list {
    border-radius: 24px;
    border-color: rgba(220, 224, 232, 0.95);
    box-shadow: 0 24px 70px rgba(31, 35, 50, 0.075);
    background: #ffffff;
  }

  .pm-list-group {
    padding: 30px;
  }

  .pm-list-status {
    padding: 10px 14px;
    border-radius: 12px;
    margin-bottom: 24px;
    background: #f1f3f6;
    color: #292d36;
  }

  .pm-list-row {
    grid-template-columns: 42px minmax(150px, 1.1fr) minmax(120px, 0.85fr) minmax(152px, 0.9fr) minmax(160px, 1fr) minmax(116px, 0.7fr) minmax(150px, auto);
    gap: 18px;
    min-height: 82px;
  }

  .pm-list-row.head {
    min-height: 42px;
    font-size: 12px;
  }

  .pm-list-row.item {
    border-radius: 16px;
    padding: 0 10px;
    margin: 0 -10px;
  }

  .pm-list-row.item:hover {
    background: linear-gradient(90deg, #fbfaff 0%, #ffffff 100%);
    transform: translateX(3px);
  }

  .pm-list-check {
    width: 24px;
    height: 24px;
    border-width: 2.5px;
    background: #fff;
  }

  .pm-list-name {
    font-size: 17px;
    font-weight: 850;
    letter-spacing: -0.025em;
  }

  .pm-list-muted {
    font-size: 14px;
    color: #6e7480;
  }

  .pm-list-bar {
    height: 9px;
    background: #eef0f5;
    box-shadow: inset 0 0 0 1px rgba(112, 71, 246, 0.02);
  }

  .pm-list-fill {
    display: block;
    min-width: 4px;
    background: linear-gradient(90deg, #7047f6 0%, #9a7bff 100%);
    box-shadow: 0 5px 14px rgba(112, 71, 246, 0.28);
    transition: width 0.35s ease;
  }

  .pm-list-percent {
    font-size: 13px;
    min-width: 38px;
  }

  .pm-list-add {
    margin-top: 24px;
    font-size: 15px;
    padding: 10px 2px 0;
  }

  .pm-list-date-input {
    width: 100%;
    min-height: 38px;
    border: 1px solid #dfe3ea;
    border-radius: 12px;
    background: #fff;
    color: #20222a;
    font-family: 'Inter', sans-serif;
    font-size: 12.5px;
    font-weight: 750;
    padding: 8px 10px;
    outline: none;
  }

  .pm-list-date-input:focus {
    border-color: #a999ff;
    box-shadow: 0 0 0 4px rgba(112, 71, 246, 0.10);
  }

  .pm-action-btn {
    min-height: 38px;
    padding: 9px 13px;
  }

  @media (max-width: 1320px) {
    .pm-content {
      padding: 30px 24px 46px;
    }

    .pm-taskboard-shell,
    .pm-project-list {
      border-radius: 22px;
    }

    .pm-taskboard-shell {
      padding: 28px;
    }

    .pm-compact-stats {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .pm-filter-row {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .pm-filter-row .pm-btn {
      grid-column: auto;
      justify-self: start;
      width: 170px;
    }

    .pm-list-row {
      grid-template-columns: 34px minmax(110px, 1fr) minmax(95px, 0.8fr) minmax(130px, 0.9fr) minmax(150px, 1fr) minmax(90px, 0.65fr) auto;
      gap: 12px;
    }

    .pm-list-group {
      padding: 26px;
    }
  }

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

  .pm-root {
    --black: #171821;
    --gray-50: #f7f8fb;
    --gray-100: #eef1f5;
    --gray-200: #e1e5ec;
    --gray-400: #9aa3af;
    --gray-600: #667085;
    --gray-800: #2f3440;
    --accent: #6d4aff;
    --accent-2: #5135d8;
    --accent-light: #f3f0ff;
    --shadow-sm: 0 1px 2px rgba(16, 24, 40, 0.04), 0 8px 24px rgba(16, 24, 40, 0.04);
    --shadow-md: 0 18px 42px rgba(16, 24, 40, 0.08);
    background: #f6f7fb;
  }

  .pm-layout {
    background: #f6f7fb;
    box-shadow: none;
  }

  .pm-sidebar {
    width: 256px;
    background: #ffffff;
    border-right: 1px solid #e8ebf0;
  }

  .pm-logo {
    min-height: 76px;
    padding: 20px 22px;
  }

  .pm-logo-title {
    font-size: 15px;
    font-weight: 800;
    color: #151821;
    line-height: 1.05;
  }

  .pm-logo-title::before {
    width: 32px;
    height: 32px;
    border-radius: 10px;
    box-shadow: 0 10px 22px rgba(109, 74, 255, 0.22);
  }

  .pm-nav {
    padding: 18px 12px 22px;
  }

  .pm-nav-label {
    margin: 20px 0 8px;
    padding: 0 12px;
    color: #a5adba;
    font-size: 9.5px;
    font-weight: 750;
    letter-spacing: 0.12em;
  }

  .pm-nav-btn {
    min-height: 40px;
    border-radius: 10px;
    padding: 9px 12px;
    margin-bottom: 3px;
    color: #606b7c;
    font-size: 12.5px;
    font-weight: 600;
  }

  .pm-nav-btn:hover {
    background: #f7f6ff;
    color: var(--accent);
  }

  .pm-nav-btn.active {
    background: #f0edff;
    color: #4f35d3;
    font-weight: 700;
    box-shadow: inset 3px 0 0 var(--accent);
  }

  .pm-nav-btn .icon {
    width: 18px;
    color: currentColor;
  }

  .pm-sidebar-footer {
    padding: 14px;
  }

  .pm-logout-btn {
    min-height: 40px;
    border-radius: 10px;
    color: #8a2b2b;
    background: #fff;
    font-size: 12.5px;
    font-weight: 600;
  }

  .pm-main {
    margin-left: 256px;
    background:
      radial-gradient(circle at 88% -5%, rgba(109, 74, 255, 0.08), transparent 28%),
      #f6f7fb;
  }

  .pm-topbar {
    height: 76px;
    padding: 0 36px;
    background: rgba(246, 247, 251, 0.88);
    border-bottom: 1px solid rgba(225, 229, 236, 0.9);
    backdrop-filter: blur(18px);
  }

  .pm-topbar-left {
    min-width: 0;
  }

  .pm-topbar-title {
    font-size: 27px;
    font-weight: 900;
    color: #171821;
    letter-spacing: -0.05em;
  }

  .pm-topbar-title::before {
    width: 16px;
    height: 20px;
    border-width: 2.5px;
    border-color: var(--accent);
    box-shadow: inset 0 -6px 0 rgba(109, 74, 255, 0.12);
  }

  .pm-content {
    padding: 34px 40px 56px;
  }

  .pm-section,
  .pm-taskboard-shell,
  .pm-project-list,
  .pm-stat-card,
  .pm-client-card,
  .pm-support-card,
  .pm-task-card,
  .pm-milestone-card,
  .pm-progress-card {
    background: rgba(255, 255, 255, 0.96);
    border: 1px solid #e5e8ef;
    border-radius: 18px;
    box-shadow: var(--shadow-sm);
  }

  .pm-section {
    margin-bottom: 22px;
  }

  .pm-section-header {
    min-height: 64px;
    padding: 16px 22px;
    background: #ffffff;
    border-bottom: 1px solid #edf0f4;
  }

  .pm-section-icon,
  .pm-stat-icon {
    width: 34px;
    height: 34px;
    border-radius: 10px;
    background: #f1eeff;
    color: var(--accent);
  }

  .pm-section-title {
    font-size: 14px;
    font-weight: 850;
  }

  .pm-section-body {
    padding: 22px;
  }

  .pm-input,
  .pm-select,
  .pm-list-date-input {
    min-height: 46px;
    border-radius: 12px;
    border-color: #dde3ec;
    background-color: #ffffff;
    color: #1f2430;
    font-size: 13.5px;
    font-weight: 600;
  }

  .pm-input:focus,
  .pm-select:focus,
  .pm-list-date-input:focus {
    border-color: #9b8aff;
    box-shadow: 0 0 0 4px rgba(109, 74, 255, 0.10);
  }

  .pm-label {
    color: #7a8494;
    font-size: 10.5px;
    font-weight: 850;
    letter-spacing: 0.075em;
  }

  .pm-btn,
  .pm-action-btn,
  .pm-back-btn {
    border-radius: 11px;
  }

  .pm-btn-primary {
    background: #6d4aff;
    box-shadow: 0 10px 24px rgba(109, 74, 255, 0.24);
  }

  .pm-btn-primary:hover {
    background: #5f3ff0;
    box-shadow: 0 16px 32px rgba(109, 74, 255, 0.26);
  }

  .pm-action-btn,
  .pm-btn-outline,
  .pm-back-btn {
    border-color: #dfe4ec;
    background: #fff;
    color: #344054;
  }

  .pm-taskboard-shell {
    padding: 28px;
    margin-bottom: 24px;
    box-shadow: 0 14px 38px rgba(16, 24, 40, 0.06);
  }

  .pm-compact-stats {
    gap: 16px;
    margin-bottom: 24px;
  }

  .pm-compact-stat {
    min-height: 118px;
    border-radius: 18px;
    padding: 22px;
    background: #ffffff;
    border-color: #e5e8ef;
    box-shadow: var(--shadow-sm);
  }

  .pm-compact-stat::after {
    content: '';
    position: absolute;
    inset: auto 18px 16px 18px;
    height: 3px;
    border-radius: 999px;
    background: linear-gradient(90deg, rgba(109, 74, 255, 0.24), rgba(109, 74, 255, 0));
  }

  .pm-compact-stat span {
    color: #7a8494;
    font-size: 11px;
    font-weight: 850;
  }

  .pm-compact-stat strong {
    margin-top: 18px;
    color: #111827;
    font-size: 36px;
    font-weight: 900;
  }

  .pm-compact-icon {
    right: 20px;
    top: 20px;
    width: 30px;
    height: 30px;
    color: var(--accent);
  }

  .pm-filter-row {
    gap: 14px;
    align-items: end;
  }

  .pm-filter-row .pm-input,
  .pm-filter-row .pm-select,
  .pm-filter-row .pm-btn {
    min-height: 52px;
    border-radius: 14px;
  }

  .pm-project-list {
    border-radius: 18px;
    overflow: hidden;
    box-shadow: 0 14px 38px rgba(16, 24, 40, 0.055);
  }

  .pm-list-group {
    padding: 26px;
  }

  .pm-list-status {
    padding: 8px 12px;
    margin-bottom: 18px;
    border-radius: 999px;
    background: #f2f4f7;
    color: #344054;
    font-size: 12px;
  }

  .pm-list-status::before {
    width: 10px;
    height: 10px;
    border: 0;
    background: #f59e0b;
  }

  .pm-list-row {
    min-height: 72px;
    gap: 16px;
    border-bottom-color: #edf0f4;
  }

  .pm-list-row.head {
    min-height: 38px;
    color: #8a93a3;
    font-size: 11.5px;
    font-weight: 800;
  }

  .pm-list-row.item {
    border-radius: 12px;
  }

  .pm-list-row.item:hover {
    background: #faf9ff;
    transform: translateX(2px);
  }

  .pm-list-check {
    width: 20px;
    height: 20px;
    border-color: #d8dde6;
  }

  .pm-list-name {
    color: #171821;
    font-size: 15.5px;
    font-weight: 850;
  }

  .pm-list-muted {
    color: #667085;
    font-size: 13px;
    font-weight: 650;
  }

  .pm-list-bar {
    height: 8px;
    background: #eef1f5;
  }

  .pm-list-fill {
    background: linear-gradient(90deg, #6d4aff, #9d8cff);
    box-shadow: none;
  }

  .pm-list-percent {
    color: #1f2430;
    font-size: 12px;
  }

  .pm-client-grid,
  .pm-task-grid,
  .pm-grid {
    gap: 18px;
  }

  .pm-client-card,
  .pm-task-card,
  .pm-support-card,
  .pm-project-card,
  .pm-milestone-card {
    transition: transform 0.18s ease, border-color 0.18s ease, box-shadow 0.18s ease;
  }

  .pm-client-card:hover,
  .pm-task-card:hover,
  .pm-support-card:hover,
  .pm-project-card:hover,
  .pm-milestone-card:hover {
    transform: translateY(-2px);
    border-color: #d7d0ff;
    box-shadow: var(--shadow-md);
  }

  .pm-client-card {
    align-items: flex-start;
    border-radius: 22px;
    padding: 18px;
    background:
      radial-gradient(circle at 92% 6%, rgba(112, 71, 246, 0.08), transparent 30%),
      #ffffff;
  }

  .pm-client-logo,
  .pm-client-avatar {
    width: 54px;
    height: 54px;
    border-radius: 17px;
  }

  .pm-member-avatar {
    background:
      radial-gradient(circle at 30% 20%, rgba(0,163,255,0.34), transparent 34%),
      linear-gradient(145deg, rgba(18,61,255,0.88), rgba(0,163,255,0.24));
    border: 1px solid rgba(142,170,255,0.34);
    color: #ffffff;
    box-shadow:
      0 16px 34px rgba(18,61,255,0.22),
      inset 0 1px 0 rgba(255,255,255,0.18);
  }

  .pm-member-logo {
    background: rgba(255,255,255,0.060);
    border: 1px solid rgba(142,170,255,0.28);
    box-shadow:
      0 16px 34px rgba(18,61,255,0.16),
      inset 0 1px 0 rgba(255,255,255,0.10);
  }

  .pm-chat-card {
    min-height: 168px;
    display: grid;
    align-content: space-between;
    gap: 16px;
    background:
      radial-gradient(circle at 88% 10%, rgba(0,163,255,0.16), transparent 32%),
      linear-gradient(145deg, rgba(255,255,255,0.095), rgba(255,255,255,0.038)),
      rgba(4,8,20,0.50);
  }

  .pm-chat-card-top {
    display: flex;
    justify-content: space-between;
    gap: 14px;
    align-items: flex-start;
  }

  .pm-chat-icon {
    width: 42px;
    height: 42px;
    border-radius: 15px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    background: linear-gradient(135deg, rgba(18,61,255,0.92), rgba(0,163,255,0.70));
    box-shadow: 0 16px 34px rgba(18,61,255,0.24);
    flex-shrink: 0;
  }

  .pm-chat-meta {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .pm-chat-chip {
    display: inline-flex;
    align-items: center;
    min-height: 28px;
    padding: 0 10px;
    border-radius: 999px;
    background: rgba(255,255,255,0.070);
    border: 1px solid rgba(142,170,255,0.16);
    color: rgba(226,232,255,0.70);
    font-size: 11px;
    font-weight: 850;
  }

  .pm-chat-description,
  .pm-chat-panel {
    background:
      linear-gradient(145deg, rgba(255,255,255,0.080), rgba(255,255,255,0.030)),
      rgba(4,8,20,0.42);
    border: 1px solid rgba(142,170,255,0.16);
    color: rgba(226,232,255,0.72);
    box-shadow: inset 0 1px 0 rgba(255,255,255,0.08);
  }

  .pm-chat-detail-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 12px;
    margin-bottom: 16px;
  }

  .pm-chat-detail-item {
    padding: 14px;
    border-radius: 16px;
    background: rgba(255,255,255,0.055);
    border: 1px solid rgba(142,170,255,0.14);
  }

  .pm-chat-detail-label {
    color: rgba(226,232,255,0.48);
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 0.10em;
    text-transform: uppercase;
    margin-bottom: 6px;
  }

  .pm-chat-detail-value {
    color: #ffffff;
    font-size: 13px;
    font-weight: 850;
  }

  .pm-chat-bubble {
    padding: 13px 15px;
    border-radius: 18px;
    max-width: 75%;
    line-height: 1.55;
    font-size: 13px;
    font-weight: 650;
    border: 1px solid rgba(255,255,255,0.08);
  }

  .pm-chat-bubble.admin {
    align-self: flex-end;
    color: #ffffff;
    background: linear-gradient(135deg, #123dff, #0076ff);
    box-shadow: 0 14px 32px rgba(18,61,255,0.22);
  }

  .pm-chat-bubble.client {
    align-self: flex-start;
    color: rgba(226,232,255,0.84);
    background: rgba(255,255,255,0.075);
  }

  .pm-artifact-card {
    min-height: 230px;
    display: grid;
    align-content: space-between;
    gap: 16px;
    background:
      radial-gradient(circle at 88% 10%, rgba(0,163,255,0.16), transparent 32%),
      linear-gradient(145deg, rgba(255,255,255,0.095), rgba(255,255,255,0.038)),
      rgba(4,8,20,0.50);
  }

  .pm-artifact-card .pm-card-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 14px;
  }

  .pm-artifact-card .pm-card-icon {
    width: 44px;
    height: 44px;
    border-radius: 16px;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    background: linear-gradient(135deg, rgba(18,61,255,0.92), rgba(0,163,255,0.70));
    box-shadow: 0 16px 34px rgba(18,61,255,0.24);
    margin-bottom: 0;
  }

  .pm-artifact-description {
    color: rgba(226,232,255,0.70);
    font-size: 13px;
    line-height: 1.55;
    margin-bottom: 2px;
    padding: 12px 13px;
    border-radius: 15px;
    background: rgba(255,255,255,0.055);
    border: 1px solid rgba(142,170,255,0.14);
  }

  .pm-artifact-card .pm-card-meta {
    color: rgba(226,232,255,0.66);
  }

  .pm-artifact-file-state {
    margin-top: 8px;
    margin-bottom: 0;
    padding: 10px 12px;
    border-radius: 14px;
    color: rgba(226,232,255,0.72);
    background: rgba(255,255,255,0.055);
    border: 1px solid rgba(142,170,255,0.14);
  }

  .pm-progress-card {
    align-items: center;
    overflow: hidden;
  }

  .pm-gauge {
    display: block;
  }

  .pm-gauge::after {
    content: attr(aria-label);
    position: absolute;
    left: 0;
    right: 0;
    bottom: 2px;
    color: rgba(226,232,255,0.62);
    font-size: 10px;
    font-weight: 850;
    text-align: center;
    letter-spacing: 0.02em;
  }

  .pm-project-value-box {
    margin-left: auto;
    min-width: 280px;
    padding: 10px;
    border-radius: 18px;
    background:
      linear-gradient(145deg, rgba(255,255,255,0.09), rgba(255,255,255,0.035)),
      rgba(4,8,20,0.42);
    border: 1px solid rgba(142,170,255,0.20);
    box-shadow:
      0 14px 34px rgba(0,0,0,0.16),
      inset 0 1px 0 rgba(255,255,255,0.08);
  }

  .pm-project-value-label {
    font-size: 10px;
    font-weight: 900;
    letter-spacing: 0.10em;
    text-transform: uppercase;
    color: rgba(226,232,255,0.58);
    margin-bottom: 7px;
  }

  .pm-external-card {
    min-height: 178px;
    display: grid;
    align-content: space-between;
    gap: 14px;
    background:
      radial-gradient(circle at 88% 10%, rgba(0,163,255,0.16), transparent 32%),
      linear-gradient(145deg, rgba(255,255,255,0.095), rgba(255,255,255,0.038)),
      rgba(4,8,20,0.50);
  }

  .pm-external-thumb,
  .pm-external-icon {
    width: 54px;
    height: 54px;
    border-radius: 16px;
    object-fit: cover;
    border: 1px solid rgba(142,170,255,0.24);
    box-shadow: 0 16px 34px rgba(18,61,255,0.18);
  }

  .pm-external-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    background: linear-gradient(135deg, rgba(18,61,255,0.92), rgba(0,163,255,0.70));
  }

  .pm-project-detail {
    position: relative;
  }

  .pm-main.pm-main-project-detail {
    background:
      radial-gradient(circle at 82% 0%, rgba(18,61,255,0.045), transparent 28%),
      linear-gradient(180deg, #050814 0%, #040713 100%);
  }

  .pm-main.pm-main-project-detail .pm-content {
    background: transparent;
  }

  .pm-project-detail .pm-section,
  .pm-project-detail .pm-progress-card,
  .pm-project-detail .pm-milestone-card,
  .pm-project-detail .pm-project-list,
  .pm-project-detail .pm-project-card {
    background:
      linear-gradient(145deg, rgba(255,255,255,0.078), rgba(255,255,255,0.030)),
      rgba(5,9,20,0.60);
    border-color: rgba(142,170,255,0.16);
    box-shadow:
      0 22px 62px rgba(0,0,0,0.22),
      inset 0 1px 0 rgba(255,255,255,0.08);
  }

  .pm-project-detail .pm-section-header,
  .pm-project-detail .pm-milestone-header {
    background: rgba(255,255,255,0.028);
    border-bottom-color: rgba(142,170,255,0.12);
  }

  .pm-project-detail .pm-external-card,
  .pm-project-detail .pm-artifact-card,
  .pm-project-detail .pm-chat-card {
    background:
      linear-gradient(145deg, rgba(255,255,255,0.078), rgba(255,255,255,0.030)),
      rgba(5,9,20,0.60);
  }

  .pm-support-card [style*="color: #15113b"],
  .pm-support-layout [style*="color: #15113b"],
  .pm-support-layout [style*="color: '#15113b'"],
  .pm-section [style*="color: #15113b"] {
    color: #ffffff !important;
  }

  .pm-support-card [style*="color: #6d6883"],
  .pm-support-layout [style*="color: #6d6883"],
  .pm-support-layout [style*="color: '#6d6883'"],
  .pm-support-layout [style*="color: #4f4a63"],
  .pm-support-layout [style*="color: '#4f4a63'"] {
    color: rgba(226,232,255,0.70) !important;
  }

  .pm-client-welcome {
    margin-top: 14px;
    padding-top: 14px;
    border-top: 1px solid #eceef5;
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 10px;
    align-items: center;
  }

  .pm-client-welcome-note {
    grid-column: 1 / -1;
    color: #858b98;
    font-size: 11px;
    font-weight: 700;
    line-height: 1.35;
  }

  .pm-client-welcome-error {
    grid-column: 1 / -1;
    color: #b42318;
    background: #fff1f1;
    border: 1px solid #ffd8d8;
    border-radius: 10px;
    padding: 8px 10px;
    font-size: 11px;
    font-weight: 800;
  }

  .pm-client-welcome-input {
    min-height: 40px;
    border: 1px solid #dfe3ea;
    border-radius: 13px;
    background: #fbfcfe;
    color: #20222a;
    font-family: 'Inter', sans-serif;
    font-size: 12.5px;
    font-weight: 650;
    padding: 0 12px;
    outline: none;
    min-width: 0;
  }

  .pm-client-welcome-input:focus {
    border-color: #a999ff;
    box-shadow: 0 0 0 4px rgba(112, 71, 246, 0.10);
    background: #fff;
  }

  .pm-welcome-btn {
    min-height: 40px;
    border-radius: 13px;
    border: 1px solid #d8d2ff;
    background: #f4f1ff;
    color: #5534ce;
    font-size: 12px;
    font-weight: 850;
    padding: 0 12px;
    cursor: pointer;
    white-space: nowrap;
  }

  .pm-welcome-btn:hover {
    background: #ede8ff;
    border-color: #bfb4ff;
  }

  .pm-welcome-btn:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }

  .pm-status-pill {
    border-radius: 999px;
    padding: 6px 10px;
    font-size: 10.5px;
    font-weight: 850;
  }

  .pm-file-upload,
  .pm-check-pill,
  .pm-deliverable-item,
  .pm-work-log {
    background: #fafbfc;
    border-color: #e4e8ef;
  }

  .pm-empty {
    background: #fff;
    border: 1px dashed #d8dde6;
    border-radius: 18px;
  }

  @media (max-width: 980px) {
    .pm-sidebar { width: 82px; }
    .pm-main { margin-left: 82px; }
  }

  @media (max-width: 720px) {
    .pm-main { margin-left: 0; }
    .pm-content { padding: 18px; }
    .pm-compact-stats { grid-template-columns: 1fr; }
  }

  .pm-root {
    --black: #f8fbff;
    --white: #ffffff;
    --gray-50: rgba(255,255,255,0.055);
    --gray-100: rgba(255,255,255,0.08);
    --gray-200: rgba(142,170,255,0.18);
    --gray-400: #7f8baa;
    --gray-600: #a6b0cc;
    --gray-800: #e8efff;
    --accent: #123dff;
    --accent-2: #00a3ff;
    --accent-light: rgba(18,61,255,0.14);
    --success: #39d98a;
    --danger: #ff5d73;
    --warning: #ffc857;
    --shadow-sm: 0 18px 46px rgba(0,0,0,0.22);
    --shadow-md: 0 24px 70px rgba(18,61,255,0.18);
    --shadow-lg: 0 34px 95px rgba(0,0,0,0.34);
    background:
      radial-gradient(circle at 17% 6%, rgba(18,61,255,0.28), transparent 28%),
      radial-gradient(circle at 85% 8%, rgba(0,163,255,0.18), transparent 30%),
      radial-gradient(circle at 62% 100%, rgba(18,61,255,0.14), transparent 34%),
      linear-gradient(135deg, #02040a 0%, #050814 48%, #02040a 100%);
    color: #f8fbff;
  }

  .pm-root::before {
    content: '';
    position: fixed;
    inset: 0;
    pointer-events: none;
    background:
      linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px);
    background-size: 58px 58px;
    mask-image: radial-gradient(circle at 50% 24%, black, transparent 74%);
    opacity: 0.5;
    z-index: 0;
  }

  .pm-layout {
    position: relative;
    z-index: 1;
    background: transparent;
    box-shadow: none;
  }

  .pm-sidebar {
    width: 270px;
    background:
      linear-gradient(180deg, rgba(9,14,30,0.92), rgba(3,7,17,0.96)),
      rgba(5,8,18,0.88);
    border-right: 1px solid rgba(108,141,255,0.20);
    box-shadow: 18px 0 60px rgba(0,0,0,0.28);
    backdrop-filter: blur(22px) saturate(140%);
    -webkit-backdrop-filter: blur(22px) saturate(140%);
  }

  .pm-logo {
    min-height: 98px;
    padding: 24px 22px;
    border-bottom: 1px solid rgba(142,170,255,0.15);
  }

  .pm-logo-title {
    gap: 13px;
    color: #ffffff;
    font-size: 16px;
    font-weight: 900;
    letter-spacing: 0;
  }

  .pm-logo-title::before {
    display: none;
  }

  .pm-logo-mark {
    width: 96px;
    height: auto;
    display: block;
    filter: drop-shadow(0 0 22px rgba(18,61,255,0.44));
  }

  .pm-logo-text {
    display: grid;
    gap: 4px;
  }

  .pm-logo-name {
    color: #ffffff;
    font-size: 13px;
    font-weight: 900;
    line-height: 1.1;
  }

  .pm-logo-role {
    color: rgba(226,232,255,0.56);
    font-size: 10px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .pm-logo-sub {
    display: none;
  }

  .pm-nav {
    padding: 22px 14px;
  }

  .pm-nav-label {
    color: rgba(226,232,255,0.34);
    font-size: 9.5px;
    letter-spacing: 0.16em;
    font-weight: 900;
  }

  .pm-nav-btn {
    min-height: 46px;
    border-radius: 15px;
    padding: 12px 13px;
    color: rgba(226,232,255,0.66);
    font-size: 12.5px;
    font-weight: 750;
    margin-bottom: 6px;
  }

  .pm-nav-btn:hover {
    color: #ffffff;
    background: rgba(255,255,255,0.075);
  }

  .pm-nav-btn.active {
    color: #ffffff;
    background:
      linear-gradient(135deg, rgba(18,61,255,0.34), rgba(0,163,255,0.16));
    box-shadow:
      inset 3px 0 0 #00a3ff,
      0 16px 36px rgba(18,61,255,0.18);
  }

  .pm-sidebar-footer {
    border-top: 1px solid rgba(142,170,255,0.15);
    padding: 16px 14px;
  }

  .pm-logout-btn {
    min-height: 44px;
    background: rgba(255,255,255,0.055);
    border-color: rgba(255,255,255,0.10);
    color: #ff9daa;
  }

  .pm-logout-btn:hover {
    background: rgba(255,93,115,0.12);
    border-color: rgba(255,93,115,0.28);
  }

  .pm-main {
    margin-left: 270px;
    background:
      radial-gradient(circle at 92% 0%, rgba(0,163,255,0.10), transparent 30%),
      transparent;
  }

  .pm-topbar {
    height: 84px;
    padding: 0 38px;
    background: rgba(5,9,20,0.70);
    border-bottom: 1px solid rgba(142,170,255,0.16);
    backdrop-filter: blur(20px) saturate(145%);
    -webkit-backdrop-filter: blur(20px) saturate(145%);
  }

  .pm-topbar-title {
    color: #ffffff;
    font-size: 27px;
    font-weight: 900;
    letter-spacing: -0.04em;
  }

  .pm-topbar-title::before {
    border-color: #123dff;
    box-shadow:
      inset 0 -6px 0 rgba(0,163,255,0.18),
      0 0 26px rgba(18,61,255,0.30);
  }

  .pm-content {
    padding: 34px 40px 56px;
  }

  .pm-section,
  .pm-taskboard-shell,
  .pm-project-list,
  .pm-stat-card,
  .pm-client-card,
  .pm-support-card,
  .pm-task-card,
  .pm-milestone-card,
  .pm-progress-card,
  .pm-compact-stat {
    background:
      linear-gradient(145deg, rgba(255,255,255,0.095), rgba(255,255,255,0.038)),
      rgba(4,8,20,0.50);
    border: 1px solid rgba(142,170,255,0.18);
    box-shadow:
      0 24px 70px rgba(0,0,0,0.24),
      inset 0 1px 0 rgba(255,255,255,0.10);
    backdrop-filter: blur(20px) saturate(136%);
    -webkit-backdrop-filter: blur(20px) saturate(136%);
  }

  .pm-section,
  .pm-taskboard-shell,
  .pm-project-list {
    border-radius: 26px;
  }

  .pm-project-card::before {
    background: linear-gradient(90deg, #123dff, #00a3ff);
  }

  .pm-section-header,
  .pm-milestone-header {
    background: rgba(255,255,255,0.035);
    border-bottom: 1px solid rgba(142,170,255,0.14);
  }

  .pm-section-icon,
  .pm-stat-icon {
    background: linear-gradient(135deg, rgba(18,61,255,0.92), rgba(0,163,255,0.82));
    color: #ffffff;
    box-shadow: 0 16px 34px rgba(18,61,255,0.26);
  }

  .pm-section-title,
  .pm-card-name,
  .pm-client-name,
  .pm-milestone-title,
  .pm-task-title,
  .pm-detail-title,
  .pm-board-title,
  .pm-list-name,
  .pm-stat-value,
  .pm-compact-stat strong,
  .pm-progress-value {
    color: #ffffff;
  }

  .pm-card-client,
  .pm-task-meta,
  .pm-task-date,
  .pm-progress-sub,
  .pm-board-sub,
  .pm-list-muted,
  .pm-stat-label,
  .pm-label,
  .pm-divider-text,
  .pm-client-projects {
    color: rgba(226,232,255,0.62);
  }

  .pm-input,
  .pm-select,
  .pm-list-date-input,
  .pm-client-welcome-input,
  .pm-color-field,
  .pm-file-upload,
  .pm-check-pill,
  .pm-deliverable-item,
  .pm-work-log {
    background-color: rgba(255,255,255,0.060);
    border-color: rgba(142,170,255,0.20);
    color: #ffffff;
  }

  .pm-filter-row .pm-input,
  .pm-filter-row .pm-select,
  .pm-filter-row .pm-btn,
  .pm-list-date-input {
    background:
      linear-gradient(145deg, rgba(255,255,255,0.085), rgba(255,255,255,0.035)),
      rgba(4,8,20,0.48);
    border: 1px solid rgba(142,170,255,0.24);
    color: #ffffff;
    box-shadow:
      inset 0 1px 0 rgba(255,255,255,0.08),
      0 14px 34px rgba(0,0,0,0.16);
    backdrop-filter: blur(16px) saturate(130%);
    -webkit-backdrop-filter: blur(16px) saturate(130%);
  }

  .pm-filter-row .pm-input::placeholder {
    color: rgba(226,232,255,0.36);
  }

  .pm-filter-row .pm-input:focus,
  .pm-filter-row .pm-select:focus,
  .pm-list-date-input:focus {
    border-color: rgba(0,163,255,0.72);
    background:
      linear-gradient(145deg, rgba(255,255,255,0.11), rgba(255,255,255,0.050)),
      rgba(4,8,20,0.58);
    box-shadow:
      0 0 0 4px rgba(18,61,255,0.16),
      0 18px 42px rgba(18,61,255,0.12);
  }

  .pm-input::placeholder,
  .pm-client-welcome-input::placeholder,
  .pm-color-code-input::placeholder {
    color: rgba(226,232,255,0.36);
  }

  .pm-input:focus,
  .pm-select:focus,
  .pm-list-date-input:focus,
  .pm-client-welcome-input:focus {
    border-color: rgba(0,163,255,0.72);
    background-color: rgba(255,255,255,0.085);
    box-shadow: 0 0 0 4px rgba(18,61,255,0.16);
  }

  .pm-select option {
    background: #071022;
    color: #ffffff;
  }

  .pm-color-code-input {
    color: #ffffff;
  }

  .pm-btn-primary,
  .pm-hero-pill,
  button.pm-hero-pill,
  .pm-welcome-btn {
    background: linear-gradient(135deg, #123dff, #0076ff);
    color: #ffffff;
    border-color: rgba(0,163,255,0.28);
    box-shadow: 0 18px 42px rgba(18,61,255,0.28);
  }

  .pm-action-btn,
  .pm-btn-outline,
  .pm-back-btn {
    background: rgba(255,255,255,0.060);
    border-color: rgba(142,170,255,0.20);
    color: rgba(255,255,255,0.86);
  }

  .pm-action-btn:hover,
  .pm-btn-outline:hover,
  .pm-back-btn:hover,
  .pm-welcome-btn:hover {
    background: rgba(18,61,255,0.18);
    border-color: rgba(0,163,255,0.42);
    color: #ffffff;
  }

  .pm-action-btn.danger {
    color: #ff9daa;
    border-color: rgba(255,93,115,0.28);
  }

  .pm-action-btn.danger:hover {
    background: rgba(255,93,115,0.14);
    border-color: rgba(255,93,115,0.44);
  }

  .pm-hero-banner {
    background:
      radial-gradient(circle at 92% 8%, rgba(0,163,255,0.18), transparent 32%),
      linear-gradient(145deg, rgba(18,61,255,0.22), rgba(255,255,255,0.045)),
      rgba(4,8,20,0.54);
    border: 1px solid rgba(142,170,255,0.18);
    box-shadow: var(--shadow-lg);
    color: #ffffff;
  }

  .pm-hero-title {
    color: #ffffff;
  }

  .pm-hero-sub {
    color: rgba(226,232,255,0.66);
  }

  .pm-compact-stat {
    min-height: 132px;
  }

  .pm-compact-stat::after {
    background: linear-gradient(90deg, rgba(0,163,255,0.72), rgba(18,61,255,0));
  }

  .pm-compact-icon,
  .pm-card-icon,
  .pm-milestone-icon,
  .pm-board-icon,
  .pm-list-add,
  .pm-card-arrow {
    color: #7bbcff;
  }

  .pm-list-status {
    color: #ffffff;
    background: rgba(255,255,255,0.075);
  }

  .pm-list-row {
    border-bottom-color: rgba(142,170,255,0.13);
  }

  .pm-list-row.head {
    color: rgba(226,232,255,0.48);
  }

  .pm-list-row.item:hover {
    background: rgba(18,61,255,0.11);
  }

  .pm-list-check {
    background: rgba(255,255,255,0.060);
    border-color: rgba(142,170,255,0.24);
  }

  .pm-list-bar,
  .pm-hours-bar {
    background: rgba(255,255,255,0.10);
  }

  .pm-list-fill,
  .pm-hours-fill {
    background: linear-gradient(90deg, #123dff, #00a3ff);
    box-shadow: 0 8px 22px rgba(18,61,255,0.28);
  }

  .pm-list-percent,
  .pm-progress-label,
  .pm-card-stat,
  .pm-card-stat strong {
    color: rgba(255,255,255,0.86);
  }

  .pm-card-meta,
  .pm-client-welcome,
  .pm-board-head,
  .pm-divider-line {
    border-color: rgba(142,170,255,0.15);
  }

  .pm-empty {
    background: rgba(255,255,255,0.040);
    border-color: rgba(142,170,255,0.20);
  }

  .pm-empty-text {
    color: rgba(226,232,255,0.62);
  }

  .pm-status-pill {
    border: 1px solid rgba(255,255,255,0.08);
  }

  .pm-status-pill.Active,
  .pm-status-pill.Approved,
  .pm-status-pill.Completed {
    background: rgba(57,217,138,0.14);
    color: #70f0ae;
  }

  .pm-status-pill.Expired,
  .pm-status-pill.Suspended,
  .pm-status-pill.Rejected {
    background: rgba(255,93,115,0.14);
    color: #ff9daa;
  }

  .pm-status-pill.Pending,
  .pm-status-pill.Pending-Renewal,
  .pm-status-pill.Not-Started {
    background: rgba(255,200,87,0.13);
    color: #ffe09a;
  }

  .pm-status-pill.In-Progress {
    background: rgba(0,163,255,0.14);
    color: #8ed1ff;
  }

  .pm-project-card:hover,
  .pm-support-card:hover,
  .pm-task-card:hover,
  .pm-client-card:hover,
  .pm-milestone-card:hover,
  .pm-compact-stat:hover {
    transform: translateY(-4px);
    border-color: rgba(0,163,255,0.38);
    box-shadow: var(--shadow-md);
  }

  @media (max-width: 980px) {
    .pm-sidebar { width: 82px; }
    .pm-main { margin-left: 82px; }
    .pm-logo-mark { width: 38px; }
    .pm-logo-text { display: none; }
  }

  @media (max-width: 720px) {
    .pm-main { margin-left: 0; }
    .pm-content { padding: 18px; }
  }

  /* Final admin refresh: light premium SaaS shell using the existing Bits3 blue/cyan accents. */
  .pm-root {
    --black: #101828;
    --white: #ffffff;
    --gray-50: #f8fafc;
    --gray-100: #eef2f7;
    --gray-200: #d9e2ee;
    --gray-400: #8a95a6;
    --gray-600: #5f6b7a;
    --gray-800: #1f2937;
    --accent: #123dff;
    --accent-2: #00a3ff;
    --accent-light: #eef4ff;
    --success: #047857;
    --danger: #c0263d;
    --warning: #b45309;
    --radius: 14px;
    --radius-lg: 16px;
    --shadow-sm: 0 1px 2px rgba(16, 24, 40, 0.04), 0 10px 28px rgba(16, 24, 40, 0.05);
    --shadow-md: 0 18px 44px rgba(16, 24, 40, 0.09);
    --shadow-lg: 0 26px 68px rgba(16, 24, 40, 0.12);
    background: #f6f8fb;
    color: #101828;
  }

  .pm-root::before { display: none; }

  .pm-layout {
    width: 100%;
    min-height: 100vh;
    max-width: none;
    background: #f6f8fb;
  }

  .pm-sidebar {
    width: 268px;
    background: #ffffff;
    border-right: 1px solid #e5eaf2;
    box-shadow: 8px 0 30px rgba(16, 24, 40, 0.04);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }

  .pm-logo {
    min-height: 86px;
    padding: 20px 22px;
    border-bottom: 1px solid #edf1f7;
  }

  .pm-logo-title {
    color: #101828;
    gap: 12px;
    letter-spacing: 0;
  }

  .pm-logo-mark {
    width: 86px;
    height: auto;
    filter: none;
  }

  .pm-logo-name {
    color: #101828;
    font-size: 13px;
    font-weight: 900;
  }

  .pm-logo-role {
    color: #667085;
    font-size: 10px;
    font-weight: 850;
    letter-spacing: 0.09em;
    text-transform: uppercase;
  }

  .pm-nav {
    padding: 18px 14px;
  }

  .pm-nav-label {
    color: #98a2b3;
    font-size: 10px;
    letter-spacing: 0.14em;
    padding: 0 10px;
  }

  .pm-nav-btn {
    min-height: 44px;
    border-radius: 12px;
    color: #475467;
    font-size: 13px;
    font-weight: 750;
    padding: 11px 12px;
    margin-bottom: 4px;
  }

  .pm-nav-btn:hover {
    background: #f3f7ff;
    color: var(--accent);
    transform: none;
  }

  .pm-nav-btn.active {
    color: var(--accent);
    background: linear-gradient(90deg, rgba(18, 61, 255, 0.10), rgba(0, 163, 255, 0.06));
    box-shadow: inset 3px 0 0 var(--accent);
  }

  .pm-sidebar-footer {
    border-top: 1px solid #edf1f7;
    padding: 14px;
  }

  .pm-logout-btn {
    background: #ffffff;
    border-color: #e5eaf2;
    color: #9f1239;
  }

  .pm-logout-btn:hover {
    background: #fff5f6;
    border-color: #fecdd3;
  }

  .pm-main,
  .pm-main.pm-main-project-detail {
    margin-left: 268px;
    background:
      radial-gradient(circle at 88% -10%, rgba(18, 61, 255, 0.08), transparent 26%),
      #f6f8fb;
  }

  .pm-topbar {
    height: 76px;
    padding: 0 34px;
    background: rgba(246, 248, 251, 0.92);
    border-bottom: 1px solid rgba(229, 234, 242, 0.92);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }

  .pm-topbar-title {
    color: #101828;
    font-size: 25px;
    font-weight: 900;
    letter-spacing: -0.035em;
  }

  .pm-topbar-title::before {
    border-color: var(--accent);
    box-shadow: inset 0 -6px 0 rgba(18, 61, 255, 0.12);
  }

  .pm-topbar-chip {
    display: inline-flex;
    align-items: center;
    min-height: 36px;
    padding: 0 12px;
    border: 1px solid #dbe5f4;
    border-radius: 999px;
    background: #ffffff;
    color: #344054;
    font-size: 12px;
    font-weight: 850;
    box-shadow: 0 8px 22px rgba(16, 24, 40, 0.04);
  }

  .pm-content {
    width: min(100%, 1440px);
    margin: 0 auto;
    padding: 34px 38px 56px;
  }

  .pm-section,
  .pm-taskboard-shell,
  .pm-project-list,
  .pm-stat-card,
  .pm-client-card,
  .pm-support-card,
  .pm-task-card,
  .pm-milestone-card,
  .pm-progress-card,
  .pm-compact-stat,
  .pm-project-detail .pm-section,
  .pm-project-detail .pm-progress-card,
  .pm-project-detail .pm-milestone-card,
  .pm-project-detail .pm-project-card {
    background: #ffffff;
    border: 1px solid #e5eaf2;
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-sm);
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }

  .pm-section,
  .pm-taskboard-shell,
  .pm-project-list {
    overflow: hidden;
  }

  .pm-section-header,
  .pm-milestone-header,
  .pm-project-detail .pm-section-header,
  .pm-project-detail .pm-milestone-header {
    min-height: 62px;
    background: #ffffff;
    border-bottom: 1px solid #edf1f7;
  }

  .pm-section-body {
    padding: 22px;
  }

  .pm-section-icon,
  .pm-stat-icon,
  .pm-chat-icon,
  .pm-artifact-card .pm-card-icon,
  .pm-external-icon {
    background: linear-gradient(135deg, rgba(18, 61, 255, 0.12), rgba(0, 163, 255, 0.12));
    color: var(--accent);
    box-shadow: none;
  }

  .pm-section-title,
  .pm-card-name,
  .pm-client-name,
  .pm-milestone-title,
  .pm-task-title,
  .pm-detail-title,
  .pm-board-title,
  .pm-list-name,
  .pm-stat-value,
  .pm-compact-stat strong,
  .pm-progress-value,
  .pm-chat-detail-value,
  .pm-progress-label,
  .pm-list-percent,
  .pm-card-stat strong {
    color: #101828;
  }

  .pm-card-client,
  .pm-task-meta,
  .pm-task-date,
  .pm-progress-sub,
  .pm-board-sub,
  .pm-list-muted,
  .pm-stat-label,
  .pm-label,
  .pm-divider-text,
  .pm-client-projects,
  .pm-chat-detail-label,
  .pm-chat-chip,
  .pm-artifact-description,
  .pm-artifact-file-state {
    color: #667085;
  }

  .pm-page-kpis {
    display: grid;
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: 14px;
    margin-bottom: 22px;
  }

  .pm-page-kpi {
    min-height: 108px;
    border: 1px solid #e5eaf2;
    border-radius: 16px;
    background: #ffffff;
    box-shadow: var(--shadow-sm);
    padding: 18px;
    display: grid;
    gap: 10px;
    position: relative;
    overflow: hidden;
  }

  .pm-page-kpi::after {
    content: '';
    position: absolute;
    left: 18px;
    right: 18px;
    bottom: 14px;
    height: 3px;
    border-radius: 999px;
    background: linear-gradient(90deg, rgba(18, 61, 255, 0.32), rgba(0, 163, 255, 0));
  }

  .pm-page-kpi span {
    color: #667085;
    font-size: 11px;
    font-weight: 850;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .pm-page-kpi strong {
    color: #101828;
    font-size: 32px;
    line-height: 1;
    font-weight: 950;
    letter-spacing: -0.045em;
  }

  .pm-hero-banner {
    background: #ffffff;
    color: #101828;
    border: 1px solid #e5eaf2;
    box-shadow: var(--shadow-sm);
  }

  .pm-hero-title {
    color: #101828;
  }

  .pm-hero-sub {
    color: #667085;
  }

  .pm-hero-pill,
  button.pm-hero-pill,
  .pm-btn-primary,
  .pm-welcome-btn {
    background: linear-gradient(135deg, #123dff, #0076ff);
    color: #ffffff;
    border-color: rgba(18, 61, 255, 0.20);
    box-shadow: 0 12px 26px rgba(18, 61, 255, 0.20);
  }

  .pm-btn-primary:hover,
  .pm-welcome-btn:hover {
    background: linear-gradient(135deg, #0f35df, #006ee8);
    box-shadow: 0 16px 34px rgba(18, 61, 255, 0.24);
  }

  .pm-input,
  .pm-select,
  .pm-list-date-input,
  .pm-client-welcome-input,
  .pm-color-field,
  .pm-file-upload,
  .pm-check-pill,
  .pm-deliverable-item,
  .pm-work-log,
  .pm-filter-row .pm-input,
  .pm-filter-row .pm-select,
  .pm-filter-row .pm-btn {
    background: #ffffff;
    border-color: #dbe3ef;
    color: #101828;
    box-shadow: none;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
  }

  .pm-input::placeholder,
  .pm-client-welcome-input::placeholder,
  .pm-color-code-input::placeholder {
    color: #98a2b3;
  }

  .pm-input:focus,
  .pm-select:focus,
  .pm-list-date-input:focus,
  .pm-client-welcome-input:focus,
  .pm-color-code-input:focus,
  .pm-btn:focus-visible,
  .pm-action-btn:focus-visible,
  .pm-back-btn:focus-visible,
  .pm-nav-btn:focus-visible,
  .pm-welcome-btn:focus-visible,
  .pm-list-row.item:focus-visible,
  .pm-project-card:focus-visible,
  .pm-support-card:focus-visible {
    outline: none;
    border-color: rgba(18, 61, 255, 0.52);
    box-shadow: 0 0 0 4px rgba(18, 61, 255, 0.12);
  }

  .pm-select option {
    background: #ffffff;
    color: #101828;
  }

  .pm-action-btn,
  .pm-btn-outline,
  .pm-back-btn {
    background: #ffffff;
    border-color: #dbe3ef;
    color: #344054;
  }

  .pm-action-btn:hover,
  .pm-btn-outline:hover,
  .pm-back-btn:hover {
    background: #f3f7ff;
    border-color: rgba(18, 61, 255, 0.28);
    color: var(--accent);
  }

  .pm-project-card,
  .pm-chat-card,
  .pm-artifact-card,
  .pm-external-card {
    background: #ffffff;
  }

  .pm-client-card {
    background: #ffffff;
    border-radius: 16px;
    min-height: 104px;
  }

  .pm-client-logo,
  .pm-client-avatar {
    width: 50px;
    height: 50px;
    border-radius: 14px;
  }

  .pm-project-card:hover,
  .pm-support-card:hover,
  .pm-task-card:hover,
  .pm-client-card:hover,
  .pm-milestone-card:hover,
  .pm-compact-stat:hover,
  .pm-page-kpi:hover {
    transform: translateY(-2px);
    border-color: rgba(18, 61, 255, 0.24);
    box-shadow: var(--shadow-md);
  }

  .pm-list-table {
    overflow-x: auto;
  }

  .pm-list-row {
    min-width: 980px;
    border-bottom-color: #edf1f7;
  }

  .pm-list-row.item:hover {
    background: #f8fbff;
  }

  .pm-list-status {
    color: #344054;
    background: #f2f6fb;
  }

  .pm-list-bar,
  .pm-hours-bar {
    background: #edf2f7;
  }

  .pm-list-fill,
  .pm-hours-fill {
    background: linear-gradient(90deg, #123dff, #00a3ff);
    box-shadow: none;
  }

  .pm-project-value-box,
  .pm-chat-description,
  .pm-chat-detail-item,
  .pm-chat-panel,
  .pm-artifact-description,
  .pm-artifact-file-state {
    background: #f8fbff;
    border: 1px solid #e5eaf2;
    box-shadow: none;
  }

  .pm-project-value-label {
    color: #667085;
  }

  .pm-chat-bubble.admin {
    color: #ffffff;
    background: linear-gradient(135deg, #123dff, #0076ff);
    box-shadow: 0 12px 28px rgba(18, 61, 255, 0.18);
  }

  .pm-chat-bubble.client {
    color: #344054;
    background: #f3f7ff;
    border-color: #dbe5f4;
  }

  .pm-empty {
    background: #ffffff;
    border: 1px dashed #cfd8e6;
    border-radius: 16px;
  }

  .pm-empty-text {
    color: #667085;
  }

  .pm-status-pill {
    border: 1px solid transparent;
    background: #eef4ff;
    color: var(--accent);
  }

  .pm-status-pill.Active,
  .pm-status-pill.Approved,
  .pm-status-pill.Completed {
    background: #ecfdf5;
    color: #047857;
  }

  .pm-status-pill.Expired,
  .pm-status-pill.Suspended,
  .pm-status-pill.Rejected {
    background: #fff1f2;
    color: #be123c;
  }

  .pm-status-pill.Pending,
  .pm-status-pill.Pending-Renewal,
  .pm-status-pill.Not-Started {
    background: #fffbeb;
    color: #b45309;
  }

  .pm-status-pill.In-Progress {
    background: #eff6ff;
    color: #1d4ed8;
  }

  .pm-divider-line,
  .pm-client-welcome,
  .pm-card-meta {
    border-color: #edf1f7;
  }

  .pm-member-avatar {
    background: linear-gradient(135deg, #123dff, #00a3ff);
    color: #ffffff;
    box-shadow: none;
  }

  .pm-gauge::after {
    color: #667085;
  }

  @media (max-width: 1180px) {
    .pm-content {
      padding: 28px 24px 44px;
    }

    .pm-page-kpis {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }

  @media (max-width: 980px) {
    .pm-sidebar {
      width: 82px;
    }

    .pm-main,
    .pm-main.pm-main-project-detail {
      margin-left: 82px;
    }

    .pm-logo {
      padding: 18px 14px;
    }

    .pm-logo-mark {
      width: 40px;
    }

    .pm-logo-text,
    .pm-nav-label,
    .pm-logout-btn span {
      display: none;
    }

    .pm-nav-btn {
      justify-content: center;
      padding: 11px;
    }

    .pm-nav-btn span:not(.icon) {
      display: none;
    }

    .pm-topbar {
      padding: 0 22px;
    }
  }

  @media (max-width: 720px) {
    .pm-sidebar {
      display: flex;
      width: 72px;
    }

    .pm-main,
    .pm-main.pm-main-project-detail {
      margin-left: 72px;
    }

    .pm-topbar {
      height: auto;
      min-height: 70px;
      padding: 14px 18px;
      align-items: flex-start;
      gap: 10px;
      flex-direction: column;
    }

    .pm-topbar-title {
      font-size: 22px;
    }

    .pm-topbar-actions {
      width: 100%;
      justify-content: flex-start;
    }

    .pm-content {
      padding: 18px 14px 36px;
    }

    .pm-page-kpis,
    .pm-compact-stats,
    .pm-support-grid,
    .pm-chat-detail-grid {
      grid-template-columns: 1fr;
    }

    .pm-section-header {
      align-items: flex-start;
      flex-wrap: wrap;
    }

    .pm-project-value-box {
      width: 100%;
      min-width: 0;
      margin-left: 0;
    }
  }

  /* More visible admin polish pass. */
  .pm-topbar {
    background:
      linear-gradient(180deg, rgba(255,255,255,0.98), rgba(248,251,255,0.94));
    box-shadow: 0 8px 28px rgba(16, 24, 40, 0.045);
  }

  .pm-topbar-left {
    display: grid;
    gap: 2px;
  }

  .pm-topbar-title {
    display: inline-flex;
    align-items: center;
    gap: 10px;
  }

  .pm-topbar-title::before {
    width: 30px;
    height: 30px;
    margin-right: 0;
    border: 0;
    border-radius: 10px;
    background: linear-gradient(135deg, #123dff, #00a3ff);
    box-shadow: 0 10px 24px rgba(18,61,255,0.22);
  }

  .pm-topbar-chip {
    background: #101828;
    border-color: #101828;
    color: #ffffff;
    box-shadow: 0 12px 28px rgba(16, 24, 40, 0.12);
  }

  .pm-sidebar {
    background:
      linear-gradient(180deg, #ffffff 0%, #fafdff 100%);
  }

  .pm-nav-btn.active {
    background: linear-gradient(135deg, rgba(18,61,255,0.12), rgba(0,163,255,0.08));
    box-shadow:
      inset 4px 0 0 #123dff,
      0 10px 24px rgba(18,61,255,0.08);
  }

  .pm-content {
    display: grid;
    gap: 24px;
  }

  .pm-taskboard-shell {
    border-radius: 24px;
    padding: 30px;
    border-color: rgba(18,61,255,0.12);
    background:
      linear-gradient(135deg, rgba(18,61,255,0.045), rgba(0,163,255,0.030) 36%, rgba(255,255,255,0) 58%),
      #ffffff;
    box-shadow: 0 24px 70px rgba(16, 24, 40, 0.08);
  }

  .pm-compact-stats {
    grid-template-columns: repeat(4, minmax(180px, 1fr));
    gap: 18px;
    margin-bottom: 28px;
  }

  .pm-compact-stat,
  .pm-page-kpi {
    border-radius: 20px;
    min-height: 138px;
    padding: 24px;
    background:
      radial-gradient(circle at 92% 12%, rgba(18,61,255,0.10), transparent 34%),
      #ffffff;
    border-color: #dfe7f3;
    box-shadow: 0 18px 42px rgba(16,24,40,0.07);
  }

  .pm-compact-stat::after,
  .pm-page-kpi::after {
    left: 24px;
    right: 24px;
    bottom: 20px;
    height: 4px;
    background: linear-gradient(90deg, #123dff, #00a3ff 46%, rgba(0,163,255,0));
  }

  .pm-compact-stat span,
  .pm-page-kpi span {
    color: #667085;
    font-size: 11px;
    letter-spacing: 0.10em;
  }

  .pm-compact-stat strong,
  .pm-page-kpi strong {
    margin-top: 10px;
    font-size: 42px;
    letter-spacing: -0.055em;
  }

  .pm-compact-icon {
    top: 24px;
    right: 24px;
    width: 34px;
    height: 34px;
    border-radius: 12px;
    color: #123dff;
    background: #eef4ff;
  }

  .pm-filter-row {
    grid-template-columns: minmax(220px, 1fr) minmax(280px, 1.35fr) minmax(190px, 0.75fr) 170px;
    gap: 16px;
    padding: 22px;
    border: 1px solid #dfe7f3;
    border-radius: 20px;
    background: rgba(248,251,255,0.82);
  }

  .pm-filter-row .pm-label {
    color: #475467;
    margin-bottom: 9px;
  }

  .pm-filter-row .pm-input,
  .pm-filter-row .pm-select,
  .pm-filter-row .pm-btn {
    min-height: 54px;
    border-radius: 14px;
    font-size: 14px;
  }

  .pm-filter-row .pm-btn {
    width: 100%;
    justify-content: center;
    margin-top: 0;
  }

  .pm-project-list {
    border-radius: 24px;
    border-color: #dfe7f3;
    box-shadow: 0 24px 70px rgba(16, 24, 40, 0.075);
  }

  .pm-list-group {
    padding: 30px;
  }

  .pm-list-status {
    min-height: 34px;
    padding: 0 14px;
    border-radius: 999px;
    background: #101828;
    color: #ffffff;
    margin-bottom: 20px;
  }

  .pm-list-status::before {
    background: #00a3ff;
  }

  .pm-list-table {
    border: 1px solid #edf1f7;
    border-radius: 18px;
    background: #ffffff;
  }

  .pm-list-row {
    padding: 0 18px;
    min-height: 76px;
  }

  .pm-list-row.head {
    min-height: 48px;
    background: #f8fbff;
    color: #667085;
  }

  .pm-list-row.item {
    margin: 0;
    border-radius: 0;
  }

  .pm-list-row.item:hover {
    background: #f4f8ff;
    transform: none;
  }

  .pm-list-name {
    font-size: 16px;
  }

  .pm-action-btn {
    min-height: 36px;
  }

  .pm-section {
    border-radius: 22px;
  }

  .pm-page-kpis {
    gap: 18px;
  }

  @media (max-width: 1320px) {
    .pm-compact-stats,
    .pm-page-kpis {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .pm-filter-row {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }

    .pm-filter-row .pm-btn {
      width: 180px;
    }
  }

  @media (max-width: 720px) {
    .pm-taskboard-shell {
      padding: 18px;
      border-radius: 18px;
    }

    .pm-compact-stats,
    .pm-page-kpis,
    .pm-filter-row {
      grid-template-columns: 1fr;
    }

    .pm-compact-stat,
    .pm-page-kpi {
      min-height: 116px;
    }

    .pm-filter-row .pm-btn {
      width: 100%;
    }
  }

  /* Bits3 noir admin theme: final layer matching the login page. */
  .pm-root {
    --black: #f8fbff;
    --white: #ffffff;
    --gray-50: rgba(255,255,255,0.055);
    --gray-100: rgba(255,255,255,0.08);
    --gray-200: rgba(142,170,255,0.18);
    --gray-400: #7f8baa;
    --gray-600: #a6b0cc;
    --gray-800: #e8efff;
    --accent: #123dff;
    --accent-2: #00a3ff;
    --accent-light: rgba(18,61,255,0.14);
    --success: #39d98a;
    --danger: #ff5d73;
    --warning: #ffc857;
    --shadow-sm: 0 18px 46px rgba(0,0,0,0.22);
    --shadow-md: 0 24px 70px rgba(18,61,255,0.18);
    --shadow-lg: 0 34px 95px rgba(0,0,0,0.34);
    background:
      radial-gradient(circle at 18% 0%, rgba(18,61,255,0.18), transparent 24%),
      radial-gradient(circle at 92% 4%, rgba(0,163,255,0.12), transparent 28%),
      linear-gradient(180deg, #05070c 0%, #010205 100%);
    color: #f8fbff;
  }

  .pm-root::before {
    display: block;
    content: '';
    position: fixed;
    inset: 0;
    pointer-events: none;
    background:
      linear-gradient(rgba(255,255,255,0.024) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.024) 1px, transparent 1px);
    background-size: 72px 72px;
    mask-image: radial-gradient(circle at 52% 22%, black, transparent 70%);
    opacity: 0.38;
    z-index: 0;
  }

  .pm-layout {
    position: relative;
    z-index: 1;
    width: 100%;
    max-width: none;
    min-height: 100vh;
    background: transparent;
    box-shadow: none;
  }

  .pm-sidebar {
    width: 268px;
    background: rgba(7,10,18,0.92);
    border-right: 1px solid rgba(255,255,255,0.09);
    box-shadow: 18px 0 60px rgba(0,0,0,0.34);
    backdrop-filter: blur(22px) saturate(140%);
    -webkit-backdrop-filter: blur(22px) saturate(140%);
  }

  .pm-logo {
    min-height: 80px;
    padding: 18px 22px;
    border-bottom: 1px solid rgba(255,255,255,0.09);
  }

  .pm-logo-title,
  .pm-logo-name {
    color: #ffffff;
  }

  .pm-logo-mark {
    width: 72px;
    filter: brightness(0) invert(1) drop-shadow(0 0 18px rgba(255,255,255,0.12));
  }

  .pm-logo-role {
    color: rgba(255,255,255,0.48);
  }

  .pm-nav {
    padding: 18px 14px;
  }

  .pm-nav-label {
    color: rgba(255,255,255,0.34);
  }

  .pm-nav-btn {
    color: rgba(255,255,255,0.64);
    border: 1px solid transparent;
    background: transparent;
  }

  .pm-nav-btn:hover {
    color: #ffffff;
    background: rgba(255,255,255,0.065);
    border-color: rgba(255,255,255,0.08);
  }

  .pm-nav-btn.active {
    color: #ffffff;
    background: linear-gradient(135deg, rgba(18,61,255,0.32), rgba(0,163,255,0.12));
    border-color: rgba(0,163,255,0.26);
    box-shadow: inset 3px 0 0 #00a3ff, 0 16px 36px rgba(18,61,255,0.16);
  }

  .pm-sidebar-footer {
    border-top: 1px solid rgba(255,255,255,0.09);
  }

  .pm-logout-btn {
    background: rgba(255,255,255,0.055);
    border-color: rgba(255,255,255,0.10);
    color: #ff9daa;
  }

  .pm-logout-btn:hover {
    background: rgba(255,93,115,0.12);
    border-color: rgba(255,93,115,0.28);
  }

  .pm-main,
  .pm-main.pm-main-project-detail {
    margin-left: 268px;
    background:
      radial-gradient(circle at 86% 0%, rgba(18,61,255,0.15), transparent 30%),
      radial-gradient(circle at 0% 90%, rgba(0,163,255,0.08), transparent 26%),
      transparent;
  }

  .pm-topbar {
    height: 76px;
    padding: 0 34px;
    background: rgba(6,9,17,0.72);
    border-bottom: 1px solid rgba(255,255,255,0.09);
    box-shadow: 0 8px 28px rgba(0,0,0,0.18);
    backdrop-filter: blur(20px) saturate(145%);
    -webkit-backdrop-filter: blur(20px) saturate(145%);
  }

  .pm-topbar-title {
    color: #ffffff;
  }

  .pm-topbar-title::before {
    display: none;
  }

  .pm-topbar-title-icon {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    color: #ffffff;
    flex-shrink: 0;
  }

  .pm-topbar-title-icon svg {
    width: 28px;
    height: 28px;
  }

  .pm-theme-toggle {
    min-width: 104px;
    height: 42px;
    border-radius: 999px;
    border: 1px solid rgba(142,170,255,0.22);
    background: rgba(255,255,255,0.065);
    color: #ffffff;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    font-size: 13px;
    font-weight: 900;
    cursor: pointer;
    transition: all 180ms ease;
  }

  .pm-theme-toggle:hover {
    border-color: rgba(0,163,255,0.46);
    background: rgba(18,61,255,0.16);
    transform: translateY(-1px);
  }

  .pm-theme-toggle-dot {
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: #00a3ff;
    box-shadow: 0 0 18px rgba(0,163,255,0.72);
  }

  .pm-topbar-chip {
    background: rgba(255,255,255,0.075);
    border-color: rgba(255,255,255,0.11);
    color: #ffffff;
  }

  .pm-content {
    width: min(100%, 1440px);
    margin: 0 auto;
    padding: 32px 38px 56px;
  }

  .pm-section,
  .pm-taskboard-shell,
  .pm-project-list,
  .pm-stat-card,
  .pm-client-card,
  .pm-support-card,
  .pm-task-card,
  .pm-milestone-card,
  .pm-progress-card,
  .pm-compact-stat,
  .pm-page-kpi,
  .pm-project-detail .pm-section,
  .pm-project-detail .pm-progress-card,
  .pm-project-detail .pm-milestone-card,
  .pm-project-detail .pm-project-card {
    background:
      linear-gradient(145deg, rgba(255,255,255,0.085), rgba(255,255,255,0.030)),
      rgba(4,8,20,0.62);
    border: 1px solid rgba(142,170,255,0.17);
    box-shadow: 0 24px 70px rgba(0,0,0,0.26), inset 0 1px 0 rgba(255,255,255,0.08);
    backdrop-filter: blur(20px) saturate(136%);
    -webkit-backdrop-filter: blur(20px) saturate(136%);
  }

  .pm-taskboard-shell,
  .pm-project-list,
  .pm-section {
    border-radius: 24px;
  }

  .pm-section-header,
  .pm-milestone-header,
  .pm-project-detail .pm-section-header,
  .pm-project-detail .pm-milestone-header {
    background: rgba(255,255,255,0.035);
    border-bottom: 1px solid rgba(142,170,255,0.13);
  }

  .pm-hero-banner {
    background:
      radial-gradient(circle at 92% 8%, rgba(0,163,255,0.15), transparent 32%),
      linear-gradient(145deg, rgba(18,61,255,0.22), rgba(255,255,255,0.045)),
      rgba(4,8,20,0.62);
    border: 1px solid rgba(142,170,255,0.17);
    color: #ffffff;
  }

  .pm-section-icon,
  .pm-stat-icon,
  .pm-compact-icon,
  .pm-chat-icon,
  .pm-artifact-card .pm-card-icon,
  .pm-external-icon {
    background: linear-gradient(135deg, rgba(18,61,255,0.92), rgba(0,163,255,0.82));
    color: #ffffff;
    box-shadow: 0 16px 34px rgba(18,61,255,0.22);
  }

  .pm-section-title,
  .pm-card-name,
  .pm-client-name,
  .pm-milestone-title,
  .pm-task-title,
  .pm-detail-title,
  .pm-board-title,
  .pm-list-name,
  .pm-stat-value,
  .pm-compact-stat strong,
  .pm-page-kpi strong,
  .pm-progress-value,
  .pm-chat-detail-value,
  .pm-progress-label,
  .pm-list-percent,
  .pm-card-stat strong,
  .pm-hero-title {
    color: #ffffff;
  }

  .pm-card-client,
  .pm-task-meta,
  .pm-task-date,
  .pm-progress-sub,
  .pm-board-sub,
  .pm-list-muted,
  .pm-stat-label,
  .pm-label,
  .pm-divider-text,
  .pm-client-projects,
  .pm-chat-detail-label,
  .pm-chat-chip,
  .pm-artifact-description,
  .pm-artifact-file-state,
  .pm-page-kpi span,
  .pm-hero-sub {
    color: rgba(226,232,255,0.62);
  }

  .pm-input,
  .pm-select,
  .pm-list-date-input,
  .pm-client-welcome-input,
  .pm-color-field,
  .pm-file-upload,
  .pm-check-pill,
  .pm-deliverable-item,
  .pm-work-log,
  .pm-filter-row,
  .pm-filter-row .pm-input,
  .pm-filter-row .pm-select,
  .pm-filter-row .pm-btn,
  .pm-project-value-box,
  .pm-chat-description,
  .pm-chat-detail-item,
  .pm-chat-panel,
  .pm-artifact-description,
  .pm-artifact-file-state {
    background:
      linear-gradient(145deg, rgba(255,255,255,0.070), rgba(255,255,255,0.026)),
      rgba(3,7,17,0.50);
    border-color: rgba(142,170,255,0.19);
    color: #ffffff;
    box-shadow: none;
    backdrop-filter: blur(14px) saturate(126%);
    -webkit-backdrop-filter: blur(14px) saturate(126%);
  }

  .pm-input::placeholder,
  .pm-client-welcome-input::placeholder,
  .pm-color-code-input::placeholder,
  .pm-filter-row .pm-input::placeholder {
    color: rgba(226,232,255,0.34);
  }

  .pm-input:focus,
  .pm-select:focus,
  .pm-list-date-input:focus,
  .pm-client-welcome-input:focus,
  .pm-color-code-input:focus {
    border-color: rgba(0,163,255,0.72);
    background: rgba(255,255,255,0.085);
    box-shadow: 0 0 0 4px rgba(18,61,255,0.16);
  }

  .pm-select option {
    background: #071022;
    color: #ffffff;
  }

  .pm-btn-primary,
  .pm-hero-pill,
  button.pm-hero-pill,
  .pm-welcome-btn {
    background: linear-gradient(135deg, #123dff, #0076ff);
    color: #ffffff;
    border-color: rgba(0,163,255,0.28);
    box-shadow: 0 18px 42px rgba(18,61,255,0.24);
  }

  .pm-action-btn,
  .pm-btn-outline,
  .pm-back-btn {
    background: rgba(255,255,255,0.060);
    border-color: rgba(142,170,255,0.20);
    color: rgba(255,255,255,0.86);
  }

  .pm-action-btn:hover,
  .pm-btn-outline:hover,
  .pm-back-btn:hover,
  .pm-welcome-btn:hover {
    background: rgba(18,61,255,0.18);
    border-color: rgba(0,163,255,0.42);
    color: #ffffff;
  }

  .pm-action-btn.danger {
    color: #ff9daa;
    border-color: rgba(255,93,115,0.28);
  }

  .pm-list-status {
    color: #ffffff;
    background: rgba(255,255,255,0.075);
  }

  .pm-list-table {
    background:
      linear-gradient(145deg, rgba(255,255,255,0.060), rgba(255,255,255,0.024)),
      rgba(3,7,17,0.58);
    border: 1px solid rgba(142,170,255,0.17);
    border-radius: 18px;
    overflow: hidden;
  }

  .pm-list-row {
    border-bottom-color: rgba(142,170,255,0.13);
    color: rgba(226,232,255,0.78);
  }

  .pm-list-row.head {
    background: rgba(255,255,255,0.040);
    color: rgba(226,232,255,0.58);
  }

  .pm-list-row.item:hover {
    background: rgba(18,61,255,0.10);
  }

  .pm-list-name {
    color: #ffffff;
  }

  .pm-list-muted {
    color: rgba(226,232,255,0.68);
  }

  .pm-list-date-input {
    background:
      linear-gradient(145deg, rgba(255,255,255,0.085), rgba(255,255,255,0.035)),
      rgba(4,8,20,0.54);
    border-color: rgba(142,170,255,0.24);
    color: #ffffff;
  }

  .pm-compact-icon {
    background: transparent;
    color: #ffffff;
    box-shadow: none;
    border-radius: 0;
  }

  .pm-compact-icon svg {
    stroke: currentColor;
  }

  .pm-list-bar,
  .pm-hours-bar {
    background: rgba(255,255,255,0.10);
  }

  .pm-list-fill,
  .pm-hours-fill,
  .pm-compact-stat::after,
  .pm-page-kpi::after {
    background: linear-gradient(90deg, #123dff, #00a3ff);
  }

  .pm-chat-bubble.admin {
    color: #ffffff;
    background: linear-gradient(135deg, #123dff, #0076ff);
  }

  .pm-chat-bubble.client {
    color: #e8efff;
    background: rgba(255,255,255,0.075);
    border-color: rgba(142,170,255,0.18);
  }

  .pm-chat-card {
    min-height: 190px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    background:
      linear-gradient(145deg, rgba(255,255,255,0.085), rgba(255,255,255,0.030)),
      rgba(4,8,20,0.62);
    border: 1px solid rgba(142,170,255,0.17);
    color: #ffffff;
    box-shadow: 0 24px 70px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.08);
  }

  .pm-chat-card-top {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    gap: 18px;
    min-height: 74px;
  }

  .pm-chat-card .pm-card-name {
    color: #ffffff;
    min-height: 24px;
  }

  .pm-chat-card .pm-card-client {
    color: rgba(226,232,255,0.58);
  }

  .pm-chat-card .pm-chat-icon {
    background: transparent;
    box-shadow: none;
    color: #ffffff;
    width: auto;
    height: auto;
    border-radius: 0;
  }

  .pm-chat-meta {
    display: flex;
    align-items: center;
    gap: 10px;
    flex-wrap: wrap;
    margin-top: auto;
  }

  .pm-chat-chip {
    background: rgba(255,255,255,0.060);
    border: 1px solid rgba(142,170,255,0.18);
    color: rgba(226,232,255,0.78);
    max-width: 100%;
  }

  .pm-support-layout,
  .pm-support-layout .pm-section,
  .pm-support-card,
  .pm-work-log {
    color: #ffffff;
  }

  .pm-support-layout strong,
  .pm-support-card strong,
  .pm-work-log strong {
    color: #ffffff;
  }

  .pm-support-layout [style*="color: #101828"],
  .pm-support-layout [style*="color: rgb(16, 24, 40)"],
  .pm-support-layout [style*="color: #15113b"],
  .pm-support-layout [style*="color: rgb(21, 17, 59)"],
  .pm-support-card [style*="color: #101828"],
  .pm-support-card [style*="color: rgb(16, 24, 40)"],
  .pm-work-log [style*="color: #101828"],
  .pm-work-log [style*="color: rgb(16, 24, 40)"] {
    color: #ffffff !important;
  }

  .pm-support-layout [style*="color: #667085"],
  .pm-support-layout [style*="color: rgb(102, 112, 133)"],
  .pm-support-layout [style*="color: #6d6883"],
  .pm-support-layout [style*="color: rgb(109, 104, 131)"],
  .pm-support-layout [style*="color: #4f4a63"],
  .pm-support-layout [style*="color: rgb(79, 74, 99)"],
  .pm-work-log [style*="color: #667085"],
  .pm-work-log [style*="color: rgb(102, 112, 133)"] {
    color: rgba(226,232,255,0.68) !important;
  }

  .pm-support-layout .pm-status-pill:not(.Active):not(.Approved):not(.Completed):not(.Expired):not(.Suspended):not(.Rejected):not(.Pending):not(.Pending-Renewal):not(.Not-Started):not(.In-Progress) {
    background: rgba(0,163,255,0.12);
    border-color: rgba(0,163,255,0.22);
    color: #8ed1ff;
  }

  .pm-artifact-card {
    min-height: 246px;
    display: flex;
    flex-direction: column;
    gap: 14px;
    background:
      radial-gradient(circle at 92% 8%, rgba(0,163,255,0.14), transparent 34%),
      linear-gradient(145deg, rgba(255,255,255,0.085), rgba(255,255,255,0.030)),
      rgba(4,8,20,0.62);
    border: 1px solid rgba(142,170,255,0.17);
    color: #ffffff;
    box-shadow: 0 24px 70px rgba(0,0,0,0.24), inset 0 1px 0 rgba(255,255,255,0.08);
  }

  .pm-artifact-card::before {
    background: linear-gradient(90deg, #123dff, #00a3ff);
  }

  .pm-artifact-card .pm-card-header {
    min-height: 34px;
  }

  .pm-artifact-card .pm-card-icon {
    width: auto;
    height: auto;
    background: transparent;
    box-shadow: none;
    color: #ffffff;
    border-radius: 0;
  }

  .pm-artifact-card .pm-card-icon svg {
    width: 28px;
    height: 28px;
    stroke: currentColor;
  }

  .pm-artifact-card .pm-card-arrow {
    color: #00a3ff;
    font-weight: 900;
  }

  .pm-artifact-card .pm-card-name {
    color: #ffffff;
    min-height: 24px;
  }

  .pm-artifact-card .pm-card-client,
  .pm-artifact-card [style*="color: #667085"],
  .pm-artifact-card [style*="color: rgb(102, 112, 133)"] {
    color: rgba(226,232,255,0.66) !important;
  }

  .pm-artifact-card .pm-artifact-description {
    color: rgba(226,232,255,0.74);
    background:
      linear-gradient(145deg, rgba(255,255,255,0.070), rgba(255,255,255,0.026)),
      rgba(3,7,17,0.50);
    border-color: rgba(142,170,255,0.18);
  }

  .pm-artifact-card .pm-card-meta {
    margin-top: auto;
    padding-top: 14px;
    border-top: 1px solid rgba(142,170,255,0.15);
    color: rgba(226,232,255,0.66);
    gap: 12px;
  }

  .pm-artifact-card .pm-actions {
    margin-top: 0 !important;
  }

  .pm-artifact-card .pm-action-btn {
    justify-content: center;
    width: 100%;
    background: rgba(255,255,255,0.060);
    border-color: rgba(142,170,255,0.20);
    color: #ffffff;
  }

  .pm-artifact-card .pm-action-btn:hover {
    background: rgba(18,61,255,0.18);
    border-color: rgba(0,163,255,0.42);
  }

  .pm-artifact-file-state {
    color: rgba(226,232,255,0.72);
  }

  .pm-empty {
    background: rgba(255,255,255,0.040);
    border-color: rgba(142,170,255,0.20);
  }

  .pm-empty-text {
    color: rgba(226,232,255,0.62);
  }

  .pm-status-pill {
    border: 1px solid rgba(255,255,255,0.08);
  }

  .pm-status-pill.Active,
  .pm-status-pill.Approved,
  .pm-status-pill.Completed {
    background: rgba(57,217,138,0.14);
    color: #70f0ae;
  }

  .pm-status-pill.Expired,
  .pm-status-pill.Suspended,
  .pm-status-pill.Rejected {
    background: rgba(255,93,115,0.14);
    color: #ff9daa;
  }

  .pm-status-pill.Pending,
  .pm-status-pill.Pending-Renewal,
  .pm-status-pill.Not-Started {
    background: rgba(255,200,87,0.13);
    color: #ffe09a;
  }

  .pm-status-pill.In-Progress {
    background: rgba(0,163,255,0.14);
    color: #8ed1ff;
  }

  .pm-divider-line,
  .pm-client-welcome,
  .pm-card-meta {
    border-color: rgba(142,170,255,0.15);
  }

  .pm-project-card:hover,
  .pm-support-card:hover,
  .pm-task-card:hover,
  .pm-client-card:hover,
  .pm-milestone-card:hover,
  .pm-compact-stat:hover,
  .pm-page-kpi:hover {
    transform: translateY(-3px);
    border-color: rgba(0,163,255,0.34);
    box-shadow: var(--shadow-md);
  }

  .pm-root.pm-theme-light {
    color: #101828;
    background:
      radial-gradient(circle at 84% 0%, rgba(18,61,255,0.10), transparent 30%),
      radial-gradient(circle at 10% 92%, rgba(0,163,255,0.08), transparent 30%),
      #f5f8fd;
  }

  .pm-root.pm-theme-light::before {
    background-image:
      linear-gradient(rgba(18,61,255,0.055) 1px, transparent 1px),
      linear-gradient(90deg, rgba(18,61,255,0.055) 1px, transparent 1px);
    opacity: 0.65;
  }

  .pm-root.pm-theme-light .pm-sidebar {
    background: rgba(255,255,255,0.92);
    border-right: 1px solid rgba(18,61,255,0.10);
    box-shadow: 18px 0 60px rgba(16,24,40,0.08);
  }

  .pm-root.pm-theme-light .pm-logo {
    border-bottom-color: rgba(18,61,255,0.10);
  }

  .pm-root.pm-theme-light .pm-logo-title,
  .pm-root.pm-theme-light .pm-logo-name {
    color: #101828;
  }

  .pm-root.pm-theme-light .pm-logo-mark {
    filter: none;
  }

  .pm-root.pm-theme-light .pm-logo-role,
  .pm-root.pm-theme-light .pm-logo-sub,
  .pm-root.pm-theme-light .pm-nav-label {
    color: #667085;
  }

  .pm-root.pm-theme-light .pm-nav-btn {
    color: #475467;
  }

  .pm-root.pm-theme-light .pm-nav-btn:hover {
    color: #123dff;
    background: rgba(18,61,255,0.060);
    border-color: rgba(18,61,255,0.10);
  }

  .pm-root.pm-theme-light .pm-nav-btn.active {
    color: #123dff;
    background: linear-gradient(135deg, rgba(18,61,255,0.11), rgba(0,163,255,0.07));
    border-color: rgba(18,61,255,0.18);
    box-shadow: inset 3px 0 0 #123dff;
  }

  .pm-root.pm-theme-light .pm-sidebar-footer {
    border-top-color: rgba(18,61,255,0.10);
  }

  .pm-root.pm-theme-light .pm-logout-btn {
    background: #ffffff;
    border-color: #e5eaf2;
    color: #b42318;
  }

  .pm-root.pm-theme-light .pm-main,
  .pm-root.pm-theme-light .pm-main.pm-main-project-detail {
    background:
      radial-gradient(circle at 86% 0%, rgba(18,61,255,0.10), transparent 32%),
      radial-gradient(circle at 0% 90%, rgba(0,163,255,0.08), transparent 28%),
      transparent;
  }

  .pm-root.pm-theme-light .pm-topbar {
    background: rgba(255,255,255,0.86);
    border-bottom-color: rgba(18,61,255,0.10);
    box-shadow: 0 8px 28px rgba(16,24,40,0.06);
  }

  .pm-root.pm-theme-light .pm-breadcrumb {
    color: #667085;
  }

  .pm-root.pm-theme-light .pm-topbar-title,
  .pm-root.pm-theme-light .pm-topbar-title-icon {
    color: #101828;
  }

  .pm-root.pm-theme-light .pm-theme-toggle {
    background: #ffffff;
    border-color: #dbe3ef;
    color: #123dff;
    box-shadow: 0 12px 30px rgba(16,24,40,0.06);
  }

  .pm-root.pm-theme-light .pm-section,
  .pm-root.pm-theme-light .pm-taskboard-shell,
  .pm-root.pm-theme-light .pm-project-list,
  .pm-root.pm-theme-light .pm-stat-card,
  .pm-root.pm-theme-light .pm-client-card,
  .pm-root.pm-theme-light .pm-support-card,
  .pm-root.pm-theme-light .pm-task-card,
  .pm-root.pm-theme-light .pm-milestone-card,
  .pm-root.pm-theme-light .pm-progress-card,
  .pm-root.pm-theme-light .pm-compact-stat,
  .pm-root.pm-theme-light .pm-page-kpi,
  .pm-root.pm-theme-light .pm-project-detail .pm-section,
  .pm-root.pm-theme-light .pm-project-detail .pm-progress-card,
  .pm-root.pm-theme-light .pm-project-detail .pm-milestone-card,
  .pm-root.pm-theme-light .pm-project-detail .pm-project-card,
  .pm-root.pm-theme-light .pm-project-card,
  .pm-root.pm-theme-light .pm-chat-card,
  .pm-root.pm-theme-light .pm-artifact-card,
  .pm-root.pm-theme-light .pm-external-card {
    background:
      linear-gradient(145deg, rgba(255,255,255,0.98), rgba(248,251,255,0.92)),
      #ffffff;
    border-color: rgba(18,61,255,0.12);
    color: #101828;
    box-shadow: 0 20px 55px rgba(16,24,40,0.08), inset 0 1px 0 rgba(255,255,255,0.95);
  }

  .pm-root.pm-theme-light .pm-section-header,
  .pm-root.pm-theme-light .pm-milestone-header,
  .pm-root.pm-theme-light .pm-project-detail .pm-section-header,
  .pm-root.pm-theme-light .pm-project-detail .pm-milestone-header {
    background: rgba(248,251,255,0.82);
    border-bottom-color: rgba(18,61,255,0.10);
  }

  .pm-root.pm-theme-light .pm-hero-banner {
    background:
      radial-gradient(circle at 92% 8%, rgba(0,163,255,0.12), transparent 32%),
      linear-gradient(145deg, rgba(255,255,255,0.98), rgba(239,246,255,0.92));
    border-color: rgba(18,61,255,0.12);
    color: #101828;
  }

  .pm-root.pm-theme-light .pm-section-title,
  .pm-root.pm-theme-light .pm-card-name,
  .pm-root.pm-theme-light .pm-client-name,
  .pm-root.pm-theme-light .pm-milestone-title,
  .pm-root.pm-theme-light .pm-task-title,
  .pm-root.pm-theme-light .pm-detail-title,
  .pm-root.pm-theme-light .pm-board-title,
  .pm-root.pm-theme-light .pm-list-name,
  .pm-root.pm-theme-light .pm-stat-value,
  .pm-root.pm-theme-light .pm-compact-stat strong,
  .pm-root.pm-theme-light .pm-page-kpi strong,
  .pm-root.pm-theme-light .pm-progress-value,
  .pm-root.pm-theme-light .pm-chat-detail-value,
  .pm-root.pm-theme-light .pm-progress-label,
  .pm-root.pm-theme-light .pm-list-percent,
  .pm-root.pm-theme-light .pm-card-stat strong,
  .pm-root.pm-theme-light .pm-hero-title,
  .pm-root.pm-theme-light .pm-support-layout strong,
  .pm-root.pm-theme-light .pm-support-card strong,
  .pm-root.pm-theme-light .pm-work-log strong {
    color: #101828;
  }

  .pm-root.pm-theme-light .pm-card-client,
  .pm-root.pm-theme-light .pm-task-meta,
  .pm-root.pm-theme-light .pm-task-date,
  .pm-root.pm-theme-light .pm-progress-sub,
  .pm-root.pm-theme-light .pm-board-sub,
  .pm-root.pm-theme-light .pm-list-muted,
  .pm-root.pm-theme-light .pm-stat-label,
  .pm-root.pm-theme-light .pm-label,
  .pm-root.pm-theme-light .pm-divider-text,
  .pm-root.pm-theme-light .pm-client-projects,
  .pm-root.pm-theme-light .pm-chat-detail-label,
  .pm-root.pm-theme-light .pm-chat-chip,
  .pm-root.pm-theme-light .pm-artifact-description,
  .pm-root.pm-theme-light .pm-artifact-file-state,
  .pm-root.pm-theme-light .pm-page-kpi span,
  .pm-root.pm-theme-light .pm-hero-sub {
    color: #667085;
  }

  .pm-root.pm-theme-light .pm-input,
  .pm-root.pm-theme-light .pm-select,
  .pm-root.pm-theme-light .pm-list-date-input,
  .pm-root.pm-theme-light .pm-client-welcome-input,
  .pm-root.pm-theme-light .pm-color-field,
  .pm-root.pm-theme-light .pm-file-upload,
  .pm-root.pm-theme-light .pm-check-pill,
  .pm-root.pm-theme-light .pm-deliverable-item,
  .pm-root.pm-theme-light .pm-work-log,
  .pm-root.pm-theme-light .pm-filter-row,
  .pm-root.pm-theme-light .pm-filter-row .pm-input,
  .pm-root.pm-theme-light .pm-filter-row .pm-select,
  .pm-root.pm-theme-light .pm-filter-row .pm-btn,
  .pm-root.pm-theme-light .pm-project-value-box,
  .pm-root.pm-theme-light .pm-chat-description,
  .pm-root.pm-theme-light .pm-chat-detail-item,
  .pm-root.pm-theme-light .pm-chat-panel,
  .pm-root.pm-theme-light .pm-artifact-description,
  .pm-root.pm-theme-light .pm-artifact-file-state {
    background: #ffffff;
    border-color: #dbe3ef;
    color: #101828;
    box-shadow: none;
  }

  .pm-root.pm-theme-light .pm-input::placeholder,
  .pm-root.pm-theme-light .pm-client-welcome-input::placeholder,
  .pm-root.pm-theme-light .pm-color-code-input::placeholder,
  .pm-root.pm-theme-light .pm-filter-row .pm-input::placeholder {
    color: #98a2b3;
  }

  .pm-root.pm-theme-light .pm-select option {
    background: #ffffff;
    color: #101828;
  }

  .pm-root.pm-theme-light .pm-action-btn,
  .pm-root.pm-theme-light .pm-btn-outline,
  .pm-root.pm-theme-light .pm-back-btn {
    background: #ffffff;
    border-color: #dbe3ef;
    color: #344054;
  }

  .pm-root.pm-theme-light .pm-action-btn:hover,
  .pm-root.pm-theme-light .pm-btn-outline:hover,
  .pm-root.pm-theme-light .pm-back-btn:hover {
    background: #f3f7ff;
    border-color: rgba(18,61,255,0.28);
    color: #123dff;
  }

  .pm-root.pm-theme-light .pm-list-table {
    background: #ffffff;
    border-color: #e5eaf2;
  }

  .pm-root.pm-theme-light .pm-list-row {
    border-bottom-color: #edf1f7;
    color: #344054;
  }

  .pm-root.pm-theme-light .pm-list-row.head {
    background: #f8fbff;
    color: #667085;
  }

  .pm-root.pm-theme-light .pm-list-row.item:hover {
    background: #f3f7ff;
  }

  .pm-root.pm-theme-light .pm-list-bar,
  .pm-root.pm-theme-light .pm-hours-bar {
    background: #edf2f7;
  }

  .pm-root.pm-theme-light .pm-chat-bubble.client {
    color: #344054;
    background: #f3f7ff;
    border-color: #dbe5f4;
  }

  .pm-root.pm-theme-light .pm-chat-card .pm-chat-icon,
  .pm-root.pm-theme-light .pm-artifact-card .pm-card-icon,
  .pm-root.pm-theme-light .pm-compact-icon {
    color: #123dff;
  }

  .pm-root.pm-theme-light .pm-artifact-card .pm-artifact-description {
    background: #f8fbff;
    border-color: #e5eaf2;
    color: #475467;
  }

  .pm-root.pm-theme-light .pm-artifact-card .pm-action-btn {
    background: #ffffff;
    color: #123dff;
    border-color: rgba(18,61,255,0.20);
  }

  .pm-root.pm-theme-light .pm-empty {
    background: #f8fbff;
    border-color: #e5eaf2;
  }

  .pm-root.pm-theme-light .pm-empty-text {
    color: #667085;
  }

  @media (max-width: 980px) {
    .pm-sidebar {
      width: 82px;
    }

    .pm-main,
    .pm-main.pm-main-project-detail {
      margin-left: 82px;
    }
  }

  @media (max-width: 720px) {
    .pm-sidebar {
      width: 72px;
    }

    .pm-main,
    .pm-main.pm-main-project-detail {
      margin-left: 72px;
    }

    .pm-content {
      padding: 18px 14px 36px;
    }
  }
`

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [adminTheme, setAdminTheme] = useState<'dark' | 'light'>('dark')
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
  const [welcomeEmailPasswords, setWelcomeEmailPasswords] = useState<Record<string, string>>({})
  const [welcomeEmailErrors, setWelcomeEmailErrors] = useState<Record<string, string>>({})
  const [sendingWelcomeClientId, setSendingWelcomeClientId] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#0a0a0a')
  const [secondaryColor, setSecondaryColor] = useState('#c8a96e')
  const [uploadedFileName, setUploadedFileName] = useState('')
  const [teamName, setTeamName] = useState('')
  const [teamUsername, setTeamUsername] = useState('')
  const [teamPassword, setTeamPassword] = useState('')
  const [teamPictureUrl, setTeamPictureUrl] = useState('')
  const [teamUploadedFileName, setTeamUploadedFileName] = useState('')
  const [editingTeamMember, setEditingTeamMember] = useState<any | null>(null)
  const [teamEditName, setTeamEditName] = useState('')
  const [teamEditUsername, setTeamEditUsername] = useState('')
  const [teamEditPassword, setTeamEditPassword] = useState('')
  const [teamEditPictureUrl, setTeamEditPictureUrl] = useState('')
  const [teamSession, setTeamSession] = useState<any | null>(null)
  // PROJECT
  const [projectName, setProjectName] = useState('')
  const [projectClientId, setProjectClientId] = useState('')
  const [projectKickoffDate, setProjectKickoffDate] = useState('')

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
    const savedTheme = window.localStorage.getItem('pm-admin-theme')
    if (savedTheme === 'light' || savedTheme === 'dark') {
      setAdminTheme(savedTheme)
    }
  }, [])

  useEffect(() => {
    window.localStorage.setItem('pm-admin-theme', adminTheme)
  }, [adminTheme])

  useEffect(() => {
    const init = async () => {
      const savedTeamMemberId = window.localStorage.getItem('pm-team-member-id')
      if (savedTeamMemberId) {
        const { data: savedTeamMember } = await supabase
          .from('team_members')
          .select('*')
          .eq('id', savedTeamMemberId)
          .single()

        if (savedTeamMember) {
          setTeamSession(savedTeamMember)
          setActiveNav('projects')
          await loadData()
          setLoading(false)
          return
        }

        window.localStorage.removeItem('pm-team-member-id')
      }

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return router.push('/login')

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profileError || profile?.role !== 'pm') {
        await supabase.auth.signOut()
        router.push('/client-login')
        return
      }

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

  useEffect(() => {
    if (teamSession && activeNav !== 'projects') {
      setActiveNav('projects')
      setSelectedProject(null)
      setSelectedRequest(null)
      setSelectedSupportContract(null)
    }
  }, [teamSession, activeNav])

const createTeamMember = async () => {
  if (!teamName.trim()) return
  if (!teamUsername.trim()) return
  if (!teamPassword.trim()) return

  const { error } = await supabase.from('team_members').insert([{
    name: teamName.trim(),
    username: teamUsername.trim(),
    password: teamPassword.trim(),
    picture_url: teamPictureUrl.trim(),
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

const openTeamMemberEditor = (member: any) => {
  setEditingTeamMember(member)
  setTeamEditName(member.name || '')
  setTeamEditUsername(member.username || '')
  setTeamEditPassword(member.password || '')
  setTeamEditPictureUrl(member.picture_url || '')
}

const closeTeamMemberEditor = () => {
  setEditingTeamMember(null)
  setTeamEditName('')
  setTeamEditUsername('')
  setTeamEditPassword('')
  setTeamEditPictureUrl('')
}

const saveTeamMember = async () => {
  if (!editingTeamMember) return
  if (!teamEditName.trim()) return
  if (!teamEditUsername.trim()) return
  if (!teamEditPassword.trim()) return

  const { error } = await supabase.from('team_members').update({
    name: teamEditName.trim(),
    username: teamEditUsername.trim(),
    password: teamEditPassword.trim(),
    picture_url: teamEditPictureUrl.trim(),
  }).eq('id', editingTeamMember.id)

  if (error) {
    alert(error.message)
    return
  }

  closeTeamMemberEditor()
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
        primary_color: normalizeHexColor(primaryColor, '#0a0a0a'),
        secondary_color: normalizeHexColor(secondaryColor, '#c8a96e'),
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

  const sendClientWelcomeEmail = async (clientId: string) => {
    const password = welcomeEmailPasswords[clientId]?.trim()

    if (!password) {
      setWelcomeEmailErrors(prev => ({
        ...prev,
        [clientId]: 'Enter the client password in this card before sending.',
      }))
      return
    }

    setWelcomeEmailErrors(prev => ({ ...prev, [clientId]: '' }))

    setSendingWelcomeClientId(clientId)

    try {
      const response = await fetch('/api/send-client-welcome-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ clientId, password }),
      })
      const result = await response.json().catch(() => ({}))

      if (!response.ok) {
        throw new Error(result.error || 'Unable to send welcome email')
      }

      setWelcomeEmailPasswords(prev => ({ ...prev, [clientId]: '' }))
      setWelcomeEmailErrors(prev => ({ ...prev, [clientId]: '' }))
      alert('Welcome email sent successfully.')
    } catch (error) {
      console.error('Client welcome email failed', error)
      alert(`Welcome email could not be sent: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setSendingWelcomeClientId('')
    }
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
    await supabase.from('projects').insert([{ name: projectName, client_id: projectClientId, start_date: projectKickoffDate || null }])
    setProjectName('')
    setProjectClientId('')
    setProjectKickoffDate('')
    await loadData()
  }


  const editProject = async (project: any) => {
    const name = prompt('Project name', project.name)
    if (!name?.trim()) return
    const kickoffDate = prompt('Project kickoff date (YYYY-MM-DD)', project.start_date || '') || ''

    await supabase.from('projects').update({ name, start_date: kickoffDate || null }).eq('id', project.id)
    if (selectedProject?.id === project.id) {
      setSelectedProject({ ...selectedProject, name, start_date: kickoffDate || null })
    }
    await loadData()
  }

  const updateProjectKickoffDate = async (projectId: string, kickoffDate: string) => {
    const { error } = await supabase
      .from('projects')
      .update({ start_date: kickoffDate || null })
      .eq('id', projectId)

    if (error) {
      alert(error.message)
      return
    }

    setProjects(prev => prev.map(project =>
      project.id === projectId ? { ...project, start_date: kickoffDate || null } : project
    ))

    if (selectedProject?.id === projectId) {
      setSelectedProject({ ...selectedProject, start_date: kickoffDate || null })
    }
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
    if (!data.start_date || !data.end_date) {
      alert('Please set both start and end dates for this deliverable.')
      return
    }

    const { error } = await supabase.from('deliverables').insert([{
      title: data.title,
      milestone_id: milestoneId,
      start_date: data.start_date,
      end_date: data.end_date,
      status: data.status || 'Not started'
    }])

    if (error) {
      alert(error.message)
      return
    }

    setDeliverableTitles(prev => ({
      ...prev,
      [milestoneId]: {}
    }))

    await loadData()
  }


  const updateDeliverableField = async (deliverableId: string, field: 'start_date' | 'end_date' | 'status', value: string) => {
    const currentDeliverable = deliverables.find(item => item.id === deliverableId)
    const previousStatus = currentDeliverable?.status

    if (teamSession && field !== 'status') {
      alert('Team members can only update deliverable status.')
      return
    }

    if (teamSession) {
      const milestone = milestones.find(item => item.id === currentDeliverable?.milestone_id)
      const isAssigned = projectTeamMembers.some(assignment =>
        assignment.team_member_id === teamSession.id && assignment.project_id === milestone?.project_id
      )

      if (!isAssigned) {
        alert('This project is not assigned to you.')
        return
      }
    }

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

    if (field === 'status' && value === 'Completed' && previousStatus !== 'Completed') {
      try {
        const response = await fetch('/api/notify-deliverable-completed', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ deliverableId }),
        })

        if (!response.ok) {
          const result = await response.json().catch(() => ({}))
          throw new Error(result.error || 'Email notification failed')
        }
      } catch (notificationError) {
        console.error('Deliverable completion notification failed', notificationError)
        alert(`Deliverable updated, but the email notification could not be sent: ${notificationError instanceof Error ? notificationError.message : 'Unknown error'}`)
      }
    }
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

  const { data: createdRequest, error } = await supabase.from('client_requests').insert([{
    client_id: requestClientId,
    project_id: requestProjectId,
    subject: requestSubject,
    description: requestDescription,
    status: 'Open',
    created_by: 'admin',
  }]).select().single()

  if (error) {
    alert(error.message)
    return
  }

  if (createdRequest?.id) {
    try {
      const response = await fetch('/api/notify-client-chat-opened', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ requestId: createdRequest.id }),
      })

      if (!response.ok) {
        const result = await response.json().catch(() => ({}))
        throw new Error(result.error || 'Email notification failed')
      }
    } catch (notificationError) {
      console.error('Client chat notification failed', notificationError)
      alert(`Chat created, but the email notification could not be sent: ${notificationError instanceof Error ? notificationError.message : 'Unknown error'}`)
    }
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

    if (!editingSupportContract && data?.id) {
      try {
        const response = await fetch('/api/notify-support-contract-pending', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ contractId: data.id }),
        })

        if (!response.ok) {
          const result = await response.json().catch(() => ({}))
          throw new Error(result.error || 'Email notification failed')
        }
      } catch (notificationError) {
        console.error('Support contract notification failed', notificationError)
        alert(`Support contract saved, but the email notification could not be sent: ${notificationError instanceof Error ? notificationError.message : 'Unknown error'}`)
      }
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

    const { data: createdArtifact, error } = await supabase.from('artifacts').insert([{
      client_id: artifactClientId,
      project_id: artifactProjectId,
      name: artifactName,
      description: artifactDescription || null,
      creation_date: artifactCreationDate || null,
      file_url: artifactFileUrl,
      file_name: artifactFileName,
      approval_status: 'Pending Approval',
    }]).select().single()

    if (error) {
      alert(error.message)
      return
    }

    if (createdArtifact?.id) {
      try {
        const response = await fetch('/api/notify-artifact-pending-approval', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ artifactId: createdArtifact.id }),
        })

        if (!response.ok) {
          const result = await response.json().catch(() => ({}))
          throw new Error(result.error || 'Email notification failed')
        }
      } catch (notificationError) {
        console.error('Artifact notification failed', notificationError)
        alert(`Artifact saved, but the email notification could not be sent: ${notificationError instanceof Error ? notificationError.message : 'Unknown error'}`)
      }
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

    const { data: createdTask, error } = await supabase.from('client_tasks').insert([{
      client_id: clientTaskForm.client_id,
      project_id: clientTaskForm.project_id || null,
      title: clientTaskForm.title,
      creation_date: clientTaskForm.creation_date || null,
      due_date: clientTaskForm.due_date || null,
      status: clientTaskForm.status,
    }]).select().single()

    if (error) {
      alert(error.message)
      return
    }

    if (createdTask?.id) {
      try {
        const response = await fetch('/api/notify-client-task-created', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ taskId: createdTask.id }),
        })

        if (!response.ok) {
          const result = await response.json().catch(() => ({}))
          throw new Error(result.error || 'Email notification failed')
        }
      } catch (notificationError) {
        console.error('Client task notification failed', notificationError)
        alert(`Client task saved, but the email notification could not be sent: ${notificationError instanceof Error ? notificationError.message : 'Unknown error'}`)
      }
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

  const removeProjectTeamMember = async (assignmentId: string) => {
  const ok = confirm('Remove this team member from this project?')
  if (!ok) return

  const { error } = await supabase
    .from('project_team_members')
    .delete()
    .eq('id', assignmentId)

  if (error) {
    alert(error.message)
    return
  }

  await loadData()
}
  const createPayment = async () => {
  if (!selectedProject) return
  if (!paymentName.trim()) return

  const { data: payment, error } = await supabase.from('payments').insert([{
    project_id: selectedProject.id,
    term: paymentName,
    amount: Number(paymentPercentage.replace('%', '')),
    is_paid: paymentStatus === 'Paid',
    due_upon: paymentDueUpon,
  }]).select().single()

  if (error) {
    alert(error.message)
    return
  }

  if (paymentStatus === 'Paid' && payment?.id) {
    try {
      const response = await fetch('/api/notify-payment-received', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId: payment.id }),
      })

      if (!response.ok) {
        const result = await response.json().catch(() => ({}))
        throw new Error(result.error || 'Email notification failed')
      }
    } catch (notificationError) {
      console.error('Payment received notification failed', notificationError)
      alert(`Payment saved, but the email notification could not be sent: ${notificationError instanceof Error ? notificationError.message : 'Unknown error'}`)
    }
  }

  setPaymentName('')
  setPaymentPercentage('')
  setPaymentStatus('Pending')
  setPaymentDueUpon('')

  await loadData()
} 

 const updatePaymentStatus = async (paymentId: string, status: string) => {
  const existingPayment = payments.find(payment => payment.id === paymentId)
  const wasPaid = Boolean(existingPayment?.is_paid)
  const isPaid = status === 'Paid'

  const { error } = await supabase
    .from('payments')
    .update({ is_paid: isPaid })
    .eq('id', paymentId)

  if (error) {
    alert(error.message)
    return
  }

  setPayments(prev => prev.map(payment =>
    payment.id === paymentId ? { ...payment, is_paid: isPaid } : payment
  ))

  if (isPaid && !wasPaid) {
    try {
      const response = await fetch('/api/notify-payment-received', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId }),
      })

      if (!response.ok) {
        const result = await response.json().catch(() => ({}))
        throw new Error(result.error || 'Email notification failed')
      }
    } catch (notificationError) {
      console.error('Payment received notification failed', notificationError)
      alert(`Payment updated, but the email notification could not be sent: ${notificationError instanceof Error ? notificationError.message : 'Unknown error'}`)
    }
  }
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
      background: 'radial-gradient(circle at 18% 16%, rgba(18,61,255,0.28), transparent 24%), radial-gradient(circle at 78% 18%, rgba(0,163,255,0.20), transparent 28%), linear-gradient(135deg, #02040A 0%, #050814 48%, #02040A 100%)',
      fontFamily: 'Inter, Arial, sans-serif',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <style>{`
        @keyframes pmLoaderFloatOne {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.78; }
          50% { transform: translate3d(28px, 22px, 0) scale(1.08); opacity: 1; }
        }
        @keyframes pmLoaderFloatTwo {
          0%, 100% { transform: translate3d(0, 0, 0) scale(1); opacity: 0.72; }
          50% { transform: translate3d(-32px, -20px, 0) scale(1.06); opacity: 1; }
        }
        @keyframes pmLoaderCardIn {
          from { transform: translateY(18px) scale(0.97); opacity: 0; }
          to { transform: translateY(0) scale(1); opacity: 1; }
        }
        @keyframes pmLoaderIconPulse {
          0%, 100% { transform: translateY(0) rotate(-1deg) scale(1); filter: drop-shadow(0 24px 52px rgba(18,61,255,0.42)); }
          50% { transform: translateY(-14px) rotate(1.5deg) scale(1.04); filter: drop-shadow(0 34px 70px rgba(0,163,255,0.42)); }
        }
        @keyframes pmLoaderCheck {
          0%, 100% { transform: rotate(-8deg) scale(1); opacity: 0.92; }
          50% { transform: rotate(0deg) scale(1.12); opacity: 1; }
        }
        @keyframes pmLoaderBar {
          0% { transform: translateX(-115%); }
          55% { transform: translateX(45%); }
          100% { transform: translateX(125%); }
        }
      `}</style>
      <div style={{
        position: 'absolute',
        width: 360,
        height: 360,
        borderRadius: '50%',
        background: 'rgba(18, 61, 255, 0.20)',
        top: -120,
        left: -100,
        filter: 'blur(10px)',
        animation: 'pmLoaderFloatOne 4.8s ease-in-out infinite',
      }} />

      <div style={{
        position: 'absolute',
        width: 420,
        height: 420,
        borderRadius: '50%',
        background: 'rgba(0, 163, 255, 0.14)',
        bottom: -160,
        right: -120,
        filter: 'blur(10px)',
        animation: 'pmLoaderFloatTwo 5.4s ease-in-out infinite',
      }} />

      <div style={{
        width: 420,
        padding: 38,
        borderRadius: 28,
        background: 'linear-gradient(145deg, rgba(255,255,255,0.10), rgba(255,255,255,0.035)), rgba(4,8,20,0.52)',
        backdropFilter: 'blur(24px) saturate(140%)',
        boxShadow: '0 30px 90px rgba(0, 0, 0, 0.34), inset 0 1px 0 rgba(255,255,255,0.14)',
        border: '1px solid rgba(142,170,255,0.22)',
        textAlign: 'center',
        zIndex: 2,
        animation: 'pmLoaderCardIn 0.55s ease-out both',
      }}>
        <div style={{
          width: 190,
          height: 150,
          margin: '0 auto 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'pmLoaderIconPulse 2.8s ease-in-out infinite',
        }}>
          <img src="/bits3-login-cube.png" alt="Bits3 cube" style={{ width: '100%', height: '100%', objectFit: 'contain', display: 'block' }} />
        </div>

        <div style={{
          fontSize: 24,
          fontWeight: 800,
          color: '#ffffff',
          marginBottom: 8,
        }}>
          Project Manager
        </div>

        <div style={{
          color: 'rgba(226,232,255,0.64)',
          fontSize: 15,
          marginBottom: 24,
        }}>
          Loading your workspace...
        </div>

        <div style={{
          height: 8,
          background: 'rgba(255,255,255,0.10)',
          borderRadius: 999,
          overflow: 'hidden',
          position: 'relative',
        }}>
          <div style={{
            height: '100%',
            width: '48%',
            borderRadius: 999,
            background: 'linear-gradient(135deg, #123DFF, #00A3FF)',
            animation: 'pmLoaderBar 1.45s ease-in-out infinite',
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
  const isTeamMemberMode = Boolean(teamSession)
  const assignedProjectIds = isTeamMemberMode
    ? projectTeamMembers
      .filter(assignment => assignment.team_member_id === teamSession?.id)
      .map(assignment => assignment.project_id)
    : []
  const visibleProjects = isTeamMemberMode
    ? projects.filter(project => assignedProjectIds.includes(project.id))
    : projects
  const visibleProjectIds = visibleProjects.map(project => project.id)
  const visibleMilestones = isTeamMemberMode
    ? milestones.filter(milestone => visibleProjectIds.includes(milestone.project_id))
    : milestones
  const visibleMilestoneIds = visibleMilestones.map(milestone => milestone.id)
  const visibleDeliverables = isTeamMemberMode
    ? deliverables.filter(deliverable => visibleMilestoneIds.includes(deliverable.milestone_id))
    : deliverables
  const openRequestCount = clientRequests.filter(request => request.status === 'Open').length
  const closedRequestCount = clientRequests.filter(request => request.status === 'Closed').length
  const pendingArtifactCount = artifacts.filter(artifact => artifact.approval_status !== 'Approved').length
  const completedClientTaskCount = clientTasks.filter(task => task.status === 'Completed').length
  const upcomingMeetingCount = meetings.filter(meeting => {
    const meetingTime = Date.parse(`${meeting.meeting_date || ''}T${meeting.meeting_time || '00:00'}`)
    return !Number.isNaN(meetingTime) && meetingTime >= supportTodayTime
  }).length

  return (
    <div className={`pm-root pm-theme-${adminTheme}`}>
      <style>{styles}</style>
      <div className="pm-layout">

        {/* ── Sidebar ── */}
        <aside className="pm-sidebar">
          <div className="pm-logo">
            <div className="pm-logo-title">
              <img className="pm-logo-mark" src="/bits3-logo.png" alt="Bits3" />
              <span className="pm-logo-text">
                <span className="pm-logo-name">Project Manager</span>
                <span className="pm-logo-role">{isTeamMemberMode ? teamSession?.name || 'Team Member' : 'Admin Portal'}</span>
              </span>
            </div>
            <div className="pm-logo-sub">{isTeamMemberMode ? teamSession?.name || 'Team Member' : 'Admin Dashboard'}</div>
          </div>

          <nav className="pm-nav">
            <div className="pm-nav-label">Workspace</div>
            {!isTeamMemberMode && (
              <button
                className={`pm-nav-btn ${activeNav === 'clients' ? 'active' : ''}`}
                onClick={() => { setActiveNav('clients'); setSelectedProject(null); setSelectedSupportContract(null) }}
              >
                <span className="icon">{Icons.client}</span>
                Clients
              </button>
            )}
            <button
              className={`pm-nav-btn ${activeNav === 'projects' ? 'active' : ''}`}
              onClick={() => { setActiveNav('projects'); setSelectedProject(null); setSelectedSupportContract(null) }}
            >
              <span className="icon">{Icons.project}</span>
              Projects
            </button>
{!isTeamMemberMode && (
<>
<button
  className={`pm-nav-btn ${activeNav === 'teams' ? 'active' : ''}`}
  onClick={() => {
    setActiveNav('teams')
    setSelectedProject(null)
    setSelectedSupportContract(null)
  }}
>
  <span className="icon">{Icons.team}</span>
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
  <span className="icon">{Icons.chat}</span>
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
  <span className="icon">{Icons.support}</span>
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
  <span className="icon">{Icons.task}</span>
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
  <span className="icon">{Icons.artifact}</span>
  Artifacts
</button>
</>
)}
            </nav>

          <div className="pm-sidebar-footer">
            <button
              className="pm-logout-btn"
              onClick={async () => {
                window.localStorage.removeItem('pm-team-member-id')
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
        <main className={`pm-main ${selectedProject ? 'pm-main-project-detail' : ''}`}>

          {/* Topbar */}
          <div className="pm-topbar">
            <div className="pm-topbar-left">
              <span className="pm-breadcrumb">Pages</span>
              <span className="pm-breadcrumb">›</span>
              <span className="pm-topbar-title">
                <span className="pm-topbar-title-icon">
                  {selectedProject ? Icons.project : getDashboardSectionIcon(activeNav)}
                </span>
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
              <button
                type="button"
                className="pm-theme-toggle"
                onClick={() => setAdminTheme(current => current === 'dark' ? 'light' : 'dark')}
                aria-label={`Switch to ${adminTheme === 'dark' ? 'light' : 'dark'} theme`}
              >
                <span className="pm-theme-toggle-dot" />
                {adminTheme === 'dark' ? 'Light' : 'Dark'}
              </button>
            </div>
          </div>

          <div className="pm-content">

            {/* ═══════════ CLIENTS VIEW ═══════════ */}
            {activeNav === 'clients' && !selectedProject && (
              <>
                <div className="pm-page-kpis">
                  <div className="pm-page-kpi">
                    <span>Total Clients</span>
                    <strong>{clients.length}</strong>
                  </div>
                  <div className="pm-page-kpi">
                    <span>Active Projects</span>
                    <strong>{projects.length}</strong>
                  </div>
                  <div className="pm-page-kpi">
                    <span>Open Chats</span>
                    <strong>{openRequestCount}</strong>
                  </div>
                  <div className="pm-page-kpi">
                    <span>Pending Artifacts</span>
                    <strong>{pendingArtifactCount}</strong>
                  </div>
                </div>

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
                          <input
                            type="color"
                            className="pm-color-input"
                            value={normalizeHexColor(primaryColor, '#0a0a0a')}
                            onChange={e => setPrimaryColor(e.target.value)}
                          />
                          <input
                            className="pm-color-code-input"
                            placeholder="#0a0a0a"
                            value={primaryColor}
                            onBlur={() => setPrimaryColor(normalizeHexColor(primaryColor, '#0a0a0a'))}
                            onChange={e => setPrimaryColor(e.target.value)}
                          />
                        </div>
                        <div className="pm-color-field">
                          <input
                            type="color"
                            className="pm-color-input"
                            value={normalizeHexColor(secondaryColor, '#c8a96e')}
                            onChange={e => setSecondaryColor(e.target.value)}
                          />
                          <input
                            className="pm-color-code-input"
                            placeholder="#c8a96e"
                            value={secondaryColor}
                            onBlur={() => setSecondaryColor(normalizeHexColor(secondaryColor, '#c8a96e'))}
                            onChange={e => setSecondaryColor(e.target.value)}
                          />
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

                          <div className="pm-client-welcome">
                            <div className="pm-client-welcome-note">
                              Enter this client password here, then send the welcome email.
                            </div>
                            <input
                              className="pm-client-welcome-input"
                              placeholder="Client password"
                              type="password"
                              value={welcomeEmailPasswords[c.id] || ''}
                              onChange={e => {
                                setWelcomeEmailPasswords(prev => ({ ...prev, [c.id]: e.target.value }))
                                setWelcomeEmailErrors(prev => ({ ...prev, [c.id]: '' }))
                              }}
                            />
                            <button
                              className="pm-welcome-btn"
                              disabled={sendingWelcomeClientId === c.id}
                              onClick={() => sendClientWelcomeEmail(c.id)}
                              type="button"
                            >
                              {sendingWelcomeClientId === c.id ? 'Sending...' : 'Send welcoming email'}
                            </button>
                            {welcomeEmailErrors[c.id] && (
                              <div className="pm-client-welcome-error">{welcomeEmailErrors[c.id]}</div>
                            )}
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
    <div className="pm-page-kpis">
      <div className="pm-page-kpi">
        <span>Team Members</span>
        <strong>{teamMembers.length}</strong>
      </div>
      <div className="pm-page-kpi">
        <span>Assigned Projects</span>
        <strong>{projectTeamMembers.length}</strong>
      </div>
      <div className="pm-page-kpi">
        <span>Total Projects</span>
        <strong>{projects.length}</strong>
      </div>
      <div className="pm-page-kpi">
        <span>Deliverables</span>
        <strong>{deliverables.length}</strong>
      </div>
    </div>

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
          <label className="pm-label">Email / Username</label>
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

    {editingTeamMember && (
      <div className="pm-section">
        <div className="pm-section-header">
          <div className="pm-section-icon">{Icons.client}</div>
          <span className="pm-section-title">Edit Team Member</span>
        </div>

        <div className="pm-section-body">
          <div className="pm-form-row">
            <div className="pm-field">
              <label className="pm-label">Member Name</label>
              <input
                className="pm-input"
                value={teamEditName}
                onChange={e => setTeamEditName(e.target.value)}
              />
            </div>

            <div className="pm-field">
              <label className="pm-label">Email / Username</label>
              <input
                className="pm-input"
                value={teamEditUsername}
                onChange={e => setTeamEditUsername(e.target.value)}
              />
            </div>
          </div>

          <div className="pm-form-row" style={{ marginTop: 12 }}>
            <div className="pm-field">
              <label className="pm-label">Password</label>
              <input
                type="text"
                className="pm-input"
                value={teamEditPassword}
                onChange={e => setTeamEditPassword(e.target.value)}
              />
            </div>

            <div className="pm-field">
              <label className="pm-label">Picture URL</label>
              <input
                className="pm-input"
                value={teamEditPictureUrl}
                onChange={e => setTeamEditPictureUrl(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' }}>
            <button className="pm-btn pm-btn-primary" onClick={saveTeamMember}>
              Save Changes
            </button>
            <button className="pm-btn pm-btn-outline" onClick={closeTeamMemberEditor}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    )}

  <div className="pm-divider">
  <div className="pm-divider-line" />
  <span className="pm-divider-text">All Team Members</span>
  <div className="pm-divider-line" />
</div>

<div className="pm-client-grid">
  {teamMembers.map(member => (
    <div
      key={member.id}
      className="pm-client-card"
      onClick={() => openTeamMemberEditor(member)}
      style={{ cursor: 'pointer' }}
    >
      {member.picture_url ? (
        <img src={member.picture_url} alt={member.name} className="pm-client-logo pm-member-logo" />
      ) : (
        <div className="pm-client-avatar pm-member-avatar">
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
            <button
              className="pm-action-btn"
              onClick={(e) => {
                e.stopPropagation()
                openTeamMemberEditor(member)
              }}
            >
              Edit
            </button>
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

    <div className="pm-page-kpis">
      <div className="pm-page-kpi">
        <span>Total Tasks</span>
        <strong>{clientTasks.length}</strong>
      </div>
      <div className="pm-page-kpi">
        <span>Completed</span>
        <strong>{completedClientTaskCount}</strong>
      </div>
      <div className="pm-page-kpi">
        <span>In Progress</span>
        <strong>{clientTasks.filter(task => task.status === 'In Progress').length}</strong>
      </div>
      <div className="pm-page-kpi">
        <span>Not Started</span>
        <strong>{clientTasks.filter(task => task.status === 'Not Started').length}</strong>
      </div>
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

    <div className="pm-page-kpis">
      <div className="pm-page-kpi">
        <span>Total Meetings</span>
        <strong>{meetings.length}</strong>
      </div>
      <div className="pm-page-kpi">
        <span>Upcoming</span>
        <strong>{upcomingMeetingCount}</strong>
      </div>
      <div className="pm-page-kpi">
        <span>Clients</span>
        <strong>{clients.length}</strong>
      </div>
      <div className="pm-page-kpi">
        <span>Projects</span>
        <strong>{projects.length}</strong>
      </div>
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

    <div className="pm-page-kpis">
      <div className="pm-page-kpi">
        <span>Total Artifacts</span>
        <strong>{artifacts.length}</strong>
      </div>
      <div className="pm-page-kpi">
        <span>Pending Approval</span>
        <strong>{pendingArtifactCount}</strong>
      </div>
      <div className="pm-page-kpi">
        <span>Clients</span>
        <strong>{clients.length}</strong>
      </div>
      <div className="pm-page-kpi">
        <span>Projects</span>
        <strong>{projects.length}</strong>
      </div>
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
            <div className="pm-card-client pm-artifact-file-state">
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
                <div key={artifact.id} className="pm-project-card pm-artifact-card">
                  <div className="pm-card-header">
                    <div className="pm-card-icon">{Icons.artifact}</div>
                    <div className="pm-card-arrow">→</div>
                  </div>
                  <div className="pm-card-name">{artifact.name}</div>
                  <div className="pm-card-client">{client?.name || 'Client'} • {project?.name || 'Project'}</div>
                  {artifact.description && (
                    <div className="pm-artifact-description">{artifact.description}</div>
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
                        <div style={{ fontSize: 18, fontWeight: 900, color: '#ffffff' }}>{Number(contract.monthly_support_fee || 0).toLocaleString()}</div>
                      </div>
                      <div>
                        <div className="pm-stat-label">Duration</div>
                        <div style={{ fontSize: 13, fontWeight: 900, color: '#00a3ff' }}>{Number(contract.duration_days || 0)} days</div>
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: 'rgba(226,232,255,0.68)', fontWeight: 800 }}>
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
                <div style={{ fontSize: 12, fontWeight: 900, color: '#00a3ff' }}>SLA Response Times</div>
                <div className="pm-card-client">Critical: {selectedSupportContract.critical_response_hours || 0}h{selectedSupportContract.critical_response_definition ? ` • ${selectedSupportContract.critical_response_definition}` : ''}</div>
                <div className="pm-card-client">Normal: {selectedSupportContract.normal_response_hours || 0}h{selectedSupportContract.normal_response_definition ? ` • ${selectedSupportContract.normal_response_definition}` : ''}</div>
                <div className="pm-card-client">Low: {selectedSupportContract.low_response_hours || 0}h{selectedSupportContract.low_response_definition ? ` • ${selectedSupportContract.low_response_definition}` : ''}</div>
              </div>

              <div style={{ marginTop: 18 }}>
                <div style={{ fontSize: 12, fontWeight: 900, color: '#00a3ff', marginBottom: 8 }}>Included Scope</div>
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
                  <div style={{ fontSize: 12, fontWeight: 900, color: '#00a3ff' }}>Renewal Log</div>
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
                    <div style={{ fontWeight: 900, color: '#ffffff' }}>{log.title}</div>
                    <span className={`pm-status-pill ${String(log.approval_status || 'Pending').replaceAll(' ', '-')}`}>{log.approval_status || 'Pending'}</span>
                  </div>
                  <div className="pm-card-client">
                    {log.work_date || 'No creation date'} • {Number(log.time_spent_hours || 0)}h required • {Number(log.charged_hours || 0)}h charged • {Number(log.charge_per_hour || 0).toLocaleString()} per hour • {log.priority} • {log.status}
                  </div>
                  {log.description && <div style={{ color: 'rgba(226,232,255,0.68)', fontSize: 13, lineHeight: 1.5 }}>{log.description}</div>}
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
    <div className="pm-page-kpis">
      <div className="pm-page-kpi">
        <span>Total Chats</span>
        <strong>{clientRequests.length}</strong>
      </div>
      <div className="pm-page-kpi">
        <span>Open</span>
        <strong>{openRequestCount}</strong>
      </div>
      <div className="pm-page-kpi">
        <span>Closed</span>
        <strong>{closedRequestCount}</strong>
      </div>
      <div className="pm-page-kpi">
        <span>Messages</span>
        <strong>{clientRequestMessages.length}</strong>
      </div>
    </div>

    <div className="pm-section">
      <div className="pm-section-header">
        <div className="pm-section-icon">{Icons.chat}</div>
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
        className="pm-project-card pm-chat-card"
        onClick={() => setSelectedRequest(req)}
      >
        <div className="pm-chat-card-top">
          <div>
            <div className="pm-card-name">{req.subject}</div>
            <div className="pm-card-client">
              {clients.find(c => c.id === req.client_id)?.name}
            </div>
          </div>
          <span className="pm-chat-icon">{Icons.chat}</span>
        </div>

        <div className="pm-chat-meta">
          <span className="pm-chat-chip">{projects.find(p => p.id === req.project_id)?.name || 'No project'}</span>
          <span className={`pm-status-pill ${String(req.status || '').replaceAll(' ', '-')}`}>{req.status}</span>
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
        <div className="pm-section-icon">{Icons.chat}</div>

        <span className="pm-section-title">
          {selectedRequest.subject}
        </span>
      </div>

      <div className="pm-section-body">

        <div className="pm-chat-detail-grid">
          <div className="pm-chat-detail-item">
            <div className="pm-chat-detail-label">Client</div>
            <div className="pm-chat-detail-value">{clients.find(c => c.id === selectedRequest.client_id)?.name}</div>
          </div>

          <div className="pm-chat-detail-item">
            <div className="pm-chat-detail-label">Project</div>
            <div className="pm-chat-detail-value">{projects.find(p => p.id === selectedRequest.project_id)?.name}</div>
          </div>

          <div className="pm-chat-detail-item">
            <div className="pm-chat-detail-label">Status</div>
            <div className="pm-chat-detail-value">{selectedRequest.status}</div>
          </div>
        </div>

        <div>
          <div className="pm-chat-detail-label">Description</div>

          <div className="pm-chat-description" style={{
            marginTop: '10px',
            padding: '14px',
            borderRadius: '16px'
          }}>
            {selectedRequest.description}
          </div>
        </div>

      </div>
    </div>

    <div className="pm-section">
      <div className="pm-section-header">
        <div className="pm-section-icon">{Icons.chat}</div>

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
                className={`pm-chat-bubble ${msg.sender === 'admin' ? 'admin' : 'client'}`}
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
                <div className="pm-taskboard-shell">
                  <div className="pm-compact-stats">
                    <div className="pm-compact-stat">
                      <span>Clients</span>
                      <strong>{isTeamMemberMode ? new Set(visibleProjects.map(project => project.client_id)).size : clients.length}</strong>
                      <span className="pm-compact-icon">{Icons.client}</span>
                    </div>
                    <div className="pm-compact-stat">
                      <span>Projects</span>
                      <strong>{visibleProjects.length}</strong>
                      <span className="pm-compact-icon">{Icons.project}</span>
                    </div>
                    <div className="pm-compact-stat">
                      <span>Milestones</span>
                      <strong>{visibleMilestones.length}</strong>
                      <span className="pm-compact-icon">{Icons.milestone}</span>
                    </div>
                    <div className="pm-compact-stat">
                      <span>Deliverables</span>
                      <strong>{visibleDeliverables.length}</strong>
                      <span className="pm-compact-icon">{Icons.deliverable}</span>
                    </div>
                  </div>

                  {!isTeamMemberMode && (
                  <div className="pm-filter-row">
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
                    <div className="pm-field" style={{ maxWidth: 190 }}>
                      <label className="pm-label">Kickoff Date</label>
                      <input
                        type="date"
                        className="pm-input"
                        value={projectKickoffDate}
                        onChange={e => setProjectKickoffDate(e.target.value)}
                        onKeyDown={e => { if (e.key === 'Enter') createProject() }}
                      />
                    </div>
                    <button className="pm-btn pm-btn-primary" style={{ flexShrink: 0 }} onClick={createProject}>
                      {Icons.plus} Add New
                    </button>
                  </div>
                  )}
                </div>

                {visibleProjects.length === 0 ? (
                  <div className="pm-empty">
                    <div className="pm-empty-icon">{Icons.folder}</div>
                    <p className="pm-empty-text">{isTeamMemberMode ? 'No projects are assigned to you yet.' : 'No projects yet. Create your first project above.'}</p>
                  </div>
                ) : (
                  <div className="pm-project-list">
                    <div className="pm-list-group">
                      <div className="pm-list-status">Active Projects</div>
                      <div className="pm-list-table">
                        <div className="pm-list-row head">
                          <span />
                          <span>Name</span>
                          <span>Client</span>
                          <span>Kickoff</span>
                          <span>Progress</span>
                          <span>Milestones</span>
                          <span />
                        </div>
                        {visibleProjects.map(p => {
                          const stats = getProjectProgress(p.id)
                          const milestoneCount = milestones.filter(m => m.project_id === p.id).length
                          return (
                            <div key={p.id} className="pm-list-row item" onClick={() => setSelectedProject(p)}>
                              <span className="pm-list-check" />
                              <span className="pm-list-name">{p.name}</span>
                              <span className="pm-list-muted">{p.clients?.name || 'No client'}</span>
                              <span onClick={e => e.stopPropagation()}>
                                {isTeamMemberMode ? (
                                  <span className="pm-list-muted">{p.start_date || 'No date'}</span>
                                ) : (
                                  <input
                                    type="date"
                                    className="pm-list-date-input"
                                    value={p.start_date || ''}
                                    onChange={e => updateProjectKickoffDate(p.id, e.target.value)}
                                  />
                                )}
                              </span>
                              <span className="pm-list-progress">
                                <span className="pm-list-bar">
                                  <span className="pm-list-fill" style={{ width: `${stats.progress}%` }} />
                                </span>
                                <span className="pm-list-percent">{stats.progress}%</span>
                              </span>
                              <span className="pm-list-muted">{milestoneCount} milestone{milestoneCount !== 1 ? 's' : ''}</span>
                              {!isTeamMemberMode && (
                                <span className="pm-actions" onClick={e => e.stopPropagation()}>
                                  <button className="pm-action-btn" onClick={() => editProject(p)}>Edit</button>
                                  <button className="pm-action-btn danger" onClick={() => deleteProject(p.id)}>Delete</button>
                                </span>
                              )}
                            </div>
                          )
                        })}
                      </div>
                      {!isTeamMemberMode && (
                        <button className="pm-list-add" onClick={() => {
                          const input = document.querySelector<HTMLInputElement>('input[placeholder="Website Redesign"]')
                          input?.focus()
                        }}>
                          {Icons.plus} Add Project
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </>
            )}

            {/* ═══════════ PROJECT DETAIL ═══════════ */}
            {selectedProject && (
              <div className="pm-project-detail">
                <button className="pm-back-btn" onClick={() => setSelectedProject(null)}>
                  {Icons.back} Back to Projects
                </button>

                <div className="pm-detail-header">
                  <div>
                    <div className="pm-detail-title">{selectedProject.name}</div>
                    <div className="pm-detail-client">{selectedProject.clients?.name}</div>
                  </div>
                </div>

                {!isTeamMemberMode && (
                <div className="pm-progress-card">
                  <div className="pm-gauge" aria-label={`Project progress ${projectProgress}%`}>
                    <svg className="pm-gauge-track" viewBox="0 0 190 112" role="presentation" aria-hidden="true">
                      <path d="M24 96 A71 71 0 0 1 166 96" fill="none" stroke="rgba(255,255,255,0.16)" strokeWidth="22" strokeLinecap="butt" />
                      <path
                        d="M24 96 A71 71 0 0 1 166 96"
                        fill="none"
                        stroke="url(#projectProgressGradient)"
                        strokeWidth="22"
                        strokeLinecap="butt"
                        pathLength="100"
                        strokeDasharray={`${projectProgress} 100`}
                      />
                      <circle cx="24" cy="96" r="11" fill="#123dff" />
                      <defs>
                        <linearGradient id="projectProgressGradient" x1="24" y1="96" x2="166" y2="96" gradientUnits="userSpaceOnUse">
                          <stop stopColor="#123dff" />
                          <stop offset="1" stopColor="#00a3ff" />
                        </linearGradient>
                      </defs>
                    </svg>
                  </div>

                  <div>
                    <div className="pm-progress-value">{projectProgress}%</div>
                    <div className="pm-progress-label">Project Progress</div>
                    <div className="pm-progress-sub">
                      {totalDeliverables === 0 ? 'No deliverables yet' : `${completedDeliverables} completed out of ${totalDeliverables} deliverables`}
                    </div>
                  </div>
                </div>
                )}

                {/* Add Milestone */}
                <div className="pm-section" style={{ marginBottom: '24px', display: isTeamMemberMode ? 'none' : undefined }}>
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
<div className="pm-section" style={{ marginBottom: '24px', display: isTeamMemberMode ? 'none' : undefined }}>
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
              {member.picture_url ? (
                <img src={member.picture_url} alt={member.name} className="pm-client-logo pm-member-logo" />
              ) : (
                <div className="pm-client-avatar pm-member-avatar">
                  {member.name?.charAt(0)?.toUpperCase()}
                </div>
              )}

              <div className="pm-client-info">
                <div className="pm-client-top">
                  <div style={{ minWidth: 0 }}>
                    <div className="pm-client-name">
                      {member.name}
                    </div>
                  </div>

                  <div className="pm-client-actions" style={{ marginLeft: 'auto', flexShrink: 0 }}>
                    <button
                      className="pm-action-btn danger"
                      onClick={() => removeProjectTeamMember(ptm.id)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
    </div>

  </div>
</div>

{/* Payments */}
<div className="pm-section" style={{ marginBottom: '24px', display: isTeamMemberMode ? 'none' : undefined }}>
  <div className="pm-section-header">
    <div className="pm-section-icon">{Icons.project}</div>
    <span className="pm-section-title">Payments</span>
    <div className="pm-project-value-box">
      <div className="pm-project-value-label">Project Value</div>
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
                {p.amount}% • {p.due_upon}
              </div>
            </div>
            <select
              className="pm-select"
              style={{ width: 140, minHeight: 42, flexShrink: 0 }}
              value={p.is_paid ? 'Paid' : 'Pending'}
              onChange={(e) => updatePaymentStatus(p.id, e.target.value)}
            >
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
            </select>
          </div>
        ))}
    </div>

  </div>
</div>

                {/* External Cards */}
                <div className="pm-section" style={{ marginBottom: '24px', display: isTeamMemberMode ? 'none' : undefined }}>
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

                {!isTeamMemberMode && externalLinks.filter(link => link.project_id === selectedProject.id).length > 0 && (
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
                              className="pm-project-card pm-external-card"
                              style={{ textDecoration: 'none' }}
                            >
                              {link.icon_url ? (
                                <img
                                  src={link.icon_url}
                                  alt={link.title}
                                  className="pm-external-thumb"
                                />
                              ) : (
                                <div className="pm-external-icon">{Icons.artifact}</div>
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
                          {!isTeamMemberMode && (
                            <div className="pm-actions">
                              <button className="pm-action-btn" onClick={() => editMilestone(m)}>Edit</button>
                              <button className="pm-action-btn danger" onClick={() => deleteMilestone(m.id)}>Delete</button>
                            </div>
                          )}
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
                                {!isTeamMemberMode && (
                                  <DeliverableDatePicker
                                    label="Start"
                                    value={d.start_date}
                                    onChange={(date) => updateDeliverableField(d.id, 'start_date', date)}
                                    tone="start"
                                    openUp
                                  />
                                )}

                                {!isTeamMemberMode && (
                                  <DeliverableDatePicker
                                    label="End"
                                    value={d.end_date}
                                    onChange={(date) => updateDeliverableField(d.id, 'end_date', date)}
                                    tone="end"
                                    openUp
                                  />
                                )}

                                <select
                                  value={d.status || 'Not started'}
                                  onChange={(e) => updateDeliverableField(d.id, 'status', e.target.value)}
                                  style={{
                                    fontSize: '11px',
                                    padding: '5px 8px',
                                    borderRadius: '20px',
                                    border: 'none',
                                    outline: 'none',
                                    background: d.status === 'Completed' ? '#e8f5e9' : d.status === 'Delayed' ? '#fdecea' : d.status === 'In Progress' ? '#eaf2ff' : '#f3f3f3',
                                    color: d.status === 'Completed' ? '#2e7d32' : d.status === 'Delayed' ? '#c0392b' : d.status === 'In Progress' ? '#1d4ed8' : '#5a5a5a',
                                    fontWeight: 800,
                                    whiteSpace: 'nowrap',
                                    cursor: 'pointer'
                                  }}
                                >
                                  <option value="Not started">Not started</option>
                                  <option value="In Progress">In Progress</option>
                                  <option value="Completed">Completed</option>
                                  <option value="Delayed">Delayed</option>
                                </select>
                              </div>

                              {!isTeamMemberMode && (
                                <div className="pm-actions">
                                  <button className="pm-action-btn danger" onClick={() => deleteDeliverable(d.id)}>Delete</button>
                                </div>
                              )}
                            </div>
                          ))}

                          {/* Add deliverable */}
                          {!isTeamMemberMode && (
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

                            <DeliverableDatePicker
                              label="Start"
                              value={deliverableTitles[m.id]?.start_date || ''}
                              onChange={date =>
                                setDeliverableTitles(prev => ({
                                  ...prev,
                                  [m.id]: { ...prev[m.id], start_date: date }
                                }))
                              }
                              tone="start"
                              variant="input"
                              openUp
                              style={{ flex: 1, minWidth: '210px' }}
                            />

                            <DeliverableDatePicker
                              label="End"
                              value={deliverableTitles[m.id]?.end_date || ''}
                              onChange={date =>
                                setDeliverableTitles(prev => ({
                                  ...prev,
                                  [m.id]: { ...prev[m.id], end_date: date }
                                }))
                              }
                              tone="end"
                              variant="input"
                              openUp
                              style={{ flex: 1, minWidth: '210px' }}
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
                              <option value="In Progress">In Progress</option>
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
                          )}
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
