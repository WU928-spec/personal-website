import type { Lang } from '@/i18n/translations'
import { createLangStorageKey, createStorageKey } from '@/utils/storage'
import { supabase, isSupabaseReady } from '@/lib/supabase'

/* ───────────────────────────────────────────────
   Helpers
   ─────────────────────────────────────────────── */
export async function fetchSetting<T>(key: string): Promise<T | null> {
  if (!isSupabaseReady()) return null
  const { data, error } = await supabase!
    .from('site_settings')
    .select('value')
    .eq('key', key)
    .maybeSingle()
  if (error || !data) return null
  return (data as Record<string, unknown>).value as T
}

export async function saveSetting<T>(key: string, value: T) {
  if (!isSupabaseReady()) return
  await supabase!.from('site_settings').upsert({
    key,
    value: value as unknown as Record<string, unknown>,
    updated_at: new Date().toISOString(),
  })
}

/* ───────────────────────────────────────────────
   Hero
   ─────────────────────────────────────────────── */
export interface HeroData {
  subtitle: string
  tagline: string
}

const defaultHero: Record<Lang, HeroData> = {
  zh: {
    subtitle: '开发者 · 写作者 · 数字园丁',
    tagline: '我动手创造，并记录所学。欢迎来到我的互联网角落。',
  },
  en: {
    subtitle: 'Developer · Writer · Digital Gardener',
    tagline: 'I build things and write about what I learn. Welcome to my corner of the internet.',
  },
}

const heroStorage = createLangStorageKey('vibecoding_hero', defaultHero)

export function loadHero(lang: Lang): HeroData {
  return heroStorage.load(lang)
}

export function saveHero(data: Record<Lang, HeroData>) {
  heroStorage.saveAll(data)
  saveSetting('hero', data).catch((e) => console.warn('Hero Supabase sync failed:', e))
}

/* ───────────────────────────────────────────────
   Skills
   ─────────────────────────────────────────────── */
export interface SkillItem {
  name: string
  size: 'lg' | 'md'
}

export interface SkillCategory {
  name: string
  color: string
  skills: SkillItem[]
}

