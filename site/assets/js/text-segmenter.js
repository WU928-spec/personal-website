export function segmentEnglish(text) {
  return text.trim().replace(/\s+/g, ' ').replace(/([.!?])\s+/g, '$1\n\n')
}

if (typeof document !== 'undefined') {
  const input = document.getElementById('segmenter-input')
  const output = document.getElementById('segmenter-output')
  document.getElementById('segmenter-run')?.addEventListener('click', () => {
    if (output) output.value = segmentEnglish(input?.value || '')
  })
}
