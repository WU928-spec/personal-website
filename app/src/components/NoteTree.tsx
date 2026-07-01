import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import type { VaultFile, ObsidianNoteMeta } from '@/types'

interface NoteTreeProps {
  tree: VaultFile[]
  onSelect: (slug: string) => void
  selectedSlug?: string
  notes?: ObsidianNoteMeta[]
  isLoggedIn: boolean
  onContextMenu: (path: string, isFolder: boolean, e: React.MouseEvent) => void
  draggedPath: string | null
  setDraggedPath: (path: string | null) => void
  onMove: (filePath: string, folderPath: string) => void
}

interface NoteTreeItemProps {
  item: VaultFile
  onSelect: (slug: string) => void
  selectedSlug?: string
  notes?: ObsidianNoteMeta[]
  isLoggedIn: boolean
  onContextMenu: (path: string, isFolder: boolean, e: React.MouseEvent) => void
  draggedPath: string | null
  setDraggedPath: (path: string | null) => void
  onMove: (filePath: string, folderPath: string) => void
  depth?: number
}

function NoteTreeItem({
  item,
  onSelect,
  selectedSlug,
  notes = [],
  isLoggedIn,
  onContextMenu,
  draggedPath,
  setDraggedPath,
  onMove,
  depth = 0,
}: NoteTreeItemProps) {
  const [expanded, setExpanded] = useState(false)

  if (item.type === 'folder') {
    const isDropTarget = draggedPath && draggedPath !== item.path
    return (
      <div>
        <div
          className={`flex items-center text-left py-1 pr-2 cursor-pointer transition-colors ${
            isDropTarget ? 'bg-accent/30' : 'hover:bg-muted'
          }`}
          style={{ paddingLeft: `${depth * 16 + 4}px` }}
          onClick={() => setExpanded(!expanded)}
          onContextMenu={(e) => onContextMenu(item.path, true, e)}
          onDragOver={(e) => {
            if (isDropTarget) e.preventDefault()
          }}
          onDrop={() => {
            if (draggedPath) onMove(draggedPath, item.path)
          }}
        >
          <span className="w-4 flex items-center justify-center shrink-0">
            {expanded ? (
              <ChevronRight size={11} className="text-muted rotate-90" />
            ) : (
              <ChevronRight size={11} className="text-muted" />
            )}
          </span>
          <span className="text-caption text-card-foreground truncate">{item.name}</span>
        </div>
        <AnimatePresence initial={false}>
          {expanded && item.children && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.15 }}
            >
              {item.children.map((child) => (
                <NoteTreeItem
                  key={child.path}
                  item={child}
                  {...{ onSelect, selectedSlug, notes, isLoggedIn, onContextMenu, draggedPath, setDraggedPath, onMove }}
                  depth={depth + 1}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  // File
  const note = notes.find((n) => n.filePath === item.path)
  const slug =
    note?.slug ||
    item.name
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9一-龥\-_]/g, '')
      .substring(0, 60)
  const isSelected = selectedSlug === slug

  return (
    <div
      draggable={isLoggedIn}
      onDragStart={() => setDraggedPath(item.path)}
      onDragEnd={() => setDraggedPath(null)}
      className="flex items-center text-left py-1 pr-2 cursor-pointer transition-colors"
      style={{ paddingLeft: `${depth * 16 + 20}px` }}
      onClick={() => onSelect(slug)}
      onContextMenu={(e) => onContextMenu(item.path, false, e)}
    >
      <span
        className={`text-caption truncate ${
          isSelected ? 'text-primary-foreground bg-accent' : 'text-card-foreground hover:bg-muted'
        }`}
      >
        {item.name}
      </span>
    </div>
  )
}

export default function NoteTree({ tree, ...props }: NoteTreeProps) {
  return (
    <>
      {tree.map((item) => (
        <NoteTreeItem key={item.path} item={item} {...props} />
      ))}
    </>
  )
}
