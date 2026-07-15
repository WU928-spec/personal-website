import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GitBranch, GitCommit, Circle, RotateCcw } from 'lucide-react'

interface GitNode {
  id: string
  message: string
  branch: string
  x: number
  y: number
  parents: string[]
}

interface GitBranchData {
  name: string
  head: string
  color: string
}

const BRANCH_COLORS: Record<string, string> = {
  main: '#4ade80',
  develop: '#60a5fa',
  feature: '#f472b6',
  hotfix: '#f87171',
}

const INITIAL_NODES: GitNode[] = [
  { id: 'c0', message: 'Initial commit', branch: 'main', x: 0, y: 0, parents: [] },
]

const INITIAL_BRANCHES: GitBranchData[] = [
  { name: 'main', head: 'c0', color: BRANCH_COLORS.main },
]

const DEMO_COMMANDS = [
  { cmd: 'git init', desc: '初始化仓库' },
  { cmd: 'git add .', desc: '添加文件到暂存区' },
  { cmd: 'git commit -m "feat: add homepage"', desc: '提交更改' },
  { cmd: 'git branch develop', desc: '创建 develop 分支' },
  { cmd: 'git checkout develop', desc: '切换到 develop 分支' },
  { cmd: 'git commit -m "feat: add login"', desc: '在 develop 上提交' },
  { cmd: 'git checkout main', desc: '切换回 main' },
  { cmd: 'git merge develop', desc: '合并 develop 到 main' },
]

