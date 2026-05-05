# Task 004: GraphView D3 知识图谱组件

## 前提
Task 001 必须已完成（linkParser 已就绪）

## 修改文件
- `app/src/components/GraphView.tsx`（修改此文件）
- `app/package.json`（添加 d3 依赖：`"d3": "^7.9.0"`）

## 禁止修改
- 不要改其他任何文件
- 不要改 index.css、tailwind.config.js

## 依赖安装
在 `app/package.json` 的 dependencies 中添加：
```json
"d3": "^7.9.0"
```
然后运行 `npm install`。

## 实现要求

实现一个 D3.js 力导向知识图谱组件，可视化文章之间的链接关系：

```tsx
import { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { useNavigate } from 'react-router-dom';
import { Post } from '@/data/posts';
import { buildLinkGraph } from '@/services/linkParser';

interface GraphViewProps {
  posts: Post[];
  highlightedSlug?: string;
}

interface GraphNode extends d3.SimulationNodeDatum {
  id: string;
  title: string;
  group: number;
}

interface GraphLink extends d3.SimulationLinkDatum<GraphNode> {
  source: string;
  target: string;
}

export default function GraphView({ posts, highlightedSlug }: GraphViewProps) {
  const svgRef = useRef<SVGSVGElement>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (!svgRef.current || posts.length === 0) return;

    const linkGraph = buildLinkGraph(posts);

    // 构建节点
    const nodes: GraphNode[] = posts
      .filter(p => {
        const bl = linkGraph.backlinks.get(p.slug) || [];
        const fl = linkGraph.forwardLinks.get(p.slug) || [];
        return bl.length > 0 || fl.length > 0;
      })
      .map((p, i) => ({
        id: p.slug,
        title: p.title,
        group: highlightedSlug && p.slug === highlightedSlug ? 2 : 1,
      }));

    // 如果少于 2 个有关联的节点，不渲染
    if (nodes.length < 2) return;

    // 构建边
    const nodeIds = new Set(nodes.map(n => n.id));
    const links: GraphLink[] = [];
    for (const [source, targets] of linkGraph.forwardLinks) {
      if (!nodeIds.has(source)) continue;
      for (const target of targets) {
        if (nodeIds.has(target)) {
          links.push({ source, target });
        }
      }
    }

    const width = svgRef.current.clientWidth || 600;
    const height = 350;

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();
    svg.attr('viewBox', `0 0 ${width} ${height}`);

    const isDark = document.documentElement.classList.contains('dark');
    const linkColor = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(100,94,86,0.3)';
    const textColor = isDark ? '#fff' : '#3A3632';
    const nodeColor = (d: GraphNode) => {
      if (d.group === 2) return '#E89E5A'; // highlighted amber
      return isDark ? '#5A5A5A' : '#8A847E';
    };

    const simulation = d3
      .forceSimulation<GraphNode>(nodes)
      .force('link', d3.forceLink<GraphNode, GraphLink>(links).id(d => d.id).distance(80))
      .force('charge', d3.forceManyBody().strength(-120))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(30));

    // 画边
    const link = svg
      .append('g')
      .selectAll('line')
      .data(links)
      .join('line')
      .attr('stroke', linkColor)
      .attr('stroke-width', 1);

    // 画节点
    const node = svg
      .append('g')
      .selectAll('g')
      .data(nodes)
      .join('g')
      .style('cursor', 'pointer')
      .on('click', (_event, d) => {
        navigate(`/blog/${d.id}`);
      });

    node
      .append('circle')
      .attr('r', d => (d.group === 2 ? 8 : 5))
      .attr('fill', nodeColor)
      .attr('stroke', nodeColor)
      .attr('stroke-width', 1);

    node
      .append('text')
      .text(d => d.title.length > 15 ? d.title.slice(0, 15) + '...' : d.title)
      .attr('x', 10)
      .attr('y', 4)
      .attr('font-size', '11px')
      .attr('fill', textColor)
      .attr('font-family', 'system-ui, sans-serif');

    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as GraphNode).x!)
        .attr('y1', d => (d.source as GraphNode).y!)
        .attr('x2', d => (d.target as GraphNode).x!)
        .attr('y2', d => (d.target as GraphNode).y!);

      node.attr('transform', d => `translate(${d.x},${d.y})`);
    });

    return () => {
      simulation.stop();
    };
  }, [posts, highlightedSlug, navigate]);

  return (
    <div className="mt-12 pt-8 border-t border-Sand dark:border-white/10">
      <h3 className="font-display text-xl font-medium text-Ink dark:text-white mb-4">
        Knowledge Graph
      </h3>
      <div className="bg-Linen dark:bg-white/5 rounded-xl border border-Sand dark:border-white/10 overflow-hidden">
        <svg ref={svgRef} className="w-full" style={{ height: '350px' }} />
      </div>
    </div>
  );
}
```

以上代码请直接写入文件。

## 完成后
1. 在 `app/.trae/results/task-004-done.md` 写一句总结
2. 更新 `app/.trae/tasks/STATUS.md`：task-004 状态改为 ✅完成
3. git commit 并 push
