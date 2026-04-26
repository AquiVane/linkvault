import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { detectSource, getDomain } from '../lib/utils'

const CATEGORY_COLORS = {
  'Redes sociales': '#E1306C', 'Google Ads': '#4285F4', 'Google Analytics': '#E37400',
  'Drive / Docs': '#4285F4', 'Canva': '#00C4CC', 'Sitio web': '#0C6EFC',
  'Agente IA': '#7c6ef7', 'Claude': '#7c6ef7', 'General': '#888'
}

export default function SharedBoard({ token }) {
  const [board, setBoard] = useState(null)
  const [links, setLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    const fetch = async () => {
      const { data: boardData } = await supabase.from('client_boards').select('*').eq('share_token', token).single()
      if (!boardData) { setNotFound(true); setLoading(false); return }
      setBoard(boardData)
      const { data: linksData } = await supabase.from('board_links').select('*').eq('board_id', boardData.id).order('category').order('created_at')
      setLinks(linksData || [])
      setLoading(false)
    }
    fetch()
  }, [token])

  if (loading) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d0d0d', color: '#555', fontFamily: 'sans-serif' }}>Cargando...</div>
  if (notFound) return <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0d0d0d', color: '#555', fontFamily: 'sans-serif', flexDirection: 'column', gap: 12 }}><div style={{ fontSize: 48 }}>🔒</div><p>Tablero no encontrado.</p></div>

  const categories = [...new Set(links.map(l => l.category))]

  return (
    <div style={{ minHeight: '100vh', background: '#0d0d0d', fontFamily: "'DM Sans', sans-serif", color: '#e5e5e5' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Space+Grotesk:wght@700&display=swap" rel="stylesheet" />

      <div style={{ maxWidth: 900, margin: '0 auto', padding: '48px 24px' }}>
        <div style={{ marginBottom: 40, textAlign: 'center' }}>
          <div style={{ fontSize: 13, color: '#555', marginBottom: 8 }}>🔖 LinkVault — Tablero compartido</div>
          <h1 style={{ fontFamily: "'Space Grotesk', sans-serif", fontSize: 32, fontWeight: 700, color: '#fff', marginBottom: 10 }}>{board.name}</h1>
          {board.description && <p style={{ color: '#666', fontSize: 15 }}>{board.description}</p>}
        </div>

        {categories.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#444', paddingTop: 40 }}>Este tablero está vacío por ahora.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
            {categories.map(cat => (
              <div key={cat}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: CATEGORY_COLORS[cat] || '#555' }} />
                  <h2 style={{ fontSize: 14, fontWeight: 600, color: '#888', letterSpacing: '0.05em', textTransform: 'uppercase' }}>{cat}</h2>
                  <div style={{ flex: 1, height: '1px', background: '#1e1e1e' }} />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 10 }}>
                  {links.filter(l => l.category === cat).map(link => {
                    const src = detectSource(link.url)
                    return (
                      <a key={link.id} href={link.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                        <div style={{ background: '#161616', border: '1px solid #2a2a2a', borderRadius: 12, padding: '12px 14px', transition: 'border-color 0.15s', cursor: 'pointer' }}
                          onMouseEnter={e => e.currentTarget.style.borderColor = '#3a3a3a'}
                          onMouseLeave={e => e.currentTarget.style.borderColor = '#2a2a2a'}>
                          <div style={{ fontSize: 11, color: '#555', marginBottom: 5 }}>{src.emoji} {src.label}</div>
                          <div style={{ fontSize: 13, fontWeight: 500, color: '#e5e5e5', lineHeight: 1.4, marginBottom: 4 }}>{link.title}</div>
                          <div style={{ fontSize: 11, color: '#444' }}>{getDomain(link.url)}</div>
                        </div>
                      </a>
                    )
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign: 'center', marginTop: 48, color: '#333', fontSize: 12 }}>
          Creado con <span style={{ color: '#7c6ef7' }}>LinkVault</span>
        </div>
      </div>
    </div>
  )
}