export default function GitVisualizer() {
  const [nodes, setNodes] = useState<GitNode[]>(INITIAL_NODES)
  const [branches, setBranches] = useState<GitBranchData[]>(INITIAL_BRANCHES)
  const [currentBranch, setCurrentBranch] = useState('main')
  const [commandInput, setCommandInput] = useState('')
  const [output, setOutput] = useState('')
  const [, _setHistory] = useState<string[]>([])

  const commitCounter = nodes.length

  const parseCommand = useCallback((cmd: string) => {
    const trimmed = cmd.trim()
    if (!trimmed.startsWith('git ')) return null

    const parts = trimmed.slice(4).split(' ').filter(Boolean)
    const action = parts[0]

    switch (action) {
      case 'init':
        return { type: 'init' as const }
      case 'add':
        return { type: 'add' as const, files: parts.slice(1).join(' ') || '.' }
      case 'commit': {
        const mIdx = parts.indexOf('-m')
        const message = mIdx >= 0 ? parts.slice(mIdx + 1).join(' ').replace(/^"|"$/g, '') : `commit ${commitCounter}`
        return { type: 'commit' as const, message }
      }
      case 'branch':
        return { type: 'branch' as const, name: parts[1] || 'new-branch' }
      case 'checkout':
        return { type: 'checkout' as const, name: parts[1] || 'main' }
      case 'merge':
        return { type: 'merge' as const, name: parts[1] || 'develop' }
      default:
        return null
    }
  }, [commitCounter])

  const executeCommand = useCallback((cmd: string) => {
    const parsed = parseCommand(cmd)
    if (!parsed) {
      setOutput(`错误: 不支持的命令 "${cmd}"\n支持的命令: init, add, commit, branch, checkout, merge`)
      return
    }

    _setHistory(prev => [...prev, cmd])

    switch (parsed.type) {
      case 'init':
        setNodes(INITIAL_NODES)
        setBranches(INITIAL_BRANCHES)
        setCurrentBranch('main')
        setOutput('已初始化空的 Git 仓库')
        break

      case 'add':
        setOutput(`已将 ${parsed.files} 添加到暂存区`)
        break

      case 'commit': {
        const branch = branches.find(b => b.name === currentBranch)
        if (!branch) return

        const parentId = branch.head
        const newId = `c${nodes.length}`
        const parentNode = nodes.find(n => n.id === parentId)

        const newNode: GitNode = {
          id: newId,
          message: parsed.message,
          branch: currentBranch,
          x: parentNode ? parentNode.x + 1 : 0,
          y: currentBranch === 'main' ? 0 : branches.findIndex(b => b.name === currentBranch) * 2,
          parents: parentId ? [parentId] : [],
        }

        setNodes(prev => [...prev, newNode])
        setBranches(prev => prev.map(b =>
          b.name === currentBranch ? { ...b, head: newId } : b
        ))
        setOutput(`[${currentBranch} ${newId}] ${parsed.message}`)
        break
      }

      case 'branch': {
        const existing = branches.find(b => b.name === parsed.name)
        if (existing) {
          setOutput(`错误: 分支 '${parsed.name}' 已存在`)
          return
        }
        const currentHead = branches.find(b => b.name === currentBranch)?.head || 'c0'
        const colorKeys = Object.keys(BRANCH_COLORS)
        const color = BRANCH_COLORS[parsed.name] || BRANCH_COLORS[colorKeys[branches.length % colorKeys.length]]
        setBranches(prev => [...prev, { name: parsed.name, head: currentHead, color }])
        setOutput(`已创建分支 '${parsed.name}'`)
        break
      }

      case 'checkout': {
        const target = branches.find(b => b.name === parsed.name)
        if (!target) {
          setOutput(`错误: 分支 '${parsed.name}' 不存在`)
          return
        }
        setCurrentBranch(parsed.name)
        setOutput(`已切换到分支 '${parsed.name}'`)
        break
      }

      case 'merge': {
        const sourceBranch = branches.find(b => b.name === parsed.name)
        const targetBranch = branches.find(b => b.name === currentBranch)
        if (!sourceBranch) {
          setOutput(`错误: 分支 '${parsed.name}' 不存在`)
          return
        }
        if (!targetBranch) return

        const mergeId = `c${nodes.length}`
        const newNode: GitNode = {
          id: mergeId,
          message: `Merge branch '${parsed.name}' into ${currentBranch}`,
          branch: currentBranch,
          x: Math.max(...nodes.map(n => n.x)) + 1,
          y: 0,
          parents: [targetBranch.head, sourceBranch.head],
        }

        setNodes(prev => [...prev, newNode])
        setBranches(prev => prev.map(b =>
          b.name === currentBranch ? { ...b, head: mergeId } : b
        ))
        setOutput(`已合并 '${parsed.name}' 到 '${currentBranch}'`)
        break
      }
    }
  }, [branches, currentBranch, nodes, parseCommand])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!commandInput.trim()) return
    executeCommand(commandInput)
    setCommandInput('')
  }

  const handleReset = () => {
    setNodes(INITIAL_NODES)
    setBranches(INITIAL_BRANCHES)
    setCurrentBranch('main')
    _setHistory([])
    setOutput('')
    setCommandInput('')
  }

  const maxX = Math.max(...nodes.map(n => n.x), 0)
  const svgWidth = Math.max(600, (maxX + 2) * 100)
  const svgHeight = Math.max(200, (branches.length + 1) * 80)

  return (
    <div className="space-y-6">
      {/* 命令输入区 */}
      <div className="p-4 rounded-xl border border-Amber/10 dark:border-white/10 bg-white/60 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-Ink/70 dark:text-white/70 font-body text-sm tracking-wider flex items-center gap-2">
            <GitBranch size={16} className="text-Amber/60" />
            Git 命令行
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-Ink/40 dark:text-white/30 font-body">
              当前分支: <span className="text-Amber/60">{currentBranch}</span>
            </span>
            <button
              onClick={handleReset}
              className="p-1.5 rounded-md text-Ink/30 dark:text-white/20 hover:text-red-400/70 transition-colors"
              title="重置"
            >
              <RotateCcw size={14} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
          <span className="text-sm text-Amber/60 font-mono py-2 shrink-0">$</span>
          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            placeholder="输入 git 命令..."
            className="flex-1 bg-white/70 dark:bg-white/5 border border-Amber/10 dark:border-white/10 rounded-lg px-3 py-2 text-sm text-Ink/80 dark:text-white/80 font-mono placeholder:text-Ink/30 dark:placeholder:text-white/20 focus:outline-none focus:border-Amber/30 dark:focus:border-white/30 transition-colors"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-Amber/20 hover:bg-Amber/30 text-Amber/80 text-xs font-body tracking-wider transition-colors border border-Amber/20"
          >
            执行
          </button>
        </form>

        {/* 快捷命令 */}
        <div className="flex flex-wrap gap-2 mb-3">
          {DEMO_COMMANDS.map(({ cmd, desc }) => (
            <button
              key={cmd}
              onClick={() => {
                setCommandInput(cmd)
                executeCommand(cmd)
              }}
              className="px-2.5 py-1 rounded-md bg-white/50 dark:bg-white/5 border border-Amber/10 dark:border-white/10 text-xs text-Ink/50 dark:text-white/40 font-mono hover:text-Amber/60 hover:border-Amber/20 transition-colors"
              title={desc}
            >
              {cmd}
            </button>
          ))}
        </div>

        {/* 输出 */}
        <AnimatePresence>
          {output && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-2 p-3 rounded-lg bg-black/5 dark:bg-white/5 border border-Amber/5 dark:border-white/5"
            >
              <pre className="text-xs text-Ink/60 dark:text-white/50 font-mono whitespace-pre-wrap">{output}</pre>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 树状图 */}
      <div className="p-4 rounded-xl border border-Amber/10 dark:border-white/10 bg-white/60 dark:bg-white/[0.03] overflow-x-auto">
        <h3 className="text-Ink/70 dark:text-white/70 font-body text-sm tracking-wider mb-4 flex items-center gap-2">
          <GitCommit size={16} className="text-Amber/60" />
          提交历史
        </h3>
        <svg width={svgWidth} height={svgHeight} className="min-w-full">
          {/* 连接线 */}
          {nodes.map(node =>
            node.parents.map(parentId => {
              const parent = nodes.find(n => n.id === parentId)
              if (!parent) return null
              return (
                <line
                  key={`${node.id}-${parentId}`}
                  x1={parent.x * 100 + 50}
                  y1={parent.y * 60 + 40}
                  x2={node.x * 100 + 50}
                  y2={node.y * 60 + 40}
                  stroke={BRANCH_COLORS[node.branch] || '#888'}
                  strokeWidth={2}
                  strokeOpacity={0.5}
                />
              )
            })
          )}

          {/* 节点 */}
          {nodes.map(node => {
            const isHead = branches.some(b => b.head === node.id)
            const branchColor = BRANCH_COLORS[node.branch] || '#888'
            return (
              <g key={node.id}>
                <circle
                  cx={node.x * 100 + 50}
                  cy={node.y * 60 + 40}
                  r={isHead ? 10 : 7}
                  fill={branchColor}
                  stroke={isHead ? '#fff' : 'none'}
                  strokeWidth={isHead ? 3 : 0}
                  className="dark:stroke-white/20"
                />
                <text
                  x={node.x * 100 + 50}
                  y={node.y * 60 + 65}
                  textAnchor="middle"
                  fill="currentColor"
                  className="text-[10px] font-mono fill-Ink/50 dark:fill-white/40"
                >
                  {node.id}
                </text>
                <text
                  x={node.x * 100 + 50}
                  y={node.y * 60 + 78}
                  textAnchor="middle"
                  fill="currentColor"
                  className="text-[9px] fill-Ink/30 dark:fill-white/20"
                >
                  {node.message.length > 12 ? node.message.slice(0, 12) + '...' : node.message}
                </text>
                {isHead && (
                  <text
                    x={node.x * 100 + 50}
                    y={node.y * 60 + 20}
                    textAnchor="middle"
                    fill={branchColor}
                    className="text-[9px] font-bold"
                  >
                    {branches.find(b => b.head === node.id)?.name}
                  </text>
                )}
              </g>
            )
          })}
        </svg>

        {/* 图例 */}
        <div className="flex flex-wrap gap-3 mt-4 pt-3 border-t border-Amber/10 dark:border-white/5">
          {branches.map(b => (
            <div key={b.name} className="flex items-center gap-1.5">
              <Circle size={8} fill={b.color} stroke="none" />
              <span className="text-xs text-Ink/40 dark:text-white/30 font-mono">{b.name}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
