const clamp = (value) => Math.max(0, Math.min(100, value))
const finiteNumber = (value) => {
  if (value === '' || value === null || value === undefined) return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

export function salaryScore(salary) {
  const value = finiteNumber(salary)
  return value === null ? 0 : clamp(((value - 50) / 250) * 100)
}

export function commuteScore(minutes) {
  const value = finiteNumber(minutes)
  return value === null ? 0 : clamp(100 - Math.max(0, value - 30) * 0.6)
}

export function totalScore(offer) {
  const values = ['salary', 'commute', 'intensity', 'atmosphere', 'growth'].map((key) => finiteNumber(offer[key]))
  if (values.some((value) => value === null)) return 0
  const [salary, commute, intensity, atmosphere, growth] = values
  const experience = commuteScore(commute) * 0.4 + clamp((11 - intensity) * 10) * 0.3 + clamp(atmosphere * 10) * 0.3
  return salaryScore(salary) * 0.25 + experience * 0.4 + clamp(growth * 10) * 0.35
}

if (typeof document !== 'undefined') {
  const form = document.getElementById('offer-form')
  const list = document.getElementById('offer-list')
  let offers = []
  try { offers = JSON.parse(localStorage.getItem('wuspace-offers') || '[]') } catch { offers = [] }

  const value = (id) => document.getElementById(id)?.value || ''
  const render = () => {
    if (!list) return
    const sorted = [...offers].sort((a, b) => totalScore(b) - totalScore(a))
    list.replaceChildren(...sorted.map((offer) => {
      const row = document.createElement('article')
      row.className = 'entry'
      const title = document.createElement('h3')
      title.textContent = `${offer.company} · ${offer.position}`
      const score = document.createElement('strong')
      score.textContent = `${Math.round(totalScore(offer))} 分`
      const bar = document.createElement('div')
      bar.style.cssText = `height:4px;background:var(--accent);width:${clamp(totalScore(offer))}%`
      const actions = document.createElement('div')
      const edit = document.createElement('button')
      edit.type = 'button'
      edit.textContent = '编辑'
      edit.addEventListener('click', () => {
        form.dataset.editId = offer.id
        for (const [key, id] of [['company','offer-company'],['position','offer-position'],['salary','offer-salary'],['commute','offer-commute'],['intensity','offer-intensity'],['atmosphere','offer-atmosphere'],['growth','offer-growth']]) {
          const field = document.getElementById(id)
          if (field) field.value = offer[key]
        }
      })
      const remove = document.createElement('button')
      remove.type = 'button'
      remove.textContent = '删除'
      remove.addEventListener('click', () => {
        offers = offers.filter((item) => item.id !== offer.id)
        try { localStorage.setItem('wuspace-offers', JSON.stringify(offers)) } catch {}
        render()
      })
      actions.append(edit, remove)
      row.append(title, score, bar, actions)
      return row
    }))
  }

  form?.addEventListener('submit', (event) => {
    event.preventDefault()
    const company = value('offer-company').trim()
    if (!company) return
    const offer = {
      id: form.dataset.editId || crypto.randomUUID(), company, position: value('offer-position').trim(),
      salary: Number(value('offer-salary')), commute: Number(value('offer-commute')),
      intensity: Number(value('offer-intensity')), atmosphere: Number(value('offer-atmosphere')), growth: Number(value('offer-growth')),
    }
    offers = [...offers.filter((item) => item.id !== offer.id), offer]
    delete form.dataset.editId
    try { localStorage.setItem('wuspace-offers', JSON.stringify(offers)) } catch {}
    form.reset()
    render()
  })
  render()
}
