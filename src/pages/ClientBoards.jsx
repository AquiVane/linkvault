import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { detectSource, cleanUrl } from '../lib/utils'

const CATEGORIES = ['General', 'Redes sociales', 'Google Ads', 'Google Analytics', 'Drive / Docs', 'Canva', 'Sitio web', 'Agente IA', 'Claude']

export default function ClientBoards({ user }) {
  const [boards, setBoards] = useState([])
  const [selectedBoard, setSelectedBoard] = useState(null)
  const [boardLinks, setBoardLinks] = useState([])
  const [loading, setLoading] = useState(true)
  const [showNewBoard, setShowNewBoard] = useState(false)
  const [showAddLink, setShowAddLink] = useState(false)
  const [newBoardName, setNewBoardName] = useState('')
  const [newBoardDesc, setNewBoardDesc] = useState('')
  const [newUrl, setNewUrl] = useState('')
  const [newTitle, setNewTitle] = useState('')
  const [newCategory, setNewCategory] = useState('General')
  const [copied, setCopied] = useState(false)

  const fetchBoards = useCallback(async () => {
    const { data } = await supabase.from('client_boards').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
    setBoards(data || [])
    setLoading(false)
  }, [user.id])

  const fetchBoardLinks = useCallback(async (boardId) => {
    const { data } = await supabase.from('board_links').select('*').eq('board_id', boardId).order('category').order('created_at')
    setBoardLinks(data || [])
  }, [])

  useEffect(() => { fetchBoards() }, [fetchBoards])
  useEffect(() => { if (selectedBoard) fetchBoardLinks(selectedBoard.id) }, [selectedBoard, fetchBoardLinks])

  const createBoard = async () => {
    if (!newBoardName.trim()) return
    const { data } = await supabase.from('client_boards').insert({ user_id: user.id, name: newBoardName.trim(), description: newBoardDesc.trim() }).select().single()
    if (data) { setBoards(prev => [data, ...prev]); setSelectedBoard(data); setShowNewBoard(false); setNewBoardName(''); setNewBoardDesc('') }
  }

  const addLink = async () => {
    if (!newUrl.trim() || !selectedBoard) return
    const url = cleanUrl(newUrl.trim())
    const src = detectSource(url)
    const { data } = await supabase.from('board_links').insert({
      board_id: selectedBoard.id, user_id: user.id, url, title: newTitle.trim() || src.label + ' link',
      category: newCategory, source_type: src.type
    }).select().single()
    if (data) { setBoardLinks(prev => [...prev, data]); setShowAddLink(false); setNewUrl(''); setNewTitle(''); setNewCategory('General') }
  }

  const deleteLink = async (id) => {
    await supabase.from('board_links').delete().eq('id', id)
    setBoardLinks(prev => prev.filter(l => l.id !== id))
  }

  const deleteBoard = async (id) => {
    if (!window.confirm('¿Eliminar este tablero y todos sus links?')) return
    await supabase.from('client_boards').delete().eq('id', id)
    setBoards(prev => prev.filter(b => b.id !== id))
    if (selectedBoard?.id === id) setSelectedBoard(null)
  }

  const shareUrl = selectedBoard ? `${window.location.origin}/board/${selectedBoard.share_token}` : ''

  const copyShare = () => {
    navigator.clipboard.writeText(shareUrl)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const categories = [...new Set(boardLinks.map(l => l.category))]

  return (
    <div style={{ display: 'flex', height: '100%', overflow: 'hidden' }}>
      {/* Board list sidebar */}
      <div style={{ width: 220, borderRight: '1px solid #1e1e1e', padding: '16px 10px', overflowY: 'auto', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12, padding: '0 4px' }}>
          <span style={{ fontSize: 11, color: '#555', textTransform: 'uppercase', letterSpacing: '0.06em' }}>Tableros de clientes</span>
          <button onClick={() => setShowNewBoard(true)} style={{ background: '#7c6ef7', border: 'none', color: '#fff', width: 22, height: 22, borderRadius: 6, cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>+</button>
        </div>
        {loading ? <div style={{ color: '#444', fontSize: 13, padding: '8px 4px' }}>Cargando...</div> :
          boards.length === 0 ? <div style={{ color: '#444', fontSize: 12, padding: '8px 4px', lineHeight: 1.5 }}>Todavía no tenés tableros. ¡Creá uno para un cliente!</div> :
            boards.map(b => (
              <div key={b.id} onClick={() => setSelectedBoard(b)} style={{
                padding: '8px 10px', borderRadius: 8, cursor: 'pointer', marginBottom: 2,
                background: selectedBoard?.id === b.id ? '#1e1a3a' : 'transparent',
                color: selectedBoard?.id === b.id ? '#a78bfa' : '#666', fontSize: 13,
                display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <span>🤝 {b.name}</span>
                <button onClick={e => { e.stopPropagation(); deleteBoard(b.id) }} style={{ background: 'transparent', border: 'none', color: '#444', cursor: 'pointer', fontSize: 12, padding: '0 2px' }}>×</button>
              </div>
            ))}
      </div>

      {/* Board content */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        {!selectedBoard ? (
          <div style={{ textAlign: 'center', paddingTop: 80 }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🤝</div>
            <p style={{ color: '#555', fontSize: 15, marginBottom: 20 }}>Seleccioná un tablero o creá uno nuevo para un cliente.</p>
            <button onClick={() => setShowNewBoard(true)} style={{ padding: '10px 24px', borderRadius: 10, background: '#7c6ef7', color: '#fff', border: 'none', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>+ Nuevo tablero</button>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
              <div>
                <h2 style={{ color: '#fff', fontSize: 20, fontWeight: 600, marginBottom: 4 }}>{selectedBoard.name}</h2>
                {selectedBoard.description && <p style={{ color: '#555', fontSize: 13 }}>{selectedBoard.description}</p>}
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <button onClick={copyShare} style={{
                  padding: '7px 14px', borderRadius: 8, border: '1px solid #3a346a', background: copied ? '#1e1a3a' : 'transparent',
                  color: copied ? '#a78bfa' : '#7c6ef7', fontSize: 12, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 500
                }}>
                  {copied ? '✓ Copiado!' : '🔗 Compartir link'}
                </button>
                <button onClick={() => setShowAddLink(true)} style={{ padding: '7px 14px', borderRadius: 8, background: '#7c6ef7', color: '#fff', border: 'none', fontSize: 12, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif", fontWeight: 600 }}>
                  + Agregar link
                </button>
              </div>
            </div>

            {boardLinks.length === 0 ? (
              <div style={{ textAlign: 'center', paddingTop: 40, color: '#444' }}>
                <p style={{ marginBottom: 16 }}>Este tablero está vacío. Agregá los links de este cliente.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                {categories.map(cat => (
                  <div key={cat}>
                    <div style={{ fontSize: 11, color: '#555', letterSpacing: '0.07em', textTransform: 'uppercase', marginBottom: 10, fontWeight: 600 }}>{cat}</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 8 }}>
                      {boardLinks.filter(l => l.category === cat).map(link => {
                        const src = detectSource(link.url)
                        return (
                          <div key={link.id} style={{ background: '#161616', border: '1px solid #2a2a2a', borderRadius: 10, padding: '10px 12px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                            <a href={link.url} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 10, color: '#555', marginBottom: 3 }}>{src.emoji} {src.label}</div>
                              <div style={{ fontSize: 13, color: '#e5e5e5', fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{link.title}</div>
                            </a>
                            <button onClick={() => deleteLink(link.id)} style={{ background: 'transparent', border: 'none', color: '#444', cursor: 'pointer', fontSize: 14, flexShrink: 0 }}>×</button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* New board modal */}
      {showNewBoard && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, fontFamily: "'DM Sans', sans-serif" }}>
          <div style={{ width: 420, background: '#161616', borderRadius: 20, padding: '28px 32px', border: '1px solid #2a2a2a' }}>
            <h2 style={{ color: '#fff', fontWeight: 600, fontSize: 17, marginBottom: 20 }}>Nuevo tablero de cliente</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input autoFocus placeholder="Nombre del cliente" value={newBoardName} onChange={e => setNewBoardName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && createBoard()}
                style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #2a2a2a', background: '#1e1e1e', color: '#fff', fontSize: 14, outline: 'none', fontFamily: "'DM Sans', sans-serif" }} />
              <input placeholder="Descripción (opcional)" value={newBoardDesc} onChange={e => setNewBoardDesc(e.target.value)}
                style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #2a2a2a', background: '#1e1e1e', color: '#fff', fontSize: 14, outline: 'none', fontFamily: "'DM Sans', sans-serif" }} />
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={() => setShowNewBoard(false)} style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: '1px solid #2a2a2a', background: 'transparent', color: '#888', fontSize: 14, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Cancelar</button>
              <button onClick={createBoard} style={{ flex: 2, padding: '11px 0', borderRadius: 10, border: 'none', background: '#7c6ef7', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Crear tablero</button>
            </div>
          </div>
        </div>
      )}

      {/* Add link to board modal */}
      {showAddLink && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, fontFamily: "'DM Sans', sans-serif" }}>
          <div style={{ width: 440, background: '#161616', borderRadius: 20, padding: '28px 32px', border: '1px solid #2a2a2a' }}>
            <h2 style={{ color: '#fff', fontWeight: 600, fontSize: 17, marginBottom: 20 }}>Agregar link al tablero</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <input autoFocus placeholder="URL" value={newUrl} onChange={e => setNewUrl(e.target.value)}
                style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #2a2a2a', background: '#1e1e1e', color: '#fff', fontSize: 14, outline: 'none', fontFamily: "'DM Sans', sans-serif" }} />
              <input placeholder="Título descriptivo" value={newTitle} onChange={e => setNewTitle(e.target.value)}
                style={{ padding: '10px 14px', borderRadius: 10, border: '1px solid #2a2a2a', background: '#1e1e1e', color: '#fff', fontSize: 14, outline: 'none', fontFamily: "'DM Sans', sans-serif" }} />
              <div>
                <label style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 8 }}>Categoría</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {CATEGORIES.map(c => (
                    <button key={c} onClick={() => setNewCategory(c)} style={{
                      padding: '5px 11px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 11,
                      background: newCategory === c ? '#7c6ef7' : '#2a2a2a',
                      color: newCategory === c ? '#fff' : '#888', fontFamily: "'DM Sans', sans-serif"
                    }}>{c}</button>
                  ))}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, marginTop: 20 }}>
              <button onClick={() => setShowAddLink(false)} style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: '1px solid #2a2a2a', background: 'transparent', color: '#888', fontSize: 14, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Cancelar</button>
              <button onClick={addLink} style={{ flex: 2, padding: '11px 0', borderRadius: 10, border: 'none', background: '#7c6ef7', color: '#fff', fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Agregar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
