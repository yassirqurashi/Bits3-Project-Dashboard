'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Mail, Lock, LayoutDashboard, KanbanSquare, CalendarCheck, Users } from 'lucide-react'

export default function LoginPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const login = async () => {
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    setLoading(false)

    if (error) {
      setError(error.message)
      return
    }

    router.push('/dashboard')
  }

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f7f5ff 0%, #ffffff 45%, #eee9ff 100%)',
      fontFamily: 'Inter, Arial, sans-serif',
      padding: '24px',
      position: 'relative',
      overflow: 'hidden',
    }}>
      <div style={{
        position: 'absolute',
        width: 360,
        height: 360,
        borderRadius: '50%',
        background: 'rgba(124, 77, 255, 0.16)',
        top: -120,
        left: -100,
        filter: 'blur(10px)',
      }} />

      <div style={{
        position: 'absolute',
        width: 420,
        height: 420,
        borderRadius: '50%',
        background: 'rgba(108, 92, 231, 0.14)',
        bottom: -160,
        right: -120,
        filter: 'blur(10px)',
      }} />

      <section style={{
        width: '100%',
        maxWidth: 980,
        display: 'grid',
        gridTemplateColumns: '1.05fr 0.95fr',
        background: 'rgba(255,255,255,0.78)',
        backdropFilter: 'blur(18px)',
        borderRadius: 28,
        overflow: 'hidden',
        boxShadow: '0 30px 80px rgba(80, 65, 180, 0.16)',
        border: '1px solid rgba(120,100,220,0.16)',
        position: 'relative',
        zIndex: 2,
      }}>
        <div style={{
          padding: 44,
          background: 'linear-gradient(135deg, #6C5CE7, #8E6CFF)',
          color: '#fff',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            width: 58,
            height: 58,
            borderRadius: 18,
            background: 'rgba(255,255,255,0.18)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 28,
          }}>
            <LayoutDashboard size={30} />
          </div>

          <h1 style={{
            fontSize: 34,
            lineHeight: 1.1,
            margin: 0,
            fontWeight: 800,
            letterSpacing: '-0.04em',
          }}>
            Project Manager Dashboard
          </h1>

          <p style={{
            marginTop: 16,
            fontSize: 15,
            lineHeight: 1.7,
            opacity: 0.86,
            maxWidth: 420,
          }}>
            Manage clients, projects, milestones, deliverables, and progress from one clean workspace.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: 14,
            marginTop: 34,
          }}>
            {[
              { icon: <KanbanSquare size={22} />, title: 'Agile Boards' },
              { icon: <CalendarCheck size={22} />, title: 'Milestones' },
              { icon: <Users size={22} />, title: 'Clients' },
              { icon: <LayoutDashboard size={22} />, title: 'Reports' },
            ].map((item, i) => (
              <div key={i} style={{
                padding: 16,
                borderRadius: 18,
                background: 'rgba(255,255,255,0.14)',
                border: '1px solid rgba(255,255,255,0.18)',
              }}>
                <div>{item.icon}</div>
                <div style={{ marginTop: 10, fontWeight: 700, fontSize: 14 }}>{item.title}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{
          padding: 46,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          background: '#fff',
        }}>
          <div style={{ marginBottom: 28 }}>
            <h2 style={{
              margin: 0,
              fontSize: 28,
              color: '#151236',
              fontWeight: 800,
              letterSpacing: '-0.03em',
            }}>
              Welcome back
            </h2>
            <p style={{
              marginTop: 8,
              color: '#7b7894',
              fontSize: 15,
            }}>
              Sign in to access your admin dashboard
            </p>
          </div>

          <label style={{ fontSize: 13, fontWeight: 700, color: '#6f6b8d', marginBottom: 8 }}>
            Email
          </label>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            border: '1px solid #ded9ff',
            borderRadius: 16,
            padding: '0 14px',
            height: 54,
            marginBottom: 18,
            background: '#fbfaff',
          }}>
            <Mail size={18} color="#7C4DFF" />
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="admin@example.com"
              type="email"
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                width: '100%',
                fontSize: 15,
              }}
            />
          </div>

          <label style={{ fontSize: 13, fontWeight: 700, color: '#6f6b8d', marginBottom: 8 }}>
            Password
          </label>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            border: '1px solid #ded9ff',
            borderRadius: 16,
            padding: '0 14px',
            height: 54,
            marginBottom: 18,
            background: '#fbfaff',
          }}>
            <Lock size={18} color="#7C4DFF" />
            <input
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') login()
              }}
              placeholder="Enter your password"
              type="password"
              style={{
                border: 'none',
                outline: 'none',
                background: 'transparent',
                width: '100%',
                fontSize: 15,
              }}
            />
          </div>

          {error && (
            <div style={{
              color: '#d63031',
              background: '#fff1f1',
              border: '1px solid #ffd6d6',
              padding: 12,
              borderRadius: 14,
              fontSize: 13,
              marginBottom: 16,
            }}>
              {error}
            </div>
          )}

          <button
            onClick={login}
            disabled={loading}
            style={{
              height: 54,
              border: 'none',
              borderRadius: 16,
              background: 'linear-gradient(135deg, #6C5CE7, #8E6CFF)',
              color: '#fff',
              fontSize: 15,
              fontWeight: 800,
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 14px 30px rgba(108,92,231,0.28)',
            }}
          >
            {loading ? 'Signing in...' : 'Login'}
          </button>
        </div>
      </section>
    </main>
  )
}
