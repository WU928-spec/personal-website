import { useEffect, useState } from 'react'
import { ArrowUpRight } from 'lucide-react'
import type { GitHubRepo } from '@/data/site'
import { parseGitHubRepos, type GitHubAPIRepo } from '@/types/api'
import { formatRelativeDate } from '@/utils/time'
import { useLang } from '@/contexts/PreferencesContext'
import RepoCard from '@/components/RepoCard'
import HomeSection from './HomeSection'

const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178c6', JavaScript: '#f1e05a', Python: '#3572A5', Go: '#00ADD8', Rust: '#dea584',
  Java: '#b07219', 'C++': '#f34b7d', C: '#555555', HTML: '#e34c26', CSS: '#563d7c', Shell: '#89e051', Vue: '#41b883',
}

export default function GitHubSection() {
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [loading, setLoading] = useState(true)
  const [failed, setFailed] = useState(false)
  const { t } = useLang()

  useEffect(() => {
    let active = true
    fetch('https://api.github.com/users/WU928-spec/repos?sort=updated&per_page=4')
      .then((response) => {
        if (!response.ok) throw new Error('GitHub unavailable')
        return response.json()
      })
      .then((data) => {
        if (!active) return
        const validated = parseGitHubRepos(data)
        setRepos(validated.map((repo: GitHubAPIRepo) => ({
          name: repo.name,
          description: repo.description || '',
          language: repo.language || 'Other',
          languageColor: LANG_COLORS[repo.language || ''] || '#8b949e',
          stars: repo.stargazers_count,
          forks: repo.forks_count,
          updated: formatRelativeDate(repo.updated_at),
        })))
        setLoading(false)
      })
      .catch(() => {
        if (!active) return
        setFailed(true)
        setLoading(false)
      })
    return () => { active = false }
  }, [])

  return (
    <HomeSection
      eyebrow="THINGS I MADE"
      title={t('homeExtra.madeTitle')}
      description={t('homeExtra.madeDesc')}
      action={<a href="https://github.com/WU928-spec" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 text-caption text-Slate transition-colors hover:text-Amber">{t('homeExtra.visitGithub')}<ArrowUpRight size={14} /></a>}
    >
      {loading ? (
        <p className="py-8 text-body text-Slate">{t('homeExtra.githubLoading')}</p>
      ) : failed ? (
        <p className="py-8 text-body text-Slate">{t('homeExtra.githubFailed')}</p>
      ) : repos.length === 0 ? (
        <p className="py-8 text-body text-Slate">{t('homeExtra.githubEmpty')}</p>
      ) : (
        <div className="grid gap-x-10 md:grid-cols-2">{repos.map((repo) => <RepoCard key={repo.name} repo={repo} />)}</div>
      )}
    </HomeSection>
  )
}
