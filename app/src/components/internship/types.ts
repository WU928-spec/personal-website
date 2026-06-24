export interface Dimension {
  id: string
  name: string
  weight: number
  description: string
  icon: string
}

export interface Offer {
  id: string
  companyName: string
  position: string
  location: string
  salary: number
  commuteMinutes: number
  workIntensity: number
  teamAtmosphere: number
  growthProspect: number
  isFavorite: boolean
}

export interface CommuteCache {
  defaultStart: string
  homeAddress: string
}

const STORAGE_KEY = 'internship-decision-offers'
const COMMUTE_KEY = 'internship-decision-commute'

export function loadOffers(): Offer[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as unknown
      if (Array.isArray(parsed)) return parsed as Offer[]
    }
  } catch {
    // ignore
  }
  return []
}

export function saveOffers(offers: Offer[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(offers))
  } catch {
    // ignore
  }
}

export function loadCommuteCache(): CommuteCache {
  try {
    const raw = localStorage.getItem(COMMUTE_KEY)
    if (raw) {
      const parsed = JSON.parse(raw) as unknown
      if (parsed && typeof parsed === 'object') {
        return {
          defaultStart: (parsed as Record<string, unknown>).defaultStart as string || '',
          homeAddress: (parsed as Record<string, unknown>).homeAddress as string || '',
        }
      }
    }
  } catch {
    // ignore
  }
  return { defaultStart: '', homeAddress: '' }
}

export function saveCommuteCache(cache: CommuteCache) {
  try {
    localStorage.setItem(COMMUTE_KEY, JSON.stringify(cache))
  } catch {
    // ignore
  }
}

/** 日薪分：50-300 映射到 0-100 */
export function calcSalaryScore(salary: number): number {
  return Math.max(0, Math.min(100, ((salary - 50) / 250) * 100))
}

/** 通勤分：超过30min后线性递减，每10min减6分 */
export function calcCommuteScore(minutes: number): number {
  return Math.max(0, 100 - Math.max(0, minutes - 30) * 0.6)
}

/** 计算单个 Offer 总分 */
export function calcTotalScore(offer: Offer): number {
  const salaryScore = calcSalaryScore(offer.salary)
  const commuteScore = calcCommuteScore(offer.commuteMinutes)
  const intensityScore = (offer.workIntensity / 10) * 100
  const atmosphereScore = (offer.teamAtmosphere / 10) * 100

  const commuteWeight = 0.4
  const intensityWeight = 0.3
  const atmosphereWeight = 0.3

  const workExperienceScore =
    commuteScore * commuteWeight +
    intensityScore * intensityWeight +
    atmosphereScore * atmosphereWeight

  const growthScore = (offer.growthProspect / 10) * 100

  return salaryScore * 0.25 + workExperienceScore * 0.40 + growthScore * 0.35
}

export function generateId(): string {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

export const defaultOfferTemplate = (): Offer => ({
  id: generateId(),
  companyName: '',
  position: '',
  location: '',
  salary: 175,
  commuteMinutes: 60,
  workIntensity: 5,
  teamAtmosphere: 5,
  growthProspect: 5,
  isFavorite: false,
})
