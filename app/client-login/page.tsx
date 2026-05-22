'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowRight, Eye, EyeOff, Lock, Mail, Sparkles } from 'lucide-react'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700;800;900&display=swap');

  .cl-root {
    min-height: 100vh;
    font-family: Inter, Arial, sans-serif;
    color: #ffffff;
    background:
      radial-gradient(circle at 18% 18%, rgba(255,255,255,0.18), transparent 24%),
      radial-gradient(circle at 82% 16%, rgba(0,220,255,0.16), transparent 25%),
      linear-gradient(145deg, #7C3DFF 0%, #6547F4 48%, #4158F3 100%);
    position: relative;
    overflow: hidden;
  }
  .cl-root::after {
    content: '';
    position: absolute;
    left: -8%;
    right: -8%;
    bottom: -1px;
    height: 25vh;
    background: #ffffff;
    border-radius: 50% 50% 0 0 / 100% 100% 0 0;
    z-index: 0;
  }
  .cl-shell {
    position: relative;
    z-index: 1;
    min-height: 100vh;
    max-width: 1180px;
    margin: 0 auto;
    padding: 28px 32px 0;
    display: flex;
    flex-direction: column;
  }
  .cl-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
  }
  .cl-brand {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-weight: 900;
    letter-spacing: 0.01em;
  }
  .cl-brand-mark {
    width: 30px;
    height: 30px;
    border-radius: 999px;
    background: conic-gradient(from 140deg, #39E9D2, #FFD166, #FF4D8D, #7C3DFF, #39E9D2);
    box-shadow: 0 10px 26px rgba(0,0,0,0.12);
  }
  .cl-nav-links {
    display: flex;
    align-items: center;
    gap: 28px;
    font-size: 13px;
    font-weight: 800;
    color: rgba(255,255,255,0.78);
  }
  .cl-nav-pill {
    border: 1px solid rgba(255,255,255,0.62);
    border-radius: 999px;
    padding: 12px 22px;
    color: #fff;
  }
  .cl-hero {
    flex: 1;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 390px;
    align-items: center;
    gap: 34px;
    padding: 52px 0 76px;
  }
  .cl-copy {
    text-align: center;
    max-width: 690px;
    margin: 0 auto;
  }
  .cl-kicker {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    padding: 9px 14px;
    border-radius: 999px;
    background: rgba(255,255,255,0.14);
    border: 1px solid rgba(255,255,255,0.18);
    font-size: 12px;
    font-weight: 900;
    margin-bottom: 20px;
  }
  .cl-title {
    margin: 0;
    font-size: 50px;
    line-height: 1.08;
    font-weight: 900;
    letter-spacing: 0;
  }
  .cl-subtitle {
    margin: 18px auto 0;
    max-width: 500px;
    color: rgba(255,255,255,0.82);
    font-size: 15px;
    line-height: 1.7;
    font-weight: 700;
  }
  .cl-actions {
    margin-top: 28px;
    display: flex;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
  }
  .cl-primary-cta,
  .cl-secondary-cta {
    min-height: 48px;
    border-radius: 999px;
    padding: 0 24px;
    border: none;
    font-size: 13px;
    font-weight: 900;
    display: inline-flex;
    align-items: center;
    gap: 9px;
  }
  .cl-primary-cta {
    background: #FF176B;
    color: #fff;
    box-shadow: 0 16px 34px rgba(255,23,107,0.32);
  }
  .cl-secondary-cta {
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.54);
    color: #fff;
  }
  .cl-visual-zone {
    position: relative;
    min-height: 430px;
    margin-top: 42px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
  }
  .cl-team-illustration {
    width: min(680px, 100%);
    height: auto;
    display: block;
    margin: 0 auto;
    filter: drop-shadow(0 24px 34px rgba(26,25,80,0.22));
    position: relative;
    z-index: 1;
  }
  .cl-login-panel {
    background: rgba(255,255,255,0.96);
    color: #151236;
    border-radius: 30px;
    padding: 34px;
    box-shadow: 0 26px 70px rgba(17,18,48,0.20);
    border: 1px solid rgba(255,255,255,0.78);
    align-self: center;
  }
  .cl-login-icon {
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
  .cl-login-title {
    margin: 0;
    font-size: 28px;
    font-weight: 900;
    color: #151236;
  }
  .cl-login-subtitle {
    margin: 8px 0 26px;
    color: #7b7894;
    font-size: 14px;
    font-weight: 700;
    line-height: 1.55;
  }
  .cl-field-label {
    display: block;
    font-size: 12px;
    font-weight: 900;
    color: #6f6b8d;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }
  .cl-input-wrap {
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
  .cl-input {
    border: none;
    outline: none;
    background: transparent;
    width: 100%;
    font-size: 14px;
    color: #151236;
    font-weight: 500;
  }
  .cl-password-toggle {
    border: none;
    background: transparent;
    color: #7C4DFF;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 5px;
    border-radius: 10px;
    cursor: pointer;
    flex-shrink: 0;
  }
  .cl-password-toggle:hover {
    background: #f3f0ff;
  }
  .cl-error {
    color: #d63031;
    background: #fff1f1;
    border: 1px solid #ffd6d6;
    padding: 12px;
    border-radius: 14px;
    font-size: 13px;
    margin-bottom: 16px;
    font-weight: 700;
  }
  .cl-success {
    color: #047857;
    background: #ecfdf5;
    border: 1px solid #bbf7d0;
    padding: 12px;
    border-radius: 14px;
    font-size: 13px;
    margin-bottom: 16px;
    font-weight: 700;
    line-height: 1.45;
  }
  .cl-forgot-row {
    display: flex;
    justify-content: flex-end;
    margin: -4px 0 18px;
  }
  .cl-forgot-button {
    border: none;
    background: transparent;
    color: #6C5CE7;
    font-size: 12px;
    font-weight: 900;
    cursor: pointer;
    padding: 0;
  }
  .cl-forgot-button:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }
  .cl-login-button {
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
  .cl-login-button:disabled {
    cursor: not-allowed;
    opacity: 0.72;
  }
  @media (max-width: 960px) {
    .cl-nav-links { display: none; }
    .cl-hero { grid-template-columns: 1fr; padding-top: 38px; }
    .cl-login-panel { width: min(100%, 460px); justify-self: center; }
    .cl-title { font-size: 40px; }
    .cl-visual-zone { min-height: 390px; }
  }
  @media (max-width: 620px) {
    .cl-shell { padding: 22px 18px 0; }
    .cl-title { font-size: 34px; }
    .cl-visual-zone { min-height: 300px; margin-top: 24px; }
    .cl-login-panel { padding: 24px; border-radius: 24px; }
  }
`

export default function ClientLoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)
  const [error, setError] = useState('')
  const [resetMessage, setResetMessage] = useState('')

  const login = async () => {
    setLoading(true)
    setError('')
    setResetMessage('')

    const { data: loginData, error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setLoading(false)
      setError(error.message)
      return
    }

    const { data: client, error: clientError } = await supabase
      .from('clients')
      .select('id')
      .eq('user_id', loginData.user.id)
      .single()

    if (clientError || !client) {
      await supabase.auth.signOut()
      setLoading(false)
      setError('This account does not have access to the client dashboard.')
      return
    }

    setLoading(false)
    router.push('/client-dashboard')
  }

  const sendPasswordReset = async () => {
    setError('')
    setResetMessage('')

    if (!email.trim()) {
      setError('Please enter your email first, then click Forgot password.')
      return
    }

    setResetLoading(true)

    const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
      redirectTo: `${window.location.origin}/client-reset-password`,
    })

    setResetLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    setResetMessage('If this email exists, Supabase has sent a password reset link.')
  }

  return (
    <main className="cl-root">
      <style>{styles}</style>
      <div className="cl-shell">
        <nav className="cl-nav">
          <div className="cl-brand">
            <span className="cl-brand-mark" />
            <span>Bits3 Portal</span>
          </div>
          <div className="cl-nav-links">
            <span>Projects</span>
            <span>Milestones</span>
            <span>Support</span>
            <span>Artifacts</span>
            <span className="cl-nav-pill">Client Login</span>
          </div>
        </nav>

        <section className="cl-hero">
          <div>
            <div className="cl-copy">
              <div className="cl-kicker"><Sparkles size={15} /> Team workspace</div>
              <h1 className="cl-title">Your project is in good hands with us!</h1>
              <p className="cl-subtitle">
                Access project progress, deliverables, chats, support, files, and assigned tasks from one simple workspace.
              </p>
              <div className="cl-actions">
                <button className="cl-primary-cta" onClick={() => document.getElementById('client-email')?.focus()}>
                  Get Started <ArrowRight size={15} />
                </button>
                <button className="cl-secondary-cta" type="button">
                  View Workspace <span style={{ width: 8, height: 8, borderRadius: 999, background: '#fff' }} />
                </button>
              </div>
            </div>

          </div>

          <form
            className="cl-login-panel"
            onSubmit={(e) => {
              e.preventDefault()
              login()
            }}
          >
            <div className="cl-login-icon">
              <Lock size={24} />
            </div>
            <h2 className="cl-login-title">Welcome back</h2>
            <p className="cl-login-subtitle">Sign in to continue to your dashboard.</p>

            <label className="cl-field-label" htmlFor="client-email">Email</label>
            <div className="cl-input-wrap">
              <Mail size={18} color="#7C4DFF" />
              <input
                id="client-email"
                className="cl-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="client@example.com"
                type="email"
              />
            </div>

            <label className="cl-field-label" htmlFor="client-password">Password</label>
            <div className="cl-input-wrap">
              <Lock size={18} color="#7C4DFF" />
              <input
                id="client-password"
                className="cl-input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                type={showPassword ? 'text' : 'password'}
              />
              <button
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="cl-password-toggle"
                onClick={() => setShowPassword(value => !value)}
                type="button"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="cl-forgot-row">
              <button className="cl-forgot-button" disabled={resetLoading} onClick={sendPasswordReset} type="button">
                {resetLoading ? 'Sending reset email...' : 'Forgot password?'}
              </button>
            </div>

            {error && <div className="cl-error">{error}</div>}
            {resetMessage && <div className="cl-success">{resetMessage}</div>}

            <button className="cl-login-button" disabled={loading} type="submit">
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}
