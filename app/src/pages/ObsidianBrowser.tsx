import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { RefreshCw, ChevronLeft, ChevronRight, Search, X } from 'lucide-react'
import MarkdownRenderer from '@/components/MarkdownRenderer.tsx'
import { TreeItem, RootFilesGroup } from '@/components/NoteTree'
import {
  fetchObsidianNotes,
  fetchObsidianNote,
  fetchVaultTree,
  isObsidianServerAvailable,
} from '@/services/obsidianClient'
import type { ObsidianNoteMeta, ObsidianNote, VaultFile } from '@/types'
import { useLang } from '@/contexts/PreferencesContext'
import PageSEO from '@/components/PageSEO'

export default function ObsidianBrowser() {
  const { t } = useLang()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [serverOn, setServerOn] = useState<boolean | null>(null)
  const [tree, setTree] = useState<VaultFile[]>([])
  const [notes, setNotes] = useState<ObsidianNoteMeta[]>([])
  const [selectedNote, setSelectedNote] = useState<ObsidianNote | null>(null)
  const [selectedSlug, setSelectedSlug] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const treeScrollRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const loadData = useCallback(async () => {
    setLoading(true)
    const available = await isObsidianServerAvailable()
    setServerOn(available)

    if (available) {
      const [treeData, notesData] = await Promise.all([
        fetchVaultTree(),
        fetchObsidianNotes(),
      ])
      setTree(treeData)
      setNotes(notesData)
    }

    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSelectNote = useCallback(
    async (slug: string) => {
      setSelectedSlug(slug)
      const note = await fetchObsidianNote(slug)
      setSelectedNote(note)
      navigate(`/obsidian?note=${encodeURIComponent(slug)}`)
    },
    [navigate]
  )

  useEffect(() => {
    const noteSlug = searchParams.get('note')
    if (noteSlug && serverOn === true) {
      if (noteSlug !== selectedSlug) {
        setSelectedSlug(noteSlug)
        fetchObsidianNote(noteSlug).then((note) => {
          setSelectedNote(note)
        })
      }
    } else if (!noteSlug && selectedNote) {
      setSelectedSlug('')
      setSelectedNote(null)
    }
  }, [searchParams, serverOn, selectedSlug, selectedNote])

  useEffect(() => {
    const el = treeScrollRef.current
    if (!el) return
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault()
      e.stopPropagation()
      el.scrollTop += e.deltaY
    }
    el.addEventListener('wheel', handleWheel, { passive: false })
    return () => el.removeEventListener('wheel', handleWheel)
  }, [sidebarCollapsed])

  useEffect(() => {
    const el = contentRef.current
    if (!el) return

    const clickHandler = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (target.classList.contains('obsidian-wikilink')) {
        e.preventDefault()
        e.stopPropagation()
        const text = target.textContent || ''
        if (text) {
          handleSelectNote(text)
        }
      }
    }

    el.addEventListener('click', clickHandler)
    return () => el.removeEventListener('click', clickHandler)
  }, [handleSelectNote, selectedNote])

  const allSlugs = useMemo(() => notes.map((n) => n.slug), [notes])

  const [historyIdx, setHistoryIdx] = useState(0)
  const maxHistoryIdx = useRef(0)

  useEffect(() => {
    const state = window.history.state as { idx?: number } | null
    const idx = state?.idx ?? 0
    setHistoryIdx(idx)
    maxHistoryIdx.current = Math.max(maxHistoryIdx.current, idx)
  }, [location.pathname, location.search])

  const canGoBack = historyIdx > 0
  const canGoForward = historyIdx < maxHistoryIdx.current

  const calcNoteScore = useCallback((note: ObsidianNoteMeta, query: string): number => {
    const q = query.toLowerCase()
    const t = note.title.toLowerCase()
    const e = note.excerpt.toLowerCase()
    const c = note.category.toLowerCase()
    let score = 0

    if (t === q) score += 100
    else if (t.startsWith(q)) score += 80
    else if (t.includes(q)) score += 60

    if (note.tags.some((tag) => tag.toLowerCase() === q)) score += 50
    else if (note.tags.some((tag) => tag.toLowerCase().includes(q))) score += 40

    if (c === q) score += 45
    else if (c.includes(q)) score += 35

    if (e === q) score += 30
    else if (e.startsWith(q)) score += 25
    else if (e.includes(q)) score += 20

    return score
  }, [])

  const filteredNotes = useMemo(() => {
    const q = searchQuery.trim().toLowerCase()
    if (!q) return []
    return notes
      .filter((n) =>
        n.title.toLowerCase().includes(q) ||
        n.category.toLowerCase().includes(q) ||
        n.tags.some((t) => t.toLowerCase().includes(q)) ||
        n.excerpt.toLowerCase().includes(q)
      )
      .map((n) => ({ note: n, score: calcNoteScore(n, q) }))
      .sort((a, b) => b.score - a.score)
      .map((item) => item.note)
  }, [searchQuery, notes, calcNoteScore])

  if (serverOn === false) {
    return (
      <div className="bg-Parchment dark:bg-Graphite min-h-[60dvh]">
        <PageSEO
          title="Obsidian Vault"
          description="Browse and preview notes from your local Obsidian vault."
          path="/obsidian"
        />
        <section className="relative h-[40vh] flex items-center justify-center overflow-hidden">
          <div className="text-center px-6">
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-display text-[clamp(1.5rem,3vw,2.5rem)] font-medium text-Ink dark:text-white"
            >
              {t('obsidian.title')}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-4 text-[1.0625rem] leading-[1.75] text-Ink/80 max-w-xl mx-auto font-body dark:text-white"
            >
              {t('obsidian.serverOffline')}
            </motion.p>
            <motion.button
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              onClick={loadData}
              className="mt-6 inline-flex items-center gap-2 px-5 py-2.5 bg-Amber text-Parchment rounded-lg text-[0.875rem] font-semibold hover:bg-[#B06A2F] transition-colors"
            >
              <RefreshCw size={16} />
              {t('obsidian.retry')}
            </motion.button>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="bg-Parchment dark:bg-Graphite min-h-[100dvh]">
      <PageSEO
        title="Obsidian Vault"
        description="Browse and preview notes from your local Obsidian vault."
        path="/obsidian"
      />
      <section className="relative h-[35vh] flex items-center justify-center overflow-hidden">
        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="font-display text-[clamp(2rem,4vw,3.5rem)] font-medium text-Ink dark:text-white"
          >
            {t('obsidian.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-3 text-[1.0625rem] leading-[1.75] text-Ink/80 max-w-xl mx-auto font-body dark:text-white"
          >
            {t('obsidian.subtitle')}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 flex items-center justify-center gap-3"
          >
            <button
              onClick={loadData}
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-4 py-2 border border-Ink/30 rounded-lg text-[0.8125rem] font-medium text-Ink hover:bg-Ink/5 transition-colors disabled:opacity-50 dark:border-white/30 dark:text-white dark:hover:bg-white/10"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
              {t('obsidian.refresh')}
            </button>
            <span className="text-[0.8125rem] text-Slate">
              {notes.length} {t('obsidian.notes')}
            </span>
          </motion.div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-6 md:px-12 pb-24 relative">
        <div className="flex gap-0 items-start">
          <div className="relative shrink-0 sticky top-24 self-start">
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.div
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 240, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <div className="w-[240px]">
                    <div className="bg-Linen/70 dark:bg-white/5 border border-Sand dark:border-white/10 rounded-xl overflow-hidden">
                      <div className="flex items-center justify-between px-4 py-3 border-b border-Sand dark:border-white/10">
                        <h3 className="text-[0.75rem] font-semibold uppercase tracking-[0.06em] text-Slate dark:text-white/60">
                          {t('obsidian.vault')}
                        </h3>
                        <button
                          onClick={() => setSidebarCollapsed(true)}
                          className="text-Slate hover:text-Ink dark:text-white/60 dark:hover:text-white transition-colors"
                          aria-label="收起侧边栏"
                        >
                          <ChevronLeft size={16} />
                        </button>
                      </div>
                      <div className="px-3 py-2 border-b border-Sand dark:border-white/10">
                        <div className="relative">
                          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-Slate" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t('obsidian.search')}
                            className="w-full pl-8 pr-7 py-1.5 text-[0.8125rem] bg-white/50 dark:bg-white/5 border border-Sand dark:border-white/10 rounded-md text-Ink dark:text-white placeholder:text-Slate/60 focus:outline-none focus:border-Amber/50 focus:ring-1 focus:ring-Amber/20"
                          />
                          {searchQuery && (
                            <button
                              onClick={() => setSearchQuery('')}
                              className="absolute right-2 top-1/2 -translate-y-1/2 text-Slate hover:text-Ink dark:hover:text-white"
                            >
                              <X size={14} />
                            </button>
                          )}
                        </div>
                      </div>
                      <div
                        ref={treeScrollRef}
                        className="p-3 max-h-[calc(100dvh-240px)] overflow-y-auto overscroll-contain"
                      >
                        {searchQuery.trim() ? (
                          filteredNotes.length === 0 ? (
                            <p className="text-[0.8125rem] text-Slate px-2 py-4 text-center">{t('obsidian.noResults')}</p>
                          ) : (
                            <div className="space-y-1">
                              {filteredNotes.map((note) => (
                                <button
                                  key={note.slug}
                                  onClick={() => handleSelectNote(note.slug)}
                                  className={`w-full text-left px-2 py-1.5 rounded-md text-[0.8125rem] transition-colors ${
                                    selectedSlug === note.slug
                                      ? 'bg-Amber/10 text-Amber'
                                      : 'text-Ink dark:text-white hover:bg-Ink/5 dark:hover:bg-white/5'
                                  }`}
                                >
                                  <div className="font-medium truncate">{note.title}</div>
                                  <div className="text-[0.6875rem] text-Slate truncate mt-0.5">{note.excerpt.slice(0, 60)}...</div>
                                </button>
                              ))}
                            </div>
                          )
                        ) : tree.length === 0 ? (
                          <p className="text-[0.8125rem] text-Slate px-2">{t('obsidian.emptyVault')}</p>
                        ) : (
                          <>
                            {tree.filter(i => i.type === 'folder').map(item => (
                              <TreeItem key={item.path} item={item} onSelect={handleSelectNote} selectedSlug={selectedSlug} />
                            ))}
                            {tree.some(i => i.type === 'file') && (
                              <RootFilesGroup
                                files={tree.filter(i => i.type === 'file')}
                                onSelect={handleSelectNote}
                                selectedSlug={selectedSlug}
                                label={t('obsidian.rootNotes')}
                              />
                            )}
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {sidebarCollapsed && (
              <button
                onClick={() => setSidebarCollapsed(false)}
                className="flex items-center justify-center w-7 h-16 rounded-r-lg bg-Linen/90 backdrop-blur-sm border border-l-0 border-Sand dark:bg-white/10 dark:border-white/15 text-Ink hover:text-Amber dark:text-white dark:hover:text-Amber transition-colors duration-300 shadow-sm"
                title="展开导航"
                aria-label="展开侧边栏"
              >
                <ChevronRight size={14} />
              </button>
            )}
          </div>

          <main className="flex-1 min-w-0 lg:pl-8">
            {selectedNote ? (
              <motion.div
                ref={contentRef}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-Linen/50 dark:bg-white/5 border border-Sand dark:border-white/10 rounded-xl p-6 md:p-10"
              >
                <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[0.6875rem] font-medium text-Amber border border-Amber/30 bg-Amber/5">
                      {selectedNote.category}
                    </span>
                    <span className="text-[0.6875rem] text-Slate">{selectedNote.date}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => canGoBack && navigate(-1)}
                      disabled={!canGoBack}
                      className={`flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-200 ${
                        canGoBack
                          ? 'border-Sand text-Ink hover:text-Amber hover:border-Amber hover:bg-Amber/10 dark:border-white/25 dark:text-white/80'
                          : 'border-transparent text-Slate/30 cursor-not-allowed'
                      }`}
                      title="上一篇"
                    >
                      <ChevronLeft size={18} />
                    </button>
                    <button
                      onClick={() => canGoForward && navigate(1)}
                      disabled={!canGoForward}
                      className={`flex items-center justify-center w-8 h-8 rounded-full border transition-all duration-200 ${
                        canGoForward
                          ? 'border-Sand text-Ink hover:text-Amber hover:border-Amber hover:bg-Amber/10 dark:border-white/25 dark:text-white/80'
                          : 'border-transparent text-Slate/30 cursor-not-allowed'
                      }`}
                      title="下一篇"
                    >
                      <ChevronRight size={18} />
                    </button>
                  </div>
                </div>

                <h2 className="font-display text-[1.75rem] md:text-[2.25rem] font-medium text-Ink dark:text-white mb-6">
                  {selectedNote.title}
                </h2>

                <MarkdownRenderer
                  content={selectedNote.content}
                  existingSlugs={allSlugs}
                  onWikilinkClick={handleSelectNote}
                />
                <div className="mt-8 pt-6 border-t border-Sand dark:border-white/10 flex flex-wrap gap-2">
                  {selectedNote.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-full text-[0.75rem] font-medium text-Slate bg-Mist/60 dark:bg-white/5"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="h-full min-h-[400px] flex items-center justify-center">
                <p className="text-Slate text-[0.9375rem]">{t('obsidian.selectNote')}</p>
              </div>
            )}
          </main>
        </div>
      </section>
    </div>
  )
}
