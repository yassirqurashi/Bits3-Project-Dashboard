'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase/client'
import type { ClientTask } from '../../lib/types'

const styles = `
  .ct-root {
    min-height: 100vh;
    background: linear-gradient(180deg, #F7F8FB 0%, #EEF1F6 100%);
    color: #151236;
    font-family: Inter, Arial, sans-serif;
    padding: 24px 28px 44px;
  }
  .ct-shell { max-width: 1180px; margin: 0 auto; }
  .ct-top { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 22px; background: rgba(255,255,255,0.94); border: 1px solid rgba(230,230,240,0.9); border-radius: 24px; padding: 20px 22px; box-shadow: 0 14px 38px rgba(21,18,54,0.06); position: relative; overflow: hidden; }
  .ct-top::after { content: ''; position: absolute; right: 18px; top: 18px; width: 96px; height: 8px; border-radius: 999px; background: linear-gradient(90deg, var(--client-primary), var(--client-secondary)); opacity: 0.9; }
  .ct-top > * { position: relative; z-index: 1; }
  .ct-title { font-size: 27px; font-weight: 900; color: #12182B; margin: 0; }
  .ct-subtitle { margin-top: 6px; color: #727789; font-size: 14px; font-weight: 700; }
  .ct-btn { border: none; border-radius: 14px; padding: 11px 16px; font-size: 13px; font-weight: 900; cursor: pointer; transition: 0.2s ease; }
  .ct-btn:hover { transform: translateY(-1px); }
  .ct-btn-light { color: var(--client-primary); background: #fff; border: 1px solid var(--client-primary-border); box-shadow: 0 10px 24px rgba(21,18,54,0.06); }
  .ct-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 14px; margin-bottom: 22px; }
  .ct-stat { background: rgba(255,255,255,0.94); border: 1px solid rgba(230,230,240,0.9); border-radius: 22px; padding: 18px; box-shadow: 0 14px 38px rgba(21,18,54,0.06); position: relative; overflow: hidden; transition: transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease; }
  .ct-stat:hover { transform: translateY(-4px); border-color: var(--client-primary); box-shadow: 0 20px 48px rgba(21,18,54,0.11); }
  .ct-stat::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 5px; background: linear-gradient(180deg, var(--client-primary), var(--client-secondary)); }
  .ct-label { color: #8A86A4; font-size: 11px; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase; position: relative; z-index: 1; }
  .ct-value { color: var(--client-primary); font-size: 28px; line-height: 1; font-weight: 900; margin-top: 12px; position: relative; z-index: 1; }
  .ct-panel { background: rgba(255,255,255,0.94); border-radius: 24px; border: 1px solid rgba(230,230,240,0.9); box-shadow: 0 14px 38px rgba(21,18,54,0.06); overflow: hidden; }
  .ct-panel-head { padding: 18px 20px; border-bottom: 1px solid #f0eff6; display: flex; align-items: center; justify-content: space-between; gap: 12px; background: #fff; }
  .ct-panel-title { font-size: 15px; font-weight: 900; }
  .ct-list { padding: 14px; display: grid; gap: 12px; }
  .ct-card { border: 1px solid #eeedf6; border-radius: 18px; background: #fff; padding: 16px 16px 16px 20px; display: grid; gap: 12px; transition: transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease; position: relative; overflow: hidden; }
  .ct-card::before { content: ''; position: absolute; left: 0; top: 14px; bottom: 14px; width: 5px; border-radius: 999px; background: linear-gradient(180deg, var(--client-primary), var(--client-secondary)); }
  .ct-card:hover { transform: translateY(-4px); border-color: var(--client-primary); box-shadow: 0 18px 42px rgba(21,18,54,0.10); background: linear-gradient(135deg, #ffffff, var(--client-primary-soft)); }
  .ct-card-top { display: flex; justify-content: space-between; gap: 14px; align-items: flex-start; }
  .ct-name { font-size: 16px; font-weight: 900; color: #151236; line-height: 1.25; }
  .ct-meta { color: #8A86A4; font-size: 12px; font-weight: 700; line-height: 1.45; }
  .ct-pill { display: inline-flex; border-radius: 999px; padding: 6px 10px; font-size: 11px; font-weight: 900; color: var(--client-primary); background: var(--client-primary-soft); white-space: nowrap; border: 1px solid var(--client-primary-border); }
  .ct-pill.Completed { color: #047857; background: #ecfdf5; }
  .ct-pill.In-Progress { color: #1d4ed8; background: #eff6ff; }
  .ct-pill.Not-Started { color: #4b5563; background: #f3f4f6; }
  .ct-empty { padding: 34px 20px; color: #8A86A4; font-weight: 700; text-align: center; }
  .ct-root.dark { background: linear-gradient(180deg, #0B1220 0%, #111827 100%); color: #F8FAFC; }
  .ct-root.dark .ct-top { background: rgba(20,28,44,0.94); border-color: rgba(148,163,184,0.20); box-shadow: 0 16px 44px rgba(0,0,0,0.26); }
  .ct-root.dark .ct-title,
  .ct-root.dark .ct-panel-title,
  .ct-root.dark .ct-name,
  .ct-root.dark .ct-value { color: #F8FAFC; }
  .ct-root.dark .ct-subtitle,
  .ct-root.dark .ct-meta,
  .ct-root.dark .ct-label,
  .ct-root.dark .ct-empty { color: #AAB3C5; }
  .ct-root.dark .ct-stat,
  .ct-root.dark .ct-panel,
  .ct-root.dark .ct-card,
  .ct-root.dark .ct-btn-light { background: rgba(20,28,44,0.94); border-color: rgba(148,163,184,0.20); box-shadow: 0 16px 44px rgba(0,0,0,0.26); }
  .ct-root.dark .ct-panel-head { border-color: rgba(148,163,184,0.20); }
  .ct-root.dark .ct-stat,
  .ct-root.dark .ct-card { background: rgba(20,28,44,0.94); }
  .ct-root.dark .ct-card:hover { background: linear-gradient(135deg, rgba(20,28,44,0.94), var(--client-primary-soft)); }
  .ct-root.dark .ct-btn-light { color: #F8FAFC; }
  @media (max-width: 760px) {
    .ct-root { padding: 18px; }
    .ct-top { align-items: flex-start; flex-direction: column; }
    .ct-card-top { flex-direction: column; }
  }
`

