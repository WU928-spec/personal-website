export const ALL_CATEGORY = '全部'
export const UNCATEGORIZED = '未归档'
export const CATEGORIES = [ALL_CATEGORY, '诗歌', '散文', '随笔', '小说', '数学', '计算机&金融', '日记', UNCATEGORIZED]
const knownCategories = new Set(CATEGORIES.slice(1, -1))

export function articleCategory(value) {
  const category = typeof value === 'string' ? value.trim() : ''
  if (category === '诗') return '诗歌'
  return knownCategories.has(category) ? category : UNCATEGORIZED
}

export function categoryFromSearch(search) {
  const category = new URLSearchParams(search).get('category')
  if (category === '诗') return '诗歌'
  return CATEGORIES.includes(category) ? category : ALL_CATEGORY
}

export function initializeCategories() {
  window.categoriesCleanup?.()
  const links = Array.from(document.querySelectorAll('[data-category-link]'))
  const entries = Array.from(document.querySelectorAll('[data-category]'))
  const empty = document.getElementById('category-empty')
  const listeners = []

  function showCategory(category, updateHistory = false) {
    let visible = 0
    for (const entry of entries) {
      const matches = category === ALL_CATEGORY || articleCategory(entry.dataset.category) === category
      entry.hidden = !matches
      if (matches) visible += 1
    }
    for (const link of links) {
      const active = link.dataset.categoryLink === category
      link.classList.toggle('is-active', active)
      if (active) link.setAttribute('aria-current', 'page')
      else link.removeAttribute('aria-current')
    }
    if (empty) empty.hidden = visible !== 0
    document.title = category === ALL_CATEGORY ? '文章 — Jasper' : `${category} — 文章 — Jasper`

    if (updateHistory) {
      const url = new URL(window.location.href)
      if (category === ALL_CATEGORY) url.searchParams.delete('category')
      else url.searchParams.set('category', category)
      window.history.pushState({}, '', url)
    }
  }

  for (const link of links) {
    const listener = (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
      event.preventDefault()
      showCategory(link.dataset.categoryLink, true)
    }
    link.addEventListener('click', listener)
    listeners.push([link, listener])
  }
  const onPopState = () => showCategory(categoryFromSearch(window.location.search))
  window.addEventListener('popstate', onPopState)
  showCategory(categoryFromSearch(window.location.search))

  const cleanup = () => {
    window.removeEventListener('popstate', onPopState)
    for (const [link, listener] of listeners) link.removeEventListener('click', listener)
  }
  window.categoriesCleanup = cleanup
  return cleanup
}

if (typeof document !== 'undefined') initializeCategories()
