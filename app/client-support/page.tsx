'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '../../lib/supabase/client'
import type { SupportContract, SupportContractRenewal, SupportWorkLog } from '../../lib/types'

const styles = `
  .cs-root {
    min-height: 100vh;
    background: linear-gradient(180deg, #F7F8FB 0%, #EEF1F6 100%);
    color: #151236;
    font-family: Inter, Arial, sans-serif;
    padding: 24px 28px 44px;
  }
  .cs-shell { max-width: 1180px; margin: 0 auto; }
  .cs-top { display: flex; justify-content: space-between; align-items: center; gap: 16px; margin-bottom: 22px; }
  .cs-title { font-size: 27px; font-weight: 900; color: #12182B; margin: 0; }
  .cs-subtitle { margin-top: 6px; color: #727789; font-size: 14px; font-weight: 700; }
  .cs-btn { border: none; border-radius: 14px; padding: 11px 16px; font-size: 13px; font-weight: 900; cursor: pointer; transition: 0.2s ease; }
  .cs-btn:hover { transform: translateY(-1px); }
  .cs-btn-primary { color: #fff; background: var(--client-primary); box-shadow: 0 12px 28px rgba(21,18,54,0.12); }
  .cs-btn-danger { color: #be123c; background: #fff1f2; border: 1px solid #fecaca; }
  .cs-btn-wide { width: 100%; padding: 13px 18px; }
  .cs-btn-light { color: #151236; background: #fff; border: 1px solid rgba(230,230,240,0.95); box-shadow: 0 10px 24px rgba(21,18,54,0.06); }
  .cs-actions { display: flex; gap: 10px; flex-wrap: wrap; margin-top: 14px; }
  .cs-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(170px, 1fr)); gap: 14px; margin-bottom: 22px; }
  .cs-stat { background: rgba(255,255,255,0.94); border: 1px solid rgba(230,230,240,0.9); border-radius: 22px; padding: 18px; box-shadow: 0 14px 38px rgba(21,18,54,0.06); position: relative; overflow: hidden; transition: transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease; }
  .cs-stat:hover { transform: translateY(-5px); border-color: var(--client-primary); box-shadow: 0 22px 54px rgba(21,18,54,0.12); }
  .cs-stat::after { content: ''; position: absolute; width: 86px; height: 86px; right: -26px; top: -28px; border-radius: 26px; background: var(--client-primary-soft); transform: rotate(18deg); }
  .cs-label { color: #8A86A4; font-size: 11px; font-weight: 900; letter-spacing: 0.08em; text-transform: uppercase; position: relative; z-index: 1; }
  .cs-value { color: #151236; font-size: 28px; line-height: 1; font-weight: 900; margin-top: 12px; position: relative; z-index: 1; }
  .cs-grid { display: grid; grid-template-columns: minmax(0, 0.9fr) minmax(360px, 1.35fr); gap: 18px; align-items: start; }
  .cs-panel { background: rgba(255,255,255,0.94); border-radius: 24px; border: 1px solid rgba(230,230,240,0.9); box-shadow: 0 14px 38px rgba(21,18,54,0.06); overflow: hidden; }
  .cs-panel-head { padding: 18px 20px; border-bottom: 1px solid #f0eff6; display: flex; align-items: center; justify-content: space-between; gap: 12px; }
  .cs-panel-title { font-size: 15px; font-weight: 900; }
  .cs-list { padding: 14px; display: grid; gap: 10px; }
  .cs-contract { width: 100%; text-align: left; border: 1px solid #eeedf6; background: #fff; border-radius: 18px; padding: 14px; cursor: pointer; transition: transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease; }
  .cs-contract:hover, .cs-contract.active { border-color: var(--client-primary); box-shadow: 0 18px 42px rgba(21,18,54,0.12); transform: translateY(-4px); }
  .cs-contract-title { font-size: 14px; font-weight: 900; color: #151236; line-height: 1.25; }
  .cs-meta { margin-top: 7px; color: #8A86A4; font-size: 12px; font-weight: 700; }
  .cs-pill { display: inline-flex; border-radius: 999px; padding: 5px 9px; font-size: 11px; font-weight: 900; margin-top: 10px; color: var(--client-primary); background: var(--client-primary-soft); }
  .cs-pill-rejected { color: #be123c; background: #fff1f2; border: 1px solid #fecaca; }
  .cs-empty { padding: 34px 20px; color: #8A86A4; font-weight: 700; text-align: center; }
  .cs-detail { padding: 18px; display: grid; gap: 14px; }
  .cs-hours { display: grid; grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 10px; }
  .cs-hour { background: #fbfbfd; border: 1px solid #eeedf6; border-radius: 16px; padding: 13px; min-height: 104px; display: flex; flex-direction: column; justify-content: space-between; transition: transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease, background 0.24s ease; }
  .cs-hour .cs-label { line-height: 1.25; min-height: 34px; display: flex; align-items: flex-start; }
  .cs-hour .cs-value { margin-top: 14px; color: var(--client-primary); }
  .cs-hour:hover { transform: translateY(-4px); border-color: var(--client-primary); background: #fff; box-shadow: 0 16px 34px rgba(21,18,54,0.09); }
  .cs-section { border: 1px solid #eeedf6; border-radius: 18px; background: #fff; padding: 14px; display: grid; gap: 10px; }
  .cs-section-title { font-size: 13px; font-weight: 900; color: #151236; }
  .cs-detail-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 10px; }
  .cs-info { background: #fbfbfd; border: 1px solid #eeedf6; border-radius: 15px; padding: 12px; min-width: 0; }
  .cs-info-value { margin-top: 6px; color: #151236; font-size: 15px; font-weight: 900; line-height: 1.25; overflow-wrap: anywhere; }
  .cs-scope { display: flex; flex-wrap: wrap; gap: 8px; }
  .cs-bar { height: 8px; background: #eef0f6; border-radius: 999px; overflow: hidden; }
  .cs-fill { height: 100%; background: var(--client-primary); border-radius: 999px; }
  .cs-log { border: 1px solid #eeedf6; border-radius: 18px; background: #fff; padding: 14px; display: grid; gap: 9px; transition: transform 0.24s ease, box-shadow 0.24s ease, border-color 0.24s ease; }
  .cs-log:hover { transform: translateY(-4px); border-color: var(--client-primary); box-shadow: 0 18px 42px rgba(21,18,54,0.10); }
  .cs-log-top { display: flex; justify-content: space-between; gap: 12px; align-items: flex-start; }
  .cs-log-title { font-size: 14px; font-weight: 900; color: #151236; }
  .cs-description { color: #5d6072; font-size: 13px; font-weight: 700; line-height: 1.45; white-space: pre-wrap; }
  .cs-root.dark { background: linear-gradient(180deg, #0B1220 0%, #111827 100%); color: #F8FAFC; }
  .cs-root.dark .cs-title,
  .cs-root.dark .cs-panel-title,
  .cs-root.dark .cs-contract-title,
  .cs-root.dark .cs-section-title,
  .cs-root.dark .cs-info-value,
  .cs-root.dark .cs-log-title,
  .cs-root.dark .cs-value { color: #F8FAFC; }
  .cs-root.dark .cs-subtitle,
  .cs-root.dark .cs-meta,
  .cs-root.dark .cs-label,
  .cs-root.dark .cs-empty { color: #AAB3C5; }
  .cs-root.dark .cs-panel,
  .cs-root.dark .cs-stat,
  .cs-root.dark .cs-contract,
  .cs-root.dark .cs-hour,
  .cs-root.dark .cs-section,
  .cs-root.dark .cs-info,
  .cs-root.dark .cs-log,
  .cs-root.dark .cs-btn-light { background: rgba(20,28,44,0.94); border-color: rgba(148,163,184,0.20); box-shadow: 0 16px 44px rgba(0,0,0,0.26); }
  .cs-root.dark .cs-panel-head,
  .cs-root.dark .cs-chat-foot { border-color: rgba(148,163,184,0.20); }
  .cs-root.dark .cs-bar { background: rgba(255,255,255,0.10); }
  .cs-root.dark .cs-description { color: #CBD5E1; background: rgba(255,255,255,0.055); border-color: rgba(148,163,184,0.20); }
  .cs-root.dark .cs-btn-light { color: #F8FAFC; }
  .cs-root.dark .cs-btn-danger,
  .cs-root.dark .cs-pill-rejected { color: #fecdd3; background: rgba(190,18,60,0.18); border-color: rgba(254,202,202,0.28); }

  @media (max-width: 880px) {
    .cs-root { padding: 18px; }
    .cs-top { align-items: flex-start; flex-direction: column; }
    .cs-grid { grid-template-columns: 1fr; }
    .cs-hours { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .cs-detail-grid { grid-template-columns: 1fr; }
  }
`

