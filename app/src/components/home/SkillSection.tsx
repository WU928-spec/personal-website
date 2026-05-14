import { useState } from 'react'
import { motion } from 'framer-motion'
import { useLang } from '@/contexts/PreferencesContext'
import { loadSkills, type SkillCategory } from '@/data/site'

export default function SkillSection() {
  const { t } = useLang()
  const [categories] = useState<SkillCategory[]>(() => loadSkills())

  return (
    <section className="bg-Linen py-20 md:py-28 relative dark:bg-Graphite/50">
      <div className="max-w-5xl mx-auto px-6 md:px-12 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="font-ui text-[0.8125rem] font-medium uppercase tracking-[0.1em] text-Sage mb-4">
            {t('home.whatIDo')}
          </p>
          <h2 className="font-display text-[clamp(1.5rem,2.5vw,2.25rem)] font-medium leading-[1.2] text-Ink dark:text-white">
            {t('home.skillsTitle')}
          </h2>
          <p className="font-body text-[0.9375rem] leading-[1.65] text-Slate mt-2">
            {t('home.skillsDesc')}
          </p>
        </motion.div>

        <div className="mt-12 flex flex-wrap justify-center gap-3 md:gap-4">
          {categories.map((cat, ci) =>
            cat.skills.map((skill, si) => (
              <motion.div
                key={`${cat.name}-${skill.name}-${ci}-${si}`}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: 0.06 * (ci * 4 + si), ease: [0.34, 1.56, 0.64, 1] }}
                whileHover={{ y: -2, boxShadow: '0 2px 8px rgba(196,120,58,0.1)', borderColor: '#C4783A' }}
                className="inline-flex items-center gap-2 bg-Mist border border-Sand rounded-full px-4 py-1.5 transition-colors duration-200 dark:bg-Graphite dark:border-white/10"
              >
                <span className={`w-2 h-2 rounded-full ${cat.color}`} />
                <span className={`font-ui font-medium tracking-[0.04em] text-Slate ${skill.size === 'lg' ? 'text-[0.9375rem]' : 'text-[0.8125rem]'}`}>
                  {skill.name}
                </span>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}
