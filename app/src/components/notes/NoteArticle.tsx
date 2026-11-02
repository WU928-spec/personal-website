import { Edit3 } from 'lucide-react'
import type { Note } from '@/types'
import MarkdownRenderer, { extractToc } from '@/components/MarkdownRenderer'
import { useLang } from '@/contexts/PreferencesContext'

interface NoteArticleProps {
  note: Note
  isLoggedIn?: boolean
  onEdit?: () => void
}

export default function NoteArticle({ note, isLoggedIn = false, onEdit }: NoteArticleProps) {
  const { t } = useLang()
  const toc = extractToc(note.content)

  return (
    <article className="mx-auto max-w-[680px]">
      <header className="mb-10 border-b border-Sand/70 pb-10 dark:border-white/10">
        <div className="flex items-center justify-between gap-4">
          <p className="font-ui text-label uppercase tracking-[0.14em] text-Amber">
            {note.category}{note.date && <span className="ml-3 text-Slate">{note.date}</span>}
          </p>
          {isLoggedIn && onEdit && (
            <button onClick={onEdit} className="inline-flex items-center gap-1.5 text-caption text-Slate transition-colors hover:text-Amber">
              <Edit3 size={14} />{t('notes.edit')}
            </button>
          )}
        </div>
        <h1 className="mt-5 font-display text-[clamp(2.25rem,5vw,4rem)] leading-[1.12] tracking-[-0.025em] text-Ink dark:text-white">
          {note.title}
        </h1>
      </header>

      {toc.length > 0 && (
        <details className="mb-12 border-y border-Sand/60 bg-Linen/25 px-5 py-4 dark:border-white/10 dark:bg-white/[0.02]">
          <summary className="cursor-pointer font-ui text-caption font-medium tracking-wide text-Slate">{t('notes.toc')} · {toc.length}</summary>
          <nav aria-label={t('notes.toc')} className="mt-4 flex flex-col gap-2.5 border-t border-Sand/50 pt-4 dark:border-white/10">
            {toc.map((item) => (
              <a key={item.id} href={`#${item.id}`} className={`text-caption text-Slate transition-colors hover:text-Amber ${item.level === 3 ? 'pl-4' : ''}`}>
                {item.text}
              </a>
            ))}
          </nav>
        </details>
      )}

      <MarkdownRenderer content={note.content} />

      {note.tags.length > 0 && (
        <footer className="mt-12 flex flex-wrap gap-2 border-t border-Sand/70 pt-6 dark:border-white/10">
          {note.tags.map((tag) => <span key={tag} className="bg-Linen px-3 py-1 text-caption text-Slate dark:bg-white/[0.06]">#{tag}</span>)}
        </footer>
      )}
    </article>
  )
}
