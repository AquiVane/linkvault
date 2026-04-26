import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import AuthPage from './pages/AuthPage'
import Dashboard from './pages/Dashboard'
import SharedBoard from './pages/SharedBoard'

export default function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Check if it's a shared board URL
  const path = window.location.pathname
  const boardMatch = path.match(/^\/board\/(.+)/)
  if (boardMatch) return <SharedBoard token={boardMatch[1]} />

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d0d0d', color: '#555', fontFamily: 'sans-serif', fontSize: 14 }}>Cargando...</div>
  return user ? <Dashboard user={user} /> : <AuthPage />
}
