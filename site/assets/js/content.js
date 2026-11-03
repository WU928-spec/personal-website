function buildTableOfContents() {
  const article = document.querySelector('[data-article]')
  const container = document.getElementById('article-toc')
  if (!article || !container) return

  const headings = Array.from(article.querySelectorAll('.article-content h2[id], .article-content h3[id]'))
  if (headings.length === 0) return

  const details = document.createElement('details')
  const summary = document.createElement('summary')
  summary.textContent = `本文目录 · ${headings.length}`
  details.appendChild(summary)

  const nav = document.createElement('nav')
  nav.setAttribute('aria-label', '文章目录')
  headings.forEach((heading) => {
    const link = document.createElement('a')
    link.href = `#${heading.id}`
    link.textContent = heading.textContent || heading.id
    if (heading.tagName === 'H3') link.style.paddingLeft = '16px'
    nav.appendChild(link)
  })
  details.appendChild(nav)
  container.replaceChildren(details)
  container.hidden = false
}

function renderMath() {
  if (typeof window.renderMathInElement !== 'function') return
  document.querySelectorAll('[data-article], [data-math]').forEach((element) => {
    window.renderMathInElement(element, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '\\[', right: '\\]', display: true },
        { left: '\\(', right: '\\)', display: false },
        { left: '$', right: '$', display: false },
      ],
      ignoredTags: ['script', 'style', 'textarea', 'pre', 'code'],
    })
  })
}

function addCopyButtons() {
  document.querySelectorAll('.article-content pre').forEach((pre) => {
    if (pre.parentElement?.classList.contains('code-wrap')) return
    const wrapper = document.createElement('div')
    wrapper.className = 'code-wrap'
    pre.replaceWith(wrapper)
    wrapper.appendChild(pre)

    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'code-copy'
    button.textContent = 'Copy'
    button.setAttribute('aria-label', '复制代码')
    button.addEventListener('click', async () => {
      const code = pre.textContent || ''
      try {
        if (!navigator.clipboard) throw new Error('Clipboard unavailable')
        await navigator.clipboard.writeText(code)
        button.textContent = 'Copied'
      } catch {
        const range = document.createRange()
        range.selectNodeContents(pre)
        const selection = window.getSelection()
        selection?.removeAllRanges()
        selection?.addRange(range)
        button.textContent = '已选中，请复制'
      }
      setTimeout(() => { button.textContent = 'Copy' }, 2000)
    })
    wrapper.appendChild(button)
  })
}

buildTableOfContents()
renderMath()
addCopyButtons()
