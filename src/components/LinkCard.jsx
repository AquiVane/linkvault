import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { detectSource, getDomain } from '../lib/utils'

const SOURCE_COLORS = {
  tiktok: '#010101', instagram: '#E1306C', linkedin: '#0A66C2',
  youtube: '#FF0000', twitter: '#000', github: '#24292e', web: '#4A90D9'
}

export default function LinkCard({ link, onDelete, onToggleRead }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const source = detectSource(link.url)
  const domain = getDomain(link.url)

  const handleDelete = async () => {
    await supabase.from('links').delete().eq('id', link.id)
    onDelete(link.id)
    setMenuOpen(false)
  }

  const handleToggleRead = async () => {
    await supabase.from('links').update({ read: !link.read }).eq('id', link.id)
    onToggleRead(link.id)
    setMenuOpen(false)
  }

  return (
    <div style={{
      background: '#161616', border: link.read ? '1px solid #1e1e1e' : '1px solid #3a346a',
      borderRadius: 14, overflow: 'hidden', position: 'relative',
      transition: 'transform 0.15s, border-color 0.15s',
      opacity: link.read ? 0.7 : 1,
    }}
      onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-2px)'}
      onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}
    >
      {!link.read && (
        <div style={{ height: 3, background: 'linear-gradient(90deg, #7c6ef7, #a78bfa)' }} />
      )}

      <div style={{ padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{
              fontSize: 10, padding: '2px 8px', borderRadius: 6, fontWeight: 500,
              background: SOURCE_COLORS[source.type] + '22',
              color: source.type === 'tiktok' || source.type === 'github' || source.type === 'twitter'
                ? '#aaa' : SOURCE_COLORS[source.type]
            }}>
              {source.emoji} {source.label}
            </span>
            {!link.read && (
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c6ef7', display: 'inline-block' }} />
            )}
          </div>

          <div style={{ position: 'relative' }}>
            <button onClick={() => setMenuOpen(!menuOpen)} style={{
              background: 'transparent', border: 'none', color: '#555', cursor: 'pointer',
              fontSize: 16, padding: '2px 6px', borderRadius: 6,
            }}>⋯</button>
            {menuOpen && (
              <div style={{
                position: 'absolute', right: 0, top: '100%', background: '#1e1e1e',
                border: '1px solid #2a2a2a', borderRadius: 10, padding: '6px', zIndex: 10,
                minWidth: 160, boxShadow: '0 8px 24px rgba(0,0,0,0.4)'
              }}>
                <button onClick={() => { window.open(link.url, '_blank'); setMenuOpen(false) }} style={menuBtnStyle}>
                  🔗 Abrir link
                </button>
                <button onClick={handleToggleRead} style={menuBtnStyle}>
                  {link.read ? '🔵 Marcar sin leer' : '✅ Marcar como leído'}
                </button>
                <button onClick={handleDelete} style={{ ...menuBtnStyle, color: '#f87171' }}>
                  🗑 Eliminar
                </button>
              </div>
            )}
          </div>
        </div>

        <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
          <h3 style={{
            color: '#e5e5e5', fontSize: 14, fontWeight: 500, lineHeight: 1.4,
            margin: '0 0 6px', display: '-webkit-box', WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical', overflow: 'hidden'
          }}>
            {link.title}
          </h3>
        </a>

        <p style={{ color: '#555', fontSize: 12, margin: '0 0 10px' }}>{domain}</p>

        {link.tags && link.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
            {link.tags.slice(0, 3).map(tag => (
              <span key={tag} style={{
                fontSize: 11, padding: '2px 8px', borderRadius: 6,
                background: '#2a2a2a', color: '#777'
              }}>#{tag}</span>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

const menuBtnStyle = {
  display: 'block', width: '100%', textAlign: 'left', padding: '8px 12px',
  background: 'transparent', border: 'none', color: '#ccc', fontSize: 13,
  cursor: 'pointer', borderRadius: 7, fontFamily: "'DM Sans', sans-serif"
}
