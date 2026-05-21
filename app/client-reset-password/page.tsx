'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Lock } from 'lucide-react'
import { supabase } from '../../lib/supabase/client'

const styles = `
  .crp-root {
    min-height: 100vh;
    font-family: Inter, Arial, sans-serif;
    background:
      radial-gradient(circle at 18% 18%, rgba(255,255,255,0.18), transparent 24%),
      radial-gradient(circle at 82% 16%, rgba(0,220,255,0.16), transparent 25%),
      linear-gradient(145deg, #7C3DFF 0%, #6547F4 48%, #4158F3 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 24px;
  }
  .crp-panel {
    width: min(100%, 430px);
    background: rgba(255,255,255,0.96);
    color: #151236;
    border-radius: 30px;
    padding: 34px;
    box-shadow: 0 26px 70px rgba(17,18,48,0.20);
    border: 1px solid rgba(255,255,255,0.78);
  }
  .crp-icon {
    width: 52px;
    height: 52px;
    border-radius: 17px;
    background: #F3F0FF;
    color: #6C5CE7;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
  }
  .crp-title { margin: 0; font-size: 28px; font-weight: 900; color: #151236; }
  .crp-subtitle { margin: 8px 0 26px; color: #7b7894; font-size: 14px; font-weight: 700; line-height: 1.55; }
  .crp-label {
    display: block;
    font-size: 12px;
    font-weight: 900;
    color: #6f6b8d;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .crp-input-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
    border: 1px solid #e4e2ef;
    border-radius: 18px;
    padding: 0 14px;
    height: 54px;
    margin-bottom: 16px;
    background: #fbfbfd;
  }
  .crp-input {
    border: none;
    outline: none;
    background: transparent;
    width: 100%;
    font-size: 15px;
    color: #151236;
    font-weight: 700;
  }
  .crp-error {
    color: #d63031;
    background: #fff1f1;
    border: 1px solid #ffd6d6;
    padding: 12px;
    border-radius: 14px;
    font-size: 13px;
    margin-bottom: 16px;
    font-weight: 700;
  }
  .crp-success {
    color: #047857;
    background: #ecfdf5;
    border: 1px solid #bbf7d0;
    padding: 12px;
    border-radius: 14px;
    font-size: 13px;
    margin-bottom: 16px;
    font-weight: 700;
  }
  .crp-button {
    width: 100%;
    height: 56px;
    border: none;
    border-radius: 18px;
    background: linear-gradient(135deg, #6C5CE7, #8E6CFF);
    color: #fff;
    font-size: 15px;
    font-weight: 900;
    cursor: pointer;
    box-shadow: 0 14px 30px rgba(108,92,231,0.28);
  }
  .crp-button.secondary {
    margin-top: 12px;
    background: #F3F0FF;
    color: #6C5CE7;
    box-shadow: none;
  }
  .crp-button:disabled { cursor: not-allowed; opacity: 0.72; }
`

export default function ClientResetPasswordPage() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [ready, setReady] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    const prepareRecoverySession = async () => {
      const code = new URLSearchParams(window.location.search).get('code')

      if (code) {
        await supabase.auth.exchangeCodeForSession(code)
        window.history.replaceState({}, '', '/client-reset-password')
      }

      const { data } = await supabase.auth.getSession()
      setReady(Boolean(data.session))
    }

    prepareRecoverySession()

    const { data: listener } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || session) setReady(true)
    })

    return () => listener.subscription.unsubscribe()
  }, [])

  const updatePassword = async () => {
    setError('')
    setMessage('')

    if (password.length < 6) {
      setError('Password should be at least 6 characters.')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    const { error } = await supabase.auth.updateUser({ password })
    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setMessage('Password updated successfully. You can login now.')
    await supabase.auth.signOut()
    window.setTimeout(() => router.push('/client-login'), 1200)
  }

  return (
    <main className="crp-root">
      <style>{styles}</style>
      <section className="crp-panel">
        <div className="crp-icon">
          <Lock size={24} />
        </div>
        <h1 className="crp-title">Reset password</h1>
        <p className="crp-subtitle">
          Enter a new password for your client dashboard account.
        </p>

        {!ready && (
          <div className="crp-error">
            Open this page from the password reset email link so Supabase can verify your request.
          </div>
        )}

        <label className="crp-label" htmlFor="new-password">New password</label>
        <div className="crp-input-wrap">
          <Lock size={18} color="#7C4DFF" />
          <input
            id="new-password"
            className="crp-input"
            value={password}
            onChange={e => setPassword(e.target.value)}
            placeholder="Enter new password"
            type="password"
          />
        </div>

        <label className="crp-label" htmlFor="confirm-password">Confirm password</label>
        <div className="crp-input-wrap">
          <Lock size={18} color="#7C4DFF" />
          <input
            id="confirm-password"
            className="crp-input"
            value={confirmPassword}
            onChange={e => setConfirmPassword(e.target.value)}
            placeholder="Confirm new password"
            type="password"
          />
        </div>

        {error && <div className="crp-error">{error}</div>}
        {message && <div className="crp-success">{message}</div>}

        <button className="crp-button" disabled={loading || !ready} onClick={updatePassword} type="button">
          {loading ? 'Updating password...' : 'Update password'}
        </button>
        <button className="crp-button secondary" onClick={() => router.push('/client-login')} type="button">
          Back to login
        </button>
      </section>
    </main>
  )
}
