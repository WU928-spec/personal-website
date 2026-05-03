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

const defaultAbout: AboutData = {
  stats: [
    { icon: 'MapPin', label: 'San Francisco, CA' },
    { icon: 'Briefcase', label: 'Full-Stack Developer' },
    { icon: 'Globe', label: 'EN, ES, DE' },
  ],
  title: 'A curious mind building in the open',
  p1: "I'm a developer who believes in learning by doing and thinking by writing. This site is my digital garden — a collection of notes, experiments, and projects that grow over time. Everything here is a work in progress, and that's exactly how I like it.",
  p2: "When I'm not coding, you'll find me exploring new ideas, reading widely, or chasing the perfect cup of coffee.",
}

export function loadAbout(): AboutData {
  const saved = localStorage.getItem(STORAGE_KEY)
  if (saved) {
    try {
      return JSON.parse(saved) as AboutData
    } catch {
      localStorage.removeItem(STORAGE_KEY)
    }
  }
  return defaultAbout
}

export function saveAbout(data: AboutData) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}
