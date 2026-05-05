import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Folder,
  FileText,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Upload,
  FileSearch,
  Eye,
} from 'lucide-react'
import MarkdownRenderer from '@/components/MarkdownRenderer.tsx'
import {
  fetchObsidianNotes,
  fetchObsidianNote,
  fetchVaultTree,
  isObsidianServerAvailable,
  type ObsidianNoteMeta,
  type ObsidianNote,
  type VaultFile,
} from '@/services/obsidianClient'
import { useLang } from '@/contexts/LangContext'

/* ───────────────────────────────────────────────
   File Tree Item (recursive)
   ─────────────────────────────────────────────── */
function TreeItem({
  item,
  depth = 0,
  onSelect,
  selectedSlug,
}: {
  item: VaultFile
  depth?: number
  onSelect: (slug: string) => void
  selectedSlug?: string
}) {
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

  // Derive slug from file name (support Chinese)
  const slug = item.name
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5\-_]/g, '')
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

/* ───────────────────────────────────────────────
   Root Files Group (ungrouped notes at vault root)
   ─────────────────────────────────────────────── */
function RootFilesGroup({
  files,
  onSelect,
  selectedSlug,
}: {
  files: VaultFile[]
  onSelect: (slug: string) => void
  selectedSlug?: string
}) {
  const [expanded, setExpanded] = useState(false)
  const { t } = useLang()

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
          {t('obsidian.rootNotes')}
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

/* ───────────────────────────────────────────────
   Note List Card
   ─────────────────────────────────────────────── */
function NoteListCard({
  note,
  onClick,
}: {
  note: ObsidianNoteMeta
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      className="w-full text-left p-4 rounded-xl border border-Sand bg-Linen/50 hover:bg-Linen hover:shadow-soft transition-all duration-200 group dark:bg-white/5 dark:border-white/10 dark:hover:bg-white/10"
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="px-2 py-0.5 rounded-full text-[0.6875rem] font-medium tracking-[0.04em] text-Sage bg-Sage/10">
          {note.category}
        </span>
        <span className="text-[0.6875rem] text-Slate">{note.date}</span>
      </div>
      <h4 className="font-display text-[1rem] font-semibold text-Ink group-hover:text-Amber transition-colors dark:text-white">
        {note.title}
      </h4>
      <p className="mt-1 text-[0.875rem] text-Slate line-clamp-2">{note.excerpt}</p>
      {note.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {note.tags.map((tag) => (
            <span
              key={tag}
              className="text-[0.6875rem] text-Slate bg-Mist/60 px-2 py-0.5 rounded-full"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}
    </button>
  )
}

/* ───────────────────────────────────────────────
   Folder Browser (main area)
   ─────────────────────────────────────────────── */
function FolderBrowser({
  tree,
  notes,
  onSelect,
  selectedSlug,
}: {
  tree: VaultFile[]
  notes: ObsidianNoteMeta[]
  onSelect: (slug: string) => void
  selectedSlug?: string
}) {
  const { t } = useLang()
  const noteMap = useMemo(() => {
    const map = new Map<string, ObsidianNoteMeta>()
    for (const n of notes) map.set(n.slug, n)
    return map
  }, [notes])

  if (tree.length === 0) {
    return <EmptyState message={t('obsidian.noNotes')} />
  }

  return (
    <div className="space-y-4">
      {tree.map((item) => (
        <FolderSection
          key={item.path}
          item={item}
          noteMap={noteMap}
          onSelect={onSelect}
          selectedSlug={selectedSlug}
        />
      ))}
    </div>
  )
}

function FolderSection({
  item,
  noteMap,
  onSelect,
  selectedSlug,
}: {
  item: VaultFile
  noteMap: Map<string, ObsidianNoteMeta>
  onSelect: (slug: string) => void
  selectedSlug?: string
}) {
  const [expanded, setExpanded] = useState(false)

  // Collect all file descendants (recursively)
  function collectFiles(node: VaultFile, files: VaultFile[]) {
    if (node.type === 'file') {
      files.push(node)
    } else if (node.children) {
      for (const child of node.children) collectFiles(child, files)
    }
  }

  const allFiles: VaultFile[] = []
  collectFiles(item, allFiles)
  const fileCount = allFiles.length

  if (item.type === 'file') {
    // Root-level file handled by RootFilesGroup in sidebar; skip here
    return null
  }

  return (
    <div className="rounded-xl border border-Sand bg-Linen/50 dark:bg-white/5 dark:border-white/10 overflow-hidden">
      {/* Folder Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-3 w-full text-left px-5 py-4 hover:bg-Ink/[0.02] transition-colors dark:hover:bg-white/[0.03]"
      >
        {expanded ? (
          <ChevronDown size={18} className="text-Slate shrink-0" />
        ) : (
          <ChevronRight size={18} className="text-Slate shrink-0" />
        )}
        <Folder size={18} className="text-Amber shrink-0" />
        <span className="font-display text-[1.0625rem] font-semibold text-Ink dark:text-white truncate">
          {item.name}
        </span>
        <span className="text-[0.75rem] text-Slate ml-auto shrink-0">
          {fileCount} 篇
        </span>
      </button>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-5 pb-4">
              {/* Sub-folders */}
              {item.children
                ?.filter((child) => child.type === 'folder')
                .map((child) => (
                  <div key={child.path} className="mt-3 ml-4">
                    <FolderSection
                      item={child}
                      noteMap={noteMap}
                      onSelect={onSelect}
                      selectedSlug={selectedSlug}
                    />
                  </div>
                ))}

              {/* Files in this folder */}
              {item.children
                ?.filter((child) => child.type === 'file')
                .map((child) => {
                  const slug = child.name
                    .trim()
                    .replace(/\s+/g, '-')
                    .replace(/[^a-zA-Z0-9\u4e00-\u9fa5\-_]/g, '')
                    .substring(0, 60)
                  const note = noteMap.get(slug)
                  const isSelected = selectedSlug === slug
                  return (
                    <button
                      key={child.path}
                      onClick={() => onSelect(slug)}
                      className={`flex items-center gap-2 w-full text-left py-2 px-3 rounded-lg transition-colors ${
                        isSelected
                          ? 'bg-Amber/10 text-Amber'
                          : 'hover:bg-Ink/5 text-Ink dark:text-white dark:hover:bg-white/5'
                      }`}
                    >
                      <FileText
                        size={14}
                        className={isSelected ? 'text-Amber shrink-0' : 'text-Slate shrink-0'}
                      />
                      <span className="text-[0.875rem] font-medium truncate">
                        {child.name}
                      </span>
                      {note && (
                        <span className="text-[0.6875rem] text-Slate ml-auto shrink-0">
                          {note.date.split('T')[0]}
                        </span>
                      )}
                    </button>
                  )
                })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

/* ───────────────────────────────────────────────
   Empty State
   ─────────────────────────────────────────────── */
function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <FileSearch size={40} className="text-Sand mb-4" />
      <p className="text-Slate font-body">{message}</p>
    </div>
  )
}

/* ───────────────────────────────────────────────
   Obsidian Browser Page
   ─────────────────────────────────────────────── */
export default function ObsidianBrowser() {
  const { t } = useLang()
  const navigate = useNavigate()

  const [serverOn, setServerOn] = useState<boolean | null>(null)
  const [tree, setTree] = useState<VaultFile[]>([])
  const [notes, setNotes] = useState<ObsidianNoteMeta[]>([])
  const [selectedNote, setSelectedNote] = useState<ObsidianNote | null>(null)
  const [selectedSlug, setSelectedSlug] = useState<string>('')
  const [loading, setLoading] = useState(false)
  const [viewMode, setViewMode] = useState<'list' | 'preview'>('list')

  // Check server and load data
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

  // Load selected note
  const handleSelectNote = useCallback(
    async (slug: string) => {
      setSelectedSlug(slug)
      setViewMode('preview')
      const note = await fetchObsidianNote(slug)
      setSelectedNote(note)
    },
    []
  )

  // All slugs for MarkdownRenderer wikilink resolution
  const allSlugs = useMemo(() => notes.map((n) => n.slug), [notes])

  // Categories for filter
  const categories = useMemo(() => {
    const cats = new Set(notes.map((n) => n.category))
    return ['All', ...Array.from(cats)]
  }, [notes])

  const [activeCategory, setActiveCategory] = useState('All')
  const filteredNotes =
    activeCategory === 'All'
      ? notes
      : notes.filter((n) => n.category === activeCategory)

  if (serverOn === false) {
    return (
      <div className="bg-Parchment dark:bg-Graphite min-h-[60dvh]">
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
      {/* ── Hero ── */}
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

      {/* ── Main Content ── */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 pb-24">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar: File Tree */}
          <aside className="lg:w-64 shrink-0">
            <div className="sticky top-20 bg-Linen/70 dark:bg-white/5 border border-Sand dark:border-white/10 rounded-xl p-4 max-h-[calc(100dvh-120px)] overflow-y-auto">
              <h3 className="text-[0.8125rem] font-semibold uppercase tracking-[0.06em] text-Slate mb-3 px-2">
                {t('obsidian.vault')}
              </h3>
              {tree.length === 0 ? (
                <p className="text-[0.8125rem] text-Slate px-2">{t('obsidian.emptyVault')}</p>
              ) : (
                <>
                  {/* Folders first */}
                  {tree
                    .filter((item) => item.type === 'folder')
                    .map((item) => (
                      <TreeItem
                        key={item.path}
                        item={item}
                        onSelect={handleSelectNote}
                        selectedSlug={selectedSlug}
                      />
                    ))}
                  {/* Root files grouped together */}
                  {tree.some((item) => item.type === 'file') && (
                    <RootFilesGroup
                      files={tree.filter((item) => item.type === 'file')}
                      onSelect={handleSelectNote}
                      selectedSlug={selectedSlug}
                    />
                  )}
                </>
              )}
            </div>
          </aside>

          {/* Main Area */}
          <main className="flex-1 min-w-0">
            {/* View Toggle */}
            {selectedNote && (
              <div className="flex items-center gap-2 mb-6">
                <button
                  onClick={() => setViewMode('list')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.8125rem] font-medium transition-colors ${
                    viewMode === 'list'
                      ? 'bg-Amber text-white'
                      : 'bg-Linen text-Ink hover:bg-Ink/5 dark:bg-white/10 dark:text-white'
                  }`}
                >
                  <FileText size={14} />
                  {t('obsidian.allNotes')}
                </button>
                <button
                  onClick={() => setViewMode('preview')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[0.8125rem] font-medium transition-colors ${
                    viewMode === 'preview'
                      ? 'bg-Amber text-white'
                      : 'bg-Linen text-Ink hover:bg-Ink/5 dark:bg-white/10 dark:text-white'
                  }`}
                >
                  <Eye size={14} />
                  {t('obsidian.preview')}
                </button>
              </div>
            )}

            {viewMode === 'preview' && selectedNote ? (
              /* ── Note Preview ── */
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-Linen/50 dark:bg-white/5 border border-Sand dark:border-white/10 rounded-xl p-6 md:p-10"
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="px-2 py-0.5 rounded-full text-[0.6875rem] font-medium text-Amber border border-Amber/30 bg-Amber/5">
                    {selectedNote.category}
                  </span>
                  <span className="text-[0.6875rem] text-Slate">{selectedNote.date}</span>
                </div>
                <h2 className="font-display text-[1.75rem] md:text-[2.25rem] font-medium text-Ink dark:text-white mb-6">
                  {selectedNote.title}
                </h2>
                <MarkdownRenderer
                  content={selectedNote.content}
                  existingSlugs={allSlugs}
                />
                <div className="mt-8 pt-6 border-t border-Sand flex flex-wrap gap-2">
                  {selectedNote.tags.map((tag) => (
                    <span
                      key={tag}
                      className="px-2.5 py-1 rounded-full text-[0.75rem] font-medium text-Slate bg-Mist/60"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
                <div className="mt-6 flex items-center gap-3">
                  <button
                    onClick={() => navigate(`/blog/${selectedNote.slug}`)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-Amber text-Parchment rounded-lg text-[0.8125rem] font-semibold hover:bg-[#B06A2F] transition-colors"
                  >
                    <Eye size={14} />
                    {t('obsidian.openInBlog')}
                  </button>
                </div>
              </motion.div>
            ) : (
              /* ── Folder Browser ── */
              <>
                <FolderBrowser
                  tree={tree}
                  notes={notes}
                  onSelect={handleSelectNote}
                  selectedSlug={selectedSlug}
                />

              </>
            )}
          </main>
        </div>
      </section>
    </div>
  )
}
