import type { Lang } from '@/i18n/translations'

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

const STORAGE_KEY = 'vibecoding_about'

/* 旧的 stats 格式迁移 */
function migrateFromLegacy(data: unknown): AboutData | null {
  if (!data || typeof data !== 'object') return null
  const d = data as Record<string, unknown>

  // 新格式已有 fields
  if (Array.isArray(d.fields)) {
    return d as AboutData
  }

  // 旧格式有 stats（没有 name/value 分离）
  if (Array.isArray(d.stats)) {
    const oldStats = d.stats as Array<{ icon: string; label: string }>
    const fieldNames: Record<string, string> = {
      MapPin: '位置',
      Briefcase: '职业',
      Globe: '语言',
    }
    return {
      fields: oldStats.map((s) => ({
        icon: s.icon,
        name: fieldNames[s.icon] || '信息',
        value: s.label,
      })),
      title: (d.title as string) || '',
      p1: (d.p1 as string) || '',
      p2: (d.p2 as string) || '',
    }
  }

  return null
}

const defaultAbout: Record<Lang, AboutData> = {
  zh: {
    fields: [
      { icon: 'MapPin', name: '位置', value: 'San Francisco, CA' },
      { icon: 'Heart', name: '爱好', value: 'Coding, Reading, Coffee' },
      { icon: 'Sparkles', name: 'MBTI', value: 'INTJ' },
    ],
    title: '一个充满好奇心的开放建造者',
    p1: '我相信在实践中学习，在写作中思考。这个网站是我的数字花园——笔记、实验和项目在这里随时间生长。一切都是进行中的作品，而我喜欢这种状态。',
    p2: '不写代码的时候，我在探索新想法、广泛阅读，或是寻找一杯完美的咖啡。',
  },
  en: {
    fields: [
      { icon: 'MapPin', name: 'Location', value: 'San Francisco, CA' },
      { icon: 'Heart', name: 'Hobbies', value: 'Coding, Reading, Coffee' },
      { icon: 'Sparkles', name: 'MBTI', value: 'INTJ' },
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
      const parsed = JSON.parse(saved)
      const migrated = migrateFromLegacy(parsed)
      if (migrated) return migrated
      localStorage.removeItem(key)
    } catch {
      localStorage.removeItem(key)
    }
  }
  return defaultAbout[lang]
}

export function saveAbout(lang: Lang, data: AboutData) {
  localStorage.setItem(`${STORAGE_KEY}_${lang}`, JSON.stringify(data))
}
