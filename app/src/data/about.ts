import type { Lang } from '@/i18n/translations'

export interface AboutStat {
  icon: string
  label: string
}

export interface AboutData {
  stats: AboutStat[]
  title: string
  p1: string
  p2: string
}

const STORAGE_KEY = 'vibecoding_about'

const defaultAbout: Record<Lang, AboutData> = {
  zh: {
    stats: [
      { icon: 'MapPin', label: 'San Francisco, CA' },
      { icon: 'Briefcase', label: 'Full-Stack Developer' },
      { icon: 'Globe', label: 'EN, ES, DE' },
    ],
    title: '一个充满好奇心的开放建造者',
    p1: '我相信在实践中学习，在写作中思考。这个网站是我的数字花园——笔记、实验和项目在这里随时间生长。一切都是进行中的作品，而我喜欢这种状态。',
    p2: '不写代码的时候，我在探索新想法、广泛阅读，或是寻找一杯完美的咖啡。',
  },
  en: {
    stats: [
      { icon: 'MapPin', label: 'San Francisco, CA' },
      { icon: 'Briefcase', label: 'Full-Stack Developer' },
      { icon: 'Globe', label: 'EN, ES, DE' },
    ],
    title: 'A curious mind building in the open',
    p1: "I'm a developer who believes in learning by doing and thinking by writing. This site is my digital garden — a collection of notes, experiments, and projects that grow over time. Everything here is a work in progress, and that's exactly how I like it.",
    p2: "When I'm not coding, you'll find me exploring new ideas, reading widely, or chasing the perfect cup of coffee.",
  },
}

export function loadAbout(lang: Lang): AboutData {
  const key = `${STORAGE_KEY}_${lang}`
  const saved = localStorage.getItem(key)
  if (saved) {
    try {
      return JSON.parse(saved) as AboutData
    } catch {
      localStorage.removeItem(key)
    }
  }
  return defaultAbout[lang]
}

export function saveAbout(lang: Lang, data: AboutData) {
  localStorage.setItem(`${STORAGE_KEY}_${lang}`, JSON.stringify(data))
}
