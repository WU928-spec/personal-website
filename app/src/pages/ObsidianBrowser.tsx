import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  FolderPlus,
  FileText,
  Trash2,
  Edit3,
  Eye,
} from 'lucide-react'
import MarkdownRenderer from '@/components/MarkdownRenderer.tsx'
// Tree rendering is inlined below as ManagedTree
import {
  fetchObsidianNotes,
  fetchObsidianNote,
  fetchVaultTree,
  saveNoteToSupabase,
  deleteNoteFromSupabase,
  deleteFolderFromSupabase,
  renameNoteInSupabase,
} from '@/services/obsidianClient'
import type { ObsidianNoteMeta, ObsidianNote, VaultFile } from '@/types'
import { useLang } from '@/contexts/PreferencesContext'
import { useAuth } from '@/contexts/AuthContext'
import PageSEO from '@/components/PageSEO'

export default function ObsidianBrowser() {
  const { t } = useLang()
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [tree, setTree] = useState<VaultFile[]>([])
  const [notes, setNotes] = useState<ObsidianNoteMeta[]>([])
  const [selectedNote, setSelectedNote] = useState<ObsidianNote | null>(null)
  const [selectedSlug, setSelectedSlug] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const treeScrollRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  /* ── Editor state ── */
  const [editorOpen, setEditorOpen] = useState(false)
  const [editContent, setEditContent] = useState('')
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [saveIndicator, setSaveIndicator] = useState(false)

  /* ── Dialogs ── */
  const [dialog, setDialog] = useState<'none' | 'newNote' | 'newFolder' | 'rename' | 'delete'>('none')
  const [dialogPath, setDialogPath] = useState('')
  const [dialogTarget, setDialogTarget] = useState('')

  const loadData = useCallback(async () => {
    setLoading(true)
    const [treeData, notesData] = await Promise.all([fetchVaultTree(), fetchObsidianNotes()])
    setTree(treeData)
    setNotes(notesData)
    setLoading(false)
  }, [])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleSelectNote = useCallback(
    async (slug: string) => {
      setSelectedSlug(slug)
      setEditorOpen(false)
      const note = await fetchObsidianNote(slug)
      setSelectedNote(note)
      if (note) setEditContent(note.content)
      navigate(`/obsidian?note=${encodeURIComponent(slug)}`)
    },
    [navigate]
  )

  useEffect(() => {
    const noteSlug = searchParams.get('note')
    if (noteSlug) {
      if (noteSlug !== selectedSlug) {
        setSelectedSlug(noteSlug)
        fetchObsidianNote(noteSlug).then((note) => {
          setSelectedNote(note)
          if (note) setEditContent(note.content)
        })
      }
    } else if (!noteSlug && selectedNote) {
      setSelectedSlug('')
      setSelectedNote(null)
      setEditorOpen(false)
    }
  }, [searchParams, selectedSlug, selectedNote])

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
        if (text) handleSelectNote(text)
      }
    }
    el.addEventListener('click', clickHandler)
    return () => el.removeEventListener('click', clickHandler)
  }, [handleSelectNote, selectedNote])

  /* ── Auto-save ── */
  useEffect(() => {
    if (!selectedNote || !editorOpen) return
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    saveTimerRef.current = setTimeout(async () => {
      if (editContent !== selectedNote.content) {
        const ok = await saveNoteToSupabase(selectedNote.filePath, editContent)
        if (ok) {
          setSelectedNote((prev) => (prev ? { ...prev, content: editContent } : null))
          setSaveIndicator(true)
          setTimeout(() => setSaveIndicator(false), 1500)
          // Refresh list to update excerpts/tags
          const updated = await fetchObsidianNotes()
          setNotes(updated)
        }
      }
    }, 1000)
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current)
    }
  }, [editContent, selectedNote, editorOpen])

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
    const ti = note.title.toLowerCase()
    const e = note.excerpt.toLowerCase()
    const c = note.category.toLowerCase()
    let score = 0
    if (ti === q) score += 100
    else if (ti.startsWith(q)) score += 80
    else if (ti.includes(q)) score += 60
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
      .filter(
        (n) =>
          n.title.toLowerCase().includes(q) ||
          n.category.toLowerCase().includes(q) ||
          n.tags.some((t) => t.toLowerCase().includes(q)) ||
          n.excerpt.toLowerCase().includes(q)
      )
      .map((n) => ({ note: n, score: calcNoteScore(n, q) }))
      .sort((a, b) => b.score - a.score)
      .map((item) => item.note)
  }, [searchQuery, notes, calcNoteScore])

  /* ── CRUD handlers ── */
  const handleCreateNote = async () => {
    const path = dialogPath.trim()
    if (!path) return
    const fullPath = path.endsWith('.md') ? path : `${path}.md`
    const ok = await saveNoteToSupabase(fullPath, '')
    if (ok) {
      await loadData()
      const slug = fullPath.replace(/\.md$/i, '').replace(/\//g, '-').replace(/[^a-zA-Z0-9一-龥\-_]/g, '')
      handleSelectNote(slug)
    }
    setDialog('none')
    setDialogPath('')
  }

  const handleCreateFolder = async () => {
    const name = dialogPath.trim()
    if (!name) return
    // Create a placeholder note so the folder exists
    const ok = await saveNoteToSupabase(`${name}/__folder__`, '')
    if (ok) await loadData()
    setDialog('none')
    setDialogPath('')
  }

  const handleDelete = async () => {
    const target = dialogTarget
    if (!target) return
    if (target.endsWith('/__folder__') || dialog === 'delete') {
      // It's a folder placeholder or user chose to delete folder
      const folderPath = target.replace(/\/[^/]+$/, '')
      await deleteFolderFromSupabase(folderPath)
    } else {
      await deleteNoteFromSupabase(target)
    }
    await loadData()
    if (selectedNote?.filePath === target) {
      setSelectedNote(null)
      setSelectedSlug('')
      setEditorOpen(false)
      navigate('/obsidian')
    }
    setDialog('none')
    setDialogTarget('')
  }

  const handleRename = async () => {
    const oldPath = dialogTarget
    const newName = dialogPath.trim()
    if (!oldPath || !newName) return
    const dir = oldPath.includes('/') ? oldPath.slice(0, oldPath.lastIndexOf('/')) : ''
    const newPath = dir ? `${dir}/${newName}.md` : `${newName}.md`
    const ok = await renameNoteInSupabase(oldPath, newPath)
    if (ok) {
      await loadData()
      if (selectedNote?.filePath === oldPath) {
        const slug = newPath.replace(/\.md$/i, '').replace(/\//g, '-').replace(/[^a-zA-Z0-9一-龥\-_]/g, '')
        handleSelectNote(slug)
      }
    }
    setDialog('none')
    setDialogPath('')
    setDialogTarget('')
  }

  const openDeleteDialog = (path: string, _isFolder: boolean) => {
    setDialogTarget(path)
    setDialog('delete')
  }

  const openRenameDialog = (path: string) => {
    setDialogTarget(path)
    const name = path.split('/').pop()?.replace(/\.md$/i, '') || ''
    setDialogPath(name)
    setDialog('rename')
  }

  return (
    <div className="bg-Parchment dark:bg-Graphite min-h-[100dvh]">
      <PageSEO title="Obsidian Vault" description="Browse and preview notes." path="/obsidian" />

      {/* Dialog overlay */}
      <AnimatePresence>
        {dialog !== 'none' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => setDialog('none')}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-Linen dark:bg-Graphite border border-Sand dark:border-white/15 rounded-xl p-6 w-[360px] max-w-[90vw] shadow-xl"
            >
              {dialog === 'newNote' && (
                <>
                  <h3 className="text-[1rem] font-semibold text-Ink dark:text-white mb-3">新建笔记</h3>
                  <p className="text-[0.8125rem] text-Slate mb-3">路径如：math/linear-algebra.md</p>
                  <input
                    value={dialogPath}
                    onChange={(e) => setDialogPath(e.target.value)}
                    placeholder="路径/文件名.md"
                    className="w-full px-3 py-2 text-[0.875rem] bg-white/50 dark:bg-white/5 border border-Sand dark:border-white/10 rounded-md text-Ink dark:text-white placeholder:text-Slate/60 focus:outline-none focus:border-Amber/50 mb-4"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateNote()}
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setDialog('none')} className="px-3 py-1.5 text-[0.8125rem] text-Slate hover:text-Ink dark:hover:text-white">取消</button>
                    <button onClick={handleCreateNote} className="px-3 py-1.5 text-[0.8125rem] bg-Sage text-white rounded-md hover:bg-[#5a7a5a]">创建</button>
                  </div>
                </>
              )}
              {dialog === 'newFolder' && (
                <>
                  <h3 className="text-[1rem] font-semibold text-Ink dark:text-white mb-3">新建文件夹</h3>
                  <input
                    value={dialogPath}
                    onChange={(e) => setDialogPath(e.target.value)}
                    placeholder="文件夹名"
                    className="w-full px-3 py-2 text-[0.875rem] bg-white/50 dark:bg-white/5 border border-Sand dark:border-white/10 rounded-md text-Ink dark:text-white placeholder:text-Slate/60 focus:outline-none focus:border-Amber/50 mb-4"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setDialog('none')} className="px-3 py-1.5 text-[0.8125rem] text-Slate hover:text-Ink dark:hover:text-white">取消</button>
                    <button onClick={handleCreateFolder} className="px-3 py-1.5 text-[0.8125rem] bg-Sage text-white rounded-md hover:bg-[#5a7a5a]">创建</button>
                  </div>
                </>
              )}
              {dialog === 'rename' && (
                <>
                  <h3 className="text-[1rem] font-semibold text-Ink dark:text-white mb-3">重命名</h3>
                  <input
                    value={dialogPath}
                    onChange={(e) => setDialogPath(e.target.value)}
                    placeholder="新名称"
                    className="w-full px-3 py-2 text-[0.875rem] bg-white/50 dark:bg-white/5 border border-Sand dark:border-white/10 rounded-md text-Ink dark:text-white placeholder:text-Slate/60 focus:outline-none focus:border-Amber/50 mb-4"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setDialog('none')} className="px-3 py-1.5 text-[0.8125rem] text-Slate hover:text-Ink dark:hover:text-white">取消</button>
                    <button onClick={handleRename} className="px-3 py-1.5 text-[0.8125rem] bg-Sage text-white rounded-md hover:bg-[#5a7a5a]">保存</button>
                  </div>
                </>
              )}
              {dialog === 'delete' && (
                <>
                  <h3 className="text-[1rem] font-semibold text-Ink dark:text-white mb-3">确认删除</h3>
                  <p className="text-[0.8125rem] text-Slate mb-4">确定要删除吗？此操作不可撤销。</p>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setDialog('none')} className="px-3 py-1.5 text-[0.8125rem] text-Slate hover:text-Ink dark:hover:text-white">取消</button>
                    <button onClick={handleDelete} className="px-3 py-1.5 text-[0.8125rem] bg-Rose text-white rounded-md hover:bg-Rose/80">删除</button>
                  </div>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                  animate={{ width: 260, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] }}
                  className="overflow-hidden"
                >
                  <div className="w-[260px]">
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

                      {/* Management toolbar */}
                      {isLoggedIn && (
                        <div className="px-3 py-2 border-b border-Sand dark:border-white/10 flex gap-2">
                          <button
                            onClick={() => { setDialog('newFolder'); setDialogPath('') }}
                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-[0.75rem] font-medium bg-Amber/10 text-Amber hover:bg-Amber/20 transition-colors"
                            title="新建文件夹"
                          >
                            <FolderPlus size={14} />
                            文件夹
                          </button>
                          <button
                            onClick={() => { setDialog('newNote'); setDialogPath('') }}
                            className="flex-1 flex items-center justify-center gap-1 px-2 py-1.5 rounded-md text-[0.75rem] font-medium bg-Sage/10 text-Sage hover:bg-Sage/20 transition-colors"
                            title="新建笔记"
                          >
                            <FileText size={14} />
                            笔记
                          </button>
                        </div>
                      )}

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
                        className="p-3 max-h-[calc(100dvh-280px)] overflow-y-auto overscroll-contain"
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
                          <ManagedTree
                            tree={tree}
                            onSelect={handleSelectNote}
                            selectedSlug={selectedSlug}
                            notes={notes}
                            isLoggedIn={isLoggedIn}
                            onDelete={openDeleteDialog}
                            onRename={openRenameDialog}
                          />
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
                    {saveIndicator && (
                      <span className="text-[0.6875rem] text-Sage">已保存</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isLoggedIn && (
                      <button
                        onClick={() => setEditorOpen(!editorOpen)}
                        className={`flex items-center gap-1 px-3 py-1.5 rounded-md text-[0.75rem] font-medium border transition-colors ${
                          editorOpen
                            ? 'bg-Sage/10 text-Sage border-Sage/30 hover:bg-Sage/20'
                            : 'bg-Ink/5 text-Ink border-Ink/20 hover:bg-Ink/10 dark:bg-white/10 dark:text-white dark:border-white/20'
                        }`}
                      >
                        {editorOpen ? <Eye size={13} /> : <Edit3 size={13} />}
                        {editorOpen ? '预览' : '编辑'}
                      </button>
                    )}
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

                {editorOpen ? (
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full min-h-[400px] p-4 rounded-lg bg-white/60 dark:bg-white/5 border border-Sand dark:border-white/10 text-[0.9375rem] text-Ink dark:text-white font-mono leading-relaxed focus:outline-none focus:border-Amber/50 resize-y"
                    spellCheck={false}
                  />
                ) : (
                  <MarkdownRenderer
                    content={selectedNote.content}
                    existingSlugs={allSlugs}
                    onWikilinkClick={handleSelectNote}
                  />
                )}

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

/* ───────────────────────────────────────────────
   Managed Tree with delete/rename actions
   ─────────────────────────────────────────────── */
interface ManagedTreeProps {
  tree: VaultFile[]
  onSelect: (slug: string) => void
  selectedSlug?: string
  notes?: ObsidianNoteMeta[]
  isLoggedIn: boolean
  onDelete: (path: string, isFolder: boolean) => void
  onRename: (path: string) => void
}

function ManagedTree({ tree, onSelect, selectedSlug, notes = [], isLoggedIn, onDelete, onRename }: ManagedTreeProps) {
  return (
    <>
      {tree.map((item) => (
        <ManagedTreeItem
          key={item.path}
          item={item}
          onSelect={onSelect}
          selectedSlug={selectedSlug}
          notes={notes}
          isLoggedIn={isLoggedIn}
          onDelete={onDelete}
          onRename={onRename}
        />
      ))}
    </>
  )
}

function ManagedTreeItem({
  item,
  onSelect,
  selectedSlug,
  notes = [],
  isLoggedIn,
  onDelete,
  onRename,
  depth = 0,
}: Omit<ManagedTreeProps, 'tree'> & { item: VaultFile; depth?: number }) {
  const [expanded, setExpanded] = useState(false)
  const [hovered, setHovered] = useState(false)

  if (item.type === 'folder') {
    return (
      <div
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className="flex items-center gap-1 group">
          <button
            onClick={() => setExpanded(!expanded)}
            className="flex items-center gap-1.5 flex-1 text-left py-1.5 px-2 rounded-md hover:bg-Ink/5 transition-colors dark:hover:bg-white/5"
            style={{ paddingLeft: `${depth * 12 + 8}px` }}
          >
            {expanded ? (
              <ChevronRight size={14} className="text-Slate shrink-0 rotate-90" />
            ) : (
              <ChevronRight size={14} className="text-Slate shrink-0" />
            )}
            <FolderPlus size={14} className="text-Amber shrink-0" />
            <span className="text-[0.8125rem] font-medium text-Ink dark:text-white truncate">
              {item.name}
            </span>
          </button>
          {isLoggedIn && hovered && (
            <div className="flex items-center gap-0.5 pr-1">
              <button
                onClick={(e) => { e.stopPropagation(); onDelete(item.path, true) }}
                className="p-1 rounded text-Slate hover:text-Rose transition-colors"
                title="删除文件夹"
              >
                <Trash2 size={12} />
              </button>
            </div>
          )}
        </div>
        <AnimatePresence initial={false}>
          {expanded && item.children && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {item.children.map((child) => (
                <ManagedTreeItem
                  key={child.path}
                  item={child}
                  onSelect={onSelect}
                  selectedSlug={selectedSlug}
                  notes={notes}
                  isLoggedIn={isLoggedIn}
                  onDelete={onDelete}
                  onRename={onRename}
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
  const slug = note?.slug || item.name.trim().replace(/\s+/g, '-').replace(/[^a-zA-Z0-9一-龥\-_]/g, '').substring(0, 60)
  const isSelected = selectedSlug === slug

  return (
    <div
      className="flex items-center gap-1 group"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <button
        onClick={() => onSelect(slug)}
        className={`flex items-center gap-2 flex-1 text-left py-1.5 px-2 rounded-md transition-colors ${
          isSelected
            ? 'bg-Amber/10 text-Amber'
            : 'hover:bg-Ink/5 text-Ink dark:text-white dark:hover:bg-white/5'
        }`}
        style={{ paddingLeft: `${depth * 12 + 24}px` }}
      >
        <FileText size={14} className={isSelected ? 'text-Amber' : 'text-Slate'} />
        <span className="text-[0.8125rem] font-medium truncate">{item.name}</span>
      </button>
      {isLoggedIn && hovered && (
        <div className="flex items-center gap-0.5 pr-1">
          <button
            onClick={(e) => { e.stopPropagation(); onRename(item.path) }}
            className="p-1 rounded text-Slate hover:text-Amber transition-colors"
            title="重命名"
          >
            <Edit3 size={12} />
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(item.path, false) }}
            className="p-1 rounded text-Slate hover:text-Rose transition-colors"
            title="删除"
          >
            <Trash2 size={12} />
          </button>
        </div>
      )}
    </div>
  )
}
