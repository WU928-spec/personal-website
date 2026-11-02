import type { Lang } from '@/i18n/translations'
import { createLangStorageKey } from '@/utils/storage'

export interface ProfileField {
  icon: string
  name: string
  value: string
}

export interface AboutData {
  fields: ProfileField[]
  title: string
  p1: string
  p2: string
}

const defaultAbout: Record<Lang, AboutData> = {
  zh: {
    fields: [],
    title: '一个仍在探索中的普通人',
    p1: '这里记录我的生活、阅读和随手写下的心得。很高兴你来坐坐。',
    p2: '不赶时间的话，可以从最近的生活或一篇笔记开始认识我。',
  },
  en: {
    fields: [],
    title: 'Just a curious person, still exploring',
    p1: 'This is where I keep notes about my life, reading, and everyday thoughts. I’m glad you stopped by.',
    p2: 'If you have a little time, start with a recent moment or a note.',
  },
}

const aboutStorage = createLangStorageKey('vibecoding_about', defaultAbout)

export function loadAbout(lang: Lang): AboutData {
  return aboutStorage.load(lang)
}

export function saveAbout(lang: Lang, data: AboutData) {
  aboutStorage.save(lang, data)
}
