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
