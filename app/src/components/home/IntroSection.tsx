import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { MapPin, Briefcase, Globe, Heart, Sparkles } from 'lucide-react'
import { useLang } from '@/contexts/PreferencesContext'
import { useAuth } from '@/contexts/AuthContext'
import { loadAbout, type AboutData } from '@/data/about'
import LazyImage from '@/components/LazyImage'

const iconMap: Record<string, React.ElementType> = { MapPin, Briefcase, Globe, Heart, Sparkles }

export default function IntroSection() {
  const { t, lang } = useLang()
  const { owner } = useAuth()
  const [about, setAbout] = useState<AboutData>(() => loadAbout(lang))

  useEffect(() => { setAbout(loadAbout(lang)) }, [lang])

  const avatar = owner.avatar

  return (
    <section className="bg-Parchment py-24 md:py-32 relative dark:bg-Graphite">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-4 flex flex-col items-center"
          >
            <div className="w-[200px] h-[200px] rounded-lg overflow-hidden border-[3px] border-Amber shadow-medium">
              <LazyImage src={avatar} alt={t('profile.avatarAlt')} className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col gap-4 mt-6 w-full max-w-[280px]">
              {about.fields.map((field, i) => {
                const IconComp = iconMap[field.icon] || MapPin
                return (
                  <motion.div
                    key={field.icon + i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 * i, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-center gap-2 bg-Linen border border-Sand rounded-lg px-4 py-2 dark:bg-Graphite/50 dark:border-white/10"
                  >
                    <IconComp size={14} className="text-Slate shrink-0" />
                    <span className="font-ui text-caption font-medium tracking-[0.04em] text-Slate">
                      {field.value}
                    </span>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-8"
          >
            <p className="font-ui text-label font-medium uppercase tracking-[0.1em] text-Sage mb-4">
              {t('home.aboutMe')}
            </p>
            <h2 className="font-display text-heading font-medium text-Ink dark:text-white">
              {about.title}
            </h2>
            <p className="font-body text-subhead text-Ink mt-6 dark:text-white/90 leading-relaxed">
              {about.p1}
            </p>
            <p className="font-body text-subhead text-Ink mt-4 dark:text-white/90 leading-relaxed">
              {about.p2}
            </p>
            <Link
              to="/projects"
              className="inline-block mt-6 font-body text-body font-medium text-Amber hover:underline underline-offset-4 transition-all duration-300"
            >
              {t('home.learnMore')}
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}
