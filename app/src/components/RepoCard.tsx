import { memo } from 'react'
import { motion } from 'framer-motion'
import { Star, GitFork, ExternalLink } from 'lucide-react'
import type { GitHubRepo } from '@/data/site'

interface RepoCardProps {
  repo: GitHubRepo
  index: number
}

function RepoCard({ repo, index }: RepoCardProps) {
  return (
    <motion.a
      href={`https://github.com/WU928-spec/${repo.name}`}
      target="_blank"
      rel="noopener noreferrer"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay: 0.1 * index, ease: [0.16, 1, 0.3, 1] }}
      className="block bg-Graphite/90 border border-white/[0.08] rounded-lg p-6 hover:border-white/[0.15] hover:shadow-deep hover:-translate-y-[2px] transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-mono text-caption leading-[1.6] text-Amber">{repo.name}</h3>
        <ExternalLink size={14} className="text-white/40" />
      </div>
      <p className="font-body text-caption leading-[1.65] text-white/70 mt-2 line-clamp-2">
        {repo.description}
      </p>
      <div className="flex items-center gap-4 mt-4">
        <span className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full" style={{ backgroundColor: repo.languageColor }} />
          <span className="font-ui text-caption tracking-[0.04em] text-white/60">{repo.language}</span>
        </span>
        <span className="flex items-center gap-1 text-white/60">
          <Star size={14} />
          <span className="font-ui text-caption tracking-[0.04em]">{repo.stars}</span>
        </span>
        <span className="flex items-center gap-1 text-white/60">
          <GitFork size={14} />
          <span className="font-ui text-caption tracking-[0.04em]">{repo.forks}</span>
        </span>
        <span className="font-ui text-caption tracking-[0.04em] text-white/40 ml-auto">
          {repo.updated}
        </span>
      </div>
    </motion.a>
  )
}

export default memo(RepoCard)
