import { useState, useEffect, useRef, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, FileText, Tag } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { fetchObsidianNotes } from '@/services/obsidianClient'
import { dbToMoment, isSupabaseReady, supabase } from '@/lib/supabase'
import type { Moment } from '@/types/moment'

interface SearchResult {
  type: 'note' | 'moment'
  id: string
  title: string
  excerpt: string
  category?: string
  tags?: string[]
  createdAt?: string
  location?: string
}

interface GlobalSearchProps {
  isOpen: boolean
  onClose: () => void
}

function calcScore(item: SearchResult, query: string): number {
  const q = query.toLowerCase()
  const t = item.title.toLowerCase()
  const e = item.excerpt.toLowerCase()
  let score = 0

  if (t === q) score += 100
  else if (t.startsWith(q)) score += 80
  else if (t.includes(q)) score += 60

  if (item.tags) {
    if (item.tags.some((tag) => tag.toLowerCase() === q)) score += 50
    else if (item.tags.some((tag) => tag.toLowerCase().includes(q))) score += 40
  }

  const c = (item.category || '').toLowerCase()
  if (c === q) score += 45
  else if (c.includes(q)) score += 35

  if (e === q) score += 30
  else if (e.startsWith(q)) score += 25
  else if (e.includes(q)) score += 20

  const loc = (item.location || '').toLowerCase()
  if (loc === q) score += 15
  else if (loc.includes(q)) score += 10

  return score
}

function loadLocalMoments(): Moment[] {
  try {
    const raw = localStorage.getItem('moments_v1')
    if (!raw) return []
    return JSON.parse(raw) as Moment[]
  } catch {
    return []
  }
}

async function fetchMomentsForSearch(): Promise<Moment[]> {
  if (!isSupabaseReady()) return loadLocalMoments()

  try {
    const timeout = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('Supabase timeout')), 2000)
    )
    const query = supabase!
      .from('moments')
      .select('*')
      .order('created_at', { ascending: false })
    const { data, error } = await Promise.race([query, timeout])
    if (error || !data) return loadLocalMoments()
    return (data as Record<string, unknown>[]).map(dbToMoment)
  } catch {
    return loadLocalMoments()
  }
}

