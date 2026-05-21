'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase/client'

const styles = `
  .cr-root {
    min-height: 100vh;
    background: linear-gradient(180deg, #F7F8FB 0%, #EEF1F6 100%);
    font-family: Inter, Arial, sans-serif;
    color: #151236;
    padding: 24px 28px 40px;
  }

  .cr-shell { max-width: 1180px; margin: 0 auto; }
  .cr-top { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 18px; }
  .cr-title { font-size: 26px; font-weight: 900; color: #12182B; margin: 0; }
  .cr-subtitle { margin-top: 6px; color: #727789; font-size: 14px; font-weight: 700; }
  .cr-btn { border: none; border-radius: 14px; padding: 11px 16px; font-size: 13px; font-weight: 900; cursor: pointer; transition: 0.2s ease; }
  .cr-btn:hover { transform: translateY(-1px); }
  .cr-btn-primary { color: #fff; background: var(--client-primary); box-shadow: 0 12px 28px rgba(80,65,180,0.16); }
  .cr-btn-light { color: #151236; background: #fff; border: 1px solid rgba(230,230,240,0.95); box-shadow: 0 10px 24px rgba(21,18,54,0.06); }
  .cr-toolbar { display: flex; align-items: center; gap: 10px; flex-wrap: wrap; margin-bottom: 18px; }
  .cr-tab { border: 1px solid rgba(230,230,240,0.95); border-radius: 999px; padding: 9px 14px; background: #fff; color: #727789; font-weight: 900; cursor: pointer; }
  .cr-tab.active { color: #fff; background: var(--client-primary); border-color: var(--client-primary); }
  .cr-grid { display: grid; grid-template-columns: minmax(280px, 0.92fr) minmax(360px, 1.45fr); gap: 18px; align-items: start; }
  .cr-panel { background: rgba(255,255,255,0.94); border-radius: 24px; border: 1px solid rgba(230,230,240,0.9); box-shadow: 0 14px 38px rgba(80,65,180,0.06); overflow: hidden; }
  .cr-panel-head { padding: 18px 20px; border-bottom: 1px solid #f0eff6; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .cr-panel-title { font-size: 15px; font-weight: 900; }
  .cr-list { padding: 14px; display: grid; gap: 10px; max-height: 650px; overflow: auto; }
  .cr-ticket { width: 100%; text-align: left; border: 1px solid #eeedf6; background: #fff; border-radius: 18px; padding: 14px; cursor: pointer; transition: 0.2s ease; }
  .cr-ticket:hover, .cr-ticket.active { border-color: var(--client-primary); box-shadow: 0 14px 30px rgba(80,65,180,0.09); transform: translateY(-1px); }
  .cr-ticket-title { font-size: 14px; font-weight: 900; color: #151236; line-height: 1.25; }
  .cr-ticket-meta { margin-top: 7px; color: #8A86A4; font-size: 12px; font-weight: 700; }
  .cr-status { display: inline-flex; border-radius: 999px; padding: 5px 9px; font-size: 11px; font-weight: 900; margin-top: 10px; }
  .cr-status.open { color: #0f766e; background: #e7f7f4; }
  .cr-status.closed { color: #7f1d1d; background: #fff1f2; }
  .cr-empty { padding: 34px 20px; color: #8A86A4; font-weight: 700; text-align: center; }
  .cr-chat { min-height: 650px; display: flex; flex-direction: column; }
  .cr-chat-body { padding: 18px; display: flex; flex-direction: column; gap: 10px; flex: 1; overflow: auto; background: linear-gradient(180deg, #fbfbfd 0%, #f5f6fb 100%); }
  .cr-description { background: #fff; border: 1px solid #eeedf6; border-radius: 16px; padding: 13px 14px; color: #5d6072; font-size: 13px; font-weight: 700; line-height: 1.45; margin-bottom: 8px; }
  .cr-bubble { max-width: 78%; border-radius: 18px; padding: 11px 13px; font-size: 13px; font-weight: 700; line-height: 1.45; white-space: pre-wrap; }
  .cr-bubble.admin { align-self: flex-start; background: #fff; color: #151236; border: 1px solid #eeedf6; border-top-left-radius: 6px; }
  .cr-bubble.client { align-self: flex-end; background: var(--client-primary); color: #fff; border-top-right-radius: 6px; }
  .cr-chat-foot { padding: 14px; border-top: 1px solid #eeedf6; background: #fff; display: flex; gap: 10px; }
  .cr-input, .cr-select, .cr-textarea { width: 100%; border: 1px solid #e6e2f5; border-radius: 14px; padding: 12px 13px; font: inherit; font-size: 13px; font-weight: 700; outline: none; background: #fff; color: #151236; }
  .cr-textarea { resize: vertical; min-height: 92px; }
  .cr-form { padding: 18px; display: grid; gap: 12px; border-top: 1px solid #f0eff6; background: #fbfbfd; }
  .cr-label { font-size: 11px; font-weight: 900; color: #8A86A4; letter-spacing: 0.08em; text-transform: uppercase; margin-bottom: 6px; display: block; }
  .cr-root.dark { background: linear-gradient(180deg, #0B1220 0%, #111827 100%); color: #F8FAFC; }
  .cr-root.dark .cr-title,
  .cr-root.dark .cr-panel-title,
  .cr-root.dark .cr-ticket-title,
  .cr-root.dark .cr-bubble.admin,
  .cr-root.dark .cr-input,
  .cr-root.dark .cr-select,
  .cr-root.dark .cr-textarea { color: #F8FAFC; }
  .cr-root.dark .cr-subtitle,
  .cr-root.dark .cr-ticket-meta,
  .cr-root.dark .cr-empty,
  .cr-root.dark .cr-label { color: #AAB3C5; }
  .cr-root.dark .cr-panel,
  .cr-root.dark .cr-ticket,
  .cr-root.dark .cr-tab,
  .cr-root.dark .cr-btn-light,
  .cr-root.dark .cr-description,
  .cr-root.dark .cr-bubble.admin,
  .cr-root.dark .cr-chat-foot,
  .cr-root.dark .cr-input,
  .cr-root.dark .cr-select,
  .cr-root.dark .cr-textarea,
  .cr-root.dark .cr-form { background: rgba(20,28,44,0.94); border-color: rgba(148,163,184,0.20); box-shadow: 0 16px 44px rgba(0,0,0,0.26); }
  .cr-root.dark .cr-panel-head,
  .cr-root.dark .cr-chat-foot,
  .cr-root.dark .cr-form { border-color: rgba(148,163,184,0.20); }
  .cr-root.dark .cr-chat-body { background: rgba(255,255,255,0.035); }
  .cr-root.dark .cr-description { color: #CBD5E1; }
  .cr-root.dark .cr-btn-light,
  .cr-root.dark .cr-tab { color: #F8FAFC; }
  .cr-root.dark .cr-tab.active { color: #fff; background: var(--client-primary); border-color: var(--client-primary); }

  @media (max-width: 860px) {
    .cr-root { padding: 18px; }
    .cr-top { align-items: flex-start; flex-direction: column; }
    .cr-grid { grid-template-columns: 1fr; }
    .cr-chat { min-height: 520px; }
  }
`

