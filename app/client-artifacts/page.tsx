'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase/client'
import type { Artifact } from '../../lib/types'

const styles = `
  .ca-root {
    min-height: 100vh;
    background: linear-gradient(180deg, #F7F8FB 0%, #EEF1F6 100%);
    color: #151236;
    font-family: Inter, Arial, sans-serif;
    padding: 24px 28px 44px;
  }
  .ca-shell { max-width: 1180px; margin: 0 auto; }
  .ca-top { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 22px; background: rgba(255,255,255,0.94); border: 1px solid rgba(230,230,240,0.9); border-radius: 24px; padding: 20px 22px; box-shadow: 0 14px 38px rgba(21,18,54,0.06); position: relative; overflow: hidden; }
  .ca-top::after { content: ''; position: absolute; right: 18px; top: 18px; width: 96px; height: 8px; border-radius: 999px; background: linear-gradient(90deg, var(--client-primary), var(--client-secondary)); opacity: 0.9; }
  .ca-top > * { position: relative; z-index: 1; }
  .ca-title { font-size: 27px; font-weight: 900; color: #12182B; margin: 0; }
  .ca-subtitle { margin-top: 6px; color: #727789; font-size: 14px; font-weight: 700; }
  .ca-btn { border: none; border-radius: 14px; padding: 11px 16px; font-size: 13px; font-weight: 900; cursor: pointer; transition: 0.2s ease; text-decoration: none; display: inline-flex; align-items: center; justify-content: center; }
  .ca-btn:hover { transform: translateY(-1px); }
  .ca-btn-primary { color: #fff; background: linear-gradient(135deg, var(--client-primary), var(--client-secondary)); box-shadow: 0 12px 28px rgba(21,18,54,0.12); }
  .ca-btn-light { color: var(--client-primary); background: #fff; border: 1px solid var(--client-primary-border); box-shadow: 0 10px 24px rgba(21,18,54,0.06); }
  .ca-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 14px; margin-bottom: 22px; }
  .ca-stat { background: rgba(255,255,255,0.94); border: 1px solid rgba(230,230,240,0.9); border-radius: 22px; padding: 18px; box-shadow: 0 14px 38px rgba(21,18,54,0.06); position: relative; overflow: hidden; transition: transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease; }
  .ca-stat:hover { transform: translateY(-5px); border-color: var(--client-primary); box-shadow: 0 22px 54px rgba(21,18,54,0.12); }
  .ca-stat::before { content: ''; position: absolute; left: 0; top: 0; bottom: 0; width: 5px; background: linear-gradient(180deg, var(--client-primary), var(--client-secondary)); }
  .ca-label { color: #8A86A4; font-size: 11px; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase; position: relative; z-index: 1; }
  .ca-value { color: #151236; font-size: 28px; line-height: 1; font-weight: 900; margin-top: 12px; position: relative; z-index: 1; }
  .ca-panel { background: rgba(255,255,255,0.94); border-radius: 24px; border: 1px solid rgba(230,230,240,0.9); box-shadow: 0 14px 38px rgba(21,18,54,0.06); overflow: hidden; }
  .ca-panel-head { padding: 18px 20px; border-bottom: 1px solid #f0eff6; display: flex; align-items: center; justify-content: space-between; gap: 12px; background: #fff; }
  .ca-panel-title { font-size: 15px; font-weight: 900; }
  .ca-list { padding: 14px; display: grid; gap: 12px; }
  .ca-card { border: 1px solid #eeedf6; border-radius: 18px; background: #fff; padding: 16px 16px 16px 20px; display: grid; grid-template-columns: 46px minmax(0, 1fr) auto; gap: 14px; align-items: start; transition: transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease, background 0.24s ease; position: relative; overflow: hidden; }
  .ca-card::before { content: ''; position: absolute; left: 0; top: 14px; bottom: 14px; width: 5px; border-radius: 999px; background: linear-gradient(180deg, var(--client-primary), var(--client-secondary)); }
  .ca-card:hover { transform: translateY(-4px); border-color: var(--client-primary); box-shadow: 0 18px 42px rgba(21,18,54,0.10); background: linear-gradient(135deg, #fff, var(--client-primary-soft)); }
  .ca-file-icon { width: 46px; height: 46px; border-radius: 14px; background: var(--client-primary-soft); color: var(--client-primary); display: flex; align-items: center; justify-content: center; }
  .ca-card-main { min-width: 0; display: grid; gap: 7px; }
  .ca-card-actions { display: flex; flex-direction: column; align-items: flex-end; gap: 9px; min-width: 188px; }
  .ca-name { font-size: 16px; font-weight: 900; color: #151236; line-height: 1.25; }
  .ca-meta { color: #8A86A4; font-size: 12px; font-weight: 700; line-height: 1.45; }
  .ca-description { color: #5d6072; font-size: 13px; font-weight: 700; line-height: 1.45; white-space: pre-wrap; }
  .ca-pill { display: inline-flex; border-radius: 999px; padding: 6px 10px; font-size: 11px; font-weight: 900; color: var(--client-primary); background: var(--client-primary-soft); white-space: nowrap; border: 1px solid var(--client-primary-border); }
  .ca-actions { display: flex; gap: 8px; justify-content: flex-end; }
  .ca-actions .ca-btn { min-width: 86px; padding: 9px 12px; border-radius: 12px; }
  .ca-empty { padding: 34px 20px; color: #8A86A4; font-weight: 700; text-align: center; }
  .ca-root.dark { background: linear-gradient(180deg, #0B1220 0%, #111827 100%); color: #F8FAFC; }
  .ca-root.dark .ca-top { background: rgba(20,28,44,0.94); border-color: rgba(148,163,184,0.20); box-shadow: 0 16px 44px rgba(0,0,0,0.26); }
  .ca-root.dark .ca-title,
  .ca-root.dark .ca-panel-title,
  .ca-root.dark .ca-name,
  .ca-root.dark .ca-value { color: #F8FAFC; }
  .ca-root.dark .ca-subtitle,
  .ca-root.dark .ca-meta,
  .ca-root.dark .ca-label,
  .ca-root.dark .ca-empty { color: #AAB3C5; }
  .ca-root.dark .ca-stat,
  .ca-root.dark .ca-panel,
  .ca-root.dark .ca-card,
  .ca-root.dark .ca-btn-light { background: rgba(20,28,44,0.94); border-color: rgba(148,163,184,0.20); box-shadow: 0 16px 44px rgba(0,0,0,0.26); }
  .ca-root.dark .ca-panel-head { border-color: rgba(148,163,184,0.20); }
  .ca-root.dark .ca-description { color: #CBD5E1; }
  .ca-root.dark .ca-btn-light { color: #F8FAFC; }
  .ca-root.dark .ca-card:hover { background: linear-gradient(135deg, rgba(20,28,44,0.94), var(--client-primary-soft)); }
  @media (max-width: 760px) {
    .ca-root { padding: 18px; }
    .ca-top { align-items: flex-start; flex-direction: column; }
    .ca-card { grid-template-columns: 42px minmax(0, 1fr); }
    .ca-file-icon { width: 42px; height: 42px; border-radius: 13px; }
    .ca-card-actions { align-items: stretch; width: 100%; }
    .ca-card-actions { grid-column: 1 / -1; min-width: 0; }
    .ca-actions { width: 100%; justify-content: stretch; }
    .ca-btn { width: 100%; }
  }
`

