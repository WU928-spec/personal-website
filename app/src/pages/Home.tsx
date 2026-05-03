import { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ChevronDown, ExternalLink, MapPin, Briefcase, Globe, Star, GitFork } from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Hero Section                                                       */
/* ------------------------------------------------------------------ */

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
          // Cursor blinks 3 times then fades
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
  const headline = "Hi, I'm Alex"
  const { displayed, showCursor, done } = useTypingEffect(headline, 80, 600)

  return (
    <section className="relative min-h-[100dvh] flex items-center justify-center overflow-hidden">
      {/* Background image with slow zoom */}
      <motion.div
        initial={{ scale: 1.05 }}
        animate={{ scale: 1 }}
        transition={{ duration: 8, ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number] }}
        className="absolute inset-0"
        style={{
          backgroundImage: 'url(/hero-bg.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      {/* Overlay gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(to bottom, rgba(45,42,38,0.5) 0%, rgba(45,42,38,0.1) 50%, rgba(247,244,239,1) 100%)',
        }}
      />

      {/* Content */}
      <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
        {/* Headline with typing */}
        <h1 className="font-display text-[clamp(2.75rem,6vw,5rem)] font-semibold leading-[1.05] tracking-[-0.02em] text-Parchment">
          {displayed}
          {showCursor && (
            <span className="text-Amber animate-blink ml-0.5">|</span>
          )}
        </h1>

        {/* Sub-line */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={done ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="font-body text-[1.0625rem] leading-[1.75] text-[rgba(247,244,239,0.85)] mt-4"
        >
          Developer &middot; Writer &middot; Digital Gardener
        </motion.p>

        {/* Tagline */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={done ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="font-body text-[0.9375rem] leading-[1.65] text-[rgba(247,244,239,0.7)] max-w-xl mx-auto mt-4"
        >
          I build things and write about what I learn. Welcome to my corner of the internet.
        </motion.p>

        {/* CTAs */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={done ? { opacity: 1, y: 0 } : {}}
          transition={{ duration: 0.6, delay: 0.9, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="flex items-center justify-center gap-4 mt-8"
        >
          <Link
            to="/blog"
            className="inline-flex items-center bg-Amber text-Parchment font-ui text-[0.875rem] font-semibold uppercase tracking-[0.05em] px-7 py-3 rounded-md hover:bg-[#B06A2F] hover:shadow-amber hover:-translate-y-px transition-all duration-300"
          >
            Read My Blog
          </Link>
          <Link
            to="/projects"
            className="inline-flex items-center border-[1.5px] border-Parchment text-Parchment font-ui text-[0.875rem] font-semibold uppercase tracking-[0.05em] px-7 py-3 rounded-md hover:bg-Ink hover:border-Ink hover:text-Parchment hover:-translate-y-px transition-all duration-300"
            style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
          >
            View Projects
          </Link>
        </motion.div>
      </div>

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10"
      >
        <div className="flex flex-col items-center gap-2 animate-scroll-pulse">
          <span className="font-ui text-[0.8125rem] font-medium tracking-[0.04em] text-[rgba(247,244,239,0.5)] uppercase">
            Scroll
          </span>
          <ChevronDown size={20} className="text-[rgba(247,244,239,0.5)]" />
        </div>
      </motion.div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Introduction Card Section                                          */
/* ------------------------------------------------------------------ */

const introStats = [
  { icon: MapPin, label: 'San Francisco, CA' },
  { icon: Briefcase, label: 'Full-Stack Developer' },
  { icon: Globe, label: 'EN, ES, DE' },
]

function IntroSection() {
  return (
    <section className="bg-Parchment py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start">
          {/* Left column */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
            className="md:col-span-4 flex flex-col items-center"
          >
            <div className="w-[200px] h-[200px] rounded-full overflow-hidden border-[3px] border-Amber shadow-medium">
              <img src="/avatar.jpg" alt="Profile" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col gap-3 mt-6 w-full max-w-[240px]">
              {introStats.map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{
                    duration: 0.5,
                    delay: 0.1 * i,
                    ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
                  }}
                  className="flex items-center gap-2 bg-Linen border border-Sand rounded-lg px-3 py-2"
                >
                  <stat.icon size={14} className="text-Slate" />
                  <span className="font-ui text-[0.8125rem] font-medium tracking-[0.04em] text-Slate">
                    {stat.label}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Right column */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{
              duration: 0.7,
              delay: 0.2,
              ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
            }}
            className="md:col-span-8"
          >
            <p className="font-ui text-[0.8125rem] font-medium uppercase tracking-[0.1em] text-Sage mb-4">
              About Me
            </p>
            <h2 className="font-display text-[clamp(1.5rem,2.5vw,2.25rem)] font-medium leading-[1.2] text-Ink">
              A curious mind building in the open
            </h2>
            <p className="font-body text-[1.0625rem] leading-[1.75] text-Ink mt-4">
              I'm a developer who believes in learning by doing and thinking by writing. This site is my digital garden — a collection of notes, experiments, and projects that grow over time. Everything here is a work in progress, and that's exactly how I like it.
            </p>
            <p className="font-body text-[1.0625rem] leading-[1.75] text-Ink mt-4">
              When I'm not coding, you'll find me exploring new ideas, reading widely, or chasing the perfect cup of coffee.
            </p>
            <Link
              to="/about"
              className="inline-block mt-6 font-body text-[1rem] font-medium text-Amber hover:underline underline-offset-4 transition-all duration-300"
            >
              Learn more about me &rarr;
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  Skill Constellation Section                                        */
/* ------------------------------------------------------------------ */

const skillCategories = [
  {
    name: 'Languages',
    color: 'bg-Amber',
    skills: [
      { name: 'TypeScript', size: 'lg' },
      { name: 'Python', size: 'lg' },
      { name: 'Go', size: 'md' },
      { name: 'Rust', size: 'md' },
    ],
  },
  {
    name: 'Frontend',
    color: 'bg-Sage',
    skills: [
      { name: 'React', size: 'lg' },
      { name: 'Vue', size: 'md' },
      { name: 'Tailwind', size: 'lg' },
      { name: 'Next.js', size: 'md' },
    ],
  },
  {
    name: 'Backend',
    color: 'bg-Slate',
    skills: [
      { name: 'Node.js', size: 'lg' },
      { name: 'PostgreSQL', size: 'md' },
      { name: 'Redis', size: 'md' },
      { name: 'GraphQL', size: 'md' },
    ],
  },
  {
    name: 'Tools',
    color: 'bg-Gold',
    skills: [
      { name: 'Docker', size: 'md' },
      { name: 'Git', size: 'lg' },
      { name: 'Linux', size: 'md' },
      { name: 'Figma', size: 'md' },
    ],
  },
]

function SkillConstellationSection() {
  return (
    <section className="bg-Linen py-20 md:py-28">
      <div className="max-w-5xl mx-auto px-6 md:px-12 text-center">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        >
          <p className="font-ui text-[0.8125rem] font-medium uppercase tracking-[0.1em] text-Sage mb-4">
            What I Do
          </p>
          <h2 className="font-display text-[clamp(1.5rem,2.5vw,2.25rem)] font-medium leading-[1.2] text-Ink">
            Tools, skills & technologies
          </h2>
          <p className="font-body text-[0.9375rem] leading-[1.65] text-Slate mt-2">
            The stack I reach for when building things
          </p>
        </motion.div>

        {/* Skill cloud */}
        <div className="mt-12 flex flex-wrap justify-center gap-3 md:gap-4">
          {skillCategories.map((cat, ci) =>
            cat.skills.map((skill, si) => (
              <motion.div
                key={`${cat.name}-${skill.name}`}
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{
                  duration: 0.5,
                  delay: 0.06 * (ci * 4 + si),
                  ease: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
                }}
                whileHover={{
                  y: -2,
                  boxShadow: '0 2px 8px rgba(196,120,58,0.1)',
                  borderColor: '#C4783A',
                }}
                className="inline-flex items-center gap-2 bg-Mist border border-Sand rounded-full px-4 py-1.5 cursor-default transition-colors duration-200 hover:bg-Linen"
              >
                <span className={`w-2 h-2 rounded-full ${cat.color}`} />
                <span
                  className={`font-ui font-medium tracking-[0.04em] text-Slate ${
                    skill.size === 'lg' ? 'text-[0.9375rem]' : 'text-[0.8125rem]'
                  }`}
                >
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

/* ------------------------------------------------------------------ */
/*  Blog Preview Section                                               */
/* ------------------------------------------------------------------ */

const blogPosts = [
  {
    thumb: '/blog-thumb-1.jpg',
    category: 'Development',
    title: 'Building a Design System from Scratch',
    excerpt: 'Lessons learned from creating a scalable component library that powers multiple products and teams.',
    date: 'Jan 15, 2025',
    readTime: '8 min read',
  },
  {
    thumb: '/blog-thumb-2.jpg',
    category: 'Thoughts',
    title: 'The Art of Digital Gardening',
    excerpt: 'Why I treat my website as a garden rather than a portfolio — and how that changes everything.',
    date: 'Jan 8, 2025',
    readTime: '5 min read',
  },
  {
    thumb: '/blog-thumb-3.jpg',
    category: 'Tutorial',
    title: 'Type-Safe API Routes with Next.js',
    excerpt: 'A practical guide to building fully type-safe API handlers without sacrificing developer experience.',
    date: 'Dec 28, 2024',
    readTime: '12 min read',
  },
]

function BlogPreviewSection() {
  return (
    <section className="bg-Parchment py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10"
        >
          <div>
            <p className="font-ui text-[0.8125rem] font-medium uppercase tracking-[0.1em] text-Sage mb-4">
              Latest Writing
            </p>
            <h2 className="font-display text-[clamp(1.5rem,2.5vw,2.25rem)] font-medium leading-[1.2] text-Ink">
              Fresh from my notebook
            </h2>
          </div>
          <Link
            to="/blog"
            className="font-body text-[1rem] font-medium text-Amber hover:underline underline-offset-4 transition-all duration-300 shrink-0"
          >
            View all &rarr;
          </Link>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {blogPosts.map((post, i) => (
            <motion.article
              key={post.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-50px' }}
              transition={{
                duration: 0.7,
                delay: 0.1 * i,
                ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
              }}
              className="group bg-[rgba(237,232,224,0.7)] border border-Sand rounded-xl overflow-hidden shadow-soft hover:shadow-medium hover:-translate-y-[3px] transition-all duration-300"
              style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
            >
              {/* Thumbnail */}
              <div className="aspect-[16/10] overflow-hidden">
                <img
                  src={post.thumb}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-[1.04] transition-transform duration-500"
                  style={{ transitionTimingFunction: 'cubic-bezier(0.25, 0.1, 0.25, 1)' }}
                />
              </div>
              {/* Content */}
              <div className="p-6">
                <span className="inline-flex items-center font-ui text-[0.8125rem] font-medium tracking-[0.04em] text-Sage bg-Mist rounded-full px-3 py-1 mb-3">
                  {post.category}
                </span>
                <h3 className="font-display text-[1.25rem] font-semibold leading-[1.3] text-Ink group-hover:text-Amber transition-colors duration-500 line-clamp-2">
                  {post.title}
                </h3>
                <p className="font-body text-[0.9375rem] leading-[1.65] text-Slate mt-2 line-clamp-3">
                  {post.excerpt}
                </p>
                <div className="flex items-center gap-2 mt-4">
                  <span className="font-ui text-[0.8125rem] font-medium tracking-[0.04em] text-[rgba(30,28,26,0.5)]">
                    {post.date}
                  </span>
                  <span className="text-[rgba(30,28,26,0.3)]">&middot;</span>
                  <span className="font-ui text-[0.8125rem] font-medium tracking-[0.04em] text-[rgba(30,28,26,0.5)]">
                    {post.readTime}
                  </span>
                </div>
              </div>
            </motion.article>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
          className="text-center mt-10"
        >
          <Link
            to="/blog"
            className="inline-flex items-center border-[1.5px] border-Ink text-Ink font-ui text-[0.875rem] font-semibold uppercase tracking-[0.05em] px-7 py-3 rounded-md hover:bg-Ink hover:text-Parchment hover:-translate-y-px transition-all duration-300"
            style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
          >
            Explore all articles &rarr;
          </Link>
        </motion.div>
      </div>
    </section>
  )
}

/* ------------------------------------------------------------------ */
/*  GitHub Snapshot Section                                            */
/* ------------------------------------------------------------------ */

const pinnedRepos = [
  {
    name: 'digital-garden',
    description: 'My personal website and digital garden built with React, Tailwind, and Vite.',
    language: 'TypeScript',
    languageColor: '#3178c6',
    stars: 142,
    forks: 18,
    updated: '2 days ago',
  },
  {
    name: 'obsidian-export',
    description: 'A CLI tool to export Obsidian vaults to static HTML with wikilink support.',
    language: 'Rust',
    languageColor: '#dea584',
    stars: 89,
    forks: 12,
    updated: '1 week ago',
  },
  {
    name: 'type-safe-api',
    description: 'End-to-end type safety for REST APIs without code generation.',
    language: 'TypeScript',
    languageColor: '#3178c6',
    stars: 234,
    forks: 31,
    updated: '3 days ago',
  },
  {
    name: 'go-cache',
    description: 'High-performance in-memory cache for Go with TTL and LRU eviction.',
    language: 'Go',
    languageColor: '#00ADD8',
    stars: 67,
    forks: 8,
    updated: '2 weeks ago',
  },
]

// Generate mock contribution data
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

function GitHubSnapshotSection() {
  const contributions = useRef(generateContributionGrid())
  const [stats] = useState({ repos: 48, stars: 1567, streak: 42 })

  const contributionColors = [
    'rgba(247,244,239,0.05)',
    'rgba(196,120,58,0.3)',
    'rgba(196,120,58,0.6)',
    'rgba(196,120,58,1)',
  ]

  return (
    <section className="bg-Graphite py-24 md:py-32">
      <div className="max-w-6xl mx-auto px-6 md:px-12">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        >
          <p className="font-ui text-[0.8125rem] font-medium uppercase tracking-[0.1em] text-[rgba(107,142,107,0.8)] mb-4">
            Open Source
          </p>
          <h2 className="font-display text-[clamp(1.5rem,2.5vw,2.25rem)] font-medium leading-[1.2] text-Parchment">
            What I'm building
          </h2>
          <p className="font-body text-[0.9375rem] leading-[1.65] text-[rgba(247,244,239,0.6)] mt-2">
            Pinned projects and recent contributions
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
          <p className="font-ui text-[0.8125rem] font-medium tracking-[0.04em] text-[rgba(247,244,239,0.5)] mb-3">
            Contribution activity
          </p>
          <div className="flex gap-[3px] overflow-x-auto pb-2">
            {contributions.current.map((week, wi) => (
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
                      ease: [0.25, 0.1, 0.25, 1] as [number, number, number, number],
                    }}
                    className="w-[10px] h-[10px] rounded-sm shrink-0"
                    style={{ backgroundColor: contributionColors[level] }}
                    title={`${level} contributions`}
                  />
                ))}
              </div>
            ))}
          </div>
        </motion.div>

        {/* Pinned repos */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-8">
          {pinnedRepos.map((repo, i) => (
            <motion.a
              key={repo.name}
              href={`https://github.com/alex/${repo.name}`}
              target="_blank"
              rel="noopener noreferrer"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.6,
                delay: 0.1 * i,
                ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
              }}
              className="block bg-[rgba(45,42,38,0.9)] border border-[rgba(255,255,255,0.08)] rounded-xl p-6 hover:border-[rgba(255,255,255,0.15)] hover:shadow-deep hover:-translate-y-[2px] transition-all duration-300"
              style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
            >
              <div className="flex items-center justify-between">
                <h3 className="font-mono text-[0.875rem] leading-[1.6] text-Amber">
                  {repo.name}
                </h3>
                <ExternalLink size={14} className="text-[rgba(247,244,239,0.4)]" />
              </div>
              <p className="font-body text-[0.9375rem] leading-[1.65] text-[rgba(247,244,239,0.7)] mt-2 line-clamp-2">
                {repo.description}
              </p>
              <div className="flex items-center gap-4 mt-4">
                <span className="flex items-center gap-1.5">
                  <span
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: repo.languageColor }}
                  />
                  <span className="font-ui text-[0.8125rem] tracking-[0.04em] text-[rgba(247,244,239,0.6)]">
                    {repo.language}
                  </span>
                </span>
                <span className="flex items-center gap-1 text-[rgba(247,244,239,0.6)]">
                  <Star size={14} />
                  <span className="font-ui text-[0.8125rem] tracking-[0.04em]">{repo.stars}</span>
                </span>
                <span className="flex items-center gap-1 text-[rgba(247,244,239,0.6)]">
                  <GitFork size={14} />
                  <span className="font-ui text-[0.8125rem] tracking-[0.04em]">{repo.forks}</span>
                </span>
                <span className="font-ui text-[0.8125rem] tracking-[0.04em] text-[rgba(247,244,239,0.4)] ml-auto">
                  {repo.updated}
                </span>
              </div>
            </motion.a>
          ))}
        </div>

        {/* Stats row */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8"
        >
          {[
            { label: 'Total Repositories', value: stats.repos },
            { label: 'Total Stars', value: stats.stars },
            { label: 'Longest Streak', value: stats.streak },
          ].map((stat, i, arr) => (
            <div
              key={stat.label}
              className={`flex flex-col items-center py-4 ${
                i < arr.length - 1 ? 'md:border-r md:border-[rgba(247,244,239,0.1)]' : ''
              }`}
            >
              <CountUpNumber value={stat.value} duration={1.5} />
              <span className="font-ui text-[0.8125rem] font-medium tracking-[0.04em] text-[rgba(247,244,239,0.5)] mt-1">
                {stat.label}
              </span>
            </div>
          ))}
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.4 }}
          className="text-center mt-10"
        >
          <a
            href="https://github.com/alex"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center border-[1.5px] border-[rgba(247,244,239,0.5)] text-Parchment font-ui text-[0.875rem] font-semibold uppercase tracking-[0.05em] px-7 py-3 rounded-md hover:bg-Parchment hover:text-Ink hover:border-Parchment hover:-translate-y-px transition-all duration-300"
            style={{ transitionTimingFunction: 'cubic-bezier(0.4, 0, 0.2, 1)' }}
          >
            View full profile &rarr;
          </a>
        </motion.div>
      </div>
    </section>
  )
}

function CountUpNumber({ value, duration }: { value: number; duration: number }) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const started = useRef(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started.current) {
          started.current = true
          const startTime = performance.now()

          const animate = (currentTime: number) => {
            const elapsed = (currentTime - startTime) / 1000
            const progress = Math.min(elapsed / duration, 1)
            // Gentle easing
            const eased = progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2
            setCount(Math.floor(eased * value))
            if (progress < 1) {
              requestAnimationFrame(animate)
            }
          }
          requestAnimationFrame(animate)
        }
      },
      { threshold: 0.5 }
    )

    observer.observe(el)
    return () => observer.disconnect()
  }, [value, duration])

  return (
    <div ref={ref} className="font-display text-[clamp(2rem,4vw,3.5rem)] font-medium leading-[1.1] text-Amber">
      {count.toLocaleString()}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Home Page                                                          */
/* ------------------------------------------------------------------ */

export default function Home() {
  return (
    <div>
      <HeroSection />
      <IntroSection />
      <SkillConstellationSection />
      <BlogPreviewSection />
      <GitHubSnapshotSection />
    </div>
  )
}
