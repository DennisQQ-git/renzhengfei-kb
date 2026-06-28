import { useState, useMemo, useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../utils/context'
import { buildGraphData } from '../utils/graphData'
import RelationGraph from '../components/RelationGraph'
import type { GraphNode } from '../utils/graphData'

const TYPE_FILTERS: { key: string; label: string; color: string }[] = [
  { key: 'book', label: '丛书', color: 'bg-amber-600' },
  { key: 'chapter', label: '章节', color: 'bg-amber-700' },
  { key: 'topic', label: '专题', color: 'bg-emerald-600' },
  { key: 'speech', label: '讲话', color: 'bg-blue-500' },
]

export default function GraphView() {
  const { indexData } = useApp()
  const navigate = useNavigate()
  const containerRef = useRef<HTMLDivElement>(null)
  const [dims, setDims] = useState({ width: 800, height: 600 })
  const [activeType, setActiveType] = useState<string | null>(null)
  const [activeTag, setActiveTag] = useState<string | null>(null)

  const { nodes, edges } = useMemo(() => buildGraphData(indexData), [indexData])

  // ResizeObserver for responsive dimensions
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

  // Tags across all graph nodes
  const allTags = useMemo(() => {
    const set = new Set<string>()
    nodes.forEach((n) => n.tags.forEach((t) => set.add(t)))
    return [...set].sort()
  }, [nodes])

  // Stats
  const stats = useMemo(() => {
    const counts: Record<string, number> = { book: 0, chapter: 0, topic: 0, speech: 0 }
    nodes.forEach((n) => counts[n.type]++)
    return counts
  }, [nodes])

  // Filtered
  const filteredNodes = useMemo(() => {
    let list: GraphNode[] = nodes
    if (activeType) list = list.filter((n) => n.type === activeType)
    if (activeTag) list = list.filter((n) => n.tags.includes(activeTag))
    return list
  }, [nodes, activeType, activeTag])

  const slugSet = useMemo(() => new Set(filteredNodes.map((n) => n.id)), [filteredNodes])

  const filteredEdges = useMemo(
    () => edges.filter((e) => slugSet.has(e.source as string) && slugSet.has(e.target as string)),
    [edges, slugSet],
  )

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-serif font-bold text-ink-800">关系图谱</h1>
          <span className="text-xs text-ink-400 bg-cream-100 px-2 py-0.5 rounded">
            {nodes.length} 节点 · {edges.length} 连接
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 text-xs text-ink-400">
          {Object.entries(stats).map(([key, count]) => {
            const f = TYPE_FILTERS.find((t) => t.key === key)
            return (
              <button
                key={key}
                onClick={() => setActiveType(activeType === key ? null : key)}
                className={`flex items-center gap-1.5 px-2 py-1 rounded transition-colors ${
                  activeType === key ? 'bg-ink-800 text-cream-50' : 'hover:bg-cream-100'
                }`}
              >
                <span className={`w-2 h-2 rounded-full inline-block ${f?.color}`} />
                {f?.label} {count}
              </button>
            )
          })}
        </div>
      </div>

      {/* Tag filter pills */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {allTags.map((tag) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`text-xs px-2.5 py-1 rounded-full transition-colors ${
                activeTag === tag
                  ? 'bg-gold-500 text-white'
                  : 'bg-cream-100 text-ink-400 hover:bg-cream-200'
              }`}
            >
              #{tag}
            </button>
          ))}
        </div>
      )}

      {(activeType || activeTag) && (
        <div className="text-xs text-ink-400">
          <button onClick={() => { setActiveType(null); setActiveTag(null) }} className="text-gold-600 hover:text-gold-500">
            清除筛选
          </button>
          <span className="ml-2">
            显示 {filteredNodes.length} 节点 · {filteredEdges.length} 连接
          </span>
        </div>
      )}

      {/* Graph */}
      <div
        ref={containerRef}
        className="w-full h-[580px] bg-cream-50/50 border border-cream-200 rounded-xl overflow-hidden"
      >
        {filteredNodes.length === 0 ? (
          <div className="flex items-center justify-center h-full text-sm text-ink-400">
            筛选条件下无可视化节点
          </div>
        ) : (
          <RelationGraph
            key={`${activeType || ''}-${activeTag || ''}`}
            nodes={filteredNodes}
            edges={filteredEdges}
            width={dims.width}
            height={dims.height}
            onNodeClick={(slug) => navigate(`/article/${slug}`)}
          />
        )}
      </div>

      {/* Hint */}
      <p className="text-xs text-ink-400 text-center">
        拖拽节点探索关联 · 滚轮缩放 · 悬停查看详情 · 点击跳转文章
      </p>
    </div>
  )
}
