import { Suspense, type ComponentType } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

const fallback = (
  <div className="min-h-[60dvh] flex items-center justify-center">
    <div className="w-6 h-6 border-2 border-Amber border-t-transparent rounded-lg animate-spin" />
  </div>
)

export function PageTransition({ children }: { children: React.ReactNode }) {
  const reduceMotion = useReducedMotion()

  return (
    <motion.div
      initial={reduceMotion ? false : { opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={reduceMotion ? { opacity: 1, y: 0 } : { opacity: 0, y: -8 }}
      transition={{ duration: reduceMotion ? 0 : 0.25, ease: 'easeInOut' }}
    >
      {children}
    </motion.div>
  )
}

interface LazyPageProps {
  component: ComponentType
}

export default function LazyPage({ component: Component }: LazyPageProps) {
  return (
    <Suspense fallback={fallback}>
      <PageTransition>
        <Component />
      </PageTransition>
    </Suspense>
  )
}
