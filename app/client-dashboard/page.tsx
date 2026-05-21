'use client'

import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase/client'
import { useRouter } from 'next/navigation'

const PROJECT_VALUE_PAYMENT_TERM = '__PROJECT_VALUE__'

export default function ClientDashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [loadingPrimary, setLoadingPrimary] = useState('#2386d2')
  const [client, setClient] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [milestones, setMilestones] = useState<any[]>([])
  const [deliverables, setDeliverables] = useState<any[]>([])
  const [externalLinks, setExternalLinks] = useState<any[]>([])
  const [clientRequests, setClientRequests] = useState<any[]>([])
  const [payments, setPayments] = useState<any[]>([])
  const [supportContracts, setSupportContracts] = useState<any[]>([])
  const [artifacts, setArtifacts] = useState<any[]>([])
  const [clientTasks, setClientTasks] = useState<any[]>([])
  const [meetings, setMeetings] = useState<any[]>([])
  const [selectedProject, setSelectedProject] = useState<any | null>(null)
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('client-dashboard-theme')
    if (savedTheme === 'dark' || savedTheme === 'light') setTheme(savedTheme)

    const loadClientData = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/client-login'); return }
      const { data: clientData, error: clientError } = await supabase.from('clients').select('*').eq('user_id', user.id).single()
      if (clientError || !clientData) { setLoading(false); return }
      setLoadingPrimary(clientData.primary_color || '#2386d2')
      setClient(clientData)
      const { data: projectData } = await supabase.from('projects').select('*, clients(*)').eq('client_id', clientData.id)
      const projectIds = (projectData || []).map(p => p.id)
      const { data: milestoneData } = projectIds.length ? await supabase.from('milestones').select('*').in('project_id', projectIds) : { data: [] }
      const milestoneIds = (milestoneData || []).map(m => m.id)
      const { data: deliverableData } = milestoneIds.length ? await supabase.from('deliverables').select('*').in('milestone_id', milestoneIds) : { data: [] }
      const { data: externalLinksData } = projectIds.length ? await supabase.from('external_links').select('*').in('project_id', projectIds) : { data: [] }
      const { data: requestData } = await supabase.from('client_requests').select('*').eq('client_id', clientData.id)
      const { data: paymentData } = projectIds.length ? await supabase.from('payments').select('*').in('project_id', projectIds) : { data: [] }
      const { data: supportContractData } = await supabase.from('support_contracts').select('*').eq('client_id', clientData.id)
      const { data: artifactData } = await supabase.from('artifacts').select('*').eq('client_id', clientData.id)
      const { data: clientTaskData } = await supabase.from('client_tasks').select('*').eq('client_id', clientData.id)
      const { data: meetingData } = await supabase.from('meetings').select('*').eq('client_id', clientData.id)
      setProjects(projectData || [])
      setMilestones(milestoneData || [])
      setDeliverables(deliverableData || [])
      setExternalLinks(externalLinksData || [])
      setClientRequests(requestData || [])
      setPayments(paymentData || [])
      setSupportContracts(supportContractData || [])
      setArtifacts(artifactData || [])
      setClientTasks(clientTaskData || [])
      setMeetings(meetingData || [])
      setLoading(false)
    }
    loadClientData()
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === 'dark' ? 'light' : 'dark'
    setTheme(nextTheme)
    window.localStorage.setItem('client-dashboard-theme', nextTheme)
  }

  const primary = client?.primary_color || loadingPrimary
  const secondary = client?.secondary_color || '#8E6CFF'
  const loadingStyles = `
    @keyframes clientLoaderSpin {
      to { transform: rotate(360deg); }
    }
    @keyframes clientLoaderPulse {
      0%, 100% { transform: scale(0.92); opacity: 0.65; }
      50% { transform: scale(1.08); opacity: 1; }
    }
    @keyframes clientLoaderBar {
      0% { transform: translateX(-110%); }
      100% { transform: translateX(110%); }
    }
  `
  const isDark = theme === 'dark'
  const pageBackground = isDark
    ? 'linear-gradient(180deg, #0B1220 0%, #111827 100%)'
    : 'linear-gradient(180deg, #F7F8FB 0%, #EEF1F6 100%)'
  const surface = isDark ? 'rgba(17,24,39,0.94)' : 'rgba(255,255,255,0.94)'
  const cardSurface = isDark ? 'rgba(20,28,44,0.94)' : 'rgba(255,255,255,0.92)'
  const softSurface = isDark ? 'rgba(255,255,255,0.055)' : '#F8F8FA'
  const textColor = isDark ? '#F8FAFC' : '#151236'
  const headingColor = isDark ? '#F8FAFC' : '#12182B'
  const mutedColor = isDark ? '#AAB3C5' : '#8A86A4'
  const bodyMutedColor = isDark ? '#CBD5E1' : '#5F6378'
  const borderColor = isDark ? 'rgba(148,163,184,0.20)' : 'rgba(230,230,240,0.9)'
  const cardShadow = isDark ? '0 16px 44px rgba(0,0,0,0.26)' : '0 14px 38px rgba(21,18,54,0.06)'
  const hoverShadow = isDark ? '0 25px 60px rgba(0,0,0,0.34)' : '0 25px 60px rgba(80,65,180,0.18)'
  const trackColor = isDark ? 'rgba(255,255,255,0.10)' : '#F1F0F7'
  const loaderBackground = isDark
    ? `radial-gradient(circle at 24% 18%, ${primary}24, transparent 28%), radial-gradient(circle at 78% 10%, ${primary}18, transparent 30%), linear-gradient(180deg, #0B1220 0%, #111827 100%)`
    : `radial-gradient(circle at 24% 18%, ${primary}1F, transparent 28%), radial-gradient(circle at 78% 10%, ${primary}14, transparent 30%), linear-gradient(180deg, #F7F8FB 0%, #EEF1F6 100%)`
  const loaderPanel = isDark ? 'rgba(20,28,44,0.86)' : 'rgba(255,255,255,0.84)'
  const loaderBorder = isDark ? '1px solid rgba(148,163,184,0.22)' : '1px solid rgba(255,255,255,0.72)'
  const loaderMuted = isDark ? '#AAB3C5' : '#7b7894'
  const loaderTrack = isDark ? 'rgba(255,255,255,0.10)' : `${primary}18`
  const loaderDot = isDark ? '#EAF2FF' : '#fff'
  const loaderShadow = isDark ? '0 30px 80px rgba(0,0,0,0.34)' : `0 30px 80px ${primary}1F`

  const getNaturalOrderKey = (item: any) => {
    const createdTime = Date.parse(item.created_at || '')
    return Number.isNaN(createdTime) ? 0 : createdTime
  }
  const sortByNaturalOrder = (items: any[]) => [...items].sort((a, b) => {
    const createdDiff = getNaturalOrderKey(a) - getNaturalOrderKey(b)
    if (createdDiff !== 0) return createdDiff
    return String(a.title || a.name || a.id || '').localeCompare(String(b.title || b.name || b.id || ''))
  })

  const getProjectMilestones = (projectId: string) => sortByNaturalOrder(milestones.filter(m => m.project_id === projectId))
  const getProjectDeliverables = (projectId: string) => {
    return getProjectMilestones(projectId).flatMap(milestone =>
      sortByNaturalOrder(deliverables.filter(d => d.milestone_id === milestone.id))
    )
  }
  const getProjectProgress = (projectId: string) => {
    const list = getProjectDeliverables(projectId)
    const total = list.length
    const completed = list.filter(d => d.status === 'Completed').length
    return total > 0 ? Math.round((completed / total) * 100) : 0
  }

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: loaderBackground, fontFamily: 'Inter, Arial, sans-serif', position: 'relative', overflow: 'hidden', padding: 24 }}>
        <style>{loadingStyles}</style>
        <div style={{ width: 360, background: loaderPanel, backdropFilter: 'blur(18px)', padding: 34, borderRadius: 30, boxShadow: loaderShadow, textAlign: 'center', border: loaderBorder }}>
          <div style={{ width: 86, height: 86, borderRadius: 28, margin: '0 auto 22px', background: primary, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 18px 42px ${primary}33`, position: 'relative' }}>
            <div style={{ position: 'absolute', inset: -8, borderRadius: 34, border: `3px solid ${primary}22`, borderTopColor: primary, animation: 'clientLoaderSpin 1s linear infinite' }} />
            <div style={{ width: 22, height: 22, borderRadius: 999, background: loaderDot, animation: 'clientLoaderPulse 1.2s ease-in-out infinite' }} />
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: textColor }}>Loading workspace...</div>
          <div style={{ marginTop: 8, color: loaderMuted, fontSize: 14, fontWeight: 700 }}>Preparing your client dashboard</div>
          <div style={{ marginTop: 22, height: 7, borderRadius: 999, background: loaderTrack, overflow: 'hidden' }}>
            <div style={{ width: '55%', height: '100%', borderRadius: 999, background: primary, animation: 'clientLoaderBar 1.25s ease-in-out infinite' }} />
          </div>
        </div>
      </div>
    )
  }

  if (!client) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter, Arial, sans-serif', background: softSurface, padding: 24 }}>
        <div style={{ maxWidth: 460, background: '#fff', padding: 32, borderRadius: 24, textAlign: 'center', boxShadow: '0 20px 60px rgba(0,0,0,0.08)' }}>
          <h2 style={{ margin: 0, color: textColor }}>No client profile found</h2>
          <p style={{ color: '#7b7894' }}>This login is not linked to any client yet.</p>
          <button onClick={async () => { await supabase.auth.signOut(); router.push('/client-login') }} style={{ border: 'none', background: primary, color: '#fff', padding: '12px 18px', borderRadius: 14, fontWeight: 700, cursor: 'pointer' }}>Back to login</button>
        </div>
      </div>
    )
  }

  const activeProject = selectedProject
  const activeMilestones = activeProject ? getProjectMilestones(activeProject.id) : []
  const activeDeliverables = activeProject ? getProjectDeliverables(activeProject.id) : []
  const activeExternalLinks = activeProject ? externalLinks.filter(link => link.project_id === activeProject.id) : []
  const activeProgress = activeProject ? getProjectProgress(activeProject.id) : 0
  const displayedProject = activeProject || projects[0]
  const displayedProgress = displayedProject ? getProjectProgress(displayedProject.id) : 0
  const dashboardTitle = displayedProject ? `${displayedProject.name} Dashboard` : `${client.name} Dashboard`
  const displayedDeliverables = displayedProject ? getProjectDeliverables(displayedProject.id) : []
  const completedDeliverables = displayedDeliverables.filter(d => d.status === 'Completed').length
  const deliverableProgress = displayedDeliverables.length > 0 ? Math.round((completedDeliverables / displayedDeliverables.length) * 100) : 0
  const displayedMilestones = displayedProject ? getProjectMilestones(displayedProject.id) : []
  const orderedDeliverables = displayedMilestones.flatMap(milestone =>
    sortByNaturalOrder(deliverables.filter(deliverable => deliverable.milestone_id === milestone.id))
  )
  const currentDeliverableName = orderedDeliverables.find(d => d.status === 'Not started')?.title || 'No not-started deliverables'
  const completedMilestones = displayedMilestones.filter(milestone => {
    const milestoneDeliverables = deliverables.filter(deliverable => deliverable.milestone_id === milestone.id)
    return milestoneDeliverables.length > 0 && milestoneDeliverables.every(deliverable => deliverable.status === 'Completed')
  }).length
  const milestoneProgress = displayedMilestones.length > 0 ? Math.round((completedMilestones / displayedMilestones.length) * 100) : 0
  const displayedExternalLinks = displayedProject ? externalLinks.filter(link => link.project_id === displayedProject.id) : []
  const projectValue = displayedProject
    ? payments.find(payment => payment.project_id === displayedProject.id && payment.term === PROJECT_VALUE_PAYMENT_TERM)?.due_upon
    : ''
  const displayedPayments = displayedProject ? payments.filter(payment => payment.project_id === displayedProject.id && payment.term !== PROJECT_VALUE_PAYMENT_TERM) : []
  const paidPaymentTotal = displayedPayments.filter(payment => payment.is_paid).reduce((sum, payment) => sum + Number(payment.amount || 0), 0)
  const nextPayment = displayedPayments.find(payment => !payment.is_paid)
  const openTickets = clientRequests.filter(request => request.status === 'Open').length
  const closedTickets = clientRequests.filter(request => request.status === 'Closed').length
  const activeSupportContracts = supportContracts.filter(contract => contract.status === 'Active' && (contract.client_approval_status || 'Approved') === 'Approved')
  const activeSupportNames = activeSupportContracts.map(contract => contract.name).filter(Boolean)
  const pendingArtifacts = artifacts.filter(artifact => artifact.approval_status !== 'Approved').length
  const completedClientTasks = clientTasks.filter(task => task.status === 'Completed').length
  const getMilestoneDeliverables = (milestoneId: string) => sortByNaturalOrder(deliverables.filter(d => d.milestone_id === milestoneId))
  const getExternalUrl = (url?: string) => {
    if (!url) return '#'
    const normalizedUrl = url.startsWith('http://') || url.startsWith('https://') ? url : `https://${url}`

    try {
      const parsedUrl = new URL(normalizedUrl)
      const driveFileId = parsedUrl.hostname.includes('drive.google.com')
        ? parsedUrl.searchParams.get('id')
        : null

      if (driveFileId) {
        return `https://drive.google.com/file/d/${driveFileId}/view?usp=sharing`
      }
    } catch {
      return normalizedUrl
    }

    return normalizedUrl
  }
  const formatDate = (date?: string | null) => date ? new Date(date).toLocaleDateString() : 'Not set'
  const getStatusStyle = (status?: string) => {
    if (status === 'Completed') return { background: '#e8f5e9', color: '#2e7d32' }
    if (status === 'Delayed') return { background: '#fdecea', color: '#c0392b' }
    return { background: '#f3f3f3', color: '#5a5a5a' }
  }

  const cardStyle: any = { background: cardSurface, borderRadius: 22, padding: '18px 20px', width: '100%', minWidth: 0, height: 218, boxShadow: cardShadow, border: `1px solid ${borderColor}`, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', transition: 'all 0.25s ease', cursor: 'pointer' }
  const topButtonStyle: any = { border: isDark ? '1px solid rgba(255,255,255,0.14)' : '1px solid rgba(255,255,255,0.28)', borderRadius: 16, padding: '11px 16px', color: isDark ? '#ffffff' : headingColor, fontSize: 13, fontWeight: 900, cursor: 'pointer', background: isDark ? '#05070D' : '#ffffff', boxShadow: isDark ? '0 14px 30px rgba(0,0,0,0.32)' : '0 12px 28px rgba(21,18,54,0.14)', flexShrink: 0 }
  const labelStyle: any = { fontSize: 12, fontWeight: 900, color: mutedColor, letterSpacing: 0.7 }
  const subStyle: any = { color: mutedColor, fontSize: 13, fontWeight: 700 }
  const rowStyle: any = { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 18, alignItems: 'stretch', marginBottom: 22 }
  const sectionTitleStyle: any = { fontSize: 15, fontWeight: 900, color: textColor, marginBottom: 12, letterSpacing: 0.1 }

  return (
    <main style={{ minHeight: '100vh', background: pageBackground, fontFamily: 'Inter, Arial, sans-serif', color: textColor, display: 'flex', transition: 'background 0.25s ease, color 0.25s ease' }}>
      <div style={{ flex: 1, padding: '24px 28px 40px' }}>
        <section style={{ padding: 0, background: 'transparent', minHeight: '100vh', maxWidth: 1180, margin: '0 auto' }}>

          <div style={{ position: 'relative', minHeight: 116, background: surface, borderRadius: 24, overflow: 'hidden', marginBottom: 24, boxShadow: cardShadow, border: `1px solid ${borderColor}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '22px 28px', gap: 24, transition: 'background 0.25s ease, border-color 0.25s ease' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 24, minWidth: 0, position: 'relative', zIndex: 1 }}>
              {client.logo_url && (
                <div style={{ width: 72, height: 72, borderRadius: 20, background: isDark ? '#ffffff' : '#ffffff', border: `1px solid ${borderColor}`, boxShadow: '0 12px 30px rgba(21,18,54,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 10, flexShrink: 0 }}>
                  <img src={client.logo_url} alt={client.name} style={{ width: '100%', height: '100%', objectFit: 'contain', borderRadius: 14 }} />
                </div>
              )}
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 25, fontWeight: 900, color: headingColor, lineHeight: 1.12 }}>{dashboardTitle}</div>
                <div style={{ marginTop: 6, fontSize: 15, fontWeight: 700, color: mutedColor }}>Designed with Love for {client.name}</div>
              </div>
            </div>
            <div style={{ position: 'absolute', right: 18, top: 16, width: 318, height: 84, background: `linear-gradient(135deg, ${client.primary_color}, ${client.secondary_color})`, borderRadius: 28, transform: 'skewX(-12deg)', boxShadow: '0 18px 42px rgba(80,65,180,0.14)' }} />
            <div style={{ position: 'absolute', right: 42, top: -40, width: 156, height: 156, borderRadius: 999, background: 'rgba(255,255,255,0.15)' }} />
            <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
              <button onClick={toggleTheme} style={topButtonStyle}>
                {isDark ? 'Light' : 'Dark'}
              </button>
              <button onClick={() => window.location.reload()} style={{ ...topButtonStyle, padding: '11px 18px' }}>Refresh</button>
              <button onClick={async () => { await supabase.auth.signOut(); router.push('/client-login') }} style={{ ...topButtonStyle, padding: '11px 18px' }}>Sign out</button>
            </div>
          </div>

          {!activeProject && (
            <>
              <div style={sectionTitleStyle}>Your Projects</div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 18, alignItems: 'stretch', marginBottom: 26 }}>
                {projects.map(project => {
                  return (
                    <div key={project.id} onClick={() => setSelectedProject(project)}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = '0 22px 54px rgba(80,65,180,0.15)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0px)'; e.currentTarget.style.boxShadow = '0 10px 34px rgba(80,65,180,0.07)' }}
                      style={{ background: `linear-gradient(135deg, rgba(255,255,255,0.98), ${client.primary_color}0D)`, width: '100%', height: 186, borderRadius: 22, padding: 20, cursor: 'pointer', border: '1px solid rgba(230,230,240,0.9)', boxShadow: '0 12px 34px rgba(80,65,180,0.07)', transition: 'all 0.25s ease', position: 'relative', overflow: 'hidden', display: 'flex', alignItems: 'center', gap: 16 }}>
                      <div style={{ position: 'absolute', right: -34, top: -38, width: 118, height: 118, borderRadius: 999, background: `${client.primary_color}12` }} />
                      <div style={{ width: 58, height: 58, borderRadius: 18, background: '#ffffff', boxShadow: '0 12px 30px rgba(80,65,180,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, position: 'relative', zIndex: 1 }}>
                        <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                          <rect x="3" y="4" width="18" height="16" rx="3" stroke={client.primary_color} strokeWidth="2.2" />
                          <path d="M8 8v8M16 8v8" stroke={client.primary_color} strokeWidth="2.2" strokeLinecap="round" />
                          <path d="M6.5 9.5h3M14.5 9.5h3M6.5 13h3M14.5 13h3" stroke={client.primary_color} strokeWidth="1.8" strokeLinecap="round" />
                        </svg>
                      </div>
                      <div style={{ minWidth: 0, position: 'relative', zIndex: 1 }}>
                        <div style={{ fontSize: 18, fontWeight: 900, color: textColor, lineHeight: 1.2 }}>{project.name}</div>
                        <div style={{ marginTop: 8, width: 42, height: 4, borderRadius: 999, background: client.primary_color }} />
                        </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}

          <div style={sectionTitleStyle}>Your Main Cards</div>

          {/* Row 1 */}
          <div style={rowStyle}>
            <div style={{ background: `linear-gradient(135deg, ${client.primary_color}, ${client.secondary_color})`, borderRadius: 22, padding: '18px 20px', minWidth: 0, height: 218, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', color: '#fff', position: 'relative', overflow: 'hidden', boxShadow: '0 22px 48px rgba(80,65,180,0.18)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z" stroke="white" strokeWidth="1.5" fill="none"/>
                  <path d="M6 12 A6 6 0 0 1 18 12" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none"/>
                  <line x1="12" y1="12" x2="16" y2="8" stroke="white" strokeWidth="2" strokeLinecap="round"/>
                  <circle cx="12" cy="12" r="1.5" fill="white"/>
                </svg>
                <div style={{ fontSize: 13, fontWeight: 800, letterSpacing: 0.4 }}>PROJECT PROGRESS</div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <svg viewBox="0 20 200 110" width="240" height="120">
                  <defs>
                    <linearGradient id="speedGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#00e676"/>
                      <stop offset="50%" stopColor="#ffeb3b"/>
                      <stop offset="100%" stopColor="#ffffff"/>
                    </linearGradient>
                  </defs>
                  <path d="M15,105 A90,90 0 0,1 185,105" fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="16" strokeLinecap="round"/>
                  <path d="M15,105 A90,90 0 0,1 185,105" fill="none" stroke="url(#speedGrad)" strokeWidth="16" strokeLinecap="round" strokeDasharray={`${displayedProgress * 2.67} 267`}/>
                  <text x="100" y="98" textAnchor="middle" fill="#fff" fontSize="22" fontWeight="900">{displayedProgress}%</text>
                </svg>
              </div>
            </div>
            <div style={cardStyle} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = hoverShadow }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0px)'; e.currentTarget.style.boxShadow = 'none' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 22 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 12, background: `${client.primary_color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="21" height="21" viewBox="0 0 24 24" fill="none"><path d="M5 3v18" stroke={client.primary_color} strokeWidth="2.4" strokeLinecap="round"/><path d="M5 4h13l-3 5 3 5H5" stroke={client.primary_color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <div style={labelStyle}>MILESTONES</div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 900, color: client.primary_color, background: `${client.primary_color}14`, borderRadius: 999, padding: '6px 9px' }}>{milestoneProgress}%</div>
                </div>
                <div style={{ fontSize: 34, fontWeight: 900, color: textColor, lineHeight: 1 }}>{completedMilestones}<span style={{ color: mutedColor, fontSize: 22 }}> / {displayedMilestones.length}</span></div>
                <div style={{ marginTop: 18, height: 8, borderRadius: 999, background: trackColor, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${milestoneProgress}%`, borderRadius: 999, background: client.primary_color }} />
                </div>
              </div>
              <div style={subStyle}>{milestoneProgress}% complete</div>
            </div>
            <div style={cardStyle} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = hoverShadow }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0px)'; e.currentTarget.style.boxShadow = 'none' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 22 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 12, background: `${client.primary_color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="21" height="21" viewBox="0 0 24 24" fill="none"><path d="M9 11l3 3L20 4" stroke={client.primary_color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M20 12v6a2 2 0 01-2 2H6a2 2 0 01-2-2V6a2 2 0 012-2h9" stroke={client.primary_color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    </div>
                    <div style={labelStyle}>DELIVERABLES</div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 900, color: client.primary_color, background: `${client.primary_color}14`, borderRadius: 999, padding: '6px 9px' }}>{deliverableProgress}%</div>
                </div>
                <div style={{ fontSize: 34, fontWeight: 900, color: textColor, lineHeight: 1 }}>{completedDeliverables}<span style={{ color: mutedColor, fontSize: 22 }}> / {displayedDeliverables.length}</span></div>
                <div style={{ marginTop: 18, height: 8, borderRadius: 999, background: trackColor, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${deliverableProgress}%`, borderRadius: 999, background: client.primary_color }} />
                </div>
              </div>
              <div style={subStyle}>{deliverableProgress}% complete</div>
            </div>
            <div style={cardStyle} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = hoverShadow }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0px)'; e.currentTarget.style.boxShadow = 'none' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 12, background: `${client.primary_color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="21" height="21" viewBox="0 0 24 24" fill="none"><path d="M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z" stroke={client.primary_color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M13 2v7h7" stroke={client.primary_color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div style={labelStyle}>CURRENT DELIVERABLE</div>
                </div>
                <div style={{ fontSize: 15, fontWeight: 700, color: bodyMutedColor, lineHeight: 1.35, overflowWrap: 'anywhere' }}>{currentDeliverableName}</div>
              </div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, color: client.primary_color, fontSize: 13, fontWeight: 900 }}>
                <span style={{ width: 8, height: 8, borderRadius: 999, background: client.primary_color }} />
                Next up
              </div>
            </div>
          </div>

          {/* Row 2 */}
          <div style={rowStyle}>
            <div style={cardStyle} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = hoverShadow }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0px)'; e.currentTarget.style.boxShadow = 'none' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 18 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 12, background: `${client.primary_color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <svg width="21" height="21" viewBox="0 0 24 24" fill="none"><rect x="2.5" y="5" width="19" height="14" rx="3" stroke={client.primary_color} strokeWidth="2.4"/><path d="M3 10h18" stroke={client.primary_color} strokeWidth="2.4" strokeLinecap="round"/></svg>
                    </div>
                    <div style={labelStyle}>PAYMENTS</div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 900, color: client.primary_color, background: `${client.primary_color}14`, borderRadius: 999, padding: '6px 9px' }}>{displayedPayments.length}</div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ fontSize: 22, fontWeight: 900, color: client.primary_color, lineHeight: 1 }}>{paidPaymentTotal}% paid</div>
                    {nextPayment ? (
                      <div style={{ marginTop: 8, color: '#7C7892', fontSize: 11.5, fontWeight: 700, lineHeight: 1.32, overflowWrap: 'anywhere' }}>
                        <div><span style={{ color: client.primary_color, fontWeight: 900 }}>Next payment</span> {Number(nextPayment.amount || 0)}%</div>
                        <div><span style={{ color: client.primary_color, fontWeight: 900 }}>Upon due:</span> {nextPayment.due_upon || nextPayment.term || 'Not set'}</div>
                      </div>
                    ) : (
                      <div style={{ marginTop: 8, color: '#7C7892', fontSize: 11.5, fontWeight: 700, lineHeight: 1.32 }}>No pending payments</div>
                    )}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0, maxWidth: 112 }}>
                    <div style={{ fontSize: 10.5, fontWeight: 900, color: mutedColor, letterSpacing: 0.4, marginBottom: 5 }}>PROJECT VALUE</div>
                    <div style={{ fontSize: 18, fontWeight: 900, color: textColor, lineHeight: 1.15 }}>{projectValue || 'Not set'}</div>
                  </div>
                </div>
                <div style={{ marginTop: 16, height: 8, borderRadius: 999, background: trackColor, overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${Math.min(paidPaymentTotal, 100)}%`, borderRadius: 999, background: client.primary_color }} />
                </div>
              </div>
              <div style={{ ...subStyle, fontSize: 12 }}>Payment progress</div>
            </div>
            <div onClick={() => router.push('/client-tasks')} style={cardStyle} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = hoverShadow }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0px)'; e.currentTarget.style.boxShadow = 'none' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 12, background: `${client.primary_color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="21" height="21" viewBox="0 0 24 24" fill="none"><path d="M9 11l2 2 4-5" stroke={client.primary_color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/><rect x="3" y="4" width="18" height="16" rx="4" stroke={client.primary_color} strokeWidth="2.4"/></svg>
                  </div>
                  <div style={labelStyle}>CLIENT&apos;S TASKS</div>
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, color: textColor, lineHeight: 1 }}>{clientTasks.length}</div>
                <div style={{ marginTop: 9, color: bodyMutedColor, fontSize: 13, fontWeight: 800, lineHeight: 1.35 }}>
                  {completedClientTasks} completed / {clientTasks.length} assigned
                </div>
              </div>
              <div style={subStyle}>{clientTasks.length > 0 ? 'View assigned tasks' : 'No assigned tasks'}</div>
            </div>
            <div onClick={() => router.push('/client-meetings')} style={cardStyle} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = hoverShadow }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0px)'; e.currentTarget.style.boxShadow = 'none' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 12, background: `${client.primary_color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="21" height="21" viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="17" rx="3" stroke={client.primary_color} strokeWidth="2.4"/><path d="M8 2v4M16 2v4M3 10h18M8 15h4M8 18h8" stroke={client.primary_color} strokeWidth="2.4" strokeLinecap="round"/></svg>
                  </div>
                  <div style={labelStyle}>MEETINGS</div>
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, color: textColor, lineHeight: 1 }}>{meetings.length}</div>
                <div style={{ marginTop: 9, color: bodyMutedColor, fontSize: 13, fontWeight: 800, lineHeight: 1.35 }}>
                  {meetings.length > 0 ? 'View MOMs and meeting logs' : 'No meetings logged'}
                </div>
              </div>
              <div style={subStyle}>Meeting minutes</div>
            </div>
            <div onClick={() => router.push('/client-requests')} style={cardStyle} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = hoverShadow }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0px)'; e.currentTarget.style.boxShadow = 'none' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 12, background: `${client.primary_color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="21" height="21" viewBox="0 0 24 24" fill="none"><path d="M15 5H7a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2V9l-4-4z" stroke={client.primary_color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M15 5v4h4" stroke={client.primary_color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div style={labelStyle}>CHATS</div>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <div style={{ background: softSurface, borderRadius: 14, padding: 12 }}>
                    <div style={{ color: mutedColor, fontSize: 12, fontWeight: 800 }}>Open chats</div>
                    <div style={{ color: textColor, fontSize: 23, fontWeight: 900 }}>{openTickets}</div>
                  </div>
                  <div style={{ background: softSurface, borderRadius: 14, padding: 12 }}>
                    <div style={{ color: mutedColor, fontSize: 12, fontWeight: 800 }}>Closed chats</div>
                    <div style={{ color: textColor, fontSize: 23, fontWeight: 900 }}>{closedTickets}</div>
                  </div>
                </div>
              </div>
              <div style={subStyle}>Client chat breakdown</div>
            </div>
            <div onClick={() => router.push('/client-support')} style={cardStyle} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = hoverShadow }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0px)'; e.currentTarget.style.boxShadow = 'none' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 12, background: `${client.primary_color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="21" height="21" viewBox="0 0 24 24" fill="none"><path d="M21 15a2 2 0 01-2 2H8l-5 4V5a2 2 0 012-2h14a2 2 0 012 2z" stroke={client.primary_color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/></svg>
                  </div>
                  <div style={labelStyle}>SUPPORT</div>
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, color: textColor, lineHeight: 1 }}>{activeSupportContracts.length}</div>
                <div style={{ marginTop: 9, fontSize: 13, fontWeight: 800, color: bodyMutedColor, lineHeight: 1.35, overflowWrap: 'anywhere' }}>
                  {activeSupportNames.length > 0 ? activeSupportNames.join(', ') : 'No active contract'}
                </div>
              </div>
              <div style={{ color: client.primary_color, fontSize: 13, fontWeight: 900 }}>{activeSupportContracts.length > 0 ? 'View support' : 'No active contract'}</div>
            </div>
            <div onClick={() => router.push('/client-artifacts')} style={cardStyle} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-6px)'; e.currentTarget.style.boxShadow = hoverShadow }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0px)'; e.currentTarget.style.boxShadow = 'none' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 22 }}>
                  <div style={{ width: 38, height: 38, borderRadius: 12, background: `${client.primary_color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="21" height="21" viewBox="0 0 24 24" fill="none"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" stroke={client.primary_color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M14 2v6h6" stroke={client.primary_color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"/><path d="M8 13h8M8 17h5" stroke={client.primary_color} strokeWidth="2.4" strokeLinecap="round"/></svg>
                  </div>
                  <div style={labelStyle}>ARTIFACTS</div>
                </div>
                <div style={{ fontSize: 28, fontWeight: 900, color: textColor, lineHeight: 1 }}>{artifacts.length}</div>
                <div style={{ marginTop: 9, fontSize: 13, fontWeight: 800, color: bodyMutedColor, lineHeight: 1.35 }}>
                  {pendingArtifacts > 0 ? `${pendingArtifacts} pending approval` : 'All artifacts reviewed'}
                </div>
              </div>
              <div style={{ color: client.primary_color, fontSize: 13, fontWeight: 900 }}>View artifacts</div>
            </div>
          </div>

          <div style={sectionTitleStyle}>External Links</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 18, alignItems: 'stretch', marginBottom: 26 }}>
            {displayedExternalLinks.length > 0 ? displayedExternalLinks.map(link => (
              <a key={link.id} href={getExternalUrl(link.url)} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-5px)'; e.currentTarget.style.boxShadow = hoverShadow }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0px)'; e.currentTarget.style.boxShadow = cardShadow }} style={{ minHeight: 154, background: cardSurface, borderRadius: 22, border: `1px solid ${borderColor}`, boxShadow: cardShadow, textDecoration: 'none', color: textColor, display: 'flex', flexDirection: 'column', justifyContent: 'space-between', padding: 18, cursor: 'pointer', transition: 'all 0.25s ease' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                  {link.icon_url ? (
                    <img src={link.icon_url} alt={link.title} style={{ width: 48, height: 48, borderRadius: 14, objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{ width: 48, height: 48, borderRadius: 14, background: `${client.primary_color}14`, color: client.primary_color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900, flexShrink: 0 }}>
                      {link.title?.slice(0, 1)?.toUpperCase() || 'L'}
                    </div>
                  )}
                  <div style={{ fontSize: 17, fontWeight: 900, lineHeight: 1.25, minWidth: 0 }}>{link.title}</div>
                </div>
                <div style={{ color: client.primary_color, fontSize: 13, fontWeight: 900 }}>Open link</div>
              </a>
            )) : [0, 1, 2, 3].map(item => (
              <div key={item} style={{ minHeight: 154, background: cardSurface, borderRadius: 22, border: `1px solid ${borderColor}`, boxShadow: cardShadow }} />
            ))}
          </div>

          <div style={sectionTitleStyle}>Milestones and Deliverables</div>
          <div style={{ background: surface, borderRadius: 24, padding: 22, marginBottom: 28, border: `1px solid ${borderColor}`, boxShadow: cardShadow }}>
            {displayedMilestones.length === 0 ? (
              <div style={{ color: mutedColor, fontSize: 14, fontWeight: 700 }}>No milestones have been added yet.</div>
            ) : (
              <div style={{ display: 'grid', gap: 18 }}>
                {displayedMilestones.map(milestone => {
                  const milestoneDeliverables = getMilestoneDeliverables(milestone.id)
                  return (
                    <div key={milestone.id} style={{ border: `1px solid ${borderColor}`, borderRadius: 20, padding: 18, background: softSurface }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, marginBottom: 14 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 11, background: `${client.primary_color}14`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                            <svg width="19" height="19" viewBox="0 0 24 24" fill="none">
                              <path d="M5 3v18" stroke={client.primary_color} strokeWidth="2.4" strokeLinecap="round" />
                              <path d="M5 4h13l-3 5 3 5H5" stroke={client.primary_color} strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          </div>
                          <div>
                            <div style={{ fontSize: 17, fontWeight: 900, color: textColor }}>{milestone.title}</div>
                            <div style={{ marginTop: 4, color: mutedColor, fontSize: 13, fontWeight: 700 }}>{milestoneDeliverables.length} deliverable(s)</div>
                          </div>
                        </div>
                      </div>
                      {milestoneDeliverables.length === 0 ? (
                        <div style={{ color: mutedColor, fontSize: 14 }}>No deliverables added yet.</div>
                      ) : (
                        <div style={{ display: 'grid', gap: 10 }}>
                          {milestoneDeliverables.map(deliverable => {
                            const statusStyle = getStatusStyle(deliverable.status)
                            return (
                              <div key={deliverable.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 1.4fr) minmax(110px, 0.7fr) minmax(110px, 0.7fr) auto', gap: 12, alignItems: 'center', background: cardSurface, borderRadius: 16, padding: '13px 14px', border: `1px solid ${borderColor}` }}>
                                <div style={{ minWidth: 0 }}>
                                  <div style={{ fontSize: 14, fontWeight: 900, color: textColor }}>{deliverable.title}</div>
                                </div>
                                <div style={{ color: mutedColor, fontSize: 13, fontWeight: 700 }}>Start: {formatDate(deliverable.start_date)}</div>
                                <div style={{ color: mutedColor, fontSize: 13, fontWeight: 700 }}>End: {formatDate(deliverable.end_date)}</div>
                                <div style={{ justifySelf: 'end', borderRadius: 999, padding: '7px 10px', fontSize: 12, fontWeight: 900, whiteSpace: 'nowrap', ...statusStyle }}>{deliverable.status || 'Not started'}</div>
                              </div>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </div>

          {activeProject && (
            <>
              <button onClick={() => setSelectedProject(null)} style={{ border: `1px solid ${borderColor}`, background: cardSurface, padding: '11px 16px', borderRadius: 14, cursor: 'pointer', fontWeight: 800, color: primary, marginBottom: 20, marginTop: 24, boxShadow: cardShadow }}>← Back to projects</button>
              <div style={{ background: surface, borderRadius: 26, padding: 26, marginBottom: 24, border: `1px solid ${borderColor}`, boxShadow: cardShadow }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <div>
                    <div style={{ fontSize: 28, fontWeight: 900, color: textColor }}>{activeProject.name}</div>
                    <div style={{ color: mutedColor, marginTop: 6 }}>{activeMilestones.length} milestone(s) • {activeDeliverables.length} deliverable(s)</div>
                  </div>
                  <div style={{ width: 90, height: 90, borderRadius: '50%', background: `conic-gradient(${primary} ${activeProgress * 3.6}deg, ${trackColor} 0deg)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div style={{ width: 68, height: 68, borderRadius: '50%', background: cardSurface, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 900, color: textColor, fontSize: 20 }}>{activeProgress}%</div>
                  </div>
                </div>
              </div>
              {activeExternalLinks.length > 0 && (
                <div style={{ background: surface, borderRadius: 26, padding: 26, marginBottom: 24, border: `1px solid ${borderColor}`, boxShadow: cardShadow }}>
                  <div style={{ fontSize: 20, fontWeight: 900, marginBottom: 18, color: textColor }}>External Links</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
                    {activeExternalLinks.map(link => (
                      <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: textColor, background: softSurface, borderRadius: 20, padding: 18, border: `1px solid ${borderColor}`, fontWeight: 800 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          {link.icon_url && <img src={link.icon_url} alt={link.title} style={{ width: 42, height: 42, borderRadius: 12, objectFit: 'cover' }} />}
                          <span>{link.title}</span>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </>
          )}

        </section>
      </div>
    </main>
  )
}
