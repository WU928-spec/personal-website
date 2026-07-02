import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useLang } from '@/contexts/PreferencesContext'
import { loadGitHub, type GitHubData, type GitHubRepo } from '@/data/site'
import { parseGitHubRepos, type GitHubAPIRepo } from '@/types/api'
import { formatRelativeDate } from '@/utils/time'
import RepoCard from '@/components/RepoCard'

const LANG_COLORS: Record<string, string> = {
  TypeScript: '#3178c6',
  JavaScript: '#f1e05a',
  Python: '#3572A5',
  Go: '#00ADD8',
  Rust: '#dea584',
  Java: '#b07219',
  'C++': '#f34b7d',
  C: '#555555',
  HTML: '#e34c26',
  CSS: '#563d7c',
  Shell: '#89e051',
  Vue: '#41b883',
  React: '#61dafb',
}

function generateContributionGrid(): number[][] {
  const grid: number[][] = []
  for (let w = 0; w < 52; w++) {
    const week: number[] = []
    for (let d = 0; d < 7; d++) {
      const rand = Math.random()
      if (rand < 0.4) week.push(0)
      else if (rand < 0.6) week.push(1)
      else if (rand < 0.8) week.push(2)
      else week.push(3)
    }
    grid.push(week)
  }
  return grid
}

const DEFAULT_CONTRIBUTIONS = generateContributionGrid()

export default function GitHubSection() {
  const { t } = useLang()
  const [github, setGithub] = useState<GitHubData>(() => loadGitHub())
  const [contributions, setContributions] = useState<number[][]>(DEFAULT_CONTRIBUTIONS)

  useEffect(() => {
    fetch('https://api.github.com/users/WU928-spec/repos?sort=updated&per_page=4')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return
        const validatedRepos = parseGitHubRepos(data)
        if (validatedRepos.length === 0) return

        const repos: GitHubRepo[] = validatedRepos.map((r: GitHubAPIRepo) => ({
          name: r.name,
          description: r.description || '',
          language: r.language || 'Other',
          languageColor: LANG_COLORS[r.language || ''] || '#8b949e',
          stars: r.stargazers_count,
          forks: r.forks_count,
          updated: formatRelativeDate(r.updated_at),
        }))
        const totalStars = repos.reduce((s, r) => s + r.stars, 0)
        setGithub({ repos, stats: { repos: validatedRepos.length, stars: totalStars, streak: 0 } })
      })
      .catch(() => {
        /* ignore fetch error */
      })
  }, [])

  useEffect(() => {
    fetch('https://github-contributions-api.deno.dev/WU928-spec.json')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data || !Array.isArray(data.contributions)) return
        const levelMap: Record<string, number> = {
          NONE: 0,
          FIRST_QUARTILE: 1,
          SECOND_QUARTILE: 2,
          THIRD_QUARTILE: 3,
          FOURTH_QUARTILE: 3,
        }
        const grid: number[][] = data.contributions.map((week: { contributionLevel: string }[]) =>
          week.map((day) => levelMap[day.contributionLevel] ?? 0)
        )
        setContributions(grid)
      })
      .catch(() => {})
  }, [])

  const contributionColors = [
    'rgba(247,244,239,0.05)',
    'rgba(196,120,58,0.3)',
    'rgba(196,120,58,0.6)',
    'rgba(196,120,58,1)',
  ]

  return (
    <section className="bg-Graphite py-24 md:py-32 relative">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="font-ui text-label font-medium uppercase tracking-[0.1em] text-Sage/80 mb-4">
            {t('home.openSource')}
          </p>
          <h2 className="font-display text-heading font-medium text-white">
            {t('home.buildingTitle')}
          </h2>
          <p className="font-body text-body text-white/60 mt-4">
            {t('home.buildingDesc')}
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-10"
        >
          <p className="font-ui text-label font-medium tracking-[0.04em] text-white/50 mb-4">
            {t('home.contributionActivity')}
          </p>
          <div className="flex gap-[3px] overflow-x-auto pb-2">
            {contributions.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-[3px]">
                {week.map((level, di) => (
                  <motion.div
                    key={di}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{
                      duration: 0.3,
                      delay: 0.005 * (wi * 7 + di),
                      ease: [0.25, 0.1, 0.25, 1],
                    }}
                    className="w-[10px] h-[10px] rounded-md shrink-0"
                    style={{ backgroundColor: contributionColors[level] }}
                    title={`${level} ${t('github.contributions')}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          {github.repos.map((repo, i) => (
            <RepoCard key={repo.name} repo={repo} index={i} />
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="text-center mt-12"
        >
          <a
            href="https://github.com/WU928-spec"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center border-[1.5px] border-white/50 text-white font-ui text-label font-semibold uppercase tracking-[0.05em] px-7 py-2 rounded-lg hover:bg-white hover:text-Graphite hover:border-white hover:-translate-y-px transition-all duration-300"
          >
            {t('home.viewFullProfile')}
          </a>
        </motion.div>
      </div>
    </section>
  )
}
