export function getYearDateRange(year: number): string {
  const start = `${year}-01-01`
  const end = `${year}-12-31`
  return `${start}~${end}`
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return ''
  const match = dateStr.match(/(\d{4})(\d{2})(\d{2})/)
  if (match) {
    return `${match[1]}年${match[2]}月${match[3]}日`
  }
  return dateStr
}

export function getYearFromFilename(filename: string): number {
  const match = filename.match(/^(\d{4})/)
  return match ? parseInt(match[1]) : 0
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

export function highlightText(text: string, query: string): string {
  if (!query || !text) return escapeHtml(text)
  const escaped = escapeHtml(text)
  const words = query.trim().split(/\s+/).filter(Boolean)
  if (words.length === 0) return escaped
  const pattern = words.map(w => w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')
  const re = new RegExp(`(${pattern})`, 'gi')
  return escaped.replace(re, '<mark class="bg-amber-200 text-ink-800 rounded px-0.5">$1</mark>')
}