const defaultSkills: SkillCategory[] = [
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

const skillsStorage = createStorageKey('vibecoding_skills', defaultSkills)

export function loadSkills(): SkillCategory[] {
  return skillsStorage.load()
}

export function saveSkills(data: SkillCategory[]) {
  skillsStorage.save(data)
  saveSetting('skills', data).catch((e) => console.warn('Skills Supabase sync failed:', e))
}

/* ───────────────────────────────────────────────
   Blog Preview
   ─────────────────────────────────────────────── */
export interface BlogPreviewPost {
  thumb: string
  category: string
  title: string
  excerpt: string
  date: string
  readTime: string
}

const defaultBlogPreview: Record<Lang, BlogPreviewPost[]> = {
  zh: [
    {
      thumb: '/blog-thumb-1.jpg',
      category: '开发',
      title: '从零开始构建设计系统',
      excerpt: '从创建可扩展组件库中学到的经验，该库为多个产品和团队提供支持。',
      date: '2025年1月15日',
      readTime: '8 分钟',
    },
    {
      thumb: '/blog-thumb-2.jpg',
      category: '随笔',
      title: '数字园艺的艺术',
      excerpt: '为什么我把网站当作花园而不是作品集——以及这如何改变了一切。',
      date: '2025年1月8日',
      readTime: '5 分钟',
    },
    {
      thumb: '/blog-thumb-3.jpg',
      category: '教程',
      title: '使用 Next.js 构建类型安全 API 路由',
      excerpt: '在不牺牲开发者体验的情况下构建完全类型安全 API 处理程序的实用指南。',
      date: '2024年12月28日',
      readTime: '12 分钟',
    },
  ],
  en: [
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
  ],
}

const blogPreviewStorage = createLangStorageKey('vibecoding_blogPreview', defaultBlogPreview)

export function loadBlogPreview(lang: Lang): BlogPreviewPost[] {
  return blogPreviewStorage.load(lang)
}

export function saveBlogPreview(data: Record<Lang, BlogPreviewPost[]>) {
  blogPreviewStorage.saveAll(data)
  saveSetting('blogPreview', data).catch((e) =>
    console.warn('BlogPreview Supabase sync failed:', e)
  )
}

/* ───────────────────────────────────────────────
   GitHub Snapshot
   ─────────────────────────────────────────────── */
export interface GitHubRepo {
  name: string
  description: string
  language: string
  languageColor: string
  stars: number
  forks: number
  updated: string
}

export interface GitHubStats {
  repos: number
  stars: number
  streak: number
}

export interface GitHubData {
  repos: GitHubRepo[]
  stats: GitHubStats
}

const defaultGitHub: GitHubData = {
  repos: [
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
  ],
  stats: { repos: 48, stars: 1567, streak: 42 },
}

const githubStorage = createStorageKey('vibecoding_github', defaultGitHub)

export function loadGitHub(): GitHubData {
  return githubStorage.load()
}

export function saveGitHub(data: GitHubData) {
  githubStorage.save(data)
  saveSetting('github', data).catch((e) => console.warn('GitHub Supabase sync failed:', e))
}

/* ───────────────────────────────────────────────
   Footer
   ─────────────────────────────────────────────── */
export interface FooterLink {
  path: string
  label: string
}

export interface FooterSocial {
  icon: string
  href: string
  label: string
}

export interface FooterData {
  brandDesc: string
  copyright: string
  tagline: string
  links: FooterLink[]
  socials: FooterSocial[]
}

const defaultFooter: Record<Lang, FooterData> = {
  zh: {
    brandDesc: '一个公开生长的数字花园。',
    copyright: '© 2025 Digital Garden. 保留所有权利。',
    tagline: '用好奇心和咖啡构建。',
    links: [
      { path: '/', label: '首页' },
      { path: '/blog', label: '博客' },
      { path: '/calendar', label: '任务管理' },
      { path: '/projects', label: '项目' },
      { path: '/projects', label: '联系' },
    ],
    socials: [
      { icon: 'Github', href: 'https://github.com/WU928-spec', label: 'GitHub' },
      { icon: 'Twitter', href: 'https://twitter.com', label: 'Twitter' },
      { icon: 'Linkedin', href: 'https://linkedin.com', label: 'LinkedIn' },
      { icon: 'Mail', href: 'mailto:hello@example.com', label: 'Email' },
    ],
  },
  en: {
    brandDesc: 'A digital garden, growing in public.',
    copyright: '© 2025 Digital Garden. All rights reserved.',
    tagline: 'Built with curiosity and coffee.',
    links: [
      { path: '/', label: 'Home' },
      { path: '/blog', label: 'Blog' },
      { path: '/calendar', label: 'Tasks' },
      { path: '/projects', label: 'Projects' },
      { path: '/projects', label: 'Contact' },
    ],
    socials: [
      { icon: 'Github', href: 'https://github.com/WU928-spec', label: 'GitHub' },
      { icon: 'Twitter', href: 'https://twitter.com', label: 'Twitter' },
      { icon: 'Linkedin', href: 'https://linkedin.com', label: 'LinkedIn' },
      { icon: 'Mail', href: 'mailto:hello@example.com', label: 'Email' },
    ],
  },
}

const footerStorage = createLangStorageKey('vibecoding_footer', defaultFooter)

export function loadFooter(lang: Lang): FooterData {
  return footerStorage.load(lang)
}

export function saveFooter(data: Record<Lang, FooterData>) {
  footerStorage.saveAll(data)
  saveSetting('footer', data).catch((e) => console.warn('Footer Supabase sync failed:', e))
}

/* ───────────────────────────────────────────────
   Background sync for all site settings
   ─────────────────────────────────────────────── */
export async function syncSiteSettings(): Promise<boolean> {
  if (!isSupabaseReady()) return false
  try {
    const keys = ['hero', 'skills', 'blogPreview', 'github', 'footer']
    for (const key of keys) {
      const remote = await fetchSetting<unknown>(key)
      if (remote) {
        localStorage.setItem(`vibecoding_${key}`, JSON.stringify(remote))
        if (key === 'hero' || key === 'blogPreview' || key === 'footer') {
          // These are lang-keyed; store under both langs for simplicity
          const typed = remote as Record<string, unknown>
          if (typed.zh) localStorage.setItem(`vibecoding_${key}_zh`, JSON.stringify(typed.zh))
          if (typed.en) localStorage.setItem(`vibecoding_${key}_en`, JSON.stringify(typed.en))
        }
      }
    }
    return true
  } catch (e) {
    console.warn('Site settings sync failed:', e)
    return false
  }
}
