import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import PageSEO from '@/components/PageSEO'
import NoteArticle from '@/components/notes/NoteArticle'
import NoteEditor from '@/components/notes/NoteEditor'
import NotesIndex from '@/components/notes/NotesIndex'
import { useAuth } from '@/contexts/AuthContext'
import { useLang } from '@/contexts/PreferencesContext'
import { useNotes } from '@/hooks/useNotes'
import { renameNote } from '@/services/noteClient'
import { slugifyNotePath } from '@/utils/noteContent'

export default function NotesPage() {
  const { isLoggedIn } = useAuth()
  const { t } = useLang()
  const { notes, loading, selectedNote, error, selectNote, refresh, save, remove } = useNotes()
  const [searchParams] = useSearchParams()
  const [editorOpen, setEditorOpen] = useState(false)
  const navigate = useNavigate()
  const noteSlug = searchParams.get('note')

  useEffect(() => {
    if (noteSlug && noteSlug !== selectedNote?.slug) void selectNote(noteSlug)
  }, [noteSlug, selectedNote?.slug, selectNote])

  const openNote = (slug: string) => {
    navigate(`/notes?note=${encodeURIComponent(slug)}`)
  }

  const handleSave = async (path: string, content: string) => {
    const normalizedPath = path.endsWith('.md') ? path : `${path}.md`
    const renaming = Boolean(noteSlug && selectedNote && editorOpen && selectedNote.filePath !== normalizedPath)
    const ok = renaming && selectedNote
      ? await renameNote(selectedNote.filePath, normalizedPath, content)
      : await save(normalizedPath, content)
    if (ok) {
      const latest = await refresh()
      setEditorOpen(false)
      openNote(latest.find((note) => note.filePath === normalizedPath)?.slug || slugifyNotePath(normalizedPath))
    }
    return ok
  }

  const handleDelete = async () => {
    if (!selectedNote || !window.confirm(t('notes.confirmDelete'))) return
    if (await remove(selectedNote.filePath)) navigate('/notes')
  }

  return (
    <div className="min-h-[calc(100dvh-4rem)] bg-Parchment px-6 py-16 dark:bg-Graphite md:px-12 md:py-24">
      <PageSEO title={selectedNote?.title || t('nav.obsidian')} description={t('notes.seoDescription')} path="/notes" />
      {noteSlug ? (
        <div className="mx-auto max-w-6xl">
          <div className="mx-auto mb-10 flex max-w-[720px] items-center justify-between">
            <button onClick={() => navigate('/notes')} className="inline-flex items-center gap-2 text-caption text-Slate transition-colors hover:text-Amber">
              <ArrowLeft size={15} />{t('notes.allNotes')}
            </button>
            {isLoggedIn && selectedNote && <button onClick={() => void handleDelete()} className="text-caption text-Slate transition-colors hover:text-Rose">{t('notes.delete')}</button>}
          </div>
          {selectedNote ? (
            <NoteArticle note={selectedNote} isLoggedIn={isLoggedIn} onEdit={() => setEditorOpen(true)} />
          ) : (
            <div className="py-24 text-center text-body text-Slate">{loading ? t('notes.opening') : error || t('notes.notFound')}</div>
          )}
        </div>
      ) : (
        <NotesIndex notes={notes} onSelect={openNote} onCreate={isLoggedIn ? () => setEditorOpen(true) : undefined} />
      )}
      {error && !noteSlug && <p className="mx-auto mt-6 max-w-4xl text-caption text-Rose">{error}</p>}
      {editorOpen && (
        <NoteEditor
          key={selectedNote?.filePath || 'new'}
          note={noteSlug && selectedNote ? selectedNote : undefined}
          onCancel={() => setEditorOpen(false)}
          onSave={handleSave}
        />
      )}
    </div>
  )
}
