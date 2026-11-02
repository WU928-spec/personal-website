import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { useMoments } from '@/hooks/useMoments'
import { useLang } from '@/contexts/PreferencesContext'
import type { Moment } from '@/types/moment'
import { formatShortDate } from '@/utils/time'
import HomeSection from './HomeSection'

function MomentPreview({ moment, featured = false }: { moment: Moment; featured?: boolean }) {
  const { t } = useLang()
  return (
    <Link to="/moments" className="group grid gap-5 py-8 md:grid-cols-[8rem_1fr_14rem] md:items-center">
      <time className="font-mono text-caption text-Slate">{formatShortDate(moment.createdAt, t('homeExtra.noNoteDate'))}</time>
      <div>
        <p className="max-w-2xl text-body leading-[1.85] text-Ink/85 dark:text-white/80">{moment.content || t('homeExtra.photoFallback')}</p>
        {moment.location && <p className="mt-2 text-caption text-Slate">{moment.location}</p>}
      </div>
      {moment.images[0] ? (
        <div className={`order-first overflow-hidden bg-Linen dark:bg-white/5 md:order-none ${featured ? 'aspect-[16/10]' : 'aspect-[4/3]'}`}>
          <img src={moment.images[0]} alt={moment.content.slice(0, 60) || t('homeExtra.photoAlt')} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]" />
        </div>
      ) : (
        <ArrowUpRight size={18} className="hidden text-Slate/50 transition-colors group-hover:text-Amber md:block md:justify-self-end" />
      )}
    </Link>
  )
}

export default function RecentMomentsSection() {
  const { moments, loading } = useMoments()
  const { t } = useLang()

  return (
    <HomeSection
      eyebrow="RECENT MOMENTS"
      title={t('homeExtra.recentMoments')}
      description={t('homeExtra.momentsDesc')}
      action={<Link to="/moments" className="inline-flex items-center gap-2 text-caption text-Slate transition-colors hover:text-Amber">{t('homeExtra.viewMomentsAll')}<ArrowUpRight size={14} /></Link>}
    >
      {loading ? (
        <p className="py-8 text-body text-Slate">{t('common.loading')}</p>
      ) : moments.length === 0 ? (
        <p className="py-8 text-body text-Slate">{t('homeExtra.momentsEmpty')}</p>
      ) : (
        <div className="divide-y divide-Sand/70 dark:divide-white/10">
          {moments.slice(0, 3).map((moment, index) => <MomentPreview key={moment.id} moment={moment} featured={index === 0} />)}
        </div>
      )}
    </HomeSection>
  )
}
