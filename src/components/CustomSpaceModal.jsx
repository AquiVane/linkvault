import { useState } from 'react'
import { supabase } from '../lib/supabase'

const EMOJIS = ['📁','💼','📢','🎯','📊','🎨','🤝','🛒','📱','🌍','🔗','⭐','🏆','💡','🔥','📝']

export default function CustomSpaceModal({ userId, onClose, onSaved }) {
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('📁')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!name.trim()) { setError('Poné un nombre.'); return }
    setLoading(true)
    const { error: err } = await supabase.from('custom_spaces').insert({
      user_id: userId, name: name.trim(), emoji
    })
    if (err) { setError('Error al guardar.'); setLoading(false); return }
    onSaved()
    onClose()
  }

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex',
      alignItems: 'center', justifyContent: 'center', zIndex: 1000, fontFamily: "'DM Sans', sans-serif"
    }}>
      <div style={{ width: 400, background: '#161616', borderRadius: 20, padding: '28px 32px', border: '1px solid #2a2a2a', position: 'relative' }}>
        <button onClick={onClose} style={{ position: 'absolute', top: 14, right: 14, background: '#2a2a2a', border: 'none', color: '#888', width: 26, height: 26, borderRadius: 7, cursor: 'pointer', fontSize: 15 }}>×</button>
        <h2 style={{ color: '#fff', fontWeight: 600, fontSize: 17, marginBottom: 20 }}>Nuevo espacio</h2>

        <div style={{ marginBottom: 16 }}>
          <label style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 6 }}>Nombre del espacio</label>
          <input autoFocus type="text" placeholder="ej: Publicidad Digital, Cliente X..."
            value={name} onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSave()}
            style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #2a2a2a', background: '#1e1e1e', color: '#fff', fontSize: 14, outline: 'none', boxSizing: 'border-box', fontFamily: "'DM Sans', sans-serif" }}
          />
        </div>

        <div style={{ marginBottom: 20 }}>
          <label style={{ color: '#888', fontSize: 12, display: 'block', marginBottom: 8 }}>Ícono</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {EMOJIS.map(e => (
              <button key={e} onClick={() => setEmoji(e)} style={{
                width: 36, height: 36, borderRadius: 8, border: emoji === e ? '2px solid #7c6ef7' : '1px solid #2a2a2a',
                background: emoji === e ? '#1e1a3a' : '#1e1e1e', fontSize: 18, cursor: 'pointer'
              }}>{e}</button>
            ))}
          </div>
        </div>

        {error && <p style={{ color: '#f87171', fontSize: 13, marginBottom: 12 }}>{error}</p>}

        <div style={{ display: 'flex', gap: 10 }}>
          <button onClick={onClose} style={{ flex: 1, padding: '11px 0', borderRadius: 10, border: '1px solid #2a2a2a', background: 'transparent', color: '#888', fontSize: 14, cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}>Cancelar</button>
          <button onClick={handleSave} disabled={loading} style={{ flex: 2, padding: '11px 0', borderRadius: 10, border: 'none', background: loading ? '#3d3a6e' : '#7c6ef7', color: '#fff', fontSize: 14, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans', sans-serif" }}>
            {loading ? 'Guardando...' : `${emoji} Crear espacio`}
          </button>
        </div>
      </div>
    </div>
  )
}
