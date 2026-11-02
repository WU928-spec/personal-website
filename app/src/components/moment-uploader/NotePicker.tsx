import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { FileText, Search, X } from 'lucide-react'
import { fetchNotes } from '@/services/noteClient'
import type { NoteMeta } from '@/types'

interface Props {
  open: boolean
  onSelect: (note: NoteMeta) => void
  onClose: () => void
}

export default function NotePicker({ open, onSelect, onClose }: Props) {
  const [notes, setNotes] = useState<NoteMeta[]>([])
  const [loading, setLoading] = useState(false)
  const [query, setQuery] = useState('')
  const pickerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    const load = async () => {
      setLoading(true)
      try {
        const list = await fetchNotes()
        setNotes(list.filter((note) => !note.filePath.endsWith('__folder__')))
      } catch {
        setNotes([])
      } finally {
        setLoading(false)
      }
    }
    void load()
  }, [open])

  useEffect(() => {
    if (!open) return
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) onClose()
    }
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('mousedown', handleClickOutside)
    document.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [open, onClose])

  const filtered = notes.filter((note) =>
    `${note.title} ${note.category} ${note.excerpt}`.toLowerCase().includes(query.trim().toLowerCase()),
  )

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
          <div ref={pickerRef} className="overflow-hidden rounded-xl border border-border bg-card shadow-xl">
            <div className="flex items-center justify-between border-b border-border px-4 py-2">
              <span className="text-caption font-medium text-foreground">选择笔记</span>
              <button onClick={onClose} aria-label="关闭笔记选择器" className="text-muted-foreground hover:text-foreground"><X size={16} /></button>
            </div>
            <div className="flex items-center gap-2 border-b border-border px-4 py-2">
              <Search size={14} className="text-muted-foreground" />
              <input autoFocus value={query} onChange={(event) => setQuery(event.target.value)} placeholder="搜索标题或内容" className="w-full bg-transparent py-1 text-caption text-foreground outline-none placeholder:text-muted-foreground" />
            </div>
            <div className="max-h-72 overflow-y-auto overscroll-contain py-1">
              {loading ? (
                <p className="py-6 text-center text-caption text-muted-foreground">正在读取笔记…</p>
              ) : filtered.length === 0 ? (
                <p className="py-6 text-center text-caption text-muted-foreground">暂无匹配笔记</p>
              ) : (
                filtered.map((note) => (
                  <button key={note.filePath} onClick={() => onSelect(note)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-muted/60">
                    <FileText size={14} className="shrink-0 text-Amber" />
                    <span className="min-w-0">
                      <span className="block truncate text-caption font-medium text-foreground">{note.title}</span>
                      <span className="block truncate text-label text-muted-foreground">{note.category}</span>
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
