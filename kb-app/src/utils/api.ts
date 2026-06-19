const DATA_BASE = '/data'

export async function fetchIndex() {
  const res = await fetch(`${DATA_BASE}/index.json`)
  if (!res.ok) throw new Error('Failed to load index')
  return res.json()
}

export async function fetchDocument(slug: string) {
  const res = await fetch(`${DATA_BASE}/documents/${slug}.json`)
  if (!res.ok) throw new Error(`Document not found: ${slug}`)
  return res.json()
}

export async function fetchYearStats() {
  const res = await fetch(`${DATA_BASE}/years.json`)
  if (!res.ok) throw new Error('Failed to load year stats')
  return res.json()
}

export async function searchDocuments(query: string, documents: any[]) {
  const q = query.toLowerCase()
  return documents.filter(doc =>
    doc.title.toLowerCase().includes(q) ||
    doc.excerpt.toLowerCase().includes(q) ||
    doc.tags?.some((t: string) => t.toLowerCase().includes(q))
  )
}