const loadingStyles = `
  @keyframes clientSupportLoaderSpin {
    to { transform: rotate(360deg); }
  }

  @keyframes clientSupportLoaderPulse {
    0%, 100% { transform: scale(0.92); opacity: 0.65; }
    50% { transform: scale(1.08); opacity: 1; }
  }

  @keyframes clientSupportLoaderBar {
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

export default function ClientSupportPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [loadingPrimary, setLoadingPrimary] = useState('#2386d2')
  const [client, setClient] = useState<Client | null>(null)
  const [projects, setProjects] = useState<Project[]>([])
  const [contracts, setContracts] = useState<SupportContract[]>([])
  const [logs, setLogs] = useState<SupportWorkLog[]>([])
  const [renewals, setRenewals] = useState<SupportContractRenewal[]>([])
  const [selectedContract, setSelectedContract] = useState<SupportContract | null>(null)
  const [supportTodayTime] = useState(() => Date.now())
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

    const { data: contractData } = await supabase
      .from('support_contracts')
      .select('*')
      .eq('client_id', clientData.id)

    const contractIds = (contractData || []).map(contract => contract.id)
    const { data: logData } = contractIds.length
      ? await supabase.from('support_work_logs').select('*').in('support_contract_id', contractIds)
      : { data: [] }
    const { data: renewalData } = contractIds.length
      ? await supabase.from('support_contract_renewals').select('*').in('support_contract_id', contractIds)
      : { data: [] }

    setClient(clientData)
    setProjects(projectData || [])
    setContracts(contractData || [])
    setLogs(logData || [])
    setRenewals(renewalData || [])
    setSelectedContract(current => {
      if (current) return (contractData || []).find(contract => contract.id === current.id) || null
      return (contractData || [])[0] || null
    })
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

  const getContractRenewals = (contractId: string) => renewals
    .filter(renewal => renewal.support_contract_id === contractId)
    .sort((a, b) => Date.parse(b.renewal_date || b.created_at || '') - Date.parse(a.renewal_date || a.created_at || ''))

  const getLatestRenewalTime = (contractId: string) => {
    const renewalTimes = getContractRenewals(contractId)
      .map(renewal => Date.parse(renewal.renewal_date || renewal.created_at || ''))
      .filter(time => !Number.isNaN(time))

    return renewalTimes.length > 0 ? Math.max(...renewalTimes) : null
  }

  const getContractPeriodStartTime = (contract: SupportContract) => {
    const latestRenewalTime = getLatestRenewalTime(contract.id)
    if (latestRenewalTime) return latestRenewalTime

    const contractStartTime = Date.parse(contract.created_at || contract.updated_at || '')
    return Number.isNaN(contractStartTime) ? 0 : contractStartTime
  }

  const isLogInCurrentPeriod = (log: SupportWorkLog, periodStartTime: number) => {
    const logTime = Date.parse(log.created_at || log.work_date || '')
    return Number.isNaN(logTime) || logTime >= periodStartTime
  }

  const getApprovedHours = (contract: SupportContract) => {
    const periodStartTime = getContractPeriodStartTime(contract)
    return logs
      .filter(log => log.support_contract_id === contract.id && log.approval_status === 'Approved' && isLogInCurrentPeriod(log, periodStartTime))
      .reduce((sum, log) => sum + Number(log.time_spent_hours || 0), 0)
  }

  const getApprovedChargedHours = (contract: SupportContract) => {
    const periodStartTime = getContractPeriodStartTime(contract)
    return logs
      .filter(log => log.support_contract_id === contract.id && log.approval_status === 'Approved' && isLogInCurrentPeriod(log, periodStartTime))
      .reduce((sum, log) => sum + Number(log.charged_hours || 0), 0)
  }

  const getHours = (contract: SupportContract) => {
    const included = Number(contract.included_hours_per_month || 0)
    const used = getApprovedHours(contract)
    return {
      included,
      used,
      remaining: Math.max(included - used, 0),
      charged: getApprovedChargedHours(contract),
    }
  }

  const getContractExpiryDate = (contract: SupportContract) => {
    if (contract.end_date) return new Date(contract.end_date)

    const renewalTimes = getContractRenewals(contract.id)
      .map(renewal => Date.parse(renewal.renewal_date || renewal.created_at || ''))
      .filter(time => !Number.isNaN(time))
    const baseTime = renewalTimes.length > 0
      ? Math.max(...renewalTimes)
      : Date.parse(contract.updated_at || contract.created_at || '')
    const expiryDate = new Date(Number.isNaN(baseTime) ? supportTodayTime : baseTime)
    expiryDate.setDate(expiryDate.getDate() + Number(contract.duration_days || 0))
    return expiryDate
  }

  const getRemainingDays = (contract: SupportContract) => Math.max(
    Math.ceil((getContractExpiryDate(contract).getTime() - supportTodayTime) / (1000 * 60 * 60 * 24)),
    0
  )

  const isContractApproved = (contract: SupportContract) => (contract.client_approval_status || 'Approved') === 'Approved'
  const activeContracts = contracts.filter(contract => contract.status === 'Active' && isContractApproved(contract))
  const totalMonthlyHours = activeContracts.reduce((sum, contract) => sum + Number(contract.included_hours_per_month || 0), 0)
  const totalUsedHours = contracts.reduce((sum, contract) => sum + getApprovedHours(contract), 0)
  const totalRemainingHours = activeContracts.reduce((sum, contract) => sum + getHours(contract).remaining, 0)
  const totalChargedHours = activeContracts.reduce((sum, contract) => sum + getHours(contract).charged, 0)
  const selectedLogs = selectedContract
    ? logs
      .filter(log => log.support_contract_id === selectedContract.id)
      .sort((a, b) => Date.parse(b.created_at || b.work_date || '') - Date.parse(a.created_at || a.work_date || ''))
    : []
  const selectedHours = selectedContract ? getHours(selectedContract) : null
  const selectedProject = selectedContract ? projects.find(item => item.id === selectedContract.project_id) : null
  const selectedRenewals = selectedContract ? getContractRenewals(selectedContract.id) : []

  const approveLog = async (logId: string) => {
    const { error } = await supabase
      .from('support_work_logs')
      .update({ approval_status: 'Approved', approved_at: new Date().toISOString() })
      .eq('id', logId)

    if (error) {
      alert(error.message)
      return
    }

    await loadData()
    alert('Support work approved successfully')
  }

  const rejectLog = async (logId: string) => {
    const { error } = await supabase
      .from('support_work_logs')
      .update({ approval_status: 'Rejected', approved_at: null })
      .eq('id', logId)

    if (error) {
      alert(error.message)
      return
    }

    await loadData()
    alert('Support work rejected')
  }

  const approveContract = async (contractId: string) => {
    const { data: { user } } = await supabase.auth.getUser()
    const { error } = await supabase
      .from('support_contracts')
      .update({
        client_approval_status: 'Approved',
        client_approved_at: new Date().toISOString(),
        client_approved_by: user?.id || null,
        status: 'Active',
      })
      .eq('id', contractId)

    if (error) {
      alert(error.message)
      return
    }

    await loadData()
    alert('Support contract approved successfully')
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
            <div style={{ position: 'absolute', inset: -8, borderRadius: 34, border: `3px solid ${primary}22`, borderTopColor: primary, animation: 'clientSupportLoaderSpin 1s linear infinite' }} />
            <div style={{ width: 22, height: 22, borderRadius: 999, background: isDark ? '#EAF2FF' : '#fff', animation: 'clientSupportLoaderPulse 1.2s ease-in-out infinite' }} />
          </div>
          <div style={{ fontSize: 22, fontWeight: 900, color: isDark ? '#F8FAFC' : '#151236' }}>Loading support...</div>
          <div style={{ marginTop: 8, color: isDark ? '#AAB3C5' : '#7b7894', fontSize: 14, fontWeight: 700 }}>Preparing your support center</div>
          <div style={{ marginTop: 22, height: 7, borderRadius: 999, background: isDark ? 'rgba(255,255,255,0.10)' : `${primary}18`, overflow: 'hidden' }}>
            <div style={{ width: '55%', height: '100%', borderRadius: 999, background: primary, animation: 'clientSupportLoaderBar 1.25s ease-in-out infinite' }} />
          </div>
        </div>
      </main>
    )
  }

  if (!client) {
    return (
      <main className={`cs-root ${theme === 'dark' ? 'dark' : ''}`}>
        <style>{styles}</style>
        <div className="cs-shell">
          <div className="cs-panel">
            <div className="cs-empty">No client profile found.</div>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className={`cs-root ${theme === 'dark' ? 'dark' : ''}`} style={{ '--client-primary': primary, '--client-primary-soft': `${primary}14` } as CSSProperties}>
      <style>{styles}</style>
      <div className="cs-shell">
        <div className="cs-top">
          <div>
            <h1 className="cs-title">Support Center</h1>
            <div className="cs-subtitle">Review support contracts, monthly hours, and approve work before hours are deducted.</div>
          </div>
          <button className="cs-btn cs-btn-light" onClick={() => router.push('/client-dashboard')}>Back to dashboard</button>
        </div>

        <div className="cs-stats">
          <div className="cs-stat"><div className="cs-label">Active</div><div className="cs-value">{activeContracts.length}</div></div>
          <div className="cs-stat"><div className="cs-label">Support Contract</div><div className="cs-value">{contracts.length}</div></div>
          <div className="cs-stat"><div className="cs-label">Monthly Hours</div><div className="cs-value">{totalMonthlyHours}</div></div>
          <div className="cs-stat"><div className="cs-label">Total Used Hours</div><div className="cs-value">{totalUsedHours}</div></div>
          <div className="cs-stat"><div className="cs-label">Total Remaining Hours</div><div className="cs-value">{totalRemainingHours}</div></div>
          <div className="cs-stat"><div className="cs-label">Total Charged Hours</div><div className="cs-value">{totalChargedHours}</div></div>
        </div>

        <div className="cs-grid">
          <div className="cs-panel">
            <div className="cs-panel-head">
              <div className="cs-panel-title">Support Contracts</div>
            </div>
            <div className="cs-list">
              {contracts.length === 0 ? (
                <div className="cs-empty">No support contracts are available yet.</div>
              ) : contracts.map(contract => {
                const hours = getHours(contract)
                const project = projects.find(item => item.id === contract.project_id)
                return (
                  <button key={contract.id} className={`cs-contract ${selectedContract?.id === contract.id ? 'active' : ''}`} onClick={() => setSelectedContract(contract)}>
                    <div className="cs-contract-title">{contract.name}</div>
                    <div className="cs-meta">{project?.name || 'Project'} • {Number(contract.duration_days || 0)} days • {getRemainingDays(contract)} days remaining</div>
                    <span className="cs-pill">{isContractApproved(contract) ? contract.status : 'Pending Approval'}</span>
                    <div className="cs-meta">{hours.used} used / {hours.included} monthly hours</div>
                    <div className="cs-bar"><div className="cs-fill" style={{ width: `${Math.min((hours.used / Math.max(hours.included, 1)) * 100, 100)}%` }} /></div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="cs-panel">
            <div className="cs-panel-head">
              <div className="cs-panel-title">{selectedContract?.name || 'Contract Details'}</div>
              {selectedContract && <span className="cs-pill">{isContractApproved(selectedContract) ? selectedContract.status : 'Pending Approval'}</span>}
            </div>
            {!selectedContract || !selectedHours ? (
              <div className="cs-empty">Select a support contract to review full contract details and work logs.</div>
            ) : (
              <div className="cs-detail">
                <div className="cs-hours">
                  <div className="cs-hour"><div className="cs-label">Monthly Allowance-Hours</div><div className="cs-value">{selectedHours.included}</div></div>
                  <div className="cs-hour"><div className="cs-label">Used</div><div className="cs-value">{selectedHours.used}</div></div>
                  <div className="cs-hour"><div className="cs-label">Remaining Hours</div><div className="cs-value">{selectedHours.remaining}</div></div>
                  <div className="cs-hour"><div className="cs-label">Remaining Days</div><div className="cs-value">{getRemainingDays(selectedContract)}</div></div>
                  <div className="cs-hour"><div className="cs-label">Charged Hours</div><div className="cs-value">{selectedHours.charged}</div></div>
                  <div className="cs-hour"><div className="cs-label">Charge Per Extra Hour</div><div className="cs-value">{Number(selectedContract.extra_hour_rate || 0).toLocaleString()}</div></div>
                </div>

                <div className="cs-bar">
                  <div className="cs-fill" style={{ width: `${Math.min((selectedHours.used / Math.max(selectedHours.included, 1)) * 100, 100)}%` }} />
                </div>

                <div className="cs-section">
                  <div className="cs-section-title">Contract Details</div>
                  <div className="cs-detail-grid">
                    <div className="cs-info"><div className="cs-label">Project</div><div className="cs-info-value">{selectedProject?.name || 'Project'}</div></div>
                    <div className="cs-info"><div className="cs-label">Status</div><div className="cs-info-value">{selectedContract.status}</div></div>
                    <div className="cs-info"><div className="cs-label">Duration</div><div className="cs-info-value">{Number(selectedContract.duration_days || 0)} days</div></div>
                    <div className="cs-info"><div className="cs-label">Remaining Days</div><div className="cs-info-value">{getRemainingDays(selectedContract)}</div></div>
                    <div className="cs-info"><div className="cs-label">Expiry Date</div><div className="cs-info-value">{getContractExpiryDate(selectedContract).toLocaleDateString()}</div></div>
                    <div className="cs-info"><div className="cs-label">Monthly Fee</div><div className="cs-info-value">{Number(selectedContract.monthly_support_fee || 0).toLocaleString()}</div></div>
                    <div className="cs-info"><div className="cs-label">Charge Per Extra Hour</div><div className="cs-info-value">{Number(selectedContract.extra_hour_rate || 0).toLocaleString()}</div></div>
                    <div className="cs-info"><div className="cs-label">Extra Hours Approval</div><div className="cs-info-value">{selectedContract.approval_required_for_extra_hours ? 'Required' : 'Not required'}</div></div>
                    <div className="cs-info"><div className="cs-label">Hours Rollover</div><div className="cs-info-value">{selectedContract.hours_rollover ? 'Yes' : 'No'}</div></div>
                    <div className="cs-info"><div className="cs-label">Max Accumulated Hours</div><div className="cs-info-value">{Number(selectedContract.max_accumulated_hours || 0)}</div></div>
                  </div>
                </div>

                <div className="cs-section">
                  <div className="cs-section-title">SLA Settings</div>
                  <div className="cs-detail-grid">
                    <div className="cs-info">
                      <div className="cs-label">Critical</div>
                      <div className="cs-info-value">{Number(selectedContract.critical_response_hours || 0)} hours</div>
                      {selectedContract.critical_response_definition && <div className="cs-meta">{selectedContract.critical_response_definition}</div>}
                    </div>
                    <div className="cs-info">
                      <div className="cs-label">Normal</div>
                      <div className="cs-info-value">{Number(selectedContract.normal_response_hours || 0)} hours</div>
                      {selectedContract.normal_response_definition && <div className="cs-meta">{selectedContract.normal_response_definition}</div>}
                    </div>
                    <div className="cs-info">
                      <div className="cs-label">Low</div>
                      <div className="cs-info-value">{Number(selectedContract.low_response_hours || 0)} hours</div>
                      {selectedContract.low_response_definition && <div className="cs-meta">{selectedContract.low_response_definition}</div>}
                    </div>
                  </div>
                </div>

                <div className="cs-section">
                  <div className="cs-section-title">Scope Of Contract</div>
                  {(selectedContract.included_scope || []).length === 0 ? (
                    <div className="cs-meta">No included scope is listed for this contract.</div>
                  ) : (
                    <div className="cs-scope">
                      {selectedContract.included_scope.map(scope => (
                        <span key={scope} className="cs-pill">{scope}</span>
                      ))}
                    </div>
                  )}
                </div>

                <div className="cs-section">
                  <div className="cs-section-title">Renewals</div>
                  {selectedRenewals.length === 0 ? (
                    <div className="cs-meta">No renewals have been logged yet.</div>
                  ) : (
                    <div className="cs-detail-grid">
                      {selectedRenewals.map(renewal => (
                        <div key={renewal.id} className="cs-info">
                          <div className="cs-label">{new Date(renewal.renewal_date || renewal.created_at).toLocaleDateString()}</div>
                          <div className="cs-info-value">{Number(renewal.duration_days || 0)} days</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="cs-section">
                  <div className="cs-section-title">Work Logs</div>
                {selectedLogs.length === 0 ? (
                  <div className="cs-empty">No support work has been logged for this contract yet.</div>
                ) : selectedLogs.map(log => (
                  <div key={log.id} className="cs-log">
                    <div className="cs-log-top">
                      <div>
                        <div className="cs-log-title">{log.title}</div>
                        <div className="cs-meta">{log.work_date || 'No creation date'} • {Number(log.time_spent_hours || 0)}h required • {Number(log.charged_hours || 0)}h charged • {Number(log.charge_per_hour || 0).toLocaleString()} per hour • {log.priority} • {log.status}</div>
                      </div>
                      <span className={`cs-pill ${(log.approval_status || 'Pending') === 'Rejected' ? 'cs-pill-rejected' : ''}`}>{log.approval_status || 'Pending'}</span>
                    </div>
                    {log.description && <div className="cs-description">{log.description}</div>}
                    {(log.approval_status || 'Pending') === 'Pending' && (
                      <div className="cs-actions">
                        <button className="cs-btn cs-btn-primary" onClick={() => approveLog(log.id)}>Approve and deduct hours</button>
                        <button className="cs-btn cs-btn-danger" onClick={() => rejectLog(log.id)}>Reject</button>
                      </div>
                    )}
                  </div>
                ))}
                </div>
                {!isContractApproved(selectedContract) && (
                  <button className="cs-btn cs-btn-primary cs-btn-wide" onClick={() => approveContract(selectedContract.id)}>
                    Approve Contract
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  )
}
