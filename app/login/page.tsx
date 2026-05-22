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
      radial-gradient(circle at 18% 18%, rgba(255,255,255,0.18), transparent 24%),
      radial-gradient(circle at 82% 16%, rgba(0,220,255,0.14), transparent 25%),
      linear-gradient(145deg, #7C3DFF 0%, #6547F4 48%, #4158F3 100%);
    position: relative;
    overflow: hidden;
  }

  .pm-login-root::after {
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

  .pm-login-shell {
    position: relative;
    z-index: 1;
    min-height: 100vh;
    max-width: 1180px;
    margin: 0 auto;
    padding: 28px 32px 0;
    display: flex;
    flex-direction: column;
  }

  .pm-login-nav {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;
  }

  .pm-login-brand {
    display: inline-flex;
    align-items: center;
    gap: 10px;
    font-weight: 900;
    letter-spacing: 0.01em;
  }

  .pm-login-brand-mark {
    width: 30px;
    height: 30px;
    border-radius: 999px;
    background: conic-gradient(from 140deg, #39E9D2, #FFD166, #FF4D8D, #7C3DFF, #39E9D2);
    box-shadow: 0 10px 26px rgba(0,0,0,0.12);
  }

  .pm-login-nav-links {
    display: flex;
    align-items: center;
    gap: 28px;
    font-size: 13px;
    font-weight: 800;
    color: rgba(255,255,255,0.78);
  }

  .pm-login-nav-pill {
    border: 1px solid rgba(255,255,255,0.62);
    border-radius: 999px;
    padding: 12px 22px;
    color: #fff;
  }

  .pm-login-hero {
    flex: 1;
    display: grid;
    grid-template-columns: minmax(0, 1fr) 390px;
    align-items: center;
    gap: 34px;
    padding: 52px 0 76px;
  }

  .pm-login-copy {
    text-align: center;
    max-width: 690px;
    margin: 0 auto;
  }

  .pm-login-kicker {
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

  .pm-login-title {
    margin: 0;
    font-size: 50px;
    line-height: 1.08;
    font-weight: 900;
    letter-spacing: 0;
  }

  .pm-login-subtitle {
    margin: 18px auto 0;
    max-width: 520px;
    color: rgba(255,255,255,0.82);
    font-size: 15px;
    line-height: 1.7;
    font-weight: 700;
  }

  .pm-login-actions {
    margin-top: 28px;
    display: flex;
    justify-content: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  .pm-login-primary-cta,
  .pm-login-secondary-cta {
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

  .pm-login-primary-cta {
    background: #FF176B;
    color: #fff;
    box-shadow: 0 16px 34px rgba(255,23,107,0.32);
  }

  .pm-login-secondary-cta {
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.54);
    color: #fff;
  }

  .pm-login-panel {
    background: rgba(255,255,255,0.96);
    color: #151236;
    border-radius: 30px;
    padding: 34px;
    box-shadow: 0 26px 70px rgba(17,18,48,0.20);
    border: 1px solid rgba(255,255,255,0.78);
    align-self: center;
  }

  .pm-login-icon {
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

  .pm-login-panel-title {
    margin: 0;
    font-size: 28px;
    font-weight: 900;
    color: #151236;
  }

  .pm-login-panel-subtitle {
    margin: 8px 0 26px;
    color: #7b7894;
    font-size: 14px;
    font-weight: 700;
    line-height: 1.55;
  }

  .pm-login-field-label {
    display: block;
    font-size: 12px;
    font-weight: 900;
    color: #6f6b8d;
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .pm-login-input-wrap {
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

  .pm-login-input {
    border: none;
    outline: none;
    background: transparent;
    width: 100%;
    font-size: 14px;
    color: #151236;
    font-weight: 500;
  }

  .pm-password-toggle {
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

  .pm-password-toggle:hover {
    background: #f3f0ff;
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

  .pm-login-button {
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

  .pm-login-button:disabled {
    cursor: not-allowed;
    opacity: 0.72;
  }

  @media (max-width: 960px) {
    .pm-login-nav-links { display: none; }
    .pm-login-hero { grid-template-columns: 1fr; padding-top: 38px; }
    .pm-login-panel { width: min(100%, 460px); justify-self: center; }
    .pm-login-title { font-size: 40px; }
  }

  @media (max-width: 620px) {
    .pm-login-shell { padding: 22px 18px 0; }
    .pm-login-title { font-size: 34px; }
    .pm-login-panel { padding: 24px; border-radius: 24px; }
  }
`

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const login = async () => {
    setLoading(true)
    setError('')

    const { data: loginData, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      const { data: teamMember } = await supabase
        .from('team_members')
        .select('*')
        .eq('username', email.trim())
        .single()

      if (teamMember && String(teamMember.password || '').trim() === password.trim()) {
        await supabase.auth.signOut()
        window.localStorage.setItem('pm-team-member-id', teamMember.id)
        setLoading(false)
        router.push('/dashboard')
        return
      }

      setLoading(false)
      setError(error.message)
      return
    }

    const user = loginData.user
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'pm') {
      await supabase.auth.signOut()
      setLoading(false)
      setError('This account does not have access to the admin dashboard.')
      return
    }

    setLoading(false)
    window.localStorage.removeItem('pm-team-member-id')
    router.push('/dashboard')
  }

  return (
    <main className="pm-login-root">
      <style>{styles}</style>
      <div className="pm-login-shell">
        <nav className="pm-login-nav">
          <div className="pm-login-brand">
            <span className="pm-login-brand-mark" />
            <span>Bits3 PM Portal</span>
          </div>
          <div className="pm-login-nav-links">
            <span>Clients</span>
            <span>Projects</span>
            <span>Delivery</span>
            <span>Support</span>
            <span className="pm-login-nav-pill">PM Login</span>
          </div>
        </nav>

        <section className="pm-login-hero">
          <div className="pm-login-copy">
            <div className="pm-login-kicker"><Sparkles size={15} /> Project manager workspace</div>
            <h1 className="pm-login-title">Run every client project from one clean dashboard.</h1>
            <p className="pm-login-subtitle">
              Manage clients, milestones, deliverables, payments, support contracts, meetings, and project updates in one place.
            </p>
            <div className="pm-login-actions">
              <button className="pm-login-primary-cta" onClick={() => document.getElementById('pm-email')?.focus()} type="button">
                Start Managing <ArrowRight size={15} />
              </button>
              <button className="pm-login-secondary-cta" type="button">
                PM Workspace <span style={{ width: 8, height: 8, borderRadius: 999, background: '#fff' }} />
              </button>
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
              <Lock size={24} />
            </div>
            <h2 className="pm-login-panel-title">Welcome back</h2>
            <p className="pm-login-panel-subtitle">Sign in to access your project manager dashboard.</p>

            <label className="pm-login-field-label" htmlFor="pm-email">Email / Team Username</label>
            <div className="pm-login-input-wrap">
              <Mail size={18} color="#7C4DFF" />
              <input
                id="pm-email"
                className="pm-login-input"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="pm@example.com"
                type="text"
              />
            </div>

            <label className="pm-login-field-label" htmlFor="pm-password">Password</label>
            <div className="pm-login-input-wrap">
              <Lock size={18} color="#7C4DFF" />
              <input
                id="pm-password"
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

            {error && <div className="pm-login-error">{error}</div>}

            <button className="pm-login-button" disabled={loading} type="submit">
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>
        </section>
      </div>
    </main>
  )
}
