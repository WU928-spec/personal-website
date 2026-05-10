import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronDown, ExternalLink, MapPin, Briefcase, Globe, Heart, Sparkles, Star, GitFork } from 'lucide-react'
import { useLang } from '@/contexts/PreferencesContext'
import { useAuth } from '@/contexts/AuthContext'
import { loadAbout, type AboutData } from '@/data/about'
import { loadHero, type HeroData } from '@/data/site'
import { loadSkills, type SkillCategory } from '@/data/site'
import { loadGitHub, type GitHubData, type GitHubRepo } from '@/data/site'
import { parseGitHubRepos, type GitHubAPIRepo } from '@/types/api'
import PageSEO from '@/components/PageSEO'

function useTypingEffect(text: string, speed = 80, delay = 500) {
  const [displayed, setDisplayed] = useState('')
  const [showCursor, setShowCursor] = useState(true)
  const [done, setDone] = useState(false)

  useEffect(() => {
    let index = 0
    let cursorBlinks = 0
    let cursorInterval: ReturnType<typeof setInterval>

    const startTimeout = setTimeout(() => {
      const typeInterval = setInterval(() => {
        if (index < text.length) {
          setDisplayed(text.slice(0, index + 1))
          index++
        } else {
          clearInterval(typeInterval)
          cursorInterval = setInterval(() => {
            cursorBlinks++
            setShowCursor((prev) => !prev)
            if (cursorBlinks >= 6) {
              clearInterval(cursorInterval)
              setShowCursor(false)
              setDone(true)
            }
          }, 500)
        }
      }, speed)

      return () => {
        clearInterval(typeInterval)
        clearInterval(cursorInterval)
      }
    }, delay)

    return () => {
      clearTimeout(startTimeout)
      clearInterval(cursorInterval)
    }
  }, [text, speed, delay])

  return { displayed, showCursor, done }
}

function HeroSection() {
  const { t, lang } = useLang()
  const headline = t('home.heroTitle')
  const { displayed, showCursor, done } = useTypingEffect(headline, 80, 600)
  const [hero, setHero] = useState<HeroData>(() => loadHero(lang))

  useEffect(() => { setHero(loadHero(lang)) }, [lang])

  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden bg-Parchment dark:bg-Graphite">
      <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
        <h1 className="font-display text-[clamp(2.75rem,6vw,5rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-Ink dark:text-white">
          {displayed}
          {showCursor && <span className="text-Amber animate-blink ml-0.5">|</span>}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={done ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="font-body text-[1.0625rem] leading-[1.75] text-Ink/85 mt-4 dark:text-white"
        >
          {hero.subtitle}
        </motion.p>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={done ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.7, ease: [0.16, 1, 0.3, 1] }}
          className="font-body text-[0.9375rem] leading-[1.65] text-Ink/70 max-w-xl mx-auto mt-4 dark:text-white"
        >
          {hero.tagline}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={done ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center justify-center gap-4 mt-8"
        >
          <Link
            to="/moments"
            className="inline-flex items-center bg-Amber text-Parchment font-ui text-[0.875rem] font-semibold uppercase tracking-[0.05em] px-7 py-3 rounded-md hover:bg-[#B06A2F] hover:shadow-amber hover:-translate-y-px transition-all duration-300"
          >
            记忆碎片
          </Link>
          <Link
            to="/projects"
            className="inline-flex items-center border-[1.5px] border-Ink/80 text-Ink font-ui text-[0.875rem] font-semibold uppercase tracking-[0.05em] px-7 py-3 rounded-md hover:bg-Ink/10 hover:-translate-y-px transition-all duration-300 dark:border-white/40 dark:text-white dark:hover:bg-white/10"
          >
            {t('home.viewProjects')}
          </Link>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="flex flex-col items-center gap-2 animate-scroll-pulse">
          <span className="font-ui text-[0.8125rem] font-medium tracking-[0.04em] text-Ink/50 uppercase dark:text-white">
            {t('home.scroll')}
          </span>
          <ChevronDown size={20} className="text-Ink/50 dark:text-white" />
        </div>
      </motion.div>
    </section>
  )
}

const iconMap: Record<string, React.ElementType> = { MapPin, Briefcase, Globe, Heart, Sparkles }

