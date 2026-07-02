import { useState, useEffect, useCallback, useMemo, useRef, lazy, Suspense } from 'react'
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronLeft,
  ChevronRight,
  Search,
  X,
  FolderPlus,
  FileText,
  Edit3,
  Eye,
  Upload,
} from 'lucide-react'
import NoteTree from '@/components/NoteTree'
// Tree rendering is inlined below as ManagedTree
import {
  fetchObsidianNotes,
  fetchObsidianNote,
  fetchVaultTree,
  saveNoteToSupabase,
  deleteNoteFromSupabase,
  deleteFolderFromSupabase,
  renameNoteInSupabase,
  slugifyNotePath,
} from '@/services/obsidianClient'
import type { ObsidianNoteMeta, ObsidianNote, VaultFile } from '@/types'
import { useLang } from '@/contexts/PreferencesContext'
import { useAuth } from '@/contexts/AuthContext'
import PageSEO from '@/components/PageSEO'

const MarkdownRenderer = lazy(() => import('@/components/MarkdownRenderer.tsx'))

const markdownFallback = (
  <div className="py-8 flex items-center justify-center">
    <div className="w-6 h-6 border-2 border-Amber border-t-transparent rounded-full animate-spin" />
  </div>
)

export default function ObsidianBrowser() {
  const { t } = useLang()
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams] = useSearchParams()

  const [tree, setTree] = useState<VaultFile[]>([])
  const [notes, setNotes] = useState<ObsidianNoteMeta[]>([])
  const [selectedNote, setSelectedNote] = useState<ObsidianNote | null>(null)
  const [selectedSlug, setSelectedSlug] = useState<string>('')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const treeScrollRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  /* ── Editor state ── */
  const [editorOpen, setEditorOpen] = useState(false)
  const [editContent, setEditContent] = useState('')
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
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
    const [treeData, notesData] = await Promise.all([fetchVaultTree(), fetchObsidianNotes()])
    setTree(treeData)
    setNotes(notesData)
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
      const slug = slugifyNotePath(fullPath)
      handleSelectNote(slug)
    }
    setDialog('none')
    setDialogPath('')
  }

  const handleFileImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    let lastSlug = ''
    for (const file of files) {
      if (!file.name.endsWith('.md')) continue
      const name = file.name.replace(/\.md$/i, '')
      const path = dialogTarget && !dialogTarget.endsWith('.md') ? `${dialogTarget}/${name}` : name
      const fullPath = `${path}.md`
      const content = await file.text()
      const ok = await saveNoteToSupabase(fullPath, content)
      if (ok) {
        lastSlug = slugifyNotePath(fullPath)
      }
    }
    await loadData()
    if (lastSlug) handleSelectNote(lastSlug)
    setDialog('none')
    setDialogPath('')
    if (fileInputRef.current) fileInputRef.current.value = ''
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
        const slug = slugifyNotePath(newPath)
        handleSelectNote(slug)
      }
    }
    setDialog('none')
    setDialogPath('')
    setDialogTarget('')
  }

  const openDeleteDialog = (path: string) => {
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
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/40"
            onClick={() => setDialog('none')}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-Linen dark:bg-Graphite border border-Sand dark:border-white/15 rounded-lg p-6 w-[360px] max-w-[90vw] shadow-xl"
            >
              {dialog === 'newNote' && (
                <>
                  <h3 className="text-body font-semibold text-Ink dark:text-white mb-3">新建笔记</h3>
                  <input
                    value={dialogPath}
                    onChange={(e) => setDialogPath(e.target.value)}
                    placeholder="笔记名"
                    className="w-full px-4 py-2 text-caption bg-white/50 dark:bg-white/5 border border-Sand dark:border-white/10 rounded-md text-Ink dark:text-white placeholder:text-Slate/60 focus:outline-none focus:border-Amber/50 mb-3"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateNote()}
                  />
                  <div className="flex justify-end gap-2 mb-3">
                    <button onClick={() => setDialog('none')} className="px-4 py-1.5 text-label text-Slate hover:text-Ink dark:hover:text-white">取消</button>
                    <button onClick={handleCreateNote} className="px-4 py-1.5 text-caption bg-Sage text-white rounded-md hover:bg-Sage/80">创建</button>
                  </div>
                  <div className="border-t border-Sand dark:border-white/10 pt-3">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="flex items-center gap-1.5 text-caption text-Slate hover:text-Ink dark:hover:text-white transition-colors"
                    >
                      <Upload size={14} />
                      从本地上传 Markdown
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept=".md"
                      multiple
                      className="hidden"
                      onChange={handleFileImport}
                    />
                  </div>
                </>
              )}
              {dialog === 'newFolder' && (
                <>
                  <h3 className="text-body font-semibold text-Ink dark:text-white mb-3">新建文件夹</h3>
                  <input
                    value={dialogPath}
                    onChange={(e) => setDialogPath(e.target.value)}
                    placeholder="文件夹名"
                    className="w-full px-4 py-2 text-caption bg-white/50 dark:bg-white/5 border border-Sand dark:border-white/10 rounded-md text-Ink dark:text-white placeholder:text-Slate/60 focus:outline-none focus:border-Amber/50 mb-4"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()}
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setDialog('none')} className="px-4 py-1.5 text-caption text-Slate hover:text-Ink dark:hover:text-white">取消</button>
                    <button onClick={handleCreateFolder} className="px-4 py-1.5 text-caption bg-Sage text-white rounded-md hover:bg-Sage/80">创建</button>
                  </div>
                </>
              )}
              {dialog === 'rename' && (
                <>
                  <h3 className="text-body font-semibold text-Ink dark:text-white mb-3">重命名</h3>
                  <input
                    value={dialogPath}
                    onChange={(e) => setDialogPath(e.target.value)}
                    placeholder="新名称"
                    className="w-full px-4 py-2 text-caption bg-white/50 dark:bg-white/5 border border-Sand dark:border-white/10 rounded-md text-Ink dark:text-white placeholder:text-Slate/60 focus:outline-none focus:border-Amber/50 mb-4"
                    autoFocus
                    onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                  />
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setDialog('none')} className="px-4 py-1.5 text-caption text-Slate hover:text-Ink dark:hover:text-white">取消</button>
                    <button onClick={handleRename} className="px-4 py-1.5 text-caption bg-Sage text-white rounded-md hover:bg-Sage/80">保存</button>
                  </div>
                </>
              )}
              {dialog === 'delete' && (
                <>
                  <h3 className="text-body font-semibold text-Ink dark:text-white mb-3">确认删除</h3>
                  <p className="text-caption text-Slate mb-4">确定要删除吗？此操作不可撤销。</p>
                  <div className="flex justify-end gap-2">
                    <button onClick={() => setDialog('none')} className="px-4 py-1.5 text-caption text-Slate hover:text-Ink dark:hover:text-white">取消</button>
                    <button onClick={handleDelete} className="px-4 py-1.5 text-caption bg-Rose text-white rounded-md hover:bg-Rose/80">删除</button>
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
          className="fixed z-50 bg-card border border-border rounded-md py-1 shadow-xl min-w-[140px]"
          style={{ left: contextMenu.x, top: contextMenu.y }}
          onClick={() => setContextMenu(null)}
        >
          {contextMenu.isFolder && (
            <button
              className="w-full text-left px-4 py-1.5 text-caption text-primary hover:bg-accent hover:text-primary-foreground transition-colors"
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
            className="w-full text-left px-4 py-1.5 text-caption text-primary hover:bg-accent hover:text-primary-foreground transition-colors"
            onClick={() => {
              openRenameDialog(contextMenu.path)
              setContextMenu(null)
            }}
          >
            重命名
          </button>
          <button
            className="w-full text-left px-4 py-1.5 text-caption text-primary hover:bg-accent hover:text-primary-foreground transition-colors"
            onClick={() => {
              openDeleteDialog(contextMenu.path)
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
            className="font-display text-display font-medium text-Ink dark:text-white"
          >
            {t('obsidian.title')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="mt-3 text-subhead leading-[1.75] text-Ink/80 max-w-xl mx-auto font-body dark:text-white"
          >
            {t('obsidian.subtitle')}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="mt-6 flex items-center justify-center gap-4"
          >
            <span className="text-caption text-Slate">
              {notes.filter((n) => !n.filePath.endsWith('__folder__')).length} {t('obsidian.notes')}
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
                    <div className="bg-card text-primary rounded-lg overflow-hidden select-none">
                      {/* Header */}
                      <div className="flex items-center justify-between px-4 py-2">
                        <h3 className="text-label font-semibold uppercase tracking-[0.08em] text-muted">
                          {t('obsidian.vault')}
                        </h3>
                        <div className="flex items-center gap-0.5">
                          {isLoggedIn && (
                            <>
                              <button
                                onClick={() => { setDialog('newFolder'); setDialogPath('') }}
                                className="p-1 rounded-md text-muted hover:text-primary hover:bg-muted transition-colors"
                                title="新建文件夹"
                              >
                                <FolderPlus size={14} />
                              </button>
                              <button
                                onClick={() => { setDialog('newNote'); setDialogPath('') }}
                                className="p-1 rounded-md text-muted hover:text-primary hover:bg-muted transition-colors"
                                title="新建笔记"
                              >
                                <FileText size={14} />
                              </button>

                            </>
                          )}
                          <button
                            onClick={() => setSidebarCollapsed(true)}
                            className="p-1 rounded-md text-muted hover:text-primary hover:bg-muted transition-colors"
                            aria-label="收起侧边栏"
                          >
                            <ChevronLeft size={14} />
                          </button>
                        </div>
                      </div>

                      {/* Search */}
                      <div className="px-4 pb-2">
                        <div className="relative">
                          <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-muted" />
                          <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder={t('obsidian.search')}
                            className="w-full pl-6 pr-6 py-1 text-label bg-muted rounded text-primary placeholder:text-muted focus:outline-none focus:ring-1 focus:ring-primary"
                          />
                          {searchQuery && (
                            <button
                              onClick={() => setSearchQuery('')}
                              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-muted hover:text-primary"
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
                            <p className="text-label text-muted px-4 py-4 text-center">无结果</p>
                          ) : (
                            <div>
                              {filteredNotes.map((note) => (
                                <button
                                  key={note.slug}
                                  onClick={() => handleSelectNote(note.slug)}
                                  className={`w-full text-left px-4 py-1 text-caption transition-colors ${
                                    selectedSlug === note.slug
                                      ? 'bg-accent text-primary-foreground'
                                      : 'text-primary hover:bg-muted'
                                  }`}
                                >
                                  <div className="truncate">{note.title}</div>
                                </button>
                              ))}
                            </div>
                          )
                        ) : tree.length === 0 ? (
                          <p className="text-label text-muted px-4 py-2">{t('obsidian.emptyVault')}</p>
                        ) : (
                          <NoteTree
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
                className="flex items-center justify-center w-7 h-16 rounded-r-lg bg-Linen/90 border border-l-0 border-Sand dark:bg-white/10 dark:border-white/15 text-Ink hover:text-Amber dark:text-white dark:hover:text-Amber transition-colors duration-300 shadow-sm"
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
                className="bg-Linen/50 dark:bg-white/5 border border-Sand dark:border-white/10 rounded-lg p-6 md:p-10"
              >
                <div className="flex items-center justify-between gap-2 mb-4 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-label font-medium text-Amber border border-Amber/30 bg-Amber/5">
                      {selectedNote.category}
                    </span>
                    <span className="text-label text-Slate">{selectedNote.date}</span>
                    {saveIndicator && (
                      <span className="text-label text-Sage">已保存</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {isLoggedIn && (
                      <button
                        onClick={() => setEditorOpen(!editorOpen)}
                        className={`flex items-center gap-1 px-4 py-1.5 rounded-md text-label font-medium border transition-colors ${
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

                <h2 className="font-display text-heading md:text-heading font-medium text-Ink dark:text-white mb-6">
                  {selectedNote.title}
                </h2>

                {editorOpen ? (
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full min-h-[400px] p-4 rounded-lg bg-white/60 dark:bg-white/5 border border-Sand dark:border-white/10 text-body text-Ink dark:text-white font-mono leading-relaxed focus:outline-none focus:border-Amber/50 resize-y"
                    spellCheck={false}
                  />
                ) : (
                  <Suspense fallback={markdownFallback}>
                    <MarkdownRenderer
                      content={selectedNote.content}
                      existingSlugs={allSlugs}
                      onWikilinkClick={handleSelectNote}
                    />
                  </Suspense>
                )}

                <div className="mt-8 pt-6 border-t border-Sand dark:border-white/10 flex flex-wrap gap-2">
                  {selectedNote.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-full text-label font-medium text-Slate bg-Mist/60 dark:bg-white/5"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ) : (
              <div className="h-full min-h-[400px] flex items-center justify-center">
                <p className="text-Slate text-body">{t('obsidian.selectNote')}</p>
              </div>
            )}
          </main>
        </div>
      </section>
    </div>
  )
}
