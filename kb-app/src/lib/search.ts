export function searchDocuments(query: string, documents: any[]) {
  const q = query.toLowerCase()
  return documents.filter(doc =>
    doc.title.toLowerCase().includes(q) ||
    doc.excerpt?.toLowerCase().includes(q) ||
    doc.tags?.some((t: string) => t.toLowerCase().includes(q)) ||
    doc.text?.toLowerCase().includes(q)
  )
}
