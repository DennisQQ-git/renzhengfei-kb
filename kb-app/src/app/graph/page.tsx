'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { buildGraphData } from '@/utils/graphData'
import RelationGraph from '@/components/RelationGraph'
import type { GraphNode } from '@/utils/graphData'

const TYPE_FILTERS: { key: string; label: string; color: string }[] = [
  { key: 'book', label: '丛书', color: 'bg-amber-600' },
  { key: 'chapter', label: '章节', color: 'bg-amber-700' },
  { key: 'topic', label: '专题', color: 'bg-emerald-600' },
  { key: 'speech', label: '讲话', color: 'bg-blue-500' },
]

export default function GraphPage() {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)
  const [dims, setDims] = useState({ width: 800, height: 600 })
  const [activeType, setActiveType] = useState<string | null>(null)
  const [activeTag, setActiveTag] = useState<string | null>(null)
  const [indexData, setIndexData] = useState<any>(null)

  useEffect(() => {
    fetch('/data/index.json')
      .then(r => r.json())
      .then(setIndexData)
      .catch(console.error)
  }, [])

  const { nodes, edges } = useMemo(() => {
    if (!indexData) return { nodes: [] as GraphNode[], edges: [] }
    return buildGraphData(indexData)
  }, [indexData])

  // Filter nodes based on active type/tag
  const filteredNodes = useMemo(() => {
    let result = nodes
    if (activeType) {
      result = result.filter(n => n.type === activeType)
    }
    if (activeTag) {
      result = result.filter(n => n.tags.includes(activeTag))
    }
    return result
  }, [nodes, activeType, activeTag])

  const filteredNodeIds = useMemo(() => new Set(filteredNodes.map(n => n.id)), [filteredNodes])
  const filteredEdges = useMemo(() => edges.filter(e => filteredNodeIds.has(e.source) && filteredNodeIds.has(e.target)), [edges, filteredNodeIds])

  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver((entries) => {
      const { width, height } = entries[0].contentRect
      if (width > 0 && height > 0) setDims({ width, height })
    })
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const allTags = useMemo(() => {
    const set = new Set<string>()
    nodes.forEach((n) => n.tags.forEach((t) => set.add(t)))
    return [...set].sort()
  }, [nodes])

  const stats = useMemo(() => {
    const counts: Record<string, number> = { book: 0, chapter: 0, topic: 0, speech: 0 }
    nodes.forEach((n) => counts[n.type]++)
    return counts
  }, [nodes])

  if (!indexData) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex flex-wrap items-center gap-2">
          {TYPE_FILTERS.map(({ key, label, color }) => (
            <button
              key={key}
              onClick={() => setActiveType(activeType === key ? null : key)}
              className={`px-3 py-1.5 text-xs rounded-full border transition-all duration-200 flex items-center gap-1.5 ${
                activeType === key
                  ? 'bg-ink-800 text-cream-50 border-ink-800'
                  : 'text-ink-500 border-cream-300 hover:border-ink-300 hover:text-ink-700'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${color}`} />
              {label} ({stats[key] || 0})
            </button>
          ))}
        </div>

        <select
          value={activeTag || ''}
          onChange={(e) => setActiveTag(e.target.value || null)}
          className="px-3 py-1.5 text-xs rounded-lg border border-cream-300 bg-white text-ink-600 focus:outline-none focus:ring-2 focus:ring-gold-500"
        >
          <option value="">全部标签</option>
          {allTags.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      <div ref={containerRef} className="card p-2 md:p-4" style={{ height: 'calc(100vh - 200px)', minHeight: 500 }}>
        <RelationGraph
          nodes={filteredNodes}
          edges={filteredEdges}
          width={dims.width}
          height={dims.height}
          onNodeClick={(slug) => router.push(`/article/${slug}`)}
        />
      </div>

      <p className="text-xs text-ink-400 text-center mt-3">
        拖拽节点浏览 · 滚轮缩放 · 点击节点查看文章
      </p>
    </div>
  )
}
