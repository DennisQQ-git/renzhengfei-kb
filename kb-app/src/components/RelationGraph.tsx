import { useRef, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { forceSimulation, forceLink, forceManyBody, forceCenter, forceCollide } from 'd3-force'
import { select, pointer } from 'd3-selection'
import { zoom as d3zoom, zoomTransform } from 'd3-zoom'
import { drag as d3drag } from 'd3-drag'
import type { GraphNode, GraphEdge } from '../utils/graphData'

const TYPE_COLORS: Record<string, string> = {
  book: '#d97706',
  chapter: '#b8860b',
  topic: '#059669',
  speech: '#3b82f6',
}

const TYPE_LABELS: Record<string, string> = {
  book: '丛书',
  chapter: '章节',
  topic: '专题',
  speech: '讲话',
}

interface SimNode extends GraphNode {
  x?: number
  y?: number
  fx?: number | null
  fy?: number | null
  vx?: number
  vy?: number
}

interface SimLink {
  source: string | SimNode
  target: string | SimNode
  strength: number
  type: 'tag' | 'hierarchy'
}

interface Props {
  nodes: GraphNode[]
  edges: GraphEdge[]
  width: number
  height: number
  onNodeClick?: (slug: string) => void
}

export default function RelationGraph({ nodes, edges, width, height, onNodeClick }: Props) {
  const svgRef = useRef<SVGSVGElement>(null)

  useEffect(() => {
    const svgEl = svgRef.current
    if (!svgEl || nodes.length === 0) return

    const svg = select(svgEl)
    svg.selectAll('*').remove()

    // Zoom container
    const g = svg.append('g')

    // Tooltip (outside zoom container so it doesn't scale)
    const tooltip = svg.append('g').attr('opacity', 0).style('pointer-events', 'none')

    const tooltipBg = tooltip.append('rect').attr('rx', 5).attr('ry', 5).attr('fill', '#2d2416')
    const tooltipText = tooltip.append('text').attr('fill', '#f5f0e8').attr('font-size', '11px').attr('font-family', 'serif').attr('dy', '0.35em')
    const tooltipYear = tooltip.append('text').attr('fill', '#d1c4b0').attr('font-size', '10px').attr('font-family', 'serif').attr('dy', '0.35em')

    // Zoom
    const zoom = d3zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.15, 5])
      .on('zoom', (event) => { g.attr('transform', event.transform) })
    svg.call(zoom)

    // Simulation
    const simNodes: SimNode[] = nodes.map(n => ({ ...n }))
    const simLinks: SimLink[] = edges.map(e => ({ ...e }))

    const sim = forceSimulation(simNodes)
      .force('link', forceLink<SimNode, SimLink>(simLinks)
        .id(d => d.id)
        .distance(d => 60 + 40 / Math.max(1, d.strength)))
      .force('charge', forceManyBody().strength(-120))
      .force('center', forceCenter(width / 2, height / 2))
      .force('collision', forceCollide<SimNode>().radius(d => 8 + Math.sqrt(d.degree) * 2))

    // Edges
    const link = g.append('g')
      .selectAll<SVGLineElement, SimLink>('line')
      .data(simLinks)
      .join('line')
      .attr('stroke', '#d1c4b0')
      .attr('stroke-width', d => Math.min(3, Math.max(0.5, Math.sqrt(d.strength))))
      .attr('stroke-opacity', d => (d.type === 'hierarchy' ? 0.6 : 0.3))
      .attr('stroke-dasharray', d => (d.type === 'hierarchy' ? '4,3' : ''))

    // Nodes
    const node = g.append('g')
      .selectAll<SVGGElement, SimNode>('g')
      .data(simNodes)
      .join('g')
      .attr('cursor', 'pointer')

    node.append('circle')
      .attr('r', d => Math.max(4, Math.min(14, Math.sqrt(d.degree) * 3 + 4)))
      .attr('fill', d => TYPE_COLORS[d.type] || '#6b7280')
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)

    node.append('text')
      .text(d => (d.degree > 1 || d.type === 'book' || d.type === 'chapter') ? d.shortLabel : '')
      .attr('dx', 0)
      .attr('dy', d => Math.max(5, Math.min(16, Math.sqrt(d.degree) * 3 + 4)) + 10)
      .attr('text-anchor', 'middle')
      .attr('font-size', '9px')
      .attr('fill', '#4b3d2b')
      .attr('font-family', 'serif')
      .style('pointer-events', 'none')

    // Drag
    const drag = d3drag<SVGGElement, SimNode>()
      .on('start', (event, d) => {
        if (!event.active) sim.alphaTarget(0.3).restart()
        d.fx = d.x
        d.fy = d.y
      })
      .on('drag', (event, d) => {
        const t = zoomTransform(svgEl)
        const [mx, my] = pointer(event.sourceEvent, svgEl)
        d.fx = (mx - t.x) / t.k
        d.fy = (my - t.y) / t.k
      })
      .on('end', (event, d) => {
        if (!event.active) sim.alphaTarget(0)
        d.fx = null
        d.fy = null
      })
    node.call(drag)

    // Highlight on hover
    const highlight = (d: SimNode, show: boolean) => {
      const connectedIds = new Set<string>()
      connectedIds.add(d.id)
      if (show) {
        for (const l of simLinks) {
          const sid = typeof l.source === 'object' ? (l.source as SimNode).id : l.source
          const tid = typeof l.target === 'object' ? (l.target as SimNode).id : l.target
          if (sid === d.id) connectedIds.add(tid as string)
          if (tid === d.id) connectedIds.add(sid as string)
        }
      }
      node.select('circle').transition().duration(200).attr('opacity', n => (show && !connectedIds.has(n.id)) ? 0.12 : 1)
      link.transition().duration(200).attr('stroke-opacity', l => {
        if (!show) return l.type === 'hierarchy' ? 0.6 : 0.3
        const sid = typeof l.source === 'object' ? (l.source as SimNode).id : l.source
        const tid = typeof l.target === 'object' ? (l.target as SimNode).id : l.target
        return (sid === d.id || tid === d.id) ? 1 : 0.03
      })
    }

    node.on('mouseenter', function (_, d) { highlight(d, true) })
    node.on('mouseleave', function () {
      highlight(null as any, false)
      tooltip.attr('opacity', 0)
    })

    // Tooltip on hover
    node.on('mousemove', function (event, d) {
      const t = zoomTransform(svgEl)
      const nx = d.x! * t.k + t.x + 15
      const ny = d.y! * t.k + t.y
      tooltip.attr('transform', `translate(${nx}, ${ny})`).attr('opacity', 0.95)

      const titleText = d.label
      const metaText = d.year > 0 ? `${TYPE_LABELS[d.type]} · ${d.year}` : TYPE_LABELS[d.type]

      tooltipText.text(titleText)
      tooltipYear.text(metaText)

      const titleW = titleText.length * 6.5 + 12
      const metaW = metaText.length * 6 + 12
      const bw = Math.max(titleW, metaW, 72)
      tooltipBg.attr('width', bw).attr('height', 34)
      tooltipText.attr('x', 6).attr('y', 14)
      tooltipYear.attr('x', 6).attr('y', 28)
    })

    // Click to navigate
    if (onNodeClick) {
      node.on('click', function (event, d) {
        // Only navigate on plain click (not drag)
        if (event.defaultPrevented) return
        onNodeClick(d.id)
      })
    }

    // Tick
    sim.on('tick', () => {
      link
        .attr('x1', d => (d.source as SimNode).x!)
        .attr('y1', d => (d.source as SimNode).y!)
        .attr('x2', d => (d.target as SimNode).x!)
        .attr('y2', d => (d.target as SimNode).y!)
      node.attr('transform', d => `translate(${d.x},${d.y})`)
    })

    return () => { sim.stop() }
    // Re-run when data or dimensions change
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nodes, edges, width, height])

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height}
      className="w-full h-full"
      style={{ background: 'transparent' }}
    />
  )
}
