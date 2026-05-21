'use client'

import { useCallback, useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase/client'
import type { Meeting } from '../../lib/types'

const styles = `
  .cm-root {
    min-height: 100vh;
    background: linear-gradient(180deg, #F7F8FB 0%, #EEF1F6 100%);
    color: #151236;
    font-family: Inter, Arial, sans-serif;
    padding: 24px 28px 44px;
  }
  .cm-shell { max-width: 1180px; margin: 0 auto; }
  .cm-top { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 22px; }
  .cm-title { font-size: 27px; font-weight: 900; color: #12182B; margin: 0; }
  .cm-subtitle { margin-top: 6px; color: #727789; font-size: 14px; font-weight: 700; }
  .cm-btn { border: none; border-radius: 14px; padding: 11px 16px; font-size: 13px; font-weight: 900; cursor: pointer; transition: 0.2s ease; }
  .cm-btn:hover { transform: translateY(-1px); }
  .cm-btn-light { color: #151236; background: #fff; border: 1px solid rgba(230,230,240,0.95); box-shadow: 0 10px 24px rgba(21,18,54,0.06); }
  .cm-layout { display: grid; grid-template-columns: minmax(0, 0.9fr) minmax(340px, 1.1fr); gap: 18px; align-items: start; }
  .cm-panel { background: rgba(255,255,255,0.94); border-radius: 24px; border: 1px solid rgba(230,230,240,0.9); box-shadow: 0 14px 38px rgba(21,18,54,0.06); overflow: hidden; transition: transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease; }
  .cm-panel:hover { transform: translateY(-3px); border-color: var(--client-primary); box-shadow: 0 22px 54px rgba(21,18,54,0.12); }
  .cm-panel-head { padding: 18px 20px; border-bottom: 1px solid #f0eff6; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .cm-panel-title { font-size: 15px; font-weight: 900; }
  .cm-list { padding: 14px; display: grid; gap: 12px; }
  .cm-card { border: 1px solid #eeedf6; border-radius: 18px; background: #fff; padding: 16px; display: grid; gap: 12px; cursor: pointer; text-align: left; transition: transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease, background 0.24s ease; position: relative; overflow: hidden; }
  .cm-card::after { content: ''; position: absolute; inset: 0 auto 0 0; width: 4px; background: var(--client-primary); opacity: 0; transform: scaleY(0.45); transition: opacity 0.24s ease, transform 0.24s ease; }
  .cm-card:hover,
  .cm-card.active { transform: translateY(-4px); border-color: var(--client-primary); box-shadow: 0 18px 42px rgba(21,18,54,0.10); background: linear-gradient(135deg, #ffffff, var(--client-primary-soft)); }
  .cm-card:hover::after,
  .cm-card.active::after { opacity: 1; transform: scaleY(1); }
  .cm-card-top { display: flex; justify-content: space-between; gap: 14px; align-items: flex-start; }
  .cm-name { font-size: 16px; font-weight: 900; color: #151236; line-height: 1.25; }
  .cm-meta { color: #8A86A4; font-size: 12px; font-weight: 700; line-height: 1.45; }
  .cm-pill { display: inline-flex; border-radius: 999px; padding: 6px 10px; font-size: 11px; font-weight: 900; color: var(--client-primary); background: var(--client-primary-soft); white-space: nowrap; }
  .cm-detail { padding: 22px; display: grid; gap: 18px; }
  .cm-detail-title { font-size: 22px; font-weight: 900; line-height: 1.2; color: #151236; }
  .cm-detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 12px; }
  .cm-detail-item { border-radius: 16px; background: #F8F8FD; padding: 14px; transition: transform 0.22s ease, box-shadow 0.22s ease, background 0.22s ease; }
  .cm-detail-item:hover { transform: translateY(-3px); background: var(--client-primary-soft); box-shadow: 0 14px 30px rgba(21,18,54,0.08); }
  .cm-label { color: #8A86A4; font-size: 11px; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase; }
  .cm-value { color: #151236; font-size: 15px; font-weight: 900; margin-top: 7px; }
  .cm-moms { white-space: pre-wrap; color: #4B4F63; font-size: 14px; font-weight: 700; line-height: 1.7; background: #F8F8FD; border-radius: 18px; padding: 18px; border: 1px solid #eeedf6; transition: transform 0.22s ease, box-shadow 0.22s ease, border-color 0.22s ease; }
  .cm-moms:hover { transform: translateY(-3px); border-color: var(--client-primary); box-shadow: 0 16px 34px rgba(21,18,54,0.09); }
  .cm-empty { padding: 34px 20px; color: #8A86A4; font-weight: 700; text-align: center; }
  .cm-root.dark { background: linear-gradient(180deg, #0B1220 0%, #111827 100%); color: #F8FAFC; }
  .cm-root.dark .cm-title,
  .cm-root.dark .cm-panel-title,
  .cm-root.dark .cm-name,
  .cm-root.dark .cm-detail-title,
  .cm-root.dark .cm-value { color: #F8FAFC; }
  .cm-root.dark .cm-subtitle,
  .cm-root.dark .cm-meta,
  .cm-root.dark .cm-label,
  .cm-root.dark .cm-empty,
  .cm-root.dark .cm-moms { color: #AAB3C5; }
  .cm-root.dark .cm-panel,
  .cm-root.dark .cm-card,
  .cm-root.dark .cm-btn-light { background: rgba(20,28,44,0.94); border-color: rgba(148,163,184,0.20); box-shadow: 0 16px 44px rgba(0,0,0,0.26); }
  .cm-root.dark .cm-panel:hover,
  .cm-root.dark .cm-card:hover,
  .cm-root.dark .cm-card.active { box-shadow: 0 24px 58px rgba(0,0,0,0.34); }
  .cm-root.dark .cm-panel-head,
  .cm-root.dark .cm-moms { border-color: rgba(148,163,184,0.20); }
  .cm-root.dark .cm-detail-item,
  .cm-root.dark .cm-moms { background: rgba(255,255,255,0.055); }
  .cm-root.dark .cm-btn-light { color: #F8FAFC; }
  @media (max-width: 880px) {
    .cm-root { padding: 18px; }
    .cm-top { align-items: flex-start; flex-direction: column; }
    .cm-layout { grid-template-columns: 1fr; }
    .cm-detail-grid { grid-template-columns: 1fr; }
  }
`

const loadingStyles = `
  @keyframes clientMeetingsLoaderSpin {
    to { transform: rotate(360deg); }
  }
  @keyframes clientMeetingsLoaderPulse {
    0%, 100% { transform: scale(0.92); opacity: 0.65; }
    50% { transform: scale(1.08); opacity: 1; }
  }
  @keyframes clientMeetingsLoaderBar {
    0% { transform: translateX(-110%); }
    100% { transform: translateX(110%); }
  }
`

type Client = {
  id: string
  name?: string
  primary_color?: string
}

type Project = {
  id: string
  name?: string
}

export default function ClientMeetingsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [loadingPrimary, setLoadingPrimary] = useState('#2386d2')
  const [client, setClient] = useState<Client | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [selectedMeeting, setSelectedMeeting] = useState<Meeting | null>(null)
  const [theme] = useState<'light' | 'dark'>(() => {
    if (typeof window === 'undefined') return 'light'
    const savedTheme = window.localStorage.getItem('client-dashboard-theme')
    return savedTheme === 'dark' || savedTheme === 'light' ? savedTheme : 'light'
  })

  const primary = client?.primary_color || loadingPrimary
  const isDark = theme === 'dark'

  const loadData = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push('/client-login')
      return
    }

    const { data: clientData, error: clientError } = await supabase
      .from('clients')
      .select('*')
      .eq('user_id', user.id)
      .single()

    if (clientError || !clientData) {
      setLoading(false)
      return
    }

    setLoadingPrimary(clientData.primary_color || '#2386d2')

    const { data: projectData } = await supabase
      .from('projects')
      .select('*')
      .eq('client_id', clientData.id)

    const { data: meetingData } = await supabase
      .from('meetings')
      .select('*')
      .eq('client_id', clientData.id)
      .order('meeting_date', { ascending: false })
      .order('meeting_time', { ascending: false })

    const orderedMeetings = meetingData || []
    setClient(clientData)
    setProjects(projectData || [])
    setMeetings(orderedMeetings)
    setSelectedMeeting(orderedMeetings[0] || null)
    setLoading(false)
  }, [router])

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      loadData()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [loadData])

  const formatDate = (date?: string | null) => date ? new Date(date).toLocaleDateString() : 'Not set'
  const formatTime = (time?: string | null) => time ? time.slice(0, 5) : 'Not set'
  const getProjectName = (projectId?: string | null) => projects.find(project => project.id === projectId)?.name || 'Project'

  if (loading) {
    return (
      <main style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isDark
          ? `radial-gradient(circle at 24% 18%, ${primary}24, transparent 28%), radial-gradient(circle at 78% 10%, ${primary}18, transparent 30%), linear-gradient(180deg, #0B1220 0%, #111827 100%)`
          : `radial-gradient(circle at 24% 18%, ${primary}1F, transparent 28%), radial-gradient(circle at 78% 10%, ${primary}14, transparent 30%), linear-gradient(180deg, #F7F8FB 0%, #EEF1F6 100%)`,
        fontFamily: 'Inter, Arial, sans-serif',
        position: 'relative',
        overflow: 'hidden',
        padding: 24,
      }}>
        <style>{loadingStyles}</style>
        <div style={{
          width: 360,
          background: isDark ? 'rgba(20,28,44,0.86)' : 'rgba(255,255,255,0.84)',
          backdropFilter: 'blur(18px)',
          padding: 34,
          borderRadius: 30,
          boxShadow: isDark ? '0 30px 80px rgba(0,0,0,0.34)' : `0 30px 80px ${primary}1F`,
          textAlign: 'center',
          border: isDark ? '1px solid rgba(148,163,184,0.22)' : '1px solid rgba(255,255,255,0.72)',
        }}>
          <div style={{
            width: 86,
            height: 86,
            borderRadius: 28,
            margin: '0 auto 22px',
            background: primary,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 18px 42px ${primary}33`,
            position: 'relative',
          }}>
            <div style={{ position: 'absolute', inset: -8, borderRadius: 34, border: `3px solid ${primary}22`, borderTopColor: primary, animation: 'clientMeetingsLoaderSpin 1s linear infinite' }} />
            <div style={{ width: 22, height: 22, borderRadius: 999, background: isDark ? '#EAF2FF' : '#fff', animation: 'clientMeetingsLoaderPulse 1.2s ease-in-out infinite' }} />
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: isDark ? '#F8FAFC' : '#151236' }}>Loading meetings...</div>
          <div style={{ marginTop: 8, color: isDark ? '#AAB3C5' : '#7b7894', fontSize: 14, fontWeight: 700 }}>Preparing meeting logs</div>
          <div style={{ marginTop: 22, height: 7, borderRadius: 999, background: isDark ? 'rgba(255,255,255,0.10)' : `${primary}18`, overflow: 'hidden' }}>
            <div style={{ width: '55%', height: '100%', borderRadius: 999, background: primary, animation: 'clientMeetingsLoaderBar 1.25s ease-in-out infinite' }} />
          </div>
        </div>
      </main>
    )
  }

  if (!client) {
    return (
      <main className={`cm-root ${theme === 'dark' ? 'dark' : ''}`}>
        <style>{styles}</style>
        <div className="cm-shell">
          <div className="cm-panel">
            <div className="cm-empty">No client profile found.</div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className={`cm-root ${theme === 'dark' ? 'dark' : ''}`} style={{ '--client-primary': primary, '--client-primary-soft': `${primary}14` } as CSSProperties}>
      <style>{styles}</style>
      <div className="cm-shell">
        <div className="cm-top">
          <div>
            <h1 className="cm-title">Meetings</h1>
            <div className="cm-subtitle">View meeting logs and MOMs shared by your admin team.</div>
          </div>
          <button className="cm-btn cm-btn-light" onClick={() => router.push('/client-dashboard')}>Back to dashboard</button>
        </div>

        <div className="cm-layout">
          <div className="cm-panel">
            <div className="cm-panel-head">
              <div className="cm-panel-title">Meeting Logs</div>
              <span className="cm-pill">{meetings.length} total</span>
            </div>
            <div className="cm-list">
              {meetings.length === 0 ? (
                <div className="cm-empty">No meetings have been logged yet.</div>
              ) : meetings.map(meeting => (
                <button
                  key={meeting.id}
                  className={`cm-card ${selectedMeeting?.id === meeting.id ? 'active' : ''}`}
                  onClick={() => setSelectedMeeting(meeting)}
                  type="button"
                >
                  <div className="cm-card-top">
                    <div>
                      <div className="cm-name">{getProjectName(meeting.project_id)}</div>
                      <div className="cm-meta">{formatDate(meeting.meeting_date)} • {formatTime(meeting.meeting_time)}</div>
                    </div>
                    <span className="cm-pill">MOM</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div className="cm-panel">
            {selectedMeeting ? (
              <div className="cm-detail">
                <div>
                  <div className="cm-detail-title">{getProjectName(selectedMeeting.project_id)}</div>
                  <div className="cm-meta" style={{ marginTop: 6 }}>Meeting details and minutes of meeting</div>
                </div>
                <div className="cm-detail-grid">
                  <div className="cm-detail-item">
                    <div className="cm-label">Meeting Date</div>
                    <div className="cm-value">{formatDate(selectedMeeting.meeting_date)}</div>
                  </div>
                  <div className="cm-detail-item">
                    <div className="cm-label">Meeting Time</div>
                    <div className="cm-value">{formatTime(selectedMeeting.meeting_time)}</div>
                  </div>
                </div>
                <div>
                  <div className="cm-label" style={{ marginBottom: 10 }}>MOMs</div>
                  <div className="cm-moms">{selectedMeeting.moms}</div>
                </div>
              </div>
            ) : (
              <div className="cm-empty">Select a meeting to view its MOMs.</div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
