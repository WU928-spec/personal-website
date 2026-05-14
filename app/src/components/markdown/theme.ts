import { createHighlighter, type ThemeInput } from 'shiki'

/* ───────────────────────────────────────────────
   Shiki warm theme (amber / sage / gold / rose)
   ─────────────────────────────────────────────── */
export const warmGardenTheme: ThemeInput = {
  name: 'warm-garden',
  type: 'dark',
  colors: {
    'editor.background': '#1E1C1A',
    'editor.foreground': '#F7F4EF',
    'editor.lineHighlight.background': '#2D2A26',
    'editor.selection.background': '#C4783A40',
  },
  tokenColors: [
    {
      scope: ['comment', 'punctuation.definition.comment'],
      settings: { foreground: '#D4C5B5', fontStyle: 'italic' },
    },
    {
      scope: ['keyword', 'storage.type', 'storage.modifier'],
      settings: { foreground: '#C4783A' },
    },
    {
      scope: [
        'string',
        'string.quoted',
        'string.template',
        'punctuation.definition.string',
      ],
      settings: { foreground: '#6B8E6B' },
    },
    {
      scope: ['entity.name.function', 'support.function', 'meta.function-call'],
      settings: { foreground: '#C9A84C' },
    },
    {
      scope: ['variable', 'identifier', 'meta.definition.variable.name'],
      settings: { foreground: '#F7F4EF' },
    },
    {
      scope: ['constant.numeric', 'constant'],
      settings: { foreground: '#B8695A' },
    },
    {
      scope: ['entity.name.type', 'support.type', 'entity.name.class'],
      settings: { foreground: '#C9A84C' },
    },
    {
      scope: ['operator', 'punctuation', 'meta.brace'],
      settings: { foreground: '#D4C5B5' },
    },
    {
      scope: ['entity.name.tag', 'support.class.component'],
      settings: { foreground: '#C4783A' },
    },
    {
      scope: ['attribute.name', 'entity.other.attribute-name'],
      settings: { foreground: '#C9A84C' },
    },
    {
      scope: ['invalid', 'error'],
      settings: { foreground: '#B8695A' },
    },
  ],
}

/* ───────────────────────────────────────────────
   Singleton highlighter
   ─────────────────────────────────────────────── */
let highlighterPromise: ReturnType<typeof createHighlighter> | null = null

export function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighter({
      themes: [warmGardenTheme],
      langs: [
        'typescript', 'javascript', 'python', 'yaml', 'json',
        'bash', 'shell', 'html', 'css', 'markdown', 'tsx', 'jsx',
        'rust', 'go', 'sql', 'java', 'c', 'cpp', 'ruby', 'php',
        'perl', 'swift', 'kotlin',
      ],
    })
  }
  return highlighterPromise
}
