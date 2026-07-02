import { memo } from 'react'
import { motion } from 'framer-motion'
import type { SkillCategory } from '@/data/site'

interface SkillTagProps {
  skill: { name: string; size: 'lg' | 'md' }
  category: SkillCategory
  index: number
}

function SkillTag({ skill, category, index }: SkillTagProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      whileInView={{ opacity: 1, scale: 1 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5, delay: 0.06 * index, ease: [0.34, 1.56, 0.64, 1] }}
      whileHover={{ y: -2, boxShadow: '0 2px 8px rgba(196,120,58,0.1)', borderColor: '#C4783A' }}
      className="inline-flex items-center gap-2 bg-Mist border border-Sand rounded-lg px-4 py-1.5 transition-colors duration-200 dark:bg-Graphite dark:border-white/10"
    >
      <span className={`w-2 h-2 rounded-lg ${category.color}`} />
      <span className={`font-ui font-medium tracking-[0.04em] text-Slate text-label`}>
        {skill.name}
      </span>
    </motion.div>
  )
}

export default memo(SkillTag)
