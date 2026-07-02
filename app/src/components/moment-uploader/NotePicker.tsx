import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Folder, ChevronRight, ChevronDown, FileText, X } from 'lucide-react'
import { fetchVaultTree } from '@/services/obsidianClient'
import type { VaultFile } from '@/types'

interface Props {
  open: boolean
  onSelect: (item: VaultFile) => void
  onClose: () => void
}

/* ── Recursive tree node renderer ── */
function TreeNode({
  item,
  depth = 0,
  expanded,
  onToggle,
  onSelect,
  highlightedPath,
}: {
  item: VaultFile
  depth?: number
  expanded: Set<string>
  onToggle: (path: string) => void
  onSelect: (item: VaultFile) => void
  highlightedPath: string
}) {
  const isExpanded = expanded.has(item.path)
  const isHighlighted = highlightedPath === item.path

  if (item.type === 'folder') {
    return (
      <div>
        <button
          data-nav-item
          data-path={item.path}
          onClick={() => onToggle(item.path)}
          className={`flex items-center gap-2 w-full text-left py-2 px-4 rounded-md transition-colors ${
            isHighlighted
              ? 'bg-muted'
              : 'hover:bg-muted/50'
          }`}
          style={{ paddingLeft: `${depth * 14 + 12}px` }}
        >
          {isExpanded ? (
            <ChevronDown size={14} className="text-muted-foreground shrink-0" />
          ) : (
            <ChevronRight size={14} className="text-muted-foreground shrink-0" />
          )}
          <Folder size={14} className="text-amber-500 shrink-0" />
          <span className="text-caption font-medium text-foreground truncate">
            {item.name}
          </span>
        </button>
        <AnimatePresence initial={false}>
          {isExpanded && item.children && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.18 }}
              className="overflow-hidden"
            >
              {item.children.map((child) => (
                <TreeNode
                  key={child.path}
                  item={child}
                  depth={depth + 1}
                  expanded={expanded}
                  onToggle={onToggle}
                  onSelect={onSelect}
                  highlightedPath={highlightedPath}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  return (
    <button
      data-nav-item
      data-path={item.path}
      onClick={() => onSelect(item)}
      className={`flex items-center gap-2 w-full text-left py-2 px-4 rounded-md transition-colors ${
        isHighlighted
          ? 'bg-Amber/10 text-Amber'
          : 'text-foreground hover:bg-muted/50'
      }`}
      style={{ paddingLeft: `${depth * 14 + 30}px` }}
    >
      <FileText
        size={14}
        className={isHighlighted ? 'text-Amber shrink-0' : 'text-muted-foreground shrink-0'}
      />
      <span className="text-caption truncate">{item.name}</span>
    </button>
  )
}

/* ── Root files group ── */
function RootFilesGroup({
  files,
  onSelect,
  highlightedPath,
}: {
  files: VaultFile[]
  onSelect: (item: VaultFile) => void
  highlightedPath: string
}) {
  return (
    <div>
      {files.map((item) => (
        <button
          key={item.path}
          data-nav-item
          data-path={item.path}
          onClick={() => onSelect(item)}
          className={`flex items-center gap-2 w-full text-left py-2 px-4 rounded-md transition-colors ${
            highlightedPath === item.path
              ? 'bg-Amber/10 text-Amber'
              : 'text-foreground hover:bg-muted/50'
          }`}
          style={{ paddingLeft: '30px' }}
        >
          <FileText
            size={14}
            className={highlightedPath === item.path ? 'text-Amber shrink-0' : 'text-muted-foreground shrink-0'}
          />
          <span className="text-caption truncate">{item.name}</span>
        </button>
      ))}
    </div>
  )
}

export default function NotePicker({ open, onSelect, onClose }: Props) {
  const [tree, setTree] = useState<VaultFile[]>([])
  const [treeLoading, setTreeLoading] = useState(false)
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [highlightedPath, setHighlightedPath] = useState('')
  const pickerRef = useRef<HTMLDivElement>(null)

  const loadTree = async () => {
    setTreeLoading(true)
    try {
      const treeData = await fetchVaultTree()
      setTree(treeData)
      setExpandedFolders(new Set())
    } catch {
      setTree([])
    }
    setTreeLoading(false)
  }

  useEffect(() => {
    if (open && tree.length === 0) {
      loadTree()
    }
  }, [open, tree.length])

  const toggleFolder = useCallback((path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev)
      if (next.has(path)) next.delete(path)
      else next.add(path)
      return next
    })
  }, [])

  /* ── Keyboard navigation ── */
  const getNavItems = useCallback(() => {
    const el = pickerRef.current
    if (!el) return []
    return Array.from(el.querySelectorAll<HTMLElement>('[data-nav-item]'))
  }, [])

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const items = getNavItems()
      if (items.length === 0) return

      const currentIndex = items.findIndex((el) => el.dataset.path === highlightedPath)
      let nextIndex = currentIndex

      if (e.key === 'ArrowDown') {
        e.preventDefault()
        nextIndex = currentIndex < items.length - 1 ? currentIndex + 1 : 0
      } else if (e.key === 'ArrowUp') {
        e.preventDefault()
        nextIndex = currentIndex > 0 ? currentIndex - 1 : items.length - 1
      } else if (e.key === 'Enter') {
        e.preventDefault()
        const path = items[currentIndex]?.dataset.path
        if (!path) return
        const findItem = (nodes: VaultFile[]): VaultFile | null => {
          for (const n of nodes) {
            if (n.path === path) return n
            if (n.children) {
              const found = findItem(n.children)
              if (found) return found
            }
          }
          return null
        }
        const item = findItem(tree)
        if (item) {
          if (item.type === 'folder') toggleFolder(item.path)
          else onSelect(item)
        }
      } else if (e.key === 'Escape') {
        e.preventDefault()
        onClose()
      }

      if (nextIndex !== currentIndex && items[nextIndex]) {
        const path = items[nextIndex].dataset.path || ''
        setHighlightedPath(path)
        items[nextIndex].scrollIntoView({ block: 'nearest', behavior: 'smooth' })
      }
    },
    [getNavItems, highlightedPath, tree, toggleFolder, onSelect, onClose]
  )

  /* Auto-focus first item when picker opens and data loads */
  useEffect(() => {
    if (open && !treeLoading && tree.length > 0) {
      const timer = setTimeout(() => {
        const items = pickerRef.current?.querySelectorAll<HTMLElement>('[data-nav-item]')
        if (items && items.length > 0) {
          const firstPath = items[0].dataset.path || ''
          setHighlightedPath(firstPath)
          pickerRef.current?.focus()
        }
      }, 100)
      return () => clearTimeout(timer)
    }
  }, [open, treeLoading, tree.length])

  /* Reset state when picker closes */
  useEffect(() => {
    if (!open) {
      setHighlightedPath('')
    }
  }, [open])

  /* Click outside to close */
  useEffect(() => {
    if (!open) return
    const handleClickOutside = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open, onClose])

  const folderNodes = tree.filter((i) => i.type === 'folder')
  const rootFileNodes = tree.filter((i) => i.type === 'file')

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.15 }}
          className="absolute inset-x-0 top-full z-50 mx-4 mt-2"
        >
          <div
            ref={pickerRef}
            tabIndex={-1}
            onKeyDown={handleKeyDown}
            className="bg-card border border-border rounded-lg shadow-xl overflow-hidden outline-none"
          >
            <div className="flex items-center justify-between px-4 py-2 border-b border-border">
              <span className="text-caption font-medium text-foreground">选择笔记</span>
              <button
                onClick={onClose}
                className="text-muted-foreground hover:text-foreground transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <div
              className="max-h-72 overflow-y-auto overscroll-contain py-1"
              onWheel={(e) => e.stopPropagation()}
            >
              {treeLoading ? (
                <div className="flex justify-center py-6">
                  <div className="w-5 h-5 border-2 border-Amber border-t-transparent rounded-full animate-spin" />
                </div>
              ) : tree.length === 0 ? (
                <div className="py-6 text-center text-caption text-muted-foreground">暂无笔记</div>
              ) : (
                <>
                  {folderNodes.map((item) => (
                    <TreeNode
                      key={item.path}
                      item={item}
                      expanded={expandedFolders}
                      onToggle={toggleFolder}
                      onSelect={onSelect}
                      highlightedPath={highlightedPath}
                    />
                  ))}
                  {rootFileNodes.length > 0 && (
                    <RootFilesGroup
                      files={rootFileNodes}
                      onSelect={onSelect}
                      highlightedPath={highlightedPath}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
