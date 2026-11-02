const dialog = document.getElementById('search-dialog')
const input = document.getElementById('search-input')
const results = document.getElementById('search-results')
let items = []
let filtered = []
let activeIndex = 0

async function loadSearchItems() {
  if (items.length > 0) return
  try {
    const response = await fetch('/search.json')
    if (!response.ok) throw new Error('Search index unavailable')
    items = await response.json()
  } catch {
    items = []
  }
}

function renderResults() {
  if (!results || !input) return
  const query = input.value.trim().toLowerCase()
  filtered = query
    ? items.filter((item) => `${item.title} ${item.excerpt} ${(item.tags || []).join(' ')}`.toLowerCase().includes(query))
    : []
  activeIndex = 0

  if (!query) {
    results.innerHTML = '<p class="search-empty">输入关键词搜索笔记和动态。</p>'
    return
  }
  if (filtered.length === 0) {
    results.innerHTML = '<p class="search-empty">没有找到相关内容。</p>'
    return
  }

  results.replaceChildren(...filtered.map((item, index) => {
    const link = document.createElement('a')
    link.className = `search-result${index === activeIndex ? ' is-active' : ''}`
    link.href = item.url
    const title = document.createElement('strong')
    title.textContent = item.title
    const excerpt = document.createElement('span')
    excerpt.textContent = item.excerpt
    link.append(title, excerpt)
    link.addEventListener('mouseenter', () => { activeIndex = index; renderResults() })
    return link
  }))
}

async function openSearch() {
  if (!dialog) return
  dialog.showModal()
  input?.focus()
  await loadSearchItems()
  renderResults()
}

document.getElementById('search-open')?.addEventListener('click', () => { void openSearch() })
document.getElementById('search-close')?.addEventListener('click', () => dialog?.close())
input?.addEventListener('input', renderResults)
dialog?.addEventListener('keydown', (event) => {
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    if (filtered.length === 0) return
    activeIndex = event.key === 'ArrowDown'
      ? (activeIndex + 1) % filtered.length
      : (activeIndex - 1 + filtered.length) % filtered.length
    renderResults()
  } else if (event.key === 'Enter' && filtered[activeIndex]) {
    event.preventDefault()
    window.location.href = filtered[activeIndex].url
  }
})
