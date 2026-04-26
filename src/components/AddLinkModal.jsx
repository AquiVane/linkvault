import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { detectSource, cleanUrl, DEFAULT_SPACES } from '../lib/utils'

export default function AddLinkModal({ userId, customSpaces, onClose, onAdded }) {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [space, setSpace] = useState('other')
  const [tags, setTags] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const source = url ? detectSource(url) : null
  const allSpaces = [...DEFAULT_SPACES, ...customSpaces]

  const handleSave = async () => {
    if (!url.trim()) { setError('Pegá una URL primero.'); return }
    setLoading(true)
    setError('')
    const cleanedUrl = cleanUrl(url.trim())
    const src = detectSource(cleanedUrl)
    const tagList = tags.split(',').map(t => t.trim()).filter(Boolean)
    const { error: err } = await supabase.from('links').insert({
      user_id: userId, url: cleanedUrl, title: title.trim() || src.label + ' link',
      source_type: src.type, space, tags: tagList, read: false,
    })
    if (err) { setError('Error al guardar. Intentá de nuevo.'); setLoading(false); return }
    onAdded()
    onClose()
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, fontFamily: "'DM Sans', sans-serif" }}>
      <div style={{ width: 480, background: '#161616', borderRadius: 20, padding: '32px 36px', border: '1px solid #2a2a2a', position: 'relative', maxHeight: '90vh', overflowY: 'auto' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 16, right: 16, background: '#2a2a2a', border: 'none', color: '#888', width: 28, height: 28, borderRadius: 8, cursor: 'pointer', fontSize: 16 }}>×</button>
        <h2 style={{ color: '#fff', fontWeight: 600, fontSize: 18, marginBottom: 24 }}>Agregar link</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ color: '#888', fontSize: 12, marginBottom: 6, display: 'block' }}>URL *</label>
            <div style={{ position: 'relative' }}>
              <input autoFocus type="text" placeholder="Pegá la URL acá..." value={url} onChange={e => setUrl(e.target.value)}
                style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #2a2a2a', background: '#1e1e1e', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif" }} />
              {source && <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 12, background: '#2a2a2a', padding: '2px 8px', borderRadius: 6, color: '#aaa' }}>{source.emoji} {source.label}</span>}
            </div>
          </div>
          <div>
            <label style={{ color: '#888', fontSize: 12, marginBottom: 6, display: 'block' }}>Título (opcional)</label>
            <input type="text" placeholder="Dale un nombre descriptivo..." value={title} onChange={e => setTitle(e.target.value)}
              style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #2a2a2a', background: '#1e1e1e', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif" }} />
          </div>
          <div>
            <label style={{ color: '#888', fontSize: 12, marginBottom: 8, display: 'block' }}>Espacio</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {allSpaces.map(s => (
                <button key={s.id || s.name} onClick={() => setSpace(s.id || s.name)} style={{
                  padding: '6px 12px', borderRadius: 8, border: 'none', cursor: 'pointer', fontSize: 12,
                  background: space === (s.id || s.name) ? '#7c6ef7' : '#2a2a2a',
                  color: space === (s.id || s.name) ? '#fff' : '#888', transition: 'all 0.15s', fontFamily: "'DM Sans', sans-serif"
                }}>{s.emoji} {s.label || s.name}</button>
              ))}
            </div>
          </div>
          <div>
            <label style={{ color: '#888', fontSize: 12, marginBottom: 6, display: 'block' }}>Etiquetas (separadas por coma)</label>
            <input type="text" placeholder="diseño, inspiración, ux..." value={tags} onChange={e => setTags(e.target.value)}
              style={{ width: '100%', padding: '11px 14px', borderRadius: 10, border: '1px solid #2a2a2a', background: '#1e1e1e', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif" }} />
          </div>
        </div>
        {error && <p style={{ color: '#f87171', fontSize: 13, marginTop: 12 }}>{error}</p>}
        <div style={{ display: 'flex', gap: 10, marginTop: 24 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '12px 0', borderRadius: 10, border: '1px solid #2a2a2a', background: 'transparent', color: '#888', fontSize: 14, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Cancelar</button>
          <button onClick={handleSave} disabled={loading} style={{ flex: 2, padding: '12px 0', borderRadius: 10, border: 'none', background: loading ? '#3d3a6e' : '#7c6ef7', color: '#fff', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
            {loading ? 'Guardando...' : 'Guardar link'}
          </button>
        </div>
      </div>
    </div>
  )
}
