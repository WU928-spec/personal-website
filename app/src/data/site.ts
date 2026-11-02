import type { Lang } from '@/i18n/translations'
import { createLangStorageKey } from '@/utils/storage'
import { supabase, isSupabaseReady } from '@/lib/supabase'

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
  saveSetting('hero', data).catch(() => {})
}

export interface GitHubRepo {
  name: string
  description: string
  language: string
  languageColor: string
  stars: number
  forks: number
  updated: string
}

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
    brandDesc: '一个记录生活与思考的小角落。',
    copyright: '© 2026 Jasper',
    tagline: '用好奇心和咖啡构建',
    links: [
      { path: '/', label: '首页' },
      { path: '/moments', label: '记忆碎片' },
      { path: '/notes', label: '笔记' },
      { path: '/tools', label: '小工具' },
    ],
    socials: [{ icon: 'Github', href: 'https://github.com/WU928-spec', label: 'GitHub' }],
  },
  en: {
    brandDesc: 'A small corner for life and notes.',
    copyright: '© 2026 Jasper',
    tagline: 'Built with curiosity and coffee',
    links: [
      { path: '/', label: 'Home' },
      { path: '/moments', label: 'Moments' },
      { path: '/notes', label: 'Notes' },
      { path: '/tools', label: 'Tools' },
    ],
    socials: [{ icon: 'Github', href: 'https://github.com/WU928-spec', label: 'GitHub' }],
  },
}

const footerStorage = createLangStorageKey('vibecoding_footer', defaultFooter)

export function loadFooter(lang: Lang): FooterData {
  return footerStorage.load(lang)
}

export function saveFooter(data: Record<Lang, FooterData>) {
  footerStorage.saveAll(data)
  saveSetting('footer', data).catch(() => {})
}

export async function syncSiteSettings(): Promise<boolean> {
  if (!isSupabaseReady()) return false
  try {
    for (const key of ['hero', 'footer']) {
      const remote = await fetchSetting<Record<Lang, unknown>>(key)
      if (!remote) continue
      localStorage.setItem(`vibecoding_${key}`, JSON.stringify(remote))
      if (remote.zh) localStorage.setItem(`vibecoding_${key}_zh`, JSON.stringify(remote.zh))
      if (remote.en) localStorage.setItem(`vibecoding_${key}_en`, JSON.stringify(remote.en))
    }
    return true
  } catch {
    return false
  }
}
