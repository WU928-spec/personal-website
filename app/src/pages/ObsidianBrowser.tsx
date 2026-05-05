import { useState, useEffect, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Folder,
  FileText,
  ChevronRight,
  ChevronDown,
  RefreshCw,
  Eye,
  ChevronLeft,
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

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
      const note = await fetchObsidianNote(slug)
      setSelectedNote(note)
    },
    []
  )

  // All slugs for MarkdownRenderer wikilink resolution
  const allSlugs = useMemo(() => notes.map((n) => n.slug), [notes])

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
      <section className="max-w-7xl mx-auto px-6 md:px-12 pb-24 relative">
        <div className="flex gap-0">
          {/* Sidebar */}
          <div className="relative shrink-0">
            {/* Expanded sidebar */}
            <AnimatePresence>
              {!sidebarCollapsed && (
                <motion.aside
                  initial={{ width: 0, opacity: 0 }}
                  animate={{ width: 240, opacity: 1 }}
                  exit={{ width: 0, opacity: 0 }}
                  transition={{ duration: 0.2, ease: [0.4, 0, 0.2, 1] as [number, number, number, number] }}
                  className="overflow-hidden"
                >
                  <div className="w-[240px] bg-Linen/70 dark:bg-white/5 border border-Sand dark:border-white/10 rounded-xl overflow-hidden">
                    {/* Header */}
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
                    {/* Tree content */}
                    <div className="p-3 max-h-[calc(100dvh-200px)] overflow-y-auto overscroll-contain">
                      {tree.length === 0 ? (
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
                            />
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </motion.aside>
              )}
            </AnimatePresence>

            {/* Collapsed toggle button */}
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

          {/* Main Area: Note Content */}
          <main className="flex-1 min-w-0 lg:pl-8">
            {selectedNote ? (
              <motion.div
                key={selectedNote.slug}
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
              <div className="h-full min-h-[400px] flex items-center justify-center">
                <div className="text-center">
                  <div className="w-16 h-16 rounded-2xl bg-Linen dark:bg-white/5 border border-Sand dark:border-white/10 flex items-center justify-center mx-auto mb-4">
                    <FileText size={28} className="text-Sand dark:text-white/20" />
                  </div>
                  <p className="text-[0.9375rem] text-Slate dark:text-white/40">
                    {t('obsidian.selectNote')}
                  </p>
                </div>
              </div>
            )}
          </main>
        </div>
      </section>
    </div>
  )
}