function IntroSection() {
  const { t, lang } = useLang()
  const { user } = useAuth()
  const [about, setAbout] = useState<AboutData>(() => loadAbout(lang))

  useEffect(() => { setAbout(loadAbout(lang)) }, [lang])

  const avatar = user?.avatar || '/avatar.jpg'

  return (
    <section className="bg-Parchment py-24 md:py-32 relative dark:bg-Graphite">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-4 flex flex-col items-center"
          >
            <div className="w-[200px] h-[200px] rounded-full overflow-hidden border-[3px] border-Amber shadow-medium">
              <img src={avatar} alt={t('profile.avatarAlt')} className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col gap-3 mt-6 w-full max-w-[280px]">
              {about.fields.map((field, i) => {
                const IconComp = iconMap[field.icon] || MapPin
                return (
                  <motion.div
                    key={field.icon + i}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: 0.1 * i, ease: [0.16, 1, 0.3, 1] }}
                    className="flex items-center gap-2 bg-Linen border border-Sand rounded-lg px-3 py-2 dark:bg-Graphite/50 dark:border-white/10"
                  >
                    <IconComp size={14} className="text-Slate shrink-0" />
                    <span className="font-ui text-[0.8125rem] font-medium tracking-[0.04em] text-Slate">
                      {field.value}
                    </span>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="md:col-span-8"
          >
            <p className="font-ui text-[0.8125rem] font-medium uppercase tracking-[0.1em] text-Sage mb-4">
              {t('home.aboutMe')}
            </p>
            <h2 className="font-display text-[clamp(1.5rem,2.5vw,2.25rem)] font-medium leading-[1.2] text-Ink dark:text-white">
              {about.title}
            </h2>
            <p className="font-body text-[1.0625rem] leading-[1.75] text-Ink mt-4 dark:text-white">
              {about.p1}
            </p>
            <p className="font-body text-[1.0625rem] leading-[1.75] text-Ink mt-4 dark:text-white">
              {about.p2}
            </p>
            <Link
              to="/about"
              className="inline-block mt-6 font-body text-[1rem] font-medium text-Amber hover:underline underline-offset-4 transition-all duration-300"
            >
              {t('home.learnMore')}
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

function SkillSection() {
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
              <motion.div
                key={`${cat.name}-${skill.name}-${ci}-${si}`}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ duration: 0.5, delay: 0.06 * (ci * 4 + si), ease: [0.34, 1.56, 0.64, 1] }}
                whileHover={{ y: -2, boxShadow: '0 2px 8px rgba(196,120,58,0.1)', borderColor: '#C4783A' }}
                className="inline-flex items-center gap-2 bg-Mist border border-Sand rounded-full px-4 py-1.5 transition-colors duration-200 dark:bg-Graphite dark:border-white/10"
              >
                <span className={`w-2 h-2 rounded-full ${cat.color}`} />
                <span className={`font-ui font-medium tracking-[0.04em] text-Slate ${skill.size === 'lg' ? 'text-[0.9375rem]' : 'text-[0.8125rem]'}`}>
                  {skill.name}
                </span>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </section>
  )
}

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

function formatRelativeDate(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  if (days === 0) return 'today'
  if (days === 1) return '1 day ago'
  if (days < 7) return `${days} days ago`
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`
  if (days < 365) return `${Math.floor(days / 30)} months ago`
  return `${Math.floor(days / 365)} years ago`
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

function GitHubSection() {
  const { t } = useLang()
  const [github, setGithub] = useState<GitHubData>(() => loadGitHub())
  const [contributions, setContributions] = useState<number[][]>(() => generateContributionGrid())

  useEffect(() => {
    fetch('https://api.github.com/users/WU928-spec/repos?sort=updated&per_page=4')
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!data) return

        // 使用 Zod 验证 API 响应
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
      .catch((error) => {
        console.error('Failed to fetch GitHub repos:', error)
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
          <p className="font-ui text-[0.8125rem] font-medium uppercase tracking-[0.1em] text-Sage/80 mb-4">
            {t('home.openSource')}
          </p>
          <h2 className="font-display text-[clamp(1.5rem,2.5vw,2.25rem)] font-medium leading-[1.2] text-white">
            {t('home.buildingTitle')}
          </h2>
          <p className="font-body text-[0.9375rem] leading-[1.65] text-white/60 mt-2">
            {t('home.buildingDesc')}
          </p>
        </motion.div>

        {/* Contribution graph */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-8"
        >
          <p className="font-ui text-[0.8125rem] font-medium tracking-[0.04em] text-white/50 mb-3">
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
                    className="w-[10px] h-[10px] rounded-sm shrink-0"
                    style={{ backgroundColor: contributionColors[level] }}
                    title={`${level} ${t('github.contributions')}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Pinned repos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          {github.repos.map((repo, i) => (
            <motion.a
              key={repo.name}
              href={`https://github.com/WU928-spec/${repo.name}`}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 * i, ease: [0.16, 1, 0.3, 1] }}
              className="block bg-Graphite/90 border border-white/[0.08] rounded-xl p-6 hover:border-white/[0.15] hover:shadow-deep hover:-translate-y-[2px] transition-all duration-300"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-mono text-[0.875rem] leading-[1.6] text-Amber">{repo.name}</h3>
                <ExternalLink size={14} className="text-white/40" />
              </div>
              <p className="font-body text-[0.9375rem] leading-[1.65] text-white/70 mt-2 line-clamp-2">
                {repo.description}
              </p>
              <div className="flex items-center gap-4 mt-4">
                <span className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded-full" style={{ backgroundColor: repo.languageColor }} />
                  <span className="font-ui text-[0.8125rem] tracking-[0.04em] text-white/60">{repo.language}</span>
                </span>
                <span className="flex items-center gap-1 text-white/60">
                  <Star size={14} />
                  <span className="font-ui text-[0.8125rem] tracking-[0.04em]">{repo.stars}</span>
                </span>
                <span className="flex items-center gap-1 text-white/60">
                  <GitFork size={14} />
                  <span className="font-ui text-[0.8125rem] tracking-[0.04em]">{repo.forks}</span>
                </span>
                <span className="font-ui text-[0.8125rem] tracking-[0.04em] text-white/40 ml-auto">
                  {repo.updated}
                </span>
              </div>
            </motion.a>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="text-center mt-10"
        >
          <a
            href="https://github.com/WU928-spec"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center border-[1.5px] border-white/50 text-white font-ui text-[0.875rem] font-semibold uppercase tracking-[0.05em] px-7 py-3 rounded-md hover:bg-white hover:text-Graphite hover:border-white hover:-translate-y-px transition-all duration-300"
          >
            {t('home.viewFullProfile')}
          </a>
        </motion.div>
      </div>
    </section>
  )
}

export default function Home() {
  return (
    <div>
      <PageSEO
        title="Vibecoding Garden"
        description="A digital garden of code, thoughts, and slow programming. Explore blog posts, projects, and a Zettelkasten-inspired knowledge base."
      />
      <HeroSection />
      <IntroSection />
      <SkillSection />
      <GitHubSection />
    </div>
  )
}
