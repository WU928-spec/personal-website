import { Link } from 'react-router-dom'
import { Sparkles } from 'lucide-react'

export default function StarryLink() {
  return (
    <Link
      to="/starry"
      aria-label="进入星空"
      className="group relative ml-2 inline-flex h-8 w-8 items-center justify-center rounded-full text-Slate/60 transition-colors hover:text-Amber focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-Amber"
    >
      <span aria-hidden="true" className="absolute inset-1 rounded-full border border-Amber/0 transition duration-500 group-hover:rotate-45 group-hover:border-Amber/30" />
      <Sparkles aria-hidden="true" size={14} className="transition duration-300 group-hover:scale-110 group-hover:drop-shadow-[0_0_5px_rgba(154,54,74,.55)]" />
    </Link>
  )
}
