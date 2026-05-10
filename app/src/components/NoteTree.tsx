import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Folder, FileText, ChevronRight, ChevronDown } from 'lucide-react'
import type { VaultFile } from '@/types'

interface TreeItemProps {
  item: VaultFile
  depth?: number
  onSelect: (slug: string) => void
  selectedSlug?: string
}

export function TreeItem({ item, depth = 0, onSelect, selectedSlug }: TreeItemProps) {
  const [expanded, setExpanded] = useState(false)

  if (item.type === 'folder') {
    return (
      <div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1.5 w-full text-left py-1.5 px-2 rounded-md hover:bg-Ink/5 transition-colors dark:hover:bg-white/5"
          style={{ paddingLeft: `${depth * 12 + 8}px` }}
        >
          {expanded ? (
            <ChevronDown size={14} className="text-Slate shrink-0" />
          ) : (
            <ChevronRight size={14} className="text-Slate shrink-0" />
          )}
          <Folder size={14} className="text-Amber shrink-0" />
          <span className="text-[0.8125rem] font-medium text-Ink dark:text-white truncate">
            {item.name}
          </span>
        </button>
        <AnimatePresence initial={false}>
          {expanded && item.children && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {item.children.map((child) => (
                <TreeItem
                  key={child.path}
                  item={child}
                  depth={depth + 1}
                  onSelect={onSelect}
                  selectedSlug={selectedSlug}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    )
  }

  const slug = item.name
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9一-龥\-_]/g, '')
    .substring(0, 60)

  const isSelected = selectedSlug === slug

  return (
    <button
      onClick={() => onSelect(slug)}
      className={`flex items-center gap-2 w-full text-left py-1.5 px-2 rounded-md transition-colors ${
        isSelected
          ? 'bg-Amber/10 text-Amber'
          : 'hover:bg-Ink/5 text-Ink dark:text-white dark:hover:bg-white/5'
      }`}
      style={{ paddingLeft: `${depth * 12 + 24}px` }}
    >
      <FileText size={14} className={isSelected ? 'text-Amber' : 'text-Slate'} />
      <span className="text-[0.8125rem] font-medium truncate">{item.name}</span>
    </button>
  )
}

interface RootFilesGroupProps {
  files: VaultFile[]
  onSelect: (slug: string) => void
  selectedSlug?: string
  label: string
}

export function RootFilesGroup({ files, onSelect, selectedSlug, label }: RootFilesGroupProps) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div>
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-1.5 w-full text-left py-1.5 px-2 rounded-md hover:bg-Ink/5 transition-colors dark:hover:bg-white/5"
        style={{ paddingLeft: '8px' }}
      >
        {expanded ? (
          <ChevronDown size={14} className="text-Slate shrink-0" />
        ) : (
          <ChevronRight size={14} className="text-Slate shrink-0" />
        )}
        <Folder size={14} className="text-Sage shrink-0" />
        <span className="text-[0.8125rem] font-medium text-Ink dark:text-white truncate">
          {label}
        </span>
        <span className="text-[0.6875rem] text-Slate ml-1">({files.length})</span>
      </button>
      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {files.map((item) => (
              <TreeItem
                key={item.path}
                item={item}
                depth={1}
                onSelect={onSelect}
                selectedSlug={selectedSlug}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
