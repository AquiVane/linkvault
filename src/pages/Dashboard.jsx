import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { DEFAULT_SPACES, SOURCE_FILTERS, detectSource } from '../lib/utils'
import AddLinkModal from '../components/AddLinkModal'
import LinkCard from '../components/LinkCard'
import CustomSpaceModal from '../components/CustomSpaceModal'
import ClientBoards from './ClientBoards'

export default function Dashboard({ user }) {
  const [links, setLinks] = useState([])
  const [customSpaces, setCustomSpaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showNewSpace, setShowNewSpace] = useState(false)
  const [activeSpace, setActiveSpace] = useState('all')
  const [activeSource, setActiveSource] = useState('all')
  const [activeFilter, setActiveFilter] = useState('all')
  const [activeTag, setActiveTag] = useState(null)
  const [search, setSearch] = useState('')
  const [view, setView] = useState('grid') // grid | list
  const [section, setSection] = useState('links') // links | boards

  const fetchLinks = useCallback(async () => {
    setLoading(true)
    const { data } = await supabase.from('links').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setLinks(data || [])
    setLoading(false)
  }, [user.id])

  const fetchCustomSpaces = useCallback(async () => {
    const { data } = await supabase.from('custom_spaces').select('*').eq('user_id', user.id).order('created_at')
    setCustomSpaces(data || [])
  }, [user.id])

  useEffect(() => { fetchLinks(); fetchCustomSpaces() }, [fetchLinks, fetchCustomSpaces])

  const handleSignOut = () => supabase.auth.signOut()
  const handleDelete = (id) => setLinks(prev => prev.filter(l => l.id !== id))
  const handleToggleRead = (id) => setLinks(prev => prev.map(l => l.id === id ? { ...l, read: !l.read } : l))

  const deleteCustomSpace = async (id) => {
    await supabase.from('custom_spaces').delete().eq('id', id)
    setCustomSpaces(prev => prev.filter(s => s.id !== id))
    if (activeSpace === id) setActiveSpace('all')
  }

  // All tags from all links
  const allTags = [...new Set(links.flatMap(l => l.tags || []))].filter(Boolean)

  const filtered = links.filter(link => {
    const src = detectSource(link.url)
    const spaceId = activeSpace
    const isCustomSpace = customSpaces.find(s => s.id === spaceId)
    if (spaceId !== 'all') {
      if (isCustomSpace) { if (link.space !== spaceId) return false }
      else { if (link.space !== spaceId) return false }
    }
    if (activeSource !== 'all' && src.type !== activeSource) return false
    if (activeFilter === 'unread' && link.read) return false
    if (activeTag && !(link.tags || []).includes(activeTag)) return false
    if (search && !link.title.toLowerCase().includes(search.toLowerCase()) && !link.url.toLowerCase().includes(search.toLowerCase())) return false
    return true
  })

  const unreadCount = links.filter(l => !l.read).length
  const allSpaces = [...DEFAULT_SPACES, ...customSpaces.map(s => ({ id: s.id, label: s.name, emoji: s.emoji, custom: true }))]

  return (
    <div style={{ display: 'flex', height: '100vh', background: '#0d0d0d', fontFamily: "'DM Sans', sans-serif", color: '#e5e5e5' }}>
      <link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Space+Grotesk:wght@700&display=swap" rel="stylesheet" />

      {/* Sidebar */}
      <div style={{ width: 220, borderRight: '1px solid #1e1e1e', padding: '20px 10px', display: 'flex', flexDirection: 'column', gap: 2, flexShrink: 0, overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 8px', marginBottom: 16 }}>
          <span style={{ fontSize: 20 }}>🔖</span>
          <span style={{ fontFamily: "'Space Grotesk', sans-serif", fontWeight: 700, fontSize: 18, color: '#fff' }}>LinkVault</span>
        </div>

        {/* Main nav */}
        <NavItem emoji="📚" label="Mis links" active={section === 'links'} onClick={() => setSection('links')} />
        <NavItem emoji="🤝" label="Tableros clientes" active={section === 'boards'} onClick={() => setSection('boards')} />

        {section === 'links' && <>
          <div style={{ height: 1, background: '#1e1e1e', margin: '8px 4px' }} />
          <NavItem emoji="🔵" label="Sin leer" active={activeFilter === 'unread'} count={unreadCount} accent={unreadCount > 0}
            onClick={() => { setActiveFilter(activeFilter === 'unread' ? 'all' : 'unread'); setSection('links') }} />

          <div style={{ fontSize: 10, color: '#444', padding: '14px 10px 5px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Espacios</div>
          <NavItem emoji="📚" label="Todos" active={activeSpace === 'all'} count={links.length} onClick={() => { setActiveSpace('all'); setActiveFilter('all') }} />
          {allSpaces.map(s => (
            <div key={s.id} style={{ display: 'flex', alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <NavItem emoji={s.emoji} label={s.label} active={activeSpace === s.id}
                  count={links.filter(l => l.space === s.id).length}
                  onClick={() => { setActiveSpace(s.id); setActiveFilter('all') }} />
              </div>
              {s.custom && (
                <button onClick={() => deleteCustomSpace(s.id)} style={{ background: 'transparent', border: 'none', color: '#333', cursor: 'pointer', fontSize: 12, padding: '4px', flexShrink: 0 }}>×</button>
              )}
            </div>
          ))}
          <button onClick={() => setShowNewSpace(true)} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px', borderRadius: 8,
            border: '1px dashed #2a2a2a', background: 'transparent', color: '#555', fontSize: 12,
            cursor: 'pointer', width: '100%', marginTop: 4, fontFamily: "'DM Sans', sans-serif"
          }}>+ Nuevo espacio</button>

          {allTags.length > 0 && <>
            <div style={{ fontSize: 10, color: '#444', padding: '14px 10px 5px', letterSpacing: '0.08em', textTransform: 'uppercase' }}>Etiquetas</div>
            {allTags.map(tag => (
              <button key={tag} onClick={() => setActiveTag(activeTag === tag ? null : tag)} style={{
                display: 'flex', alignItems: 'center', gap: 6, padding: '5px 10px', borderRadius: 8,
                border: 'none', cursor: 'pointer', background: activeTag === tag ? '#1e1a3a' : 'transparent',
                color: activeTag === tag ? '#a78bfa' : '#666', fontSize: 12, width: '100%', textAlign: 'left',
                fontFamily: "'DM Sans', sans-serif"
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: activeTag === tag ? '#7c6ef7' : '#333', flexShrink: 0 }} />
                #{tag}
              </button>
            ))}
          </>}
        </>}

        <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid #1e1e1e' }}>
          <div style={{ fontSize: 11, color: '#444', padding: '4px 8px', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.email}</div>
          <button onClick={handleSignOut} style={{ width: '100%', textAlign: 'left', padding: '7px 10px', borderRadius: 8, background: 'transparent', border: 'none', color: '#555', fontSize: 12, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>🚪 Cerrar sesión</button>
        </div>
      </div>

      {/* Main content */}
      {section === 'boards' ? (
        <ClientBoards user={user} />
      ) : (
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {/* Topbar */}
          <div style={{ padding: '14px 20px', borderBottom: '1px solid #1e1e1e', display: 'flex', alignItems: 'center', gap: 10 }}>
            <input type="text" placeholder="Buscar en tus links..." value={search} onChange={e => setSearch(e.target.value)}
              style={{ flex: 1, padding: '9px 14px', borderRadius: 10, border: '1px solid #2a2a2a', background: '#161616', color: '#fff', fontSize: 14, outline: 'none', fontFamily: "'DM Sans', sans-serif" }} />
            {/* View toggle */}
            <div style={{ display: 'flex', background: '#1a1a1a', borderRadius: 8, padding: 3, gap: 2 }}>
              <button onClick={() => setView('grid')} style={{ padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', background: view === 'grid' ? '#2a2a2a' : 'transparent', color: view === 'grid' ? '#fff' : '#555', fontSize: 14 }}>⊞</button>
              <button onClick={() => setView('list')} style={{ padding: '5px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', background: view === 'list' ? '#2a2a2a' : 'transparent', color: view === 'list' ? '#fff' : '#555', fontSize: 14 }}>☰</button>
            </div>
            <button onClick={() => setShowModal(true)} style={{ padding: '9px 18px', borderRadius: 10, background: '#7c6ef7', color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap', fontFamily: "'DM Sans', sans-serif" }}>+ Agregar link</button>
          </div>

          {/* Source filter */}
          <div style={{ padding: '8px 20px', borderBottom: '1px solid #1e1e1e', display: 'flex', gap: 6, overflowX: 'auto' }}>
            {SOURCE_FILTERS.map(f => (
              <button key={f.id} onClick={() => setActiveSource(f.id)} style={{
                padding: '4px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12, whiteSpace: 'nowrap',
                background: activeSource === f.id ? '#7c6ef7' : '#1a1a1a', color: activeSource === f.id ? '#fff' : '#666',
                transition: 'all 0.15s', fontFamily: "'DM Sans', sans-serif"
              }}>{f.emoji} {f.label}</button>
            ))}
            {activeTag && (
              <button onClick={() => setActiveTag(null)} style={{ padding: '4px 12px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12, background: '#3d3a6e', color: '#a78bfa', fontFamily: "'DM Sans', sans-serif" }}>
                #{activeTag} ×
              </button>
            )}
          </div>

          {/* Stats */}
          <div style={{ padding: '6px 20px', display: 'flex', gap: 12, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#444' }}>{filtered.length} links</span>
            {unreadCount > 0 && <span style={{ fontSize: 12, color: '#7c6ef7' }}>{unreadCount} sin leer</span>}
          </div>

          {/* Links grid/list */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '8px 20px 24px' }}>
            {loading ? (
              <div style={{ textAlign: 'center', color: '#444', paddingTop: 60, fontSize: 14 }}>Cargando...</div>
            ) : filtered.length === 0 ? (
              <div style={{ textAlign: 'center', paddingTop: 80 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>🔖</div>
                <p style={{ color: '#555', fontSize: 15 }}>{links.length === 0 ? '¡Empezá guardando tu primer link!' : 'No hay links con esos filtros.'}</p>
                {links.length === 0 && <button onClick={() => setShowModal(true)} style={{ marginTop: 16, padding: '10px 24px', borderRadius: 10, background: '#7c6ef7', color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>+ Agregar mi primer link</button>}
              </div>
            ) : view === 'grid' ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 12 }}>
                {filtered.map(link => <LinkCard key={link.id} link={link} onDelete={handleDelete} onToggleRead={handleToggleRead} />)}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {filtered.map(link => <LinkRow key={link.id} link={link} onDelete={handleDelete} onToggleRead={handleToggleRead} />)}
              </div>
            )}
          </div>
        </div>
      )}

      {showModal && <AddLinkModal userId={user.id} customSpaces={customSpaces} onClose={() => setShowModal(false)} onAdded={fetchLinks} />}
      {showNewSpace && <CustomSpaceModal userId={user.id} onClose={() => setShowNewSpace(false)} onSaved={fetchCustomSpaces} />}
    </div>
  )
}

function NavItem({ emoji, label, active, count, onClick, accent }) {
  return (
    <button onClick={onClick} style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '7px 10px',
      borderRadius: 8, border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left',
      background: active ? '#1e1a3a' : 'transparent', color: active ? '#a78bfa' : '#666',
      transition: 'all 0.15s', fontFamily: "'DM Sans', sans-serif", fontSize: 13
    }}>
      <span>{emoji} {label}</span>
      {count > 0 && <span style={{ fontSize: 10, padding: '1px 6px', borderRadius: 6, background: active ? '#7c6ef7' : accent ? '#3d3a6e' : '#1e1e1e', color: active || accent ? '#c4b5fd' : '#444' }}>{count}</span>}
    </button>
  )
}

function LinkRow({ link, onDelete, onToggleRead }) {
  const { detectSource, getDomain } = require('../lib/utils')
  const src = detectSource(link.url)
  const SOURCE_COLORS = { tiktok: '#010101', instagram: '#E1306C', linkedin: '#0A66C2', youtube: '#FF0000', twitter: '#000', github: '#24292e', web: '#4A90D9' }

  const handleDelete = async () => {
    const { supabase } = require('../lib/supabase')
    await supabase.from('links').delete().eq('id', link.id)
    onDelete(link.id)
  }

  const handleToggle = async () => {
    const { supabase } = require('../lib/supabase')
    await supabase.from('links').update({ read: !link.read }).eq('id', link.id)
    onToggleRead(link.id)
  }

  return (
    <div style={{ background: '#161616', border: link.read ? '1px solid #1e1e1e' : '1px solid #3a346a', borderRadius: 10, padding: '10px 14px', display: 'flex', alignItems: 'center', gap: 12, opacity: link.read ? 0.7 : 1 }}>
      {!link.read && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c6ef7', flexShrink: 0 }} />}
      <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 6, background: (SOURCE_COLORS[src.type] || '#4A90D9') + '22', color: src.type === 'tiktok' || src.type === 'github' ? '#aaa' : (SOURCE_COLORS[src.type] || '#4A90D9'), whiteSpace: 'nowrap' }}>{src.emoji}</span>
      <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ flex: 1, textDecoration: 'none', color: '#e5e5e5', fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link.title}</a>
      <span style={{ fontSize: 11, color: '#444', whiteSpace: 'nowrap', flexShrink: 0 }}>{getDomain(link.url)}</span>
      {(link.tags || []).slice(0, 2).map(t => <span key={t} style={{ fontSize: 10, padding: '1px 7px', borderRadius: 6, background: '#2a2a2a', color: '#666', whiteSpace: 'nowrap' }}>#{t}</span>)}
      <button onClick={handleToggle} style={{ background: 'transparent', border: 'none', color: '#555', cursor: 'pointer', fontSize: 13, padding: '2px 4px', flexShrink: 0 }}>{link.read ? '🔵' : '✅'}</button>
      <button onClick={handleDelete} style={{ background: 'transparent', border: 'none', color: '#444', cursor: 'pointer', fontSize: 13, padding: '2px 4px', flexShrink: 0 }}>🗑</button>
    </div>
  )
}
