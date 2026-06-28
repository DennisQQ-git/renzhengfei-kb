import type { IndexData } from '../types'

export interface GraphNode {
  id: string
  label: string
  shortLabel: string
  year: number
  type: 'book' | 'chapter' | 'topic' | 'speech'
  tags: string[]
  degree: number
}

export interface GraphEdge {
  source: string
  target: string
  strength: number
  type: 'tag' | 'hierarchy'
}

export interface GraphData {
  nodes: GraphNode[]
  edges: GraphEdge[]
}

export function buildGraphData(data: IndexData): GraphData {
  const { documents } = data
  const docMap = new Map(documents.map(d => [d.slug, d]))

  // tag → set of doc slugs
  const tagMap = new Map<string, Set<string>>()
  for (const doc of documents) {
    for (const tag of doc.tags.filter(Boolean)) {
      if (!tagMap.has(tag)) tagMap.set(tag, new Set())
      tagMap.get(tag)!.add(doc.slug)
    }
  }

  // Build edges from shared tags
  const edgeKey = (a: string, b: string) => [a, b].sort().join('::')
  const edgeStrength = new Map<string, number>()
  const edgeTypes = new Map<string, 'tag' | 'hierarchy'>()
  const nodeDegree = new Map<string, number>()

  for (const [, slugs] of tagMap) {
    const arr = [...slugs]
    for (let i = 0; i < arr.length; i++) {
      for (let j = i + 1; j < arr.length; j++) {
        const key = edgeKey(arr[i], arr[j])
        edgeStrength.set(key, (edgeStrength.get(key) || 0) + 1)
        edgeTypes.set(key, 'tag')
        nodeDegree.set(arr[i], (nodeDegree.get(arr[i]) || 0) + 1)
        nodeDegree.set(arr[j], (nodeDegree.get(arr[j]) || 0) + 1)
      }
    }
  }

  // Hierarchy edges: book → chapter
  for (const doc of documents) {
    if (doc.category === '管理思想丛书' && doc.slug.includes('-')) {
      const bookSlug = doc.slug.split('-')[0]
      const key = edgeKey(bookSlug, doc.slug)
      if (!edgeStrength.has(key)) {
        edgeStrength.set(key, 5)
        edgeTypes.set(key, 'hierarchy')
        nodeDegree.set(bookSlug, (nodeDegree.get(bookSlug) || 0) + 1)
        nodeDegree.set(doc.slug, (nodeDegree.get(doc.slug) || 0) + 1)
      }
    }
  }

  // Only connected nodes
  const connectedSlugs = new Set<string>()
  for (const key of edgeStrength.keys()) {
    const [a, b] = key.split('::')
    connectedSlugs.add(a)
    connectedSlugs.add(b)
  }

  const nodes: GraphNode[] = [...connectedSlugs]
    .map(slug => {
      const doc = docMap.get(slug)
      if (!doc) return null
      const isChapter = doc.category === '管理思想丛书' && slug.includes('-')
      const isBook = doc.category === '管理思想丛书' && !isChapter
      return {
        id: slug,
        label: doc.title,
        shortLabel: isBook
          ? doc.title.replace(/[《》]/g, '').slice(0, 8)
          : doc.title.length > 10
            ? doc.title.slice(0, 10) + '…'
            : doc.title,
        year: doc.year,
        type: (isBook ? 'book' : isChapter ? 'chapter' : doc.isTopic ? 'topic' : 'speech') as GraphNode['type'],
        tags: doc.tags.filter(Boolean),
        degree: nodeDegree.get(slug) || 0,
      }
    })
    .filter((n): n is GraphNode => n !== null)

  const edges: GraphEdge[] = [...edgeStrength.entries()]
    .filter(([key]) => {
      const [a, b] = key.split('::')
      return connectedSlugs.has(a) && connectedSlugs.has(b)
    })
    .map(([key, strength]) => {
      const [source, target] = key.split('::')
      return { source, target, strength, type: edgeTypes.get(key) || 'tag' }
    })

  return { nodes, edges }
}
