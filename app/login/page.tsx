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
      radial-gradient(circle at 20% 12%, rgba(18,61,255,0.12), transparent 22%),
      radial-gradient(circle at 82% 16%, rgba(0,123,255,0.08), transparent 26%),
      radial-gradient(circle at 50% 105%, rgba(18,61,255,0.07), transparent 36%),
      linear-gradient(135deg, #000104 0%, #02040c 44%, #000205 100%);
    position: relative;
    overflow: hidden;
  }

  .pm-login-root::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      linear-gradient(rgba(255,255,255,0.020) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.020) 1px, transparent 1px);
    background-size: 72px 72px;
    mask-image: radial-gradient(circle at 50% 34%, black, transparent 68%);
    opacity: 0.36;
    z-index: 0;
  }

  .pm-login-root::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
    background:
      linear-gradient(180deg, rgba(255,255,255,0.024), transparent 18%, transparent 78%, rgba(18,61,255,0.045)),
      radial-gradient(circle at 50% 42%, transparent 0%, rgba(0,0,0,0.46) 72%);
    z-index: 0;
  }

  .pm-login-shell {
    position: relative;
    z-index: 1;
    min-height: 100vh;
    max-width: 1240px;
    margin: 0 auto;
    padding: 30px 32px;
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
    gap: 12px;
    font-weight: 900;
    letter-spacing: 0.01em;
  }

  .pm-login-brand-logo {
    width: 118px;
    height: auto;
    display: block;
    filter: drop-shadow(0 0 22px rgba(18,61,255,0.45));
  }

  .pm-login-nav-links {
    display: flex;
    align-items: center;
    gap: 24px;
    font-size: 13px;
    font-weight: 800;
    color: rgba(226,232,255,0.70);
  }

  .pm-login-nav-pill {
    border: 1px solid rgba(45,98,255,0.55);
    border-radius: 999px;
    padding: 12px 22px;
    color: #fff;
    background: rgba(18,61,255,0.13);
    box-shadow: inset 0 0 24px rgba(18,61,255,0.18);
  }

  .pm-login-hero {
    flex: 1;
    display: grid;
    grid-template-columns: minmax(0, 1.08fr) 430px;
    align-items: end;
    gap: 44px;
    padding: 0 0 210px;
  }

  .pm-login-stage {
    position: relative;
    min-height: 610px;
    display: flex;
    align-items: flex-end;
    justify-content: center;
    padding-top: 0;
    perspective: 1200px;
  }

  .pm-login-cube {
    position: absolute;
    top: -120px;
    left: 50%;
    width: min(66%, 500px);
    max-height: 500px;
    object-fit: contain;
    filter: drop-shadow(0 34px 90px rgba(18,61,255,0.34));
    animation: pmCubeFloat 7s ease-in-out infinite;
    z-index: 0;
    transform-style: preserve-3d;
    will-change: transform;
  }

  .pm-login-orbit {
    display: none;
  }

  .pm-login-copy {
    position: relative;
    left: auto;
    bottom: auto;
    max-width: 620px;
    padding: 22px 24px;
    border: 1px solid rgba(255,255,255,0.14);
    border-radius: 28px;
    background:
      linear-gradient(145deg, rgba(255,255,255,0.085), rgba(255,255,255,0.025)),
      rgba(3,6,16,0.50);
    backdrop-filter: blur(28px) saturate(132%);
    -webkit-backdrop-filter: blur(28px) saturate(132%);
    box-shadow:
      0 28px 80px rgba(0,0,0,0.28),
      inset 0 1px 0 rgba(255,255,255,0.16),
      inset 0 -1px 0 rgba(255,255,255,0.05);
    margin-top: 0;
    z-index: 1;
  }

  .pm-login-kicker {
    display: inline-flex;
    align-items: center;
    gap: 12px;
    padding: 9px 13px;
    border-radius: 999px;
    background: rgba(18,61,255,0.16);
    border: 1px solid rgba(45,98,255,0.38);
    color: #AFC4FF;
    font-size: 12px;
    font-weight: 900;
    margin-bottom: 16px;
  }

  .pm-login-title {
    margin: 0;
    font-size: 54px;
    line-height: 0.98;
    font-weight: 900;
    letter-spacing: 0;
    max-width: 580px;
  }

  .pm-login-subtitle {
    margin: 16px 0 0;
    max-width: 540px;
    color: rgba(226,232,255,0.72);
    font-size: 15px;
    line-height: 1.7;
    font-weight: 700;
  }

  .pm-login-actions {
    margin-top: 20px;
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .pm-login-chip {
    display: inline-flex;
    align-items: center;
    gap: 8px;
    min-height: 38px;
    border-radius: 999px;
    padding: 0 14px;
    color: #C7D5FF;
    background: rgba(255,255,255,0.055);
    border: 1px solid rgba(255,255,255,0.10);
    font-size: 12px;
    font-weight: 900;
  }

  .pm-login-panel {
    background:
      linear-gradient(180deg, rgba(8,13,28,0.84), rgba(3,6,15,0.96)),
      rgba(2,4,10,0.86);
    color: #ffffff;
    border-radius: 32px;
    padding: 34px;
    box-shadow: 0 28px 90px rgba(0,0,0,0.42), inset 0 1px 0 rgba(255,255,255,0.10);
    border: 1px solid rgba(79,120,255,0.26);
    align-self: end;
    width: 100%;
    position: relative;
    overflow: hidden;
  }

  .pm-login-panel::before {
    content: '';
    position: absolute;
    left: 22px;
    right: 22px;
    top: 0;
    height: 3px;
    border-radius: 999px;
    background: linear-gradient(90deg, transparent, #123DFF, #00A3FF, transparent);
  }

  .pm-login-icon {
    width: 76px;
    height: 76px;
    border-radius: 22px;
    background: rgba(18,61,255,0.12);
    border: 1px solid rgba(45,98,255,0.24);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 22px;
    box-shadow: 0 18px 48px rgba(18,61,255,0.18);
  }

  .pm-login-icon img {
    width: 62px;
    height: 62px;
    object-fit: contain;
  }

  .pm-login-panel-title {
    margin: 0;
    font-size: 30px;
    font-weight: 900;
    color: #fff;
  }

  .pm-login-panel-subtitle {
    margin: 8px 0 26px;
    color: rgba(226,232,255,0.62);
    font-size: 14px;
    font-weight: 700;
    line-height: 1.55;
  }

  .pm-login-field-label {
    display: block;
    font-size: 12px;
    font-weight: 900;
    color: rgba(226,232,255,0.64);
    margin-bottom: 8px;
    text-transform: uppercase;
    letter-spacing: 0.04em;
  }

  .pm-login-input-wrap {
    display: flex;
    align-items: center;
    gap: 10px;
    border: 1px solid rgba(91,124,255,0.20);
    border-radius: 18px;
    padding: 0 14px;
    height: 54px;
    margin-bottom: 16px;
    background: rgba(255,255,255,0.055);
    transition: border-color 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
  }

  .pm-login-input-wrap:focus-within {
    border-color: rgba(35,89,255,0.72);
    box-shadow: 0 0 0 4px rgba(18,61,255,0.14);
    background: rgba(255,255,255,0.075);
  }

  .pm-login-input {
    border: none;
    outline: none;
    background: transparent;
    width: 100%;
    font-size: 14px;
    color: #fff;
    font-weight: 500;
  }

  .pm-login-input::placeholder {
    color: rgba(226,232,255,0.34);
  }

  .pm-password-toggle {
    border: none;
    background: transparent;
    color: #8FACFF;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    padding: 5px;
    border-radius: 10px;
    cursor: pointer;
    flex-shrink: 0;
  }

  .pm-password-toggle:hover {
    background: rgba(255,255,255,0.08);
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
    background: linear-gradient(135deg, #123DFF, #006DFF);
    color: #fff;
    font-size: 15px;
    font-weight: 900;
    cursor: pointer;
    box-shadow: 0 18px 40px rgba(18,61,255,0.36);
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
    .pm-login-stage { min-height: 560px; }
    .pm-login-copy { position: relative; left: auto; bottom: auto; margin-top: -60px; }
  }

  @media (max-width: 620px) {
    .pm-login-shell { padding: 22px 18px 0; }
    .pm-login-title { font-size: 34px; }
    .pm-login-panel { padding: 24px; border-radius: 24px; }
    .pm-login-stage { min-height: auto; display: grid; gap: 18px; }
    .pm-login-cube { width: 86%; }
    .pm-login-copy { margin-top: 0; padding: 18px; }
  }

  @keyframes pmCubeFloat {
    0%, 100% { transform: translateX(-50%) translateY(0) rotate(-1deg); }
    50% { transform: translateX(-50%) translateY(-16px) rotate(1deg); }
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
            <img className="pm-login-brand-logo" src="/bits3-logo.png" alt="Bits3" />
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
          <div className="pm-login-stage">
            <div className="pm-login-orbit" />
            <img className="pm-login-cube" src="/bits3-login-cube.png" alt="Bits3 operations cube" />
            <div className="pm-login-copy">
              <div className="pm-login-kicker"><Sparkles size={15} /> Project command system</div>
              <h1 className="pm-login-title">Control delivery from the blue core.</h1>
              <p className="pm-login-subtitle">
                A secure Bits3 workspace for clients, projects, milestones, payments, chats, artifacts, meetings, and support operations.
              </p>
              <div className="pm-login-actions">
                <span className="pm-login-chip">Live delivery hub <ArrowRight size={14} /></span>
                <span className="pm-login-chip">PM access only</span>
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
            <h2 className="pm-login-panel-title">Project Manager Portal</h2>
            <p className="pm-login-panel-subtitle">Sign in to access your project manager dashboard.</p>

            <label className="pm-login-field-label" htmlFor="pm-email">Email / Team Username</label>
            <div className="pm-login-input-wrap">
              <Mail size={18} color="#8FACFF" />
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
              <Lock size={18} color="#8FACFF" />
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
