import { useEffect, useRef, useState } from 'react'
import { X } from 'lucide-react'
import type { Note } from '@/types'
import { useLang } from '@/contexts/PreferencesContext'

interface NoteEditorProps {
  note?: Note
  onCancel: () => void
  onSave: (path: string, content: string) => Promise<boolean>
}

export default function NoteEditor({ note, onCancel, onSave }: NoteEditorProps) {
  const { t } = useLang()
  const [path, setPath] = useState(note?.filePath || t('notes.defaultFileName'))
  const [content, setContent] = useState(note?.content || '')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const dialogRef = useRef<HTMLDivElement>(null)
  const pathInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const previousFocus = document.activeElement as HTMLElement | null
    pathInputRef.current?.focus()

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        onCancel()
        return
      }
      if (event.key !== 'Tab') return

      const focusable = Array.from(dialogRef.current?.querySelectorAll<HTMLElement>(
        'button:not([disabled]), input, textarea, a[href], [tabindex]:not([tabindex="-1"])',
      ) || [])
      if (focusable.length === 0) return
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      const active = document.activeElement

      if (event.shiftKey && active === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && active === last) {
        event.preventDefault()
        first.focus()
      } else if (!dialogRef.current?.contains(active)) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      previousFocus?.focus()
    }
  }, [onCancel])

  const handleSubmit = async () => {
    if (!path.trim()) {
      setError(t('notes.fileNameRequired'))
      return
    }
    setSaving(true)
    setError('')
    const ok = await onSave(path.trim(), content)
    if (!ok) setError(t('notes.saveFailed'))
    setSaving(false)
  }

  return (
    <div ref={dialogRef} className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 p-4" role="dialog" aria-modal="true" aria-label={note ? t('notes.editorEdit') : t('notes.editorNew')}>
      <div className="flex max-h-[90dvh] w-full max-w-3xl flex-col rounded-2xl border border-Sand bg-Parchment p-6 shadow-deep dark:border-white/15 dark:bg-Graphite">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="font-display text-2xl text-Ink dark:text-white">{note ? t('notes.editorEdit') : t('notes.editorNew')}</h2>
          <button onClick={onCancel} aria-label={t('notes.closeEditor')} className="text-Slate hover:text-Amber"><X size={20} /></button>
        </div>
        <label className="text-caption text-Slate" htmlFor="note-path">{t('notes.fileName')}</label>
        <input ref={pathInputRef} id="note-path" value={path} onChange={(event) => setPath(event.target.value)} className="mt-2 rounded-lg border border-Sand bg-white/60 px-3 py-2 text-body text-Ink outline-none focus:border-Amber dark:border-white/15 dark:bg-white/5 dark:text-white" />
        <label className="mt-5 text-caption text-Slate" htmlFor="note-content">{t('notes.contentLabel')}</label>
        <textarea id="note-content" value={content} onChange={(event) => setContent(event.target.value)} spellCheck={false} className="mt-2 min-h-[45dvh] flex-1 resize-y rounded-lg border border-Sand bg-white/60 p-4 font-mono text-sm leading-relaxed text-Ink outline-none focus:border-Amber dark:border-white/15 dark:bg-white/5 dark:text-white" />
        {error && <p role="alert" className="mt-3 text-caption text-Rose">{error}</p>}
        <div className="mt-5 flex justify-end gap-3">
          <button onClick={onCancel} className="px-4 py-2 text-caption text-Slate">{t('notes.cancel')}</button>
          <button onClick={() => void handleSubmit()} disabled={saving} className="rounded-full bg-Amber px-5 py-2 text-caption font-medium text-white disabled:opacity-50">{saving ? t('notes.saving') : t('notes.save')}</button>
        </div>
      </div>
    </div>
  )
}
