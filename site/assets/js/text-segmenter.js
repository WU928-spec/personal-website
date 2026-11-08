const ABBREVIATIONS = new Set(['mr.', 'mrs.', 'ms.', 'dr.', 'prof.', 'sr.', 'jr.', 'st.', 'vs.', 'vol.', 'inc.', 'ltd.', 'corp.', 'e.g.', 'i.e.', 'etc.', 'a.m.', 'p.m.', 'u.s.', 'u.k.', 'u.n.', 'e.u.', 'no.', 'fig.', 'jan.', 'feb.', 'mar.', 'apr.', 'jun.', 'jul.', 'aug.', 'sep.', 'oct.', 'nov.', 'dec.'])

function isAbbreviation(text, position) {
  const start = position - 1
  let wordStart = start
  while (wordStart >= 0 && /[a-zA-Z.]/.test(text[wordStart])) wordStart -= 1
  return ABBREVIATIONS.has(text.slice(wordStart + 1, position + 1).toLowerCase())
}

function splitSentences(line) {
  const sentences = []
  let current = ''
  for (let index = 0; index < line.length; index += 1) {
    current += line[index]
    if (!/[.!?]/.test(line[index]) || isAbbreviation(line, index)) continue
    let next = index + 1
    while (line[next] === ' ') next += 1
    if (line[next] === '"' || line[next] === "'") {
      current += line[next]
      next += 1
      while (line[next] === ' ') next += 1
    }
    if (next >= line.length || /[A-Z]/.test(line[next])) {
      sentences.push(current.trim())
      current = ''
      index = next - 1
    }
  }
  if (current.trim()) sentences.push(current.trim())
  return sentences
}

export function segmentEnglish(text) {
  if (!text.trim()) return ''
  return text.trim().split(/\n\s*\n/).map((paragraph) =>
    paragraph.split('\n').map((line) => splitSentences(line.trim()).join('\n\n')).join('\n'),
  ).join('\n\n')
}

if (typeof document !== 'undefined') {
  const input = document.getElementById('segmenter-input')
  const output = document.getElementById('segmenter-output')
  const run = () => { if (output) output.value = segmentEnglish(input?.value || '') }
  document.getElementById('segmenter-run')?.addEventListener('click', run)
  document.getElementById('segmenter-clear')?.addEventListener('click', () => {
    if (input) input.value = ''
    if (output) output.value = ''
    input?.focus()
  })
  document.getElementById('segmenter-copy')?.addEventListener('click', async (event) => {
    if (!output?.value) return
    const button = event.currentTarget
    try {
      await navigator.clipboard.writeText(output.value)
      button.textContent = '已复制'
    } catch {
      output.select()
      button.textContent = '已选中，请复制'
    }
    setTimeout(() => { button.textContent = '复制结果' }, 2000)
  })
  document.getElementById('segmenter-paste')?.addEventListener('click', async (event) => {
    const button = event.currentTarget
    try {
      const text = await navigator.clipboard.readText()
      if (input) input.value = text
      run()
    } catch {
      button.textContent = '请手动粘贴'
      setTimeout(() => { button.textContent = '粘贴并整理' }, 2000)
    }
  })
}
