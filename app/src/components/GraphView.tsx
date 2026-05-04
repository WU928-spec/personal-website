import { useRef, useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import * as d3 from 'd3'
import { Network, Maximize2 } from 'lucide-react'
import type { ObsidianNoteMeta } from '@/types'

interface GraphViewProps {
  notes: ObsidianNoteMeta[]
  height?: number
}

export default function GraphView({ notes, height = 500 }: GraphViewProps) {
  const navigate = useNavigate()
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [isDark, setIsDark] = useState(false)

  // Detect dark mode
  useEffect(() => {
    const check = () => setIsDark(document.documentElement.classList.contains('dark'))
    check()
    const observer = new MutationObserver(check)
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const buildGraph = useCallback(() => {
    if (!svgRef.current || notes.length === 0) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = svgRef.current.clientWidth || 800
    const h = height

    // Build nodes and links
    const nodeMap = new Map<string, ObsidianNoteMeta>()
    for (const n of notes) nodeMap.set(n.slug, n)

    const nodes = notes.map((n) => ({
      id: n.slug,
      title: n.title,
      category: n.category,
      radius: 8 + Math.min(n.outboundLinks.length * 2, 12),
    }))

    const links: { source: string; target: string }[] = []
    const seen = new Set<string>()
    for (const note of notes) {
      for (const target of note.outboundLinks) {
        if (nodeMap.has(target)) {
          const key = [note.slug, target].sort().join('→')
          if (!seen.has(key)) {
            seen.add(key)
            links.push({ source: note.slug, target })
          }
        }
      }
    }

    // Color scale for categories
    const categories = [...new Set(notes.map((n) => n.category))]
    const colorScale = d3.scaleOrdinal<string, string>()
      .domain(categories)
      .range([
        '#C4783A', // Amber
        '#6B8E6B', // Sage
        '#C9A84C', // Gold
        '#B8695A', // Rose
        '#7B9E9E', // Teal-ish
        '#9E7BB9', // Purple-ish
      ])

    const g = svg.append('g')

    // Zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.3, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })
    svg.call(zoom)

    // Simulation
    const simulation = d3.forceSimulation(nodes as d3.SimulationNodeDatum[])
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-300))
      .force('center', d3.forceCenter(width / 2, h / 2))
      .force('collision', d3.forceCollide().radius((d: any) => d.radius + 5))

    // Links
    const link = g.append('g')
      .attr('stroke', isDark ? 'rgba(255,255,255,0.15)' : 'rgba(30,28,26,0.12)')
      .attr('stroke-width', 1.5)
      .selectAll('line')
      .data(links)
      .join('line')

    // Nodes
    const node = g.append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .style('cursor', 'pointer')
      .call(
        d3.drag<any, any>()
          .on('start', (event, d: any) => {
            if (!event.active) simulation.alphaTarget(0.3).restart()
            d.fx = d.x
            d.fy = d.y
          })
          .on('drag', (event, d: any) => {
            d.fx = event.x
            d.fy = event.y
          })
          .on('end', (event, d: any) => {
            if (!event.active) simulation.alphaTarget(0)
            d.fx = null
            d.fy = null
          })
      )

    node.append('circle')
      .attr('r', (d: any) => d.radius)
      .attr('fill', (d: any) => colorScale(d.category) as string)
      .attr('stroke', isDark ? '#1E1C1A' : '#F7F4EF')
      .attr('stroke-width', 2)
      .on('click', (_event, d: any) => {
        navigate(`/blog/${d.id}`)
      })

    // Labels
    node.append('text')
      .text((d: any) => d.title)
      .attr('x', (d: any) => d.radius + 4)
      .attr('y', 4)
      .attr('font-size', '11px')
      .attr('font-weight', '500')
      .attr('fill', isDark ? 'rgba(255,255,255,0.8)' : 'rgba(30,28,26,0.75)')
      .style('pointer-events', 'none')
      .style('user-select', 'none')

    // Tick
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => d.source.x)
        .attr('y1', (d: any) => d.source.y)
        .attr('x2', (d: any) => d.target.x)
        .attr('y2', (d: any) => d.target.y)

      node.attr('transform', (d: any) => `translate(${d.x},${d.y})`)
    })

    return () => {
      simulation.stop()
    }
  }, [notes, height, isDark, navigate])

  useEffect(() => {
    const cleanup = buildGraph()
    return () => {
      if (cleanup) cleanup()
    }
  }, [buildGraph])

  const handleReset = () => {
    if (!svgRef.current) return
    const svg = d3.select(svgRef.current)
    svg.transition().duration(500).call(
      d3.zoom<SVGSVGElement, unknown>().transform,
      d3.zoomIdentity
    )
  }

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Network size={16} className="text-Amber" />
          <h3 className="font-display text-[1.125rem] font-semibold text-Ink dark:text-white">
            知识图谱
          </h3>
          <span className="text-[0.75rem] text-Slate">
            {notes.length} 个节点
          </span>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[0.75rem] font-medium text-Slate bg-Linen hover:bg-Mist transition-colors dark:bg-white/10 dark:text-white/70 dark:hover:bg-white/20"
        >
          <Maximize2 size={12} />
          重置视图
        </button>
      </div>
      <div
        ref={containerRef}
        className="relative rounded-xl border border-Sand dark:border-white/10 overflow-hidden bg-Linen/30 dark:bg-white/5"
        style={{ height }}
      >
        <svg
          ref={svgRef}
          width="100%"
          height="100%"
          style={{ display: 'block' }}
        />
      </div>
    </div>
  )
}
