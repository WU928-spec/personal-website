import { ArrowUpRight, PenLine } from 'lucide-react'
import type { NoteMeta } from '@/types'
import { selectVisibleNotes } from '@/utils/noteContent'
import { useLang } from '@/contexts/PreferencesContext'

interface NotesIndexProps {
  notes: NoteMeta[]
  onSelect: (slug: string) => void
  onCreate?: () => void
}

export default function NotesIndex({ notes, onSelect, onCreate }: NotesIndexProps) {
  const { t } = useLang()
  const visibleNotes = selectVisibleNotes(notes)
    .sort((a, b) => (Date.parse(b.modified) || 0) - (Date.parse(a.modified) || 0))

  return (
    <div className="mx-auto max-w-4xl">
      <div className="mb-12 flex items-end justify-between gap-6 border-b border-Sand/70 pb-8 dark:border-white/10">
        <div>
          <p className="font-ui text-label uppercase tracking-[0.16em] text-Amber">{t('notes.eyebrow')}</p>
          <h1 className="mt-3 font-display text-[clamp(2.5rem,5vw,4.5rem)] leading-tight text-Ink dark:text-white">{t('notes.title')}</h1>
          <p className="mt-4 max-w-lg text-body leading-relaxed text-Slate">{t('notes.subtitle')}</p>
        </div>
        {onCreate && (
          <button onClick={onCreate} className="inline-flex shrink-0 items-center gap-2 rounded-full border border-Sand px-4 py-2 text-caption text-Ink transition hover:border-Amber hover:text-Amber dark:border-white/20 dark:text-white">
            <PenLine size={15} />{t('notes.create')}
          </button>
        )}
      </div>

      {visibleNotes.length === 0 ? (
        <p className="py-20 text-center text-body text-Slate">{t('notes.empty')}</p>
      ) : (
        <div className="divide-y divide-Sand/60 dark:divide-white/10">
          {visibleNotes.map((note) => (
            <button key={note.filePath} onClick={() => onSelect(note.slug)} className="group grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-5 py-8 text-left">
              <span className="pt-1 font-mono text-caption text-Slate/70">{note.date || t('homeExtra.noNoteDate')}</span>
              <span>
                <span className="block break-words font-display text-2xl font-medium leading-snug text-Ink transition-colors group-hover:text-Amber dark:text-white md:text-3xl">{note.title}</span>
                <span className="mt-3 block max-w-xl text-body leading-relaxed text-Slate">{note.excerpt || t('homeExtra.noteExcerptFallback')}</span>
              </span>
              <ArrowUpRight size={18} className="mt-1 text-Slate/50 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-Amber" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
