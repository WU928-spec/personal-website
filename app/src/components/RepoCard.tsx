import { memo } from 'react'
import { ExternalLink, GitFork, Star } from 'lucide-react'
import type { GitHubRepo } from '@/data/site'

function RepoCard({ repo }: { repo: GitHubRepo }) {
  return (
    <a href={`https://github.com/WU928-spec/${repo.name}`} target="_blank" rel="noopener noreferrer" className="group border-t border-Sand/70 py-6 dark:border-white/10">
      <div className="flex items-center justify-between gap-4">
        <h3 className="font-mono text-body font-medium text-Ink transition-colors group-hover:text-Amber dark:text-white">{repo.name}</h3>
        <ExternalLink size={15} className="shrink-0 text-Slate/50 transition-colors group-hover:text-Amber" />
      </div>
      <p className="mt-3 line-clamp-2 text-caption leading-relaxed text-Slate">{repo.description || '这个仓库还没有添加简介。'}</p>
      <div className="mt-4 flex flex-wrap items-center gap-4 text-label text-Slate">
        <span className="inline-flex items-center gap-1.5"><span className="h-2 w-2 rounded-full" style={{ backgroundColor: repo.languageColor }} />{repo.language}</span>
        <span className="inline-flex items-center gap-1"><Star size={12} />{repo.stars}</span>
        <span className="inline-flex items-center gap-1"><GitFork size={12} />{repo.forks}</span>
        <span className="ml-auto">{repo.updated}</span>
      </div>
    </a>
  )
}

export default memo(RepoCard)
