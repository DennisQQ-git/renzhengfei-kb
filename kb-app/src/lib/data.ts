import fs from 'fs'
import path from 'path'
import type { IndexData, Document } from './types'

const DATA_DIR = path.join(process.cwd(), 'public', 'data')
const DOCS_DIR = path.join(DATA_DIR, 'documents')

let _indexCache: IndexData | null = null
const _docCache = new Map<string, Document>()

// Build a slug→filename mapping from the filesystem, to handle encoding mismatches
let _slugFileMap: Map<string, string> | null = null

function getSlugFileMap(): Map<string, string> {
  if (_slugFileMap) return _slugFileMap
  _slugFileMap = new Map()
  const files = fs.readdirSync(DOCS_DIR)
  for (const file of files) {
    if (file.endsWith('.json')) {
      const slug = file.slice(0, -5) // remove .json
      _slugFileMap.set(slug, file)
    }
  }
  return _slugFileMap
}

export function getIndexData(): IndexData {
  if (_indexCache) return _indexCache
  const raw = fs.readFileSync(path.join(DATA_DIR, 'index.json'), 'utf-8')
  _indexCache = JSON.parse(raw)
  return _indexCache!
}

export function getDocument(slug: string): Document {
  const cached = _docCache.get(slug)
  if (cached) return cached

  // Try direct lookup first, then fall back to slug-file map (handles encoding differences)
  let filePath = path.join(DOCS_DIR, `${slug}.json`)

  if (!fs.existsSync(filePath)) {
    const map = getSlugFileMap()
    const actualFile = map.get(slug)
    if (!actualFile) {
      // Try URL-decoding the slug (Next.js may pass encoded params)
      const decoded = decodeURIComponent(slug)
      const fallback = map.get(decoded)
      if (fallback) {
        filePath = path.join(DOCS_DIR, fallback)
      } else {
        throw new Error(`Document not found: ${slug}`)
      }
    } else {
      filePath = path.join(DOCS_DIR, actualFile)
    }
  }

  const raw = fs.readFileSync(filePath, 'utf-8')
  const doc = JSON.parse(raw) as Document
  _docCache.set(slug, doc)
  return doc
}

export function getAllSlugs(): string[] {
  const map = getSlugFileMap()
  return Array.from(map.keys())
}

export function getFeatured(): any[] {
  const raw = fs.readFileSync(path.join(DATA_DIR, 'featured.json'), 'utf-8')
  return JSON.parse(raw)
}

export function getSearchIndex(): any[] {
  const raw = fs.readFileSync(path.join(DATA_DIR, 'search-index.json'), 'utf-8')
  return JSON.parse(raw)
}

export function getYearStats(): Record<string, number> {
  const raw = fs.readFileSync(path.join(DATA_DIR, 'years.json'), 'utf-8')
  return JSON.parse(raw)
}
