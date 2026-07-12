'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase/client'
import { useRouter } from 'next/navigation'
import { ArrowRight, Eye, EyeOff, Lock, Mail, Sparkles } from 'lucide-react'

const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@500;600;700;800;900&display=swap');

  .pm-login-root {
    min-height: 100vh;
    font-family: Inter, Arial, sans-serif;
    color: #ffffff;
    background:
      radial-gradient(circle at 74% 46%, rgba(18,61,255,0.13), transparent 27%),
      radial-gradient(circle at 84% 82%, rgba(0,163,255,0.08), transparent 28%),
      linear-gradient(180deg, #030303 0%, #000000 100%);
    position: relative;
    overflow: hidden;
  }

  .pm-login-root::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.035) 50%, transparent 100%),
      radial-gradient(circle at 50% 0%, rgba(255,255,255,0.08), transparent 34%);
    opacity: 0.55;
    z-index: 0;
  }

  .pm-login-root::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      linear-gradient(180deg, rgba(255,255,255,0.03), transparent 18%, transparent 74%, rgba(18,61,255,0.06)),
      radial-gradient(circle at 78% 50%, transparent 0%, rgba(0,0,0,0.54) 58%);
    z-index: 0;
  }

  .pm-login-shell {
    position: relative;
    z-index: 1;
    min-height: 100vh;
    max-width: 1320px;
    margin: 0 auto;
    padding: 20px 46px 42px;
    display: flex;
    flex-direction: column;
  }

  .pm-login-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 28px;
    width: min(100%, 930px);
    margin: 0 auto;
    padding: 8px 22px;
    border: 1px solid rgba(255,255,255,0.11);
    border-radius: 999px;
    background: rgba(12,12,12,0.86);
    box-shadow: 0 22px 54px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.06);
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(18px);
  }

  .pm-login-brand {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    font-weight: 900;
    letter-spacing: 0.01em;
  }

  .pm-login-brand-logo {
    width: 60px;
    height: auto;
    display: block;
    filter: brightness(0) invert(1) drop-shadow(0 0 18px rgba(255,255,255,0.15));
  }

  .pm-login-nav-links {
    display: flex;
    align-items: center;
    gap: 24px;
    font-size: 12px;
    font-weight: 800;
    color: rgba(255,255,255,0.58);
  }

  .pm-login-nav-pill {
    border: none;
    border-radius: 0;
    padding: 0;
    color: #fff;
    background: transparent;
    box-shadow: none;
  }

  .pm-login-hero {
    flex: 1;
    display: grid;
    grid-template-columns: minmax(0, 1.08fr) 400px;
    align-items: center;
    gap: 46px;
    padding: 42px 0 0;
  }

  .pm-login-stage {
    position: relative;
    min-height: 540px;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding-top: 0;
  }

  .pm-login-cube {
    display: none;
  }

  .pm-login-orbit {
    display: none;
  }

  .pm-login-watermark {
    position: absolute;
    right: -130px;
    top: 205px;
    width: 500px;
    opacity: 0.055;
    filter: brightness(0) invert(1);
    z-index: 0;
    pointer-events: none;
  }

  .pm-login-copy {
    position: relative;
    max-width: 620px;
    padding: 0;
    border: none;
    border-radius: 0;
    background: transparent;
    backdrop-filter: none;
    -webkit-backdrop-filter: none;
    box-shadow: none;
    z-index: 1;
  }

  .pm-login-kicker {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    padding: 0;
    border-radius: 0;
    background: transparent;
    border: none;
    color: #1768ff;
    font-size: 15px;
    font-weight: 900;
    margin-bottom: 22px;
  }

  .pm-login-title {
    margin: 0;
    font-size: clamp(48px, 5.7vw, 84px);
    line-height: 0.96;
    font-weight: 900;
    letter-spacing: -0.055em;
    max-width: 650px;
  }

  .pm-login-subtitle {
    margin: 24px 0 0;
    max-width: 540px;
    color: rgba(255,255,255,0.66);
    font-size: 19px;
    line-height: 1.45;
    font-weight: 800;
    letter-spacing: -0.02em;
  }

  .pm-login-actions {
    margin-top: 28px;
    display: flex;
    gap: 14px;
    flex-wrap: wrap;
  }

  .pm-login-chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 42px;
    border-radius: 999px;
    padding: 0 18px;
    color: rgba(255,255,255,0.82);
    background: rgba(255,255,255,0.055);
    border: 1px solid rgba(255,255,255,0.12);
    font-size: 12px;
    font-weight: 900;
  }

  .pm-login-panel {
    background:
      linear-gradient(160deg, #2f6edf 0%, #102441 100%);
    color: #ffffff;
    border-radius: 24px;
    padding: 36px 32px;
    box-shadow: 0 38px 90px rgba(0,0,0,0.36), inset 0 1px 0 rgba(255,255,255,0.14);
    border: 1px solid rgba(255,255,255,0.12);
    align-self: center;
    width: 100%;
    position: relative;
    overflow: hidden;
  }

  .pm-login-panel::before {
    content: none;
  }

  .pm-login-icon {
    width: 72px;
    height: 44px;
    border-radius: 0;
    background: transparent;
    border: none;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    margin-bottom: 24px;
    box-shadow: none;
  }

  .pm-login-icon img {
    width: 74px;
    height: auto;
    object-fit: contain;
    filter: brightness(0) invert(1);
  }

  .pm-login-panel-title {
    margin: 0;
    font-size: 34px;
    line-height: 1.02;
    font-weight: 900;
    color: #fff;
    letter-spacing: -0.045em;
  }

  .pm-login-panel-subtitle {
    margin: 10px 0 34px;
    color: rgba(255,255,255,0.70);
    font-size: 15px;
    font-weight: 700;
    line-height: 1.55;
  }

  .pm-login-field-label {
    display: block;
    font-size: 12px;
    font-weight: 900;
    color: rgba(255,255,255,0.70);
    margin-bottom: 10px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .pm-login-input-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
    border: 1px solid rgba(255,255,255,0.18);
    border-radius: 14px;
    padding: 0 16px;
    height: 52px;
    margin-bottom: 15px;
    background: rgba(255,255,255,0.10);
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  }

  .pm-login-input-wrap:focus-within {
    border-color: rgba(255,255,255,0.54);
    box-shadow: 0 0 0 4px rgba(255,255,255,0.10);
    background: rgba(255,255,255,0.15);
  }

  .pm-login-input {
    appearance: none;
    -webkit-appearance: none;
    border: 0;
    border-bottom: 0;
    border-radius: 0;
    outline: none;
    box-shadow: none;
    background: transparent;
    width: 100%;
    min-width: 0;
    height: 100%;
    font-size: 14px;
    color: #fff;
    font-weight: 500;
  }

  .pm-login-input:focus,
  .pm-login-input:focus-visible {
    border: 0;
    outline: none;
    box-shadow: none;
  }

  .pm-login-input::placeholder {
    color: rgba(255,255,255,0.48);
  }

  .pm-login-input:-webkit-autofill,
  .pm-login-input:-webkit-autofill:hover,
  .pm-login-input:-webkit-autofill:focus,
  .pm-login-input:-webkit-autofill:active {
    -webkit-text-fill-color: #ffffff;
    caret-color: #ffffff;
    border: 0;
    box-shadow: 0 0 0 1000px transparent inset;
    -webkit-box-shadow: 0 0 0 1000px transparent inset;
    transition: background-color 9999s ease-out, color 9999s ease-out;
  }

  .pm-login-input-wrap:has(.pm-login-input:-webkit-autofill) {
    background: rgba(255,255,255,0.10);
  }

  .pm-password-toggle {
    border: none;
    background: transparent;
    color: rgba(255,255,255,0.82);
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 5px;
    border-radius: 10px;
    cursor: pointer;
    flex-shrink: 0;
  }

  .pm-password-toggle:hover {
    background: rgba(255,255,255,0.12);
  }

  .pm-login-forgot-row {
    display: flex;
    justify-content: flex-end;
    margin: -4px 0 18px;
  }

  .pm-login-forgot-button {
    border: none;
    background: transparent;
    color: rgba(255,255,255,0.86);
    font-size: 13px;
    font-weight: 900;
    cursor: pointer;
    padding: 0;
  }

  .pm-login-forgot-button:disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }

  .pm-login-error {
    color: #d63031;
    background: #fff1f1;
    border: 1px solid #ffd6d6;
    padding: 12px;
    border-radius: 14px;
    font-size: 13px;
    margin-bottom: 16px;
    font-weight: 700;
  }

  .pm-login-success {
    color: #70f0ae;
    background: rgba(57,217,138,0.12);
    border: 1px solid rgba(57,217,138,0.26);
    padding: 12px;
    border-radius: 14px;
    font-size: 13px;
    margin-bottom: 16px;
    font-weight: 700;
    line-height: 1.45;
  }

  .pm-login-button {
    width: 100%;
    height: 52px;
    border: none;
    border-radius: 999px;
    background: #ffffff;
    color: #123DFF;
    font-size: 15px;
    font-weight: 900;
    cursor: pointer;
    box-shadow: 0 18px 40px rgba(0,0,0,0.18);
  }

  .pm-login-button:disabled {
    cursor: not-allowed;
    opacity: 0.72;
  }

  @media (max-width: 960px) {
    .pm-login-shell { padding: 20px 20px 38px; }
    .pm-login-nav { width: 100%; }
    .pm-login-nav-links { display: none; }
    .pm-login-hero { grid-template-columns: 1fr; padding-top: 44px; gap: 32px; }
    .pm-login-panel { width: min(100%, 460px); justify-self: center; }
    .pm-login-title { font-size: 56px; }
    .pm-login-subtitle { font-size: 18px; }
    .pm-login-stage { min-height: 520px; }
    .pm-login-watermark,
    .pm-login-cube { display: none; }
  }

  @media (max-width: 620px) {
    .pm-login-title { font-size: 44px; }
    .pm-login-subtitle { font-size: 16px; }
    .pm-login-panel { padding: 24px; border-radius: 24px; }
    .pm-login-stage { min-height: auto; }
    .pm-login-nav { padding: 18px 22px; }
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
    <main className="pm-login-root">
      <style>{styles}</style>
      <div className="pm-login-shell">
        <nav className="pm-login-nav">
          <div className="pm-login-brand">
            <img className="pm-login-brand-logo" src="/bits3-logo.png" alt="Bits3" />
          </div>
          <div className="pm-login-nav-links">
            <span>Projects</span>
            <span>Milestones</span>
            <span>Support</span>
            <span>Artifacts</span>
            <span className="pm-login-nav-pill">Client Login</span>
          </div>
        </nav>

        <section className="pm-login-hero">
          <div className="pm-login-stage">
            <img className="pm-login-watermark" src="/bits3-logo.png" alt="" />
            <div className="pm-login-copy">
              <div className="pm-login-kicker"><Sparkles size={15} /> Client workspace</div>
              <h1 className="pm-login-title">Track your project from the blue core.</h1>
              <p className="pm-login-subtitle">
                Access project progress, deliverables, chats, support, files, and assigned tasks from one simple workspace.
              </p>
              <div className="pm-login-actions">
                <span className="pm-login-chip">Client delivery hub <ArrowRight size={14} /></span>
                <span className="pm-login-chip">Secure client access</span>
              </div>
            </div>
          </div>

          <form
            className="pm-login-panel"
            onSubmit={(e) => {
              e.preventDefault()
              login()
            }}
          >
            <div className="pm-login-icon">
              <img src="/bits3-logo.png" alt="" />
            </div>
            <h2 className="pm-login-panel-title">Client Portal</h2>
            <p className="pm-login-panel-subtitle">Sign in to continue to your client dashboard.</p>

            <label className="pm-login-field-label" htmlFor="client-email">Email</label>
            <div className="pm-login-input-wrap">
              <Mail size={18} color="#8FACFF" />
              <input
                id="client-email"
                className="pm-login-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="client@example.com"
                type="email"
              />
            </div>

            <label className="pm-login-field-label" htmlFor="client-password">Password</label>
            <div className="pm-login-input-wrap">
              <Lock size={18} color="#8FACFF" />
              <input
                id="client-password"
                className="pm-login-input"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Enter your password"
                type={showPassword ? 'text' : 'password'}
              />
              <button
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="pm-password-toggle"
                onClick={() => setShowPassword(value => !value)}
                type="button"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="pm-login-forgot-row">
              <button className="pm-login-forgot-button" disabled={resetLoading} onClick={sendPasswordReset} type="button">
                {resetLoading ? 'Sending reset email...' : 'Forgot password?'}
              </button>
            </div>

            {error && <div className="pm-login-error">{error}</div>}
            {resetMessage && <div className="pm-login-success">{resetMessage}</div>}

            <button className="pm-login-button" disabled={loading} type="submit">
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}