const loadingStyles = `
  @keyframes clientRequestsLoaderSpin {
    to { transform: rotate(360deg); }
  }

  @keyframes clientRequestsLoaderPulse {
    0%, 100% { transform: scale(0.92); opacity: 0.65; }
    50% { transform: scale(1.08); opacity: 1; }
  }

  @keyframes clientRequestsLoaderBar {
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

type ClientRequest = {
  id: string
  client_id: string
  project_id: string
  subject: string
  description?: string | null
  status: 'Open' | 'Closed'
  created_at?: string
}

type RequestMessage = {
  id: string
  request_id: string
  sender: 'admin' | 'client' | string
  message: string
  created_at?: string
}

export default function ClientRequestsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [loadingPrimary, setLoadingPrimary] = useState('#2386d2')
  const [client, setClient] = useState<Client | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [requests, setRequests] = useState<ClientRequest[]>([])
  const [messages, setMessages] = useState<RequestMessage[]>([])
  const [selectedRequest, setSelectedRequest] = useState<ClientRequest | null>(null)
  const [filter, setFilter] = useState<'Open' | 'Closed'>('Open')
  const [showNewTicket, setShowNewTicket] = useState(false)
  const [newProjectId, setNewProjectId] = useState('')
  const [newSubject, setNewSubject] = useState('')
  const [newDescription, setNewDescription] = useState('')
  const [replyMessage, setReplyMessage] = useState('')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  const primary = client?.primary_color || loadingPrimary
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

    const { data: projectData } = await supabase
      .from('projects')
      .select('*')
      .eq('client_id', clientData.id)

    const { data: requestData } = await supabase
      .from('client_requests')
      .select('*')
      .eq('client_id', clientData.id)

    const requestIds = (requestData || []).map(request => request.id)
    const { data: messageData } = requestIds.length
      ? await supabase.from('client_request_messages').select('*').in('request_id', requestIds)
      : { data: [] }

    setClient(clientData)
    setProjects(projectData || [])
    setRequests(requestData || [])
    setMessages(messageData || [])
    setSelectedRequest(current => current ? (requestData || []).find(request => request.id === current.id) || null : current)
    setLoading(false)
  }

  useEffect(() => {
    const savedTheme = window.localStorage.getItem('client-dashboard-theme')
    if (savedTheme === 'dark' || savedTheme === 'light') setTheme(savedTheme)

    const timeoutId = window.setTimeout(() => {
      loadData()
    }, 0)

    return () => window.clearTimeout(timeoutId)
  }, [])

  const sortedRequests = [...requests]
    .filter(request => request.status === filter)
    .sort((a, b) => Date.parse(b.created_at || '') - Date.parse(a.created_at || ''))

  const selectedMessages = [...messages]
    .filter(message => message.request_id === selectedRequest?.id)
    .sort((a, b) => Date.parse(a.created_at || '') - Date.parse(b.created_at || ''))

  const createTicket = async () => {
    if (!client) return
    if (!newProjectId) return alert('Please select a project')
    if (!newSubject.trim()) return alert('Please add a subject')

    const { error } = await supabase.from('client_requests').insert([{
      client_id: client.id,
      project_id: newProjectId,
      subject: newSubject,
      description: newDescription,
      status: 'Open',
      created_by: 'client',
    }])

    if (error) {
      alert(error.message)
      return
    }

    setNewProjectId('')
    setNewSubject('')
    setNewDescription('')
    setShowNewTicket(false)
    setFilter('Open')
    await loadData()
    alert('Ticket created successfully')
  }

  const sendReply = async () => {
    if (!selectedRequest) return
    if (!replyMessage.trim()) return

    const { error } = await supabase.from('client_request_messages').insert([{
      request_id: selectedRequest.id,
      sender: 'client',
      message: replyMessage,
    }])

    if (error) {
      alert(error.message)
      return
    }

    setReplyMessage('')
    await loadData()
  }

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
            <div style={{ position: 'absolute', inset: -8, borderRadius: 34, border: `3px solid ${primary}22`, borderTopColor: primary, animation: 'clientRequestsLoaderSpin 1s linear infinite' }} />
            <div style={{ width: 22, height: 22, borderRadius: 999, background: isDark ? '#EAF2FF' : '#fff', animation: 'clientRequestsLoaderPulse 1.2s ease-in-out infinite' }} />
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: isDark ? '#F8FAFC' : '#151236' }}>Loading chats...</div>
          <div style={{ marginTop: 8, color: isDark ? '#AAB3C5' : '#7b7894', fontSize: 14, fontWeight: 700 }}>Preparing your ticket center</div>
          <div style={{ marginTop: 22, height: 7, borderRadius: 999, background: isDark ? 'rgba(255,255,255,0.10)' : `${primary}18`, overflow: 'hidden' }}>
            <div style={{ width: '55%', height: '100%', borderRadius: 999, background: primary, animation: 'clientRequestsLoaderBar 1.25s ease-in-out infinite' }} />
          </div>
        </div>
      </main>
    )
  }

  if (!client) {
    return (
      <main className={`cr-root ${theme === 'dark' ? 'dark' : ''}`}>
        <style>{styles}</style>
        <div className="cr-shell">
          <div className="cr-panel">
            <div className="cr-empty">No client profile found.</div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className={`cr-root ${theme === 'dark' ? 'dark' : ''}`} style={{ '--client-primary': primary } as CSSProperties}>
      <style>{styles}</style>
      <div className="cr-shell">
        <div className="cr-top">
          <div>
            <h1 className="cr-title">Chats</h1>
            <div className="cr-subtitle">Continue your chats with the admin team.</div>
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <button className="cr-btn cr-btn-light" onClick={() => router.push('/client-dashboard')}>Back to dashboard</button>
            <button className="cr-btn cr-btn-primary" onClick={() => setShowNewTicket(prev => !prev)}>New chat</button>
          </div>
        </div>

        <div className="cr-toolbar">
          <button className={`cr-tab ${filter === 'Open' ? 'active' : ''}`} onClick={() => { setFilter('Open'); setSelectedRequest(null) }}>
            Open chats ({requests.filter(request => request.status === 'Open').length})
          </button>
          <button className={`cr-tab ${filter === 'Closed' ? 'active' : ''}`} onClick={() => { setFilter('Closed'); setSelectedRequest(null) }}>
            Closed chats ({requests.filter(request => request.status === 'Closed').length})
          </button>
        </div>

        {showNewTicket && (
          <div className="cr-panel" style={{ marginBottom: 18 }}>
            <div className="cr-panel-head">
              <div className="cr-panel-title">Create Chat</div>
            </div>
            <div className="cr-form">
              <div>
                <label className="cr-label">Project</label>
                <select className="cr-select" value={newProjectId} onChange={e => setNewProjectId(e.target.value)}>
                  <option value="">Select project...</option>
                  {projects.map(project => (
                    <option key={project.id} value={project.id}>{project.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="cr-label">Subject</label>
                <input className="cr-input" value={newSubject} onChange={e => setNewSubject(e.target.value)} placeholder="What do you need help with?" />
              </div>
              <div>
                <label className="cr-label">Description</label>
                <textarea className="cr-textarea" value={newDescription} onChange={e => setNewDescription(e.target.value)} placeholder="Add the details for admin..." />
              </div>
              <div>
                <button className="cr-btn cr-btn-primary" onClick={createTicket}>Create ticket</button>
              </div>
            </div>
          </div>
        )}

        <div className="cr-grid">
          <div className="cr-panel">
            <div className="cr-panel-head">
              <div className="cr-panel-title">{filter === 'Open' ? 'Open chats' : 'Closed chats'}</div>
            </div>
            <div className="cr-list">
              {sortedRequests.length === 0 ? (
                <div className="cr-empty">No {filter.toLowerCase()} chats yet.</div>
              ) : sortedRequests.map(request => (
                <button
                  key={request.id}
                  className={`cr-ticket ${selectedRequest?.id === request.id ? 'active' : ''}`}
                  onClick={() => setSelectedRequest(request)}
                >
                  <div className="cr-ticket-title">{request.subject}</div>
                  <div className="cr-ticket-meta">{projects.find(project => project.id === request.project_id)?.name || 'Project'}</div>
                  <span className={`cr-status ${request.status === 'Open' ? 'open' : 'closed'}`}>{request.status}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="cr-panel cr-chat">
            {!selectedRequest ? (
              <div className="cr-empty" style={{ margin: 'auto' }}>Select a chat to open the conversation.</div>
            ) : (
              <>
                <div className="cr-panel-head">
                  <div>
                    <div className="cr-panel-title">{selectedRequest.subject}</div>
                    <div className="cr-ticket-meta">{projects.find(project => project.id === selectedRequest.project_id)?.name || 'Project'} • {selectedRequest.status}</div>
                  </div>
                </div>
                <div className="cr-chat-body">
                  {selectedRequest.description && (
                    <div className="cr-description">{selectedRequest.description}</div>
                  )}
                  {selectedMessages.length === 0 ? (
                    <div className="cr-empty">No messages yet. Send the first reply.</div>
                  ) : selectedMessages.map(message => (
                    <div key={message.id} className={`cr-bubble ${message.sender === 'client' ? 'client' : 'admin'}`}>
                      {message.message}
                    </div>
                  ))}
                </div>
                <div className="cr-chat-foot">
                  <input
                    className="cr-input"
                    placeholder={selectedRequest.status === 'Closed' ? 'This chat is closed' : 'Type a reply...'}
                    value={replyMessage}
                    onChange={e => setReplyMessage(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') sendReply() }}
                    disabled={selectedRequest.status === 'Closed'}
                  />
                  <button className="cr-btn cr-btn-primary" onClick={sendReply} disabled={selectedRequest.status === 'Closed'}>Send</button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
