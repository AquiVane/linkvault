import { useState } from 'react'
import { supabase } from '../lib/supabase'

export default function AuthPage() {
  const [mode, setMode] = useState('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  const handleSubmit = async () => {
    setLoading(true)
    setError('')
    setMessage('')
    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setError('Email o contraseña incorrectos.')
    } else {
      const { error } = await supabase.auth.signUp({ email, password })
      if (error) setError(error.message)
      else setMessage('¡Cuenta creada! Revisá tu email para confirmar.')
    }
    setLoading(false)
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0d0d0d', fontFamily: "'DM Sans', sans-serif"
    }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Space+Grotesk:wght@700&display=swap" rel="stylesheet" />

      <div style={{ width: 380, padding: '48px 40px', background: '#161616', borderRadius: 20, border: '1px solid #2a2a2a' }}>
        <div style={{ textAlign: 'center', marginBottom: 36 }}>
          <div style={{ fontSize: 32, marginBottom: 8 }}>🔖</div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", color: '#fff', fontSize: 26, fontWeight: 700, margin: 0 }}>LinkVault</h1>
          <p style={{ color: '#666', fontSize: 14, marginTop: 6 }}>Tus links, organizados por fin.</p>
        </div>

        <div style={{ display: 'flex', background: '#1e1e1e', borderRadius: 10, padding: 4, marginBottom: 28 }}>
          {['login', 'register'].map(m => (
            <button key={m} onClick={() => { setMode(m); setError(''); setMessage('') }} style={{
              flex: 1, padding: '8px 0', borderRadius: 7, border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 500,
              background: mode === m ? '#7c6ef7' : 'transparent',
              color: mode === m ? '#fff' : '#666',
              transition: 'all 0.2s'
            }}>
              {m === 'login' ? 'Entrar' : 'Registrarse'}
            </button>
          ))}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <input
            type="email" placeholder="tu@email.com" value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            style={{
              padding: '12px 16px', borderRadius: 10, border: '1px solid #2a2a2a',
              background: '#1e1e1e', color: '#fff', fontSize: 14, outline: 'none',
              fontFamily: "'DM Sans', sans-serif"
            }}
          />
          <input
            type="password" placeholder="Contraseña" value={password}
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSubmit()}
            style={{
              padding: '12px 16px', borderRadius: 10, border: '1px solid #2a2a2a',
              background: '#1e1e1e', color: '#fff', fontSize: 14, outline: 'none',
              fontFamily: "'DM Sans', sans-serif"
            }}
          />
        </div>

        {error && <p style={{ color: '#f87171', fontSize: 13, marginTop: 12, textAlign: 'center' }}>{error}</p>}
        {message && <p style={{ color: '#6ee7b7', fontSize: 13, marginTop: 12, textAlign: 'center' }}>{message}</p>}

        <button onClick={handleSubmit} disabled={loading} style={{
          width: '100%', marginTop: 20, padding: '13px 0', borderRadius: 10,
          background: loading ? '#3d3a6e' : '#7c6ef7', color: '#fff', border: 'none',
          fontSize: 15, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer',
          fontFamily: "'DM Sans', sans-serif", transition: 'background 0.2s'
        }}>
          {loading ? 'Cargando...' : mode === 'login' ? 'Entrar' : 'Crear cuenta'}
        </button>
      </div>
    </div>
  )
}
