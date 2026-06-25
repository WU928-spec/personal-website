import { motion } from 'framer-motion'
import { Sparkles } from 'lucide-react'
import type { Section } from './epilogue-data'

export default function EpilogueSection({ section, index }: { section: Section; index: number }) {
  const delay = 0.15 + index * 0.1

  if (section.type === 'heading') {
    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, x: -20 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.8, delay }}
        className="pt-12 pb-4"
      >
        <div className="flex items-center gap-3">
          <span className="text-white/20 text-xs font-body tracking-widest">
            {String(index + 1).padStart(2, '0')}
          </span>
          <h2 className="text-white/85 font-body text-base md:text-lg tracking-[0.2em]">
            {section.text}
          </h2>
        </div>
        <div className="mt-3 w-16 h-px bg-gradient-to-r from-white/30 via-white/10 to-transparent" />
      </motion.div>
    )
  }

  if (section.type === 'quote') {
    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, scale: 0.98 }}
        whileInView={{ opacity: 1, scale: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 1, delay }}
        className="my-10 relative"
      >
        <div className="absolute -left-3 top-0 text-white/10 text-4xl font-serif leading-none select-none">
          "
        </div>
        <div className="pl-5 pr-4 py-6 border-l border-white/15 bg-white/[0.02] rounded-r-xl">
          {section.content?.map((text, i) => (
            <p
              key={i}
              className="text-white/70 font-body text-sm md:text-[15px] leading-[2.2] tracking-wide italic"
            >
              {text}
            </p>
          ))}
        </div>
      </motion.div>
    )
  }

  if (section.type === 'list') {
    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 0.8, delay }}
        className="space-y-5 py-4"
      >
        {section.items?.map((item, i) => (
          <div key={i} className="flex gap-4 items-start">
            <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-white/50 shrink-0 shadow-[0_0_6px_rgba(255,255,255,0.3)]" />
            <p className="text-white/60 font-body text-sm md:text-[15px] leading-[1.95] tracking-wide">
              {item}
            </p>
          </div>
        ))}
      </motion.div>
    )
  }

  if (section.type === 'closing') {
    return (
      <motion.div
        key={index}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: '-80px' }}
        transition={{ duration: 1.2, delay }}
        className="mt-20 mb-8 text-center space-y-6"
      >
        <div className="flex items-center justify-center gap-2 mb-4">
          <div className="w-6 h-px bg-gradient-to-r from-transparent to-white/20" />
          <Sparkles size={12} className="text-white/30" />
          <div className="w-6 h-px bg-gradient-to-l from-transparent to-white/20" />
        </div>
        {section.content?.map((text, i) => (
          <p
            key={i}
            className={`font-body ${
              i === 0
                ? 'text-white/90 text-base tracking-[0.2em]'
                : 'text-white/60 text-sm md:text-[15px] leading-[2.2] tracking-wide'
            }`}
          >
            {text}
          </p>
        ))}
        <div className="pt-8 flex flex-col items-center gap-4">
          <div className="w-8 h-px bg-white/10" />
          <p className="text-white/40 text-xs font-body tracking-[0.3em]">
            —— 作者
          </p>
          <div className="w-8 h-px bg-white/10" />
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      key={index}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.8, delay }}
      className="space-y-5 py-3"
    >
      {section.content?.map((text, i) => (
        <p
          key={i}
          className="text-white/65 font-body text-sm md:text-[15px] leading-[2.2] tracking-wide text-justify"
        >
          {text}
        </p>
      ))}
    </motion.div>
  )
}