export default function GlobalSearch({ isOpen, onClose }: GlobalSearchProps) {
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [highlightedIndex, setHighlightedIndex] = useState(0)
  const searchInputRef = useRef<HTMLInputElement>(null)

  const loadSearchData = useCallback(async () => {
    if (searchResults.length > 0) return
    setSearchLoading(true)
    try {
      const [notes, moments] = await Promise.all([fetchObsidianNotes(), fetchMomentsForSearch()])
      const results: SearchResult[] = []

      notes.forEach((n) =>
        results.push({
          type: 'note',
          id: n.slug,
          title: n.title,
          excerpt: n.excerpt,
          category: n.category,
          tags: n.tags,
        })
      )

      moments.forEach((m) => {
        const content = m.content.trim()
        results.push({
          type: 'moment',
          id: m.id,
          title: content ? content.slice(0, 30) + (content.length > 30 ? '...' : '') : '图片动态',
          excerpt: content,
          createdAt: m.createdAt,
          location: m.location,
        })
      })

      setSearchResults(results)
    } catch {
      setSearchResults([])
    }
    setSearchLoading(false)
  }, [searchResults.length])

  useEffect(() => {
    if (isOpen) {
      setSearchQuery('')
      setHighlightedIndex(0)
      loadSearchData()
      const timer = setTimeout(() => searchInputRef.current?.focus(), 50)
      return () => clearTimeout(timer)
    }
  }, [isOpen, loadSearchData])

  const filtered = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return []
    return searchResults
      .filter((r) => {
        const text = `${r.title} ${r.excerpt} ${r.category || ''} ${r.tags?.join(' ') || ''} ${r.location || ''}`.toLowerCase()
        return text.includes(q)
      })
      .map((r) => ({ item: r, score: calcScore(r, q) }))
      .sort((a, b) => b.score - a.score)
      .map((r) => r.item)
  }, [searchQuery, searchResults])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault()
      onClose()
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlightedIndex((i) => (i < filtered.length - 1 ? i + 1 : 0))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlightedIndex((i) => (i > 0 ? i - 1 : filtered.length - 1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      const note = filtered[highlightedIndex]
      if (note) {
        onClose()
        if (note.type === 'note') {
          navigate(`/obsidian?note=${encodeURIComponent(note.id)}`)
        } else {
          navigate('/moments')
        }
      }
    }
  }

  useEffect(() => {
    setHighlightedIndex(0)
  }, [searchQuery])

  if (!isOpen) return null

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm flex items-start justify-center pt-[20vh] px-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: -20, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.96 }}
          transition={{ duration: 0.2 }}
          className="w-full max-w-lg bg-Parchment dark:bg-[#1a1a1a] rounded-xl shadow-2xl border border-Sand dark:border-white/10 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center gap-3 px-4 py-3 border-b border-Sand dark:border-white/10">
            <Search size={18} className="text-Slate shrink-0" />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="搜索笔记..."
              className="flex-1 bg-transparent text-Ink dark:text-white placeholder:text-Slate/60 text-[0.9375rem] focus:outline-none"
            />
            {searchQuery && (
              <button onClick={() => setSearchQuery('')} className="text-Slate hover:text-Ink dark:hover:text-white">
                <X size={16} />
              </button>
            )}
            <span className="text-[0.6875rem] text-Slate border border-Sand dark:border-white/20 rounded px-1.5 py-0.5">
              ESC
            </span>
          </div>

          <div className="max-h-[50vh] overflow-y-auto overscroll-contain touch-pan-y" onWheel={(e) => e.stopPropagation()}>
            {searchLoading ? (
              <div className="flex justify-center py-6">
                <div className="w-5 h-5 border-2 border-Amber border-t-transparent rounded-full animate-spin" />
              </div>
            ) : !searchQuery.trim() ? (
              <div className="py-6 text-center text-sm text-Slate">输入关键词搜索笔记</div>
            ) : filtered.length === 0 ? (
              <div className="py-6 text-center text-sm text-Slate">未找到相关笔记</div>
            ) : (
              <div className="py-1">
                {filtered.map((item, idx) => (
                  <button
                    key={`${item.type}-${item.id}`}
                    onClick={() => {
                      onClose()
                      if (item.type === 'note') {
                        navigate(`/obsidian?note=${encodeURIComponent(item.id)}`)
                      } else {
                        navigate('/moments')
                      }
                    }}
                    onMouseEnter={() => setHighlightedIndex(idx)}
                    className={`w-full text-left px-4 py-2.5 transition-colors ${
                      idx === highlightedIndex ? 'bg-Amber/10' : 'hover:bg-gray-50 dark:hover:bg-white/5'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {item.type === 'note' ? (
                        <FileText size={14} className={idx === highlightedIndex ? 'text-Amber shrink-0' : 'text-Slate shrink-0'} />
                      ) : (
                        <span className="text-[0.625rem] font-bold px-1 py-0.5 rounded bg-rose-100 text-rose-600 dark:bg-rose-900/30 dark:text-rose-300 shrink-0">
                          碎片
                        </span>
                      )}
                      <span className="text-sm font-medium text-Ink dark:text-white truncate">{item.title}</span>
                    </div>
                    <div className="flex items-center gap-2 mt-1 ml-5">
                      {item.type === 'note' ? (
                        <>
                          <span className="text-[0.6875rem] text-Amber">{item.category}</span>
                          {item.tags && item.tags.length > 0 && (
                            <span className="flex items-center gap-1 text-[0.6875rem] text-Slate">
                              <Tag size={10} />
                              {item.tags.slice(0, 3).join(', ')}
                            </span>
                          )}
                          <span className="text-[0.6875rem] text-Slate truncate">{item.excerpt.slice(0, 40)}...</span>
                        </>
                      ) : (
                        <>
                          {item.location && <span className="text-[0.6875rem] text-Slate">📍 {item.location}</span>}
                          <span className="text-[0.6875rem] text-Slate truncate">{item.excerpt.slice(0, 50)}...</span>
                        </>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between px-4 py-2 border-t border-Sand dark:border-white/10 bg-gray-50/50 dark:bg-white/5">
            <span className="text-[0.6875rem] text-Slate">{filtered.length > 0 ? `${filtered.length} 条结果` : ''}</span>
            <div className="flex items-center gap-2 text-[0.6875rem] text-Slate">
              <span>↑↓ 选择</span>
              <span>↵ 打开</span>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
