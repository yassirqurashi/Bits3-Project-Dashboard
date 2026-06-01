'use client'

import { useEffect, useState } from 'react'
import type { CSSProperties } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase } from '@/lib/supabase/client'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

  *, *::before, *::after { box-sizing: border-box; }

  .client-edit-root {
    min-height: 100vh;
    font-family: 'Inter', sans-serif;
    background:
      radial-gradient(circle at 18% 8%, rgba(109, 93, 252, 0.14), transparent 28%),
      radial-gradient(circle at 88% 0%, rgba(139, 92, 246, 0.14), transparent 26%),
      #f7f6fd;
    color: #111827;
    padding: 32px;
  }

  .client-edit-shell { max-width: 940px; margin: 0 auto; }

  .client-edit-top {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 18px;
    margin-bottom: 22px;
  }

  .client-edit-eyebrow {
    color: #7c7694;
    font-size: 12px;
    font-weight: 800;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  .client-edit-title {
    color: #15113b;
    font-size: 30px;
    line-height: 1.1;
    letter-spacing: -0.04em;
    font-weight: 800;
    margin: 0;
  }

  .client-edit-subtitle {
    color: #7c7694;
    font-size: 14px;
    font-weight: 600;
    margin-top: 8px;
  }

  .client-edit-card {
    background: rgba(255,255,255,0.9);
    border: 1px solid rgba(230,226,245,0.95);
    border-radius: 24px;
    box-shadow: 0 18px 45px rgba(45, 35, 120, 0.10);
    overflow: hidden;
  }

  .client-edit-preview {
    min-height: 118px;
    padding: 24px;
    display: flex;
    align-items: center;
    gap: 18px;
    color: #fff;
    background: linear-gradient(135deg, var(--client-primary), var(--client-secondary));
  }

  .client-edit-logo,
  .client-edit-avatar {
    width: 62px;
    height: 62px;
    border-radius: 18px;
    flex-shrink: 0;
    border: 1px solid rgba(255,255,255,0.35);
    background: rgba(255,255,255,0.18);
  }

  .client-edit-logo { object-fit: cover; }

  .client-edit-avatar {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 24px;
    font-weight: 800;
  }

  .client-edit-preview-name {
    font-size: 22px;
    font-weight: 800;
    letter-spacing: -0.03em;
  }

  .client-edit-preview-email {
    font-size: 13px;
    opacity: 0.82;
    margin-top: 4px;
    font-weight: 600;
  }

  .client-edit-form { padding: 24px; }

  .client-edit-grid {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 16px;
  }

  .client-edit-field.full { grid-column: 1 / -1; }

  .client-edit-label {
    display: block;
    font-size: 11px;
    font-weight: 800;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: #7c7694;
    margin-bottom: 7px;
  }

  .client-edit-input {
    width: 100%;
    padding: 13px 14px;
    border: 1px solid #e6e2f5;
    border-radius: 15px;
    font: inherit;
    font-size: 14px;
    color: #111827;
    background: #fff;
    outline: none;
    transition: 0.2s ease;
  }

  .client-edit-input:focus {
    border-color: rgba(109,93,252,0.48);
    box-shadow: 0 0 0 4px rgba(109,93,252,0.10);
  }

  .client-edit-file {
    position: relative;
    border: 1.5px dashed #cbc5ef;
    border-radius: 16px;
    padding: 18px;
    text-align: center;
    background: #fbfaff;
    cursor: pointer;
    transition: 0.2s ease;
  }

  .client-edit-file:hover { border-color: #6d5dfc; background: #f5f2ff; }

  .client-edit-file input {
    position: absolute;
    inset: 0;
    opacity: 0;
    cursor: pointer;
  }

  .client-edit-file-title {
    color: #6d6883;
    font-size: 13px;
    font-weight: 800;
  }

  .client-edit-file-sub {
    color: #a4a0b8;
    font-size: 11px;
    margin-top: 4px;
    font-weight: 600;
  }

  .client-edit-colors {
    display: grid;
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 12px;
  }

  .client-edit-color {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px 12px;
    border: 1px solid #e6e2f5;
    border-radius: 15px;
    background: #fff;
  }

  .client-edit-color input {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 50%;
    padding: 0;
    cursor: pointer;
    background: none;
  }

  .client-edit-color span {
    color: #6d6883;
    font-size: 12px;
    font-weight: 700;
  }

  .client-edit-actions {
    display: flex;
    justify-content: flex-end;
    gap: 10px;
    margin-top: 22px;
  }

  .client-edit-btn {
    border: none;
    border-radius: 14px;
    padding: 12px 18px;
    font: inherit;
    font-size: 13px;
    font-weight: 800;
    cursor: pointer;
    transition: 0.2s ease;
  }

  .client-edit-btn.primary {
    color: #fff;
    background: linear-gradient(135deg, #6d5dfc, #8b5cf6);
    box-shadow: 0 14px 30px rgba(109,93,252,0.23);
  }

  .client-edit-btn.secondary {
    color: #6d5dfc;
    background: #fff;
    border: 1px solid #d8d2f7;
  }

  .client-edit-btn:hover { transform: translateY(-1px); }
  .client-edit-btn:disabled { opacity: 0.65; cursor: not-allowed; transform: none; }

  .client-edit-message {
    margin-top: 14px;
    color: #dc2626;
    font-size: 13px;
    font-weight: 700;
  }

  @media (max-width: 720px) {
    .client-edit-root { padding: 18px; }
    .client-edit-top { align-items: flex-start; flex-direction: column; }
    .client-edit-grid, .client-edit-colors { grid-template-columns: 1fr; }
    .client-edit-actions { flex-direction: column-reverse; }
    .client-edit-btn { width: 100%; }
  }

  .client-edit-root {
    background:
      radial-gradient(circle at 88% -10%, rgba(18, 61, 255, 0.08), transparent 26%),
      #f6f8fb;
    color: #101828;
  }

  .client-edit-shell {
    max-width: 960px;
  }

  .client-edit-eyebrow,
  .client-edit-subtitle,
  .client-edit-label,
  .client-edit-file-title,
  .client-edit-file-sub,
  .client-edit-color span {
    color: #667085;
  }

  .client-edit-title {
    color: #101828;
    letter-spacing: -0.035em;
  }

  .client-edit-card {
    background: #ffffff;
    border: 1px solid #e5eaf2;
    border-radius: 18px;
    box-shadow: 0 1px 2px rgba(16, 24, 40, 0.04), 0 14px 38px rgba(16, 24, 40, 0.06);
  }

  .client-edit-preview {
    color: #ffffff;
    background: linear-gradient(135deg, var(--client-primary), var(--client-secondary));
  }

  .client-edit-preview-name,
  .client-edit-preview-email {
    color: #ffffff;
  }

  .client-edit-input,
  .client-edit-color,
  .client-edit-file {
    border-color: #dbe3ef;
    border-radius: 13px;
    background: #ffffff;
    color: #101828;
    box-shadow: none;
  }

  .client-edit-input:focus {
    border-color: rgba(18, 61, 255, 0.52);
    box-shadow: 0 0 0 4px rgba(18, 61, 255, 0.12);
  }

  .client-edit-file {
    background: #f8fbff;
  }

  .client-edit-file:hover {
    border-color: rgba(18, 61, 255, 0.38);
    background: #f3f7ff;
  }

  .client-edit-btn {
    border-radius: 12px;
  }

  .client-edit-btn.primary {
    background: linear-gradient(135deg, #123dff, #0076ff);
    box-shadow: 0 12px 26px rgba(18, 61, 255, 0.20);
  }

  .client-edit-btn.secondary {
    color: #123dff;
    border-color: #dbe3ef;
  }

  .client-edit-btn:focus-visible {
    outline: none;
    box-shadow: 0 0 0 4px rgba(18, 61, 255, 0.12);
  }
`

export default function EditClientPage() {
  const router = useRouter()
  const params = useParams<{ clientId: string }>()
  const clientId = params.clientId

  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [logoUrl, setLogoUrl] = useState('')
  const [primaryColor, setPrimaryColor] = useState('#0a0a0a')
  const [secondaryColor, setSecondaryColor] = useState('#c8a96e')
  const [uploadedFileName, setUploadedFileName] = useState('')

  useEffect(() => {
    const loadClient = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

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

      const { data, error: fetchError } = await supabase
        .from('clients')
        .select('*')
        .eq('id', clientId)
        .single()

      if (fetchError || !data) {
        setError('Client not found')
        setLoading(false)
        return
      }

      setName(data.name || '')
      setEmail(data.email || '')
      setLogoUrl(data.logo_url || '')
      setPrimaryColor(data.primary_color || '#0a0a0a')
      setSecondaryColor(data.secondary_color || '#c8a96e')
      setLoading(false)
    }

    loadClient()
  }, [clientId, router])

  const uploadLogo = async (file: File) => {
    setUploadedFileName(file.name)
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-')
    const filePath = `logos/${Date.now()}-${safeName}`
    const { error: uploadError } = await supabase.storage
      .from('client-logos')
      .upload(filePath, file, { upsert: true })

    if (uploadError) {
      setError(uploadError.message)
      return
    }

    const { data } = supabase.storage.from('client-logos').getPublicUrl(filePath)
    setLogoUrl(data.publicUrl)
  }

  const saveClient = async () => {
    if (!name.trim()) {
      setError('Please enter the client name')
      return
    }

    if (!email.trim()) {
      setError('Please enter the client email')
      return
    }

    setSaving(true)
    setError('')

    const res = await fetch('/api/update-client', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        clientId,
        name,
        email,
        password,
        logo_url: logoUrl,
        primary_color: primaryColor,
        secondary_color: secondaryColor,
      }),
    })

    const result = await res.json()

    if (!res.ok) {
      setSaving(false)
      setError(result.error || 'Failed to save client')
      return
    }

    router.push('/dashboard?section=clients')
  }

  if (loading) {
    return (
      <div className="client-edit-root">
        <style>{styles}</style>
        <div className="client-edit-shell">Loading client...</div>
      </div>
    )
  }

  return (
    <div className="client-edit-root" style={{ '--client-primary': primaryColor, '--client-secondary': secondaryColor } as CSSProperties}>
      <style>{styles}</style>
      <div className="client-edit-shell">
        <div className="client-edit-top">
          <div>
            <div className="client-edit-eyebrow">Client profile</div>
            <h1 className="client-edit-title">Edit Client</h1>
            <div className="client-edit-subtitle">Update the client details and save the changes.</div>
          </div>

          <button className="client-edit-btn secondary" onClick={() => router.push('/dashboard?section=clients')}>
            Back to clients
          </button>
        </div>

        <div className="client-edit-card">
          <div className="client-edit-preview">
            {logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="client-edit-logo" src={logoUrl} alt={name || 'Client logo'} />
            ) : (
              <div className="client-edit-avatar">{name.charAt(0).toUpperCase() || 'C'}</div>
            )}
            <div>
              <div className="client-edit-preview-name">{name || 'Client name'}</div>
              <div className="client-edit-preview-email">{email || 'client@email.com'}</div>
            </div>
          </div>

          <div className="client-edit-form">
            <div className="client-edit-grid">
              <div className="client-edit-field">
                <label className="client-edit-label">Client Name</label>
                <input className="client-edit-input" value={name} onChange={e => setName(e.target.value)} />
              </div>

              <div className="client-edit-field">
                <label className="client-edit-label">Client Email / Username</label>
                <input className="client-edit-input" value={email} onChange={e => setEmail(e.target.value)} />
              </div>

              <div className="client-edit-field full">
                <label className="client-edit-label">New Password</label>
                <input
                  type="password"
                  className="client-edit-input"
                  placeholder="Leave blank to keep current password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                />
              </div>

              <div className="client-edit-field full">
                <label className="client-edit-label">Logo</label>
                <div className="client-edit-file">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files?.[0]
                      if (file) await uploadLogo(file)
                    }}
                  />
                  <div className="client-edit-file-title">
                    {uploadedFileName || 'Click to upload a new logo'}
                  </div>
                  <div className="client-edit-file-sub">PNG, JPG, SVG up to 5MB</div>
                </div>
              </div>

              <div className="client-edit-field full">
                <label className="client-edit-label">Brand Colors</label>
                <div className="client-edit-colors">
                  <div className="client-edit-color">
                    <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)} />
                    <span>Primary - {primaryColor}</span>
                  </div>
                  <div className="client-edit-color">
                    <input type="color" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)} />
                    <span>Secondary - {secondaryColor}</span>
                  </div>
                </div>
              </div>
            </div>

            {error && <div className="client-edit-message">{error}</div>}

            <div className="client-edit-actions">
              <button className="client-edit-btn secondary" onClick={() => router.push('/dashboard?section=clients')}>
                Cancel
              </button>
              <button className="client-edit-btn primary" onClick={saveClient} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
