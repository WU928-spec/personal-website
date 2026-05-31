import { useState } from 'react'
import { motion } from 'framer-motion'
import { useLang } from '@/contexts/PreferencesContext'
import { loadSkills, type SkillCategory } from '@/data/site'
import SkillTag from '@/components/SkillTag'

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
              <SkillTag
                key={`${cat.name}-${skill.name}-${ci}-${si}`}
                skill={skill}
                category={cat}
                index={ci * 4 + si}
              />
            ))
          )}
        </div>
      </div>
    </section>
  )
}
