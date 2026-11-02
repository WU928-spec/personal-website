import { useEffect, useState } from 'react'
import { Briefcase, Globe, Heart, MapPin, Sparkles } from 'lucide-react'
import { useLang } from '@/contexts/PreferencesContext'
import { loadAbout, type AboutData } from '@/data/about'

const iconMap: Record<string, React.ElementType> = { MapPin, Briefcase, Globe, Heart, Sparkles }

export default function IntroSection() {
  const { t, lang } = useLang()
  const [about, setAbout] = useState<AboutData>(() => loadAbout(lang))

  useEffect(() => { setAbout(loadAbout(lang)) }, [lang])

  return (
    <section className="border-b border-Sand/70 py-14 dark:border-white/10 md:py-16">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 md:grid-cols-[.75fr_2fr] md:px-12">
        <div>
          <p className="font-ui text-label uppercase tracking-[0.16em] text-Sage">{t('home.aboutMe')}</p>
          <h2 className="mt-3 font-display text-heading font-medium leading-tight text-Ink dark:text-white">{about.title}</h2>
        </div>
        <div className="max-w-2xl">
          <p className="text-subhead leading-[1.85] text-Ink/80 dark:text-white/80">{about.p1}</p>
          {about.p2 && <p className="mt-4 text-body leading-[1.85] text-Slate">{about.p2}</p>}
          {about.fields.length > 0 && (
            <div className="mt-7 flex flex-wrap gap-x-6 gap-y-3 border-t border-Sand/60 pt-6 dark:border-white/10">
              {about.fields.map((field, index) => {
                const Icon = iconMap[field.icon] || Sparkles
                return <span key={`${field.name}-${index}`} className="inline-flex items-center gap-2 text-caption text-Slate"><Icon size={14} className="text-Amber" />{field.value}</span>
              })}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}
