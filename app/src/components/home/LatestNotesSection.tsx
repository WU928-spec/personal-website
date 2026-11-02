import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { fetchNotes } from '@/services/noteClient'
import { selectLatestNotes } from '@/utils/noteContent'
import { useLang } from '@/contexts/PreferencesContext'
import type { NoteMeta } from '@/types'
import HomeSection from './HomeSection'

export default function LatestNotesSection() {
  const [notes, setNotes] = useState<NoteMeta[]>([])
  const [loading, setLoading] = useState(true)
  const { t } = useLang()

  useEffect(() => {
    let active = true
    const load = async () => {
      try {
        const list = await fetchNotes()
        if (active) setNotes(selectLatestNotes(list, 3))
      } catch {
        if (active) setNotes([])
      } finally {
        if (active) setLoading(false)
      }
    }
    void load()
    return () => { active = false }
  }, [])

  return (
    <HomeSection
      eyebrow="NOTES & STORIES"
      title={t('homeExtra.latestNotes')}
      description={t('homeExtra.notesDesc')}
      action={<Link to="/notes" className="inline-flex items-center gap-2 text-caption text-Slate transition-colors hover:text-Amber">{t('homeExtra.viewNotesAll')}<ArrowUpRight size={14} /></Link>}
      className="bg-Linen/35 dark:bg-white/[0.015]"
    >
      {loading ? (
        <p className="py-8 text-body text-Slate">{t('homeExtra.notesLoading')}</p>
      ) : notes.length === 0 ? (
        <p className="py-8 text-body text-Slate">{t('homeExtra.notesEmpty')}</p>
      ) : (
        <div className="divide-y divide-Sand/70 dark:divide-white/10">
          {notes.map((note, index) => (
            <Link key={note.filePath} to={`/notes?note=${encodeURIComponent(note.slug)}`} className="group grid gap-3 py-7 md:grid-cols-[8rem_1fr_auto] md:items-start">
              <div className="flex items-center gap-4 font-mono text-caption text-Slate md:flex-col md:gap-2">
                <span className="text-Amber">0{index + 1}</span>
                <time>{note.date || t('homeExtra.noNoteDate')}</time>
              </div>
              <div>
                <h3 className="font-display text-2xl leading-snug text-Ink transition-colors group-hover:text-Amber dark:text-white md:text-3xl">{note.title}</h3>
                <p className="mt-2 max-w-2xl text-body leading-relaxed text-Slate">{note.excerpt || t('homeExtra.noteExcerptFallback')}</p>
              </div>
              <span className="inline-flex items-center gap-1.5 text-caption text-Slate transition-colors group-hover:text-Amber md:pt-1">{t('homeExtra.readNote')}<ArrowUpRight size={14} /></span>
            </Link>
          ))}
        </div>
      )}
    </HomeSection>
  )
}
