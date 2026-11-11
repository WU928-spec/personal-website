const VERSION = new URL(import.meta.url).search
const scriptPromises = new Map()
let navigationSequence = 0

export function isSeamlessPath(pathname) {
  return !pathname.startsWith('/starry') && !pathname.startsWith('/assets/')
}

function ensureStylesheet(href) {
  if (document.querySelector(`link[href="${href}"]`)) return
  const link = document.createElement('link')
  link.rel = 'stylesheet'
  link.href = href
  document.head.append(link)
}

function loadClassicScript(src, ready) {
  if (ready()) return Promise.resolve()
  if (scriptPromises.has(src)) return scriptPromises.get(src)
  const promise = new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.onload = resolve
    script.onerror = reject
    document.head.append(script)
  })
  scriptPromises.set(src, promise)
  return promise
}

async function initializeContent() {
  ensureStylesheet('https://cdn.jsdelivr.net/npm/katex@0.16.45/dist/katex.min.css')
  await loadClassicScript('https://cdn.jsdelivr.net/npm/katex@0.16.45/dist/katex.min.js', () => typeof window.katex !== 'undefined')
  await loadClassicScript('https://cdn.jsdelivr.net/npm/katex@0.16.45/dist/contrib/auto-render.min.js', () => typeof window.renderMathInElement === 'function')
  await loadClassicScript(`/assets/js/content.js${VERSION}`, () => typeof window.buildTableOfContents === 'function')
  window.buildTableOfContents()
  window.renderMath()
  window.addCopyButtons()
}

async function initializePage(url) {
  if (url.pathname === '/') {
    const { initializeContributions } = await import(/* @vite-ignore */ `/assets/js/github-contributions.js${VERSION}`)
    initializeContributions()
  } else if (url.pathname === '/notes/' || url.pathname === '/notes') {
    const { initializeCategories } = await import(/* @vite-ignore */ `/assets/js/categories.js${VERSION}`)
    initializeCategories()
  }
  await initializeContent()
}

function isToolsPage(url) {
  return url.pathname === '/tools' || url.pathname === '/tools/' || url.pathname.startsWith('/tools/')
}

async function mountTools() {
  ensureStylesheet(`/assets/legacy-tools/legacy-tools.css${VERSION}`)
  if (typeof window.legacyToolsMount !== 'function') {
    await import(/* @vite-ignore */ `/assets/legacy-tools/legacy-tools.js${VERSION}`)
  }
  window.legacyToolsMount()
}

async function navigate(url, { push = true } = {}) {
  const main = document.getElementById('main-content')
  if (!main || !isSeamlessPath(url.pathname)) {
    window.location.href = url.href
    return
  }
  const sequence = ++navigationSequence
  main.setAttribute('aria-busy', 'true')
  try {
    const response = await fetch(url.href)
    if (!response.ok) throw new Error('Page unavailable')
    const html = await response.text()
    const nextDocument = new DOMParser().parseFromString(html, 'text/html')
    const nextMain = nextDocument.getElementById('main-content')
    if (!nextMain) throw new Error('Page content unavailable')
    if (sequence !== navigationSequence) return

    window.legacyToolsUnmount?.()
    window.categoriesCleanup?.()
    window.contributionsCleanup?.()
    main.replaceWith(nextMain)
    document.title = nextDocument.title
    const description = nextDocument.querySelector('meta[name="description"]')
    if (description) document.querySelector('meta[name="description"]')?.setAttribute('content', description.content)
    document.getElementById('search-dialog')?.close()
    if (push) window.history.pushState({}, '', url)
    window.scrollTo(0, 0)

    if (isToolsPage(url)) await mountTools()
    else await initializePage(url)
  } catch {
    if (sequence === navigationSequence) window.location.href = url.href
  } finally {
    document.getElementById('main-content')?.removeAttribute('aria-busy')
  }
}

document.addEventListener('click', (event) => {
  if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return
  const anchor = event.target.closest?.('a[href]')
  if (!anchor || anchor.hasAttribute('download') || anchor.target === '_blank' || anchor.hasAttribute('data-category-link')) return
  const url = new URL(anchor.href, window.location.href)
  if (url.origin !== window.location.origin || !['http:', 'https:'].includes(url.protocol)) return
  if (url.pathname.startsWith('/starry')) {
    document.getElementById('music-audio')?.pause()
    return
  }
  if (!isSeamlessPath(url.pathname)) return
  if (url.pathname === window.location.pathname && url.search === window.location.search && url.hash) return

  event.preventDefault()
  void navigate(url)
})

window.addEventListener('popstate', () => {
  void navigate(new URL(window.location.href), { push: false })
})
