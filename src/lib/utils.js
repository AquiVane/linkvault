export function detectSource(url) {
  if (!url) return { type: 'web', label: 'Web', color: '#4A90D9', emoji: '🌐' }
  const lower = url.toLowerCase()
  if (lower.includes('tiktok.com')) return { type: 'tiktok', label: 'TikTok', color: '#010101', emoji: '🎵' }
  if (lower.includes('instagram.com')) return { type: 'instagram', label: 'Instagram', color: '#E1306C', emoji: '📸' }
  if (lower.includes('linkedin.com')) return { type: 'linkedin', label: 'LinkedIn', color: '#0A66C2', emoji: '💼' }
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return { type: 'youtube', label: 'YouTube', color: '#FF0000', emoji: '▶️' }
  if (lower.includes('twitter.com') || lower.includes('x.com')) return { type: 'twitter', label: 'X / Twitter', color: '#000000', emoji: '𝕏' }
  if (lower.includes('github.com')) return { type: 'github', label: 'GitHub', color: '#24292e', emoji: '💻' }
  if (lower.includes('drive.google.com')) return { type: 'drive', label: 'Google Drive', color: '#4285F4', emoji: '📂' }
  if (lower.includes('docs.google.com')) return { type: 'docs', label: 'Google Docs', color: '#4285F4', emoji: '📄' }
  if (lower.includes('canva.com')) return { type: 'canva', label: 'Canva', color: '#00C4CC', emoji: '🎨' }
  if (lower.includes('claude.ai')) return { type: 'claude', label: 'Claude', color: '#7c6ef7', emoji: '🤖' }
  if (lower.includes('analytics.google.com')) return { type: 'analytics', label: 'Google Analytics', color: '#E37400', emoji: '📊' }
  if (lower.includes('ads.google.com')) return { type: 'googleads', label: 'Google Ads', color: '#4285F4', emoji: '📢' }
  if (lower.includes('notion.so')) return { type: 'notion', label: 'Notion', color: '#000', emoji: '📝' }
  if (lower.includes('wix.com') || lower.includes('duda.co')) return { type: 'website', label: 'Sitio web', color: '#0C6EFC', emoji: '🌍' }
  return { type: 'web', label: 'Web', color: '#4A90D9', emoji: '🌐' }
}

export function cleanUrl(url) {
  if (!url.startsWith('http://') && !url.startsWith('https://')) return 'https://' + url
  return url
}

export function getDomain(url) {
  try { return new URL(url).hostname.replace('www.', '') } catch { return url }
}

export const DEFAULT_SPACES = [
  { id: 'social', label: 'Redes sociales', emoji: '📱' },
  { id: 'work', label: 'Trabajo', emoji: '💼' },
  { id: 'learn', label: 'Aprender', emoji: '🎓' },
  { id: 'inspo', label: 'Inspiración', emoji: '✨' },
  { id: 'tools', label: 'Herramientas', emoji: '🔧' },
  { id: 'shopping', label: 'Compras', emoji: '🛍' },
  { id: 'other', label: 'Otro', emoji: '📌' },
]

export const SOURCE_FILTERS = [
  { id: 'all', label: 'Todos', emoji: '🔖' },
  { id: 'tiktok', label: 'TikTok', emoji: '🎵' },
  { id: 'instagram', label: 'Instagram', emoji: '📸' },
  { id: 'linkedin', label: 'LinkedIn', emoji: '💼' },
  { id: 'youtube', label: 'YouTube', emoji: '▶️' },
  { id: 'drive', label: 'Drive', emoji: '📂' },
  { id: 'canva', label: 'Canva', emoji: '🎨' },
  { id: 'web', label: 'Web', emoji: '🌐' },
]
