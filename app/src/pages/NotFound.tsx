import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-[80dvh] bg-Parchment dark:bg-Graphite flex items-center justify-center">
      <div className="text-center px-6 max-w-lg">
        {/* 404 large number */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          <h1 className="font-display text-[clamp(6rem,15vw,10rem)] font-bold leading-none text-Amber/20 dark:text-Amber/15 select-none">
            404
          </h1>
        </motion.div>

        {/* Message */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <h2 className="font-display text-[1.5rem] md:text-[2rem] font-medium text-Ink dark:text-white mt-2">
            Page Not Found
          </h2>
          <p className="mt-3 text-[1.0625rem] leading-[1.75] text-Slate dark:text-white/60 font-body max-w-sm mx-auto">
            This note has not been planted in the garden yet — or it never will be.
          </p>
        </motion.div>

        {/* Actions */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="mt-8 flex items-center justify-center gap-4 flex-wrap"
        >
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-6 py-3 bg-Amber text-Parchment rounded-lg font-ui text-[0.875rem] font-semibold uppercase tracking-[0.05em] hover:bg-[#B06A2F] hover:-translate-y-px transition-all duration-200"
          >
            <Home size={16} />
            Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 px-6 py-3 border-[1.5px] border-Sand dark:border-white/25 text-Ink dark:text-white rounded-lg font-ui text-[0.875rem] font-semibold uppercase tracking-[0.05em] hover:border-Ink dark:hover:border-white/50 hover:-translate-y-px transition-all duration-200"
          >
            <ArrowLeft size={16} />
            Go Back
          </button>
        </motion.div>
      </div>
    </div>
  )
}