const loadingStyles = `
  @keyframes clientArtifactsLoaderSpin {
    to { transform: rotate(360deg); }
  }

  @keyframes clientArtifactsLoaderPulse {
    0%, 100% { transform: scale(0.92); opacity: 0.65; }
    50% { transform: scale(1.08); opacity: 1; }
  }

  @keyframes clientArtifactsLoaderBar {
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

export default function ClientArtifactsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [loadingPrimary, setLoadingPrimary] = useState('#2386d2')
  const [loadingSecondary, setLoadingSecondary] = useState('#8E6CFF')
  const [client, setClient] = useState<Client | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [artifacts, setArtifacts] = useState<Artifact[]>([])
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

    const { data: artifactData } = await supabase
      .from('artifacts')
      .select('*')
      .eq('client_id', clientData.id)
      .order('creation_date', { ascending: false })

    setClient(clientData)
    setProjects(projectData || [])
    setArtifacts(artifactData || [])
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

  const approveArtifact = async (artifactId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase
      .from('artifacts')
      .update({
        approval_status: 'Approved',
        approved_at: new Date().toISOString(),
        approved_by: user?.id || null,
      })
      .eq('id', artifactId)

    if (error) {
      alert(error.message)
      return
    }

    await loadData()
    alert('Artifact approved successfully')
  }

  const getArtifactDownloadUrl = (artifact: Artifact) => {
    return `/api/download-artifact?id=${encodeURIComponent(artifact.id)}`
  }

  const formatDate = (date?: string | null) => date ? new Date(date).toLocaleDateString() : 'Not set'
  const pendingArtifacts = artifacts.filter(artifact => artifact.approval_status !== 'Approved').length
  const approvedArtifacts = artifacts.filter(artifact => artifact.approval_status === 'Approved').length

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
            <div style={{ position: 'absolute', inset: -8, borderRadius: 34, border: `3px solid ${primary}22`, borderTopColor: primary, animation: 'clientArtifactsLoaderSpin 1s linear infinite' }} />
            <div style={{ width: 22, height: 22, borderRadius: 999, background: isDark ? '#EAF2FF' : '#fff', animation: 'clientArtifactsLoaderPulse 1.2s ease-in-out infinite' }} />
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: isDark ? '#F8FAFC' : '#151236' }}>Loading artifacts...</div>
          <div style={{ marginTop: 8, color: isDark ? '#AAB3C5' : '#7b7894', fontSize: 14, fontWeight: 700 }}>Preparing your project files</div>
          <div style={{ marginTop: 22, height: 7, borderRadius: 999, background: isDark ? 'rgba(255,255,255,0.10)' : `${primary}18`, overflow: 'hidden' }}>
            <div style={{ width: '55%', height: '100%', borderRadius: 999, background: `linear-gradient(90deg, ${primary}, ${secondary})`, animation: 'clientArtifactsLoaderBar 1.25s ease-in-out infinite' }} />
          </div>
        </div>
      </main>
    )
  }

  if (!client) {
    return (
      <main className={`ca-root ${theme === 'dark' ? 'dark' : ''}`}>
        <style>{styles}</style>
        <div className="ca-shell">
          <div className="ca-panel">
            <div className="ca-empty">No client profile found.</div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className={`ca-root ${theme === 'dark' ? 'dark' : ''}`} style={{ '--client-primary': primary, '--client-secondary': secondary, '--client-primary-soft': `${primary}14`, '--client-primary-border': `${primary}2E` } as CSSProperties}>
      <style>{styles}</style>
      <div className="ca-shell">
        <div className="ca-top">
          <div>
            <h1 className="ca-title">Artifacts</h1>
            <div className="ca-subtitle">Download project files and approve them after review.</div>
          </div>
          <button className="ca-btn ca-btn-light" onClick={() => router.push('/client-dashboard')}>Back to dashboard</button>
        </div>

        <div className="ca-stats">
          <div className="ca-stat"><div className="ca-label">Artifacts</div><div className="ca-value">{artifacts.length}</div></div>
          <div className="ca-stat"><div className="ca-label">Pending Approval</div><div className="ca-value">{pendingArtifacts}</div></div>
          <div className="ca-stat"><div className="ca-label">Approved</div><div className="ca-value">{approvedArtifacts}</div></div>
        </div>

        <div className="ca-panel">
          <div className="ca-panel-head">
            <div className="ca-panel-title">Project Artifacts</div>
          </div>
          <div className="ca-list">
            {artifacts.length === 0 ? (
              <div className="ca-empty">No artifacts are available yet.</div>
            ) : artifacts.map(artifact => {
              const project = projects.find(item => item.id === artifact.project_id)
              const isApproved = artifact.approval_status === 'Approved'

              return (
                <div key={artifact.id} className="ca-card">
                  <div className="ca-file-icon" aria-hidden="true">
                    <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                      <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M14 2v5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      <path d="M9 13h6M9 17h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    </svg>
                  </div>
                  <div className="ca-card-main">
                    <div className="ca-name">{artifact.name}</div>
                    <div className="ca-meta">{project?.name || 'Project'} • Created {formatDate(artifact.creation_date)}</div>
                    {artifact.description && <div className="ca-description">{artifact.description}</div>}
                    {artifact.approved_at && <div className="ca-meta">Approved {formatDate(artifact.approved_at)}</div>}
                  </div>
                  <div className="ca-card-actions">
                    <span className="ca-pill">{artifact.approval_status}</span>
                    <div className="ca-actions">
                      <a
                        className="ca-btn ca-btn-light"
                        href={getArtifactDownloadUrl(artifact)}
                        download={artifact.file_name || undefined}
                      >
                        Download
                      </a>
                      {!isApproved && (
                        <button className="ca-btn ca-btn-primary" onClick={() => approveArtifact(artifact.id)}>
                          Approve
                        </button>
                      )}
                    </div>
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
