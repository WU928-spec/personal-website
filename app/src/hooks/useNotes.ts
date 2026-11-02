import { useCallback, useEffect, useState } from 'react'
import type { Note, NoteMeta } from '@/types'
import { deleteNote, fetchNote, fetchNotes, saveNote } from '@/services/noteClient'
import { useLang } from '@/contexts/PreferencesContext'
import { t } from '@/i18n/translations'

export function useNotes() {
  const { lang } = useLang()
  const [notes, setNotes] = useState<NoteMeta[]>([])
  const [selectedNote, setSelectedNote] = useState<Note | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const refresh = useCallback(async () => {
    try {
      const list = await fetchNotes()
      setNotes(list)
      return list
    } catch {
      setError(t('notes.readError', lang))
      return []
    } finally {
      setLoading(false)
    }
  }, [lang])

  useEffect(() => { void refresh() }, [refresh])

  const selectNote = useCallback(async (slug: string) => {
    setLoading(true)
    setError('')
    try {
      const note = await fetchNote(slug)
      setSelectedNote(note)
      if (!note) setError(t('notes.notFound', lang))
      return note
    } catch {
      setSelectedNote(null)
      setError(t('notes.readError', lang))
      return null
    } finally {
      setLoading(false)
    }
  }, [lang])

  const save = useCallback(async (path: string, content: string) => {
    const ok = await saveNote(path, content)
    if (!ok) {
      setError(t('notes.saveFailed', lang))
      return false
    }
    await refresh()
    setSelectedNote((current) => current?.filePath === path ? { ...current, content } : current)
    setError('')
    return true
  }, [refresh, lang])

  const remove = useCallback(async (path: string) => {
    const ok = await deleteNote(path)
    if (!ok) {
      setError(t('notes.deleteFailed', lang))
      return false
    }
    await refresh()
    setSelectedNote((current) => current?.filePath === path ? null : current)
    setError('')
    return true
  }, [refresh, lang])

  return { notes, loading, selectedNote, error, selectNote, refresh, save, remove }
}