const loadingStyles = `
  @keyframes clientTasksLoaderSpin {
    to { transform: rotate(360deg); }
  }
  @keyframes clientTasksLoaderPulse {
    0%, 100% { transform: scale(0.92); opacity: 0.65; }
    50% { transform: scale(1.08); opacity: 1; }
  }
  @keyframes clientTasksLoaderBar {
    0% { transform: translateX(-110%); }
    100% { transform: translateX(110%); }
  }
`

type Client = {
  id: string
  name?: string
  primary_color?: string
  secondary_color?: string
}

type Project = {
  id: string
  name?: string
}

export default function ClientTasksPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [loadingPrimary, setLoadingPrimary] = useState('#2386d2')
  const [loadingSecondary, setLoadingSecondary] = useState('#8E6CFF')
  const [client, setClient] = useState<Client | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [tasks, setTasks] = useState<ClientTask[]>([])
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  const primary = client?.primary_color || loadingPrimary
  const secondary = client?.secondary_color || loadingSecondary
  const isDark = theme === 'dark'

  const loadData = async () => {
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
    setLoadingSecondary(clientData.secondary_color || '#8E6CFF')
    window.localStorage.setItem('client-dashboard-primary-color', clientData.primary_color || '#2386d2')
    window.localStorage.setItem('client-dashboard-secondary-color', clientData.secondary_color || '#8E6CFF')

    const { data: projectData } = await supabase
      .from('projects')
      .select('*')
      .eq('client_id', clientData.id)

    const { data: taskData } = await supabase
      .from('client_tasks')
      .select('*')
      .eq('client_id', clientData.id)
      .order('created_at', { ascending: false })

    setClient(clientData)
    setProjects(projectData || [])
    setTasks(taskData || [])
    setLoading(false)
  }

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('client-dashboard-theme')
    if (savedTheme === 'dark' || savedTheme === 'light') setTheme(savedTheme)
    const savedPrimary = window.localStorage.getItem('client-dashboard-primary-color')
    const savedSecondary = window.localStorage.getItem('client-dashboard-secondary-color')
    if (savedPrimary) setLoadingPrimary(savedPrimary)
    if (savedSecondary) setLoadingSecondary(savedSecondary)

    const timeoutId = window.setTimeout(() => {
      loadData()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [])

  const formatDate = (date?: string | null) => date ? new Date(date).toLocaleDateString() : 'Not set'
  const completedTasks = tasks.filter(task => task.status === 'Completed').length
  const openTasks = tasks.length - completedTasks

  if (loading) {
    return (
      <main style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: isDark
          ? `radial-gradient(circle at 24% 18%, ${primary}24, transparent 28%), radial-gradient(circle at 78% 10%, ${secondary}22, transparent 30%), linear-gradient(180deg, #0B1220 0%, #111827 100%)`
          : `radial-gradient(circle at 24% 18%, ${primary}1F, transparent 28%), radial-gradient(circle at 78% 10%, ${secondary}1D, transparent 30%), linear-gradient(180deg, #F7F8FB 0%, #EEF1F6 100%)`,
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
            background: `linear-gradient(135deg, ${primary}, ${secondary})`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: `0 18px 42px ${primary}33`,
            position: 'relative',
          }}>
            <div style={{ position: 'absolute', inset: -8, borderRadius: 34, border: `3px solid ${primary}22`, borderTopColor: primary, animation: 'clientTasksLoaderSpin 1s linear infinite' }} />
            <div style={{ width: 22, height: 22, borderRadius: 999, background: isDark ? '#EAF2FF' : '#fff', animation: 'clientTasksLoaderPulse 1.2s ease-in-out infinite' }} />
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: isDark ? '#F8FAFC' : '#151236' }}>Loading tasks...</div>
          <div style={{ marginTop: 8, color: isDark ? '#AAB3C5' : '#7b7894', fontSize: 14, fontWeight: 700 }}>Preparing your assigned tasks</div>
          <div style={{ marginTop: 22, height: 7, borderRadius: 999, background: isDark ? 'rgba(255,255,255,0.10)' : `${primary}18`, overflow: 'hidden' }}>
            <div style={{ width: '55%', height: '100%', borderRadius: 999, background: `linear-gradient(90deg, ${primary}, ${secondary})`, animation: 'clientTasksLoaderBar 1.25s ease-in-out infinite' }} />
          </div>
        </div>
      </main>
    )
  }

  if (!client) {
    return (
      <main className={`ct-root ${theme === 'dark' ? 'dark' : ''}`}>
        <style>{styles}</style>
        <div className="ct-shell">
          <div className="ct-panel">
            <div className="ct-empty">No client profile found.</div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className={`ct-root ${theme === 'dark' ? 'dark' : ''}`} style={{ '--client-primary': primary, '--client-secondary': secondary, '--client-primary-soft': `${primary}14`, '--client-secondary-soft': `${secondary}14`, '--client-primary-border': `${primary}2E`, '--client-secondary-border': `${secondary}2E` } as CSSProperties}>
      <style>{styles}</style>
      <div className="ct-shell">
        <div className="ct-top">
          <div>
            <h1 className="ct-title">Clients Task</h1>
            <div className="ct-subtitle">View the tasks assigned by your admin team.</div>
          </div>
          <button className="ct-btn ct-btn-light" onClick={() => router.push('/client-dashboard')}>Back to dashboard</button>
        </div>

        <div className="ct-stats">
          <div className="ct-stat"><div className="ct-label">Assigned Tasks</div><div className="ct-value">{tasks.length}</div></div>
          <div className="ct-stat"><div className="ct-label">Completed</div><div className="ct-value">{completedTasks}</div></div>
          <div className="ct-stat"><div className="ct-label">Open Tasks</div><div className="ct-value">{openTasks}</div></div>
        </div>

        <div className="ct-panel">
          <div className="ct-panel-head">
            <div className="ct-panel-title">Assigned Tasks</div>
          </div>
          <div className="ct-list">
            {tasks.length === 0 ? (
              <div className="ct-empty">No tasks have been assigned yet.</div>
            ) : tasks.map(task => {
              const project = projects.find(item => item.id === task.project_id)

              return (
                <div key={task.id} className="ct-card">
                  <div className="ct-card-top">
                    <div>
                      <div className="ct-name">{task.title}</div>
                      <div className="ct-meta">{project?.name || 'Project'} • Created {formatDate(task.creation_date)} • Due {formatDate(task.due_date)}</div>
                    </div>
                    <span className={`ct-pill ${String(task.status).replaceAll(' ', '-')}`}>{task.status}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </main>
  )
}
