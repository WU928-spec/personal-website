import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Box, Plus, Trash2, Play, Layers } from 'lucide-react'

interface CondaEnv {
  id: string
  name: string
  python: string
  packages: string[]
  isActive: boolean
}

const PACKAGE_ICONS: Record<string, string> = {
  numpy: '🔢',
  pandas: '🐼',
  matplotlib: '📊',
  pytorch: '🔥',
  tensorflow: '🧠',
  scikit: '🤖',
  jupyter: '📓',
  flask: '🌶️',
  django: '🎸',
  requests: '📡',
  pillow: '🖼️',
  opencv: '👁️',
}

const INITIAL_ENVS: CondaEnv[] = [
  { id: 'base', name: 'base', python: '3.11', packages: ['numpy', 'pandas', 'matplotlib'], isActive: true },
]

export default function CondaVisualizer() {
  const [envs, setEnvs] = useState<CondaEnv[]>(INITIAL_ENVS)
  const [commandInput, setCommandInput] = useState('')
  const [output, setOutput] = useState('')

  const parseCommand = useCallback((cmd: string) => {
    const trimmed = cmd.trim()
    if (!trimmed.startsWith('conda ')) return null

    const parts = trimmed.slice(6).split(' ').filter(Boolean)
    const action = parts[0]

    switch (action) {
      case 'create':
        const nameIdx = parts.indexOf('-n') >= 0 ? parts.indexOf('-n') : parts.indexOf('--name')
        const name = nameIdx >= 0 ? parts[nameIdx + 1] : 'new-env'
        const pythonIdx = parts.indexOf('python')
        const python = pythonIdx >= 0 ? parts[pythonIdx + 1] : '3.11'
        return { type: 'create' as const, name, python }
      case 'activate':
        return { type: 'activate' as const, name: parts[1] || 'base' }
      case 'deactivate':
        return { type: 'deactivate' as const }
      case 'install':
        const pkgs = parts.slice(1).filter(p => !p.startsWith('-'))
        return { type: 'install' as const, packages: pkgs.length > 0 ? pkgs : ['numpy'] }
      case 'remove':
      case 'uninstall':
        const rmPkgs = parts.slice(1).filter(p => !p.startsWith('-'))
        return { type: 'remove' as const, packages: rmPkgs.length > 0 ? rmPkgs : ['numpy'] }
      case 'env':
        if (parts[1] === 'remove' || parts[1] === 'delete') {
          const envNameIdx = parts.indexOf('-n') >= 0 ? parts.indexOf('-n') : parts.indexOf('--name')
          const envName = envNameIdx >= 0 ? parts[envNameIdx + 1] : parts[2]
          return { type: 'deleteEnv' as const, name: envName || 'new-env' }
        }
        if (parts[1] === 'list') {
          return { type: 'list' as const }
        }
        return null
      case 'list':
        return { type: 'list' as const }
      default:
        return null
    }
  }, [])

  const executeCommand = useCallback((cmd: string) => {
    const parsed = parseCommand(cmd)
    if (!parsed) {
      setOutput(`错误: 不支持的命令 "${cmd}"\n支持的命令: conda create, activate, deactivate, install, remove, env remove, env list`)
      return
    }

    switch (parsed.type) {
      case 'create': {
        if (envs.find(e => e.name === parsed.name)) {
          setOutput(`错误: 环境 '${parsed.name}' 已存在`)
          return
        }
        const newEnv: CondaEnv = {
          id: parsed.name,
          name: parsed.name,
          python: parsed.python,
          packages: [],
          isActive: false,
        }
        setEnvs(prev => [...prev, newEnv])
        setOutput(`已创建环境 '${parsed.name}' (Python ${parsed.python})`)
        break
      }

      case 'activate': {
        const target = envs.find(e => e.name === parsed.name)
        if (!target) {
          setOutput(`错误: 环境 '${parsed.name}' 不存在`)
          return
        }
        setEnvs(prev => prev.map(e => ({ ...e, isActive: e.name === parsed.name })))
        setOutput(`已激活环境 '${parsed.name}'`)
        break
      }

      case 'deactivate':
        setEnvs(prev => prev.map(e => ({ ...e, isActive: e.name === 'base' })))
        setOutput('已退出到 base 环境')
        break

      case 'install': {
        const activeEnv = envs.find(e => e.isActive)
        if (!activeEnv) {
          setOutput('错误: 没有激活的环境')
          return
        }
        const newPkgs = parsed.packages.filter(p => !activeEnv.packages.includes(p))
        if (newPkgs.length === 0) {
          setOutput('所有包已安装')
          return
        }
        setEnvs(prev => prev.map(e =>
          e.isActive ? { ...e, packages: [...e.packages, ...newPkgs] } : e
        ))
        setOutput(`已在 ${activeEnv.name} 中安装: ${newPkgs.join(', ')}`)
        break
      }

      case 'remove': {
        const activeEnv = envs.find(e => e.isActive)
        if (!activeEnv) {
          setOutput('错误: 没有激活的环境')
          return
        }
        const removed = parsed.packages.filter(p => activeEnv.packages.includes(p))
        if (removed.length === 0) {
          setOutput('未找到要移除的包')
          return
        }
        setEnvs(prev => prev.map(e =>
          e.isActive ? { ...e, packages: e.packages.filter(p => !removed.includes(p)) } : e
        ))
        setOutput(`已从 ${activeEnv.name} 中移除: ${removed.join(', ')}`)
        break
      }

      case 'deleteEnv': {
        if (parsed.name === 'base') {
          setOutput('错误: 不能删除 base 环境')
          return
        }
        const target = envs.find(e => e.name === parsed.name)
        if (!target) {
          setOutput(`错误: 环境 '${parsed.name}' 不存在`)
          return
        }
        setEnvs(prev => prev.filter(e => e.name !== parsed.name))
        setOutput(`已删除环境 '${parsed.name}'`)
        break
      }

      case 'list': {
        const list = envs.map(e => `${e.isActive ? '* ' : '  '}${e.name}  Python ${e.python}  [${e.packages.length} packages]`).join('\n')
        setOutput(`环境列表:\n${list}`)
        break
      }
    }
  }, [envs, parseCommand])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!commandInput.trim()) return
    executeCommand(commandInput)
    setCommandInput('')
  }

  const handleReset = () => {
    setEnvs(INITIAL_ENVS)
    setOutput('')
    setCommandInput('')
  }

  const activeEnv = envs.find(e => e.isActive)

  return (
    <div className="space-y-6">
      {/* 命令输入区 */}
      <div className="p-4 rounded-xl border border-Amber/10 dark:border-white/10 bg-white/60 dark:bg-white/[0.03]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-Ink/70 dark:text-white/70 font-body text-sm tracking-wider flex items-center gap-2">
            <Box size={16} className="text-Amber/60" />
            Conda 命令行
          </h3>
          <div className="flex items-center gap-2">
            <span className="text-xs text-Ink/40 dark:text-white/30 font-body">
              激活环境: <span className="text-Amber/60">{activeEnv?.name || 'none'}</span>
            </span>
            <button
              onClick={handleReset}
              className="p-1.5 rounded-md text-Ink/30 dark:text-white/20 hover:text-red-400/70 transition-colors"
              title="重置"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex gap-2 mb-3">
          <span className="text-sm text-Amber/60 font-mono py-2 shrink-0">(env)$</span>
          <input
            type="text"
            value={commandInput}
            onChange={(e) => setCommandInput(e.target.value)}
            placeholder="输入 conda 命令..."
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
          {[
            { cmd: 'conda create -n ml python=3.11', desc: '创建 ML 环境' },
            { cmd: 'conda activate ml', desc: '激活环境' },
            { cmd: 'conda install numpy pandas', desc: '安装包' },
            { cmd: 'conda list', desc: '列出环境' },
            { cmd: 'conda deactivate', desc: '退出环境' },
          ].map(({ cmd, desc }) => (
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

      {/* 环境卡片网格 */}
      <div className="p-4 rounded-xl border border-Amber/10 dark:border-white/10 bg-white/60 dark:bg-white/[0.03]">
        <h3 className="text-Ink/70 dark:text-white/70 font-body text-sm tracking-wider mb-4 flex items-center gap-2">
          <Layers size={16} className="text-Amber/60" />
          虚拟环境
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {envs.map(env => (
            <motion.div
              key={env.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`relative p-4 rounded-lg border transition-all duration-300 ${
                env.isActive
                  ? 'border-Amber/30 dark:border-white/20 bg-Amber/5 dark:bg-white/5'
                  : 'border-Amber/10 dark:border-white/10 bg-white/40 dark:bg-white/[0.02]'
              }`}
            >
              {/* 激活指示器 */}
              {env.isActive && (
                <div className="absolute top-2 right-2 flex items-center gap-1">
                  <Play size={10} className="text-green-400/60 fill-green-400/60" />
                  <span className="text-[10px] text-green-400/60 font-mono">active</span>
                </div>
              )}

              <div className="flex items-center gap-2 mb-3">
                <Box size={16} className={env.isActive ? 'text-Amber/60' : 'text-Ink/30 dark:text-white/20'} />
                <span className="text-sm font-mono text-Ink/70 dark:text-white/70">{env.name}</span>
                <span className="text-xs text-Ink/30 dark:text-white/20 font-mono">py{env.python}</span>
              </div>

              {/* 包列表 */}
              <div className="flex flex-wrap gap-1.5">
                {env.packages.length === 0 ? (
                  <span className="text-xs text-Ink/20 dark:text-white/10 font-body">空环境</span>
                ) : (
                  env.packages.map(pkg => (
                    <span
                      key={pkg}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/60 dark:bg-white/5 border border-Amber/10 dark:border-white/10 text-xs text-Ink/50 dark:text-white/40 font-mono"
                    >
                      <span>{PACKAGE_ICONS[pkg] || '📦'}</span>
                      {pkg}
                    </span>
                  ))
                )}
              </div>

              {/* 快速操作 */}
              <div className="flex gap-2 mt-3 pt-3 border-t border-Amber/10 dark:border-white/5">
                {!env.isActive && (
                  <button
                    onClick={() => executeCommand(`conda activate ${env.name}`)}
                    className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-Amber/60 hover:text-Amber/80 transition-colors"
                  >
                    <Play size={10} />
                    激活
                  </button>
                )}
                {env.name !== 'base' && (
                  <button
                    onClick={() => executeCommand(`conda env remove -n ${env.name}`)}
                    className="flex items-center gap-1 px-2 py-1 rounded-md text-xs text-red-400/40 hover:text-red-400/70 transition-colors"
                  >
                    <Trash2 size={10} />
                    删除
                  </button>
                )}
              </div>
            </motion.div>
          ))}

          {/* 添加环境按钮 */}
          <button
            onClick={() => {
              const name = `env-${envs.length}`
              executeCommand(`conda create -n ${name} python=3.11`)
            }}
            className="flex flex-col items-center justify-center gap-2 p-4 rounded-lg border border-dashed border-Amber/20 dark:border-white/10 bg-white/20 dark:bg-white/[0.01] hover:bg-white/40 dark:hover:bg-white/5 transition-colors min-h-[120px]"
          >
              <Plus size={20} className="text-Amber/40" />
              <span className="text-xs text-Ink/30 dark:text-white/20 font-body">新建环境</span>
          </button>
        </div>
      </div>
    </div>
  )
}
