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

  /* ── Context menu ── */
  const [contextMenu, setContextMenu] = useState<{
    x: number
    y: number
    path: string
    isFolder: boolean
  } | null>(null)

  /* ── Drag & drop ── */
  const [draggedPath, setDraggedPath] = useState<string | null>(null)

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
    let path = dialogPath.trim()
    if (!path) return
    if (dialogTarget && !dialogTarget.endsWith('.md')) {
      path = `${dialogTarget}/${path}`
    }
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

  /* ── Drag & drop move ── */
  const handleMoveNote = async (filePath: string, folderPath: string) => {
    const fileName = filePath.split('/').pop() || filePath
    const newPath = `${folderPath}/${fileName}`
    const ok = await renameNoteInSupabase(filePath, newPath)
    if (ok) await loadData()
    setDraggedPath(null)
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

      {/* Context menu */}
      {contextMenu && (
        <div
          className="fixed z-50 bg-[#252526] border border-[#3c3c3c] rounded-md py-1 shadow-xl min-w-[140px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={() => setContextMenu(null)}
        >
          {contextMenu.isFolder && (
            <button
              className="w-full text-left px-3 py-1.5 text-[0.8125rem] text-[#cccccc] hover:bg-[#094771] hover:text-white transition-colors"
              onClick={() => {
                setDialogPath('')
                setDialogTarget(contextMenu.path)
                setDialog('newNote')
                setContextMenu(null)
              }}
            >
              新建笔记
            </button>
          )}
          <button
            className="w-full text-left px-3 py-1.5 text-[0.8125rem] text-[#cccccc] hover:bg-[#094771] hover:text-white transition-colors"
            onClick={() => {
              openRenameDialog(contextMenu.path)
              setContextMenu(null)
            }}
          >
            重命名
          </button>
          <button
            className="w-full text-left px-3 py-1.5 text-[0.8125rem] text-[#cccccc] hover:bg-[#094771] hover:text-white transition-colors"
            onClick={() => {
              openDeleteDialog(contextMenu.path, contextMenu.isFolder)
              setContextMenu(null)
            }}
          >
            删除
          </button>
        </div>
      )}

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
                    <div className="bg-[#1e1e1e] text-[#cccccc] rounded-lg overflow-hidden select-none">
                      {/* Header */}
                      <div className="flex items-center justify-between px-3 py-2">
                        <h3 className="text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-[#858585]">
                          {t('obsidian.vault')}
                        </h3>
                        <div className="flex items-center gap-0.5">
                          {isLoggedIn && (
                            <>
                              <button
                                onClick={() => { setDialog('newFolder'); setDialogPath('') }}
                                className="p-1 rounded text-[#858585] hover:text-[#cccccc] hover:bg-[#2a2d2e] transition-colors"
                                title="新建文件夹"
                              >
                                <FolderPlus size={14} />
                              </button>
                              <button
                                onClick={() => { setDialog('newNote'); setDialogPath('') }}
                                className="p-1 rounded text-[#858585] hover:text-[#cccccc] hover:bg-[#2a2d2e] transition-colors"
                                title="新建笔记"
                              >
                                <FileText size={14} />
                              </button>

                            </>
                          )}
                          <button
                            onClick={() => setSidebarCollapsed(true)}
                            className="p-1 rounded text-[#858585] hover:text-[#cccccc] hover:bg-[#2a2d2e] transition-colors"
                            aria-label="收起侧边栏"
                          >
                            <ChevronLeft size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Search */}
                      <div className="px-3 pb-2">
                        <div className="relative">
                          <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-[#858585]" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t('obsidian.search')}
                            className="w-full pl-6 pr-6 py-1 text-[0.75rem] bg-[#3c3c3c] rounded text-[#cccccc] placeholder:text-[#858585] focus:outline-none focus:ring-1 focus:ring-[#007acc]"
                          />
                          {searchQuery && (
                            <button
                              onClick={() => setSearchQuery('')}
                              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[#858585] hover:text-[#cccccc]"
                            >
                              <X size={12} />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Tree */}
                      <div
                        ref={treeScrollRef}
                        className="max-h-[calc(100dvh-220px)] overflow-y-auto overscroll-contain pb-2"
                      >
                        {searchQuery.trim() ? (
                          filteredNotes.length === 0 ? (
                            <p className="text-[0.75rem] text-[#858585] px-3 py-4 text-center">无结果</p>
                          ) : (
                            <div>
                              {filteredNotes.map((note) => (
                                <button
                                  key={note.slug}
                                  onClick={() => handleSelectNote(note.slug)}
                                  className={`w-full text-left px-3 py-1 text-[0.8125rem] transition-colors ${
                                    selectedSlug === note.slug
                                      ? 'bg-[#37373d] text-white'
                                      : 'text-[#cccccc] hover:bg-[#2a2d2e]'
                                  }`}
                                >
                                  <div className="truncate">{note.title}</div>
                                </button>
                              ))}
                            </div>
                          )
                        ) : tree.length === 0 ? (
                          <p className="text-[0.75rem] text-[#858585] px-3 py-2">Vault 为空</p>
                        ) : (
                          <ManagedTree
                            tree={tree}
                            onSelect={handleSelectNote}
                            selectedSlug={selectedSlug}
                            notes={notes}
                            isLoggedIn={isLoggedIn}
                            onContextMenu={(path, isFolder, e) => {
                              e.preventDefault()
                              setContextMenu({ x: e.clientX, y: e.clientY, path, isFolder })
                            }}
                            draggedPath={draggedPath}
                            setDraggedPath={setDraggedPath}
                            onMove={handleMoveNote}
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
   Managed Tree — Obsidian-style
   ─────────────────────────────────────────────── */
interface ManagedTreeProps {
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

interface ManagedTreeItemProps {
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

function ManagedTree({ tree, ...props }: ManagedTreeProps) {
  return (
    <>
      {tree.map((item) => (
        <ManagedTreeItem key={item.path} item={item} {...props} />
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
  onContextMenu,
  draggedPath,
  setDraggedPath,
  onMove,
  depth = 0,
}: ManagedTreeItemProps) {
  const [expanded, setExpanded] = useState(false)

  if (item.type === 'folder') {
    const isDropTarget = draggedPath && draggedPath !== item.path
    return (
      <div>
        <div
          className={`flex items-center text-left py-[3px] pr-2 cursor-pointer transition-colors ${
            isDropTarget ? 'bg-[#094771]/30' : 'hover:bg-[#2a2d2e]'
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
              <ChevronRight size={11} className="text-[#858585] rotate-90" />
            ) : (
              <ChevronRight size={11} className="text-[#858585]" />
            )}
          </span>
          <span className="text-[0.8125rem] text-[#cccccc] truncate">{item.name}</span>
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
                <ManagedTreeItem key={child.path} item={child} {...{ onSelect, selectedSlug, notes, isLoggedIn, onContextMenu, draggedPath, setDraggedPath, onMove }} depth={depth + 1} />
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
      draggable={isLoggedIn}
      onDragStart={() => setDraggedPath(item.path)}
      onDragEnd={() => setDraggedPath(null)}
      className="flex items-center text-left py-[3px] pr-2 cursor-pointer transition-colors"
      style={{ paddingLeft: `${depth * 16 + 20}px` }}
      onClick={() => onSelect(slug)}
      onContextMenu={(e) => onContextMenu(item.path, false, e)}
    >
      <span className={`text-[0.8125rem] truncate ${isSelected ? 'text-white bg-[#37373d]' : 'text-[#cccccc] hover:bg-[#2a2d2e]'}`}>
        {item.name}
      </span>
    </div>
  )
}
