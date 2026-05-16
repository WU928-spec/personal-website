import { createJavaScriptRegexEngine } from '@shikijs/engine-javascript'
import bash from '@shikijs/langs/bash'
import c from '@shikijs/langs/c'
import cpp from '@shikijs/langs/cpp'
import css from '@shikijs/langs/css'
import go from '@shikijs/langs/go'
import html from '@shikijs/langs/html'
import java from '@shikijs/langs/java'
import javascript from '@shikijs/langs/javascript'
import json from '@shikijs/langs/json'
import jsx from '@shikijs/langs/jsx'
import kotlin from '@shikijs/langs/kotlin'
import markdown from '@shikijs/langs/markdown'
import perl from '@shikijs/langs/perl'
import php from '@shikijs/langs/php'
import python from '@shikijs/langs/python'
import ruby from '@shikijs/langs/ruby'
import rust from '@shikijs/langs/rust'
import shell from '@shikijs/langs/shell'
import sql from '@shikijs/langs/sql'
import swift from '@shikijs/langs/swift'
import tsx from '@shikijs/langs/tsx'
import typescript from '@shikijs/langs/typescript'
import yaml from '@shikijs/langs/yaml'
import { createHighlighterCore } from 'shiki/core'
import type { ThemeInput } from '@shikijs/types'

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
let highlighterPromise: ReturnType<typeof createHighlighterCore> | null = null

export function getHighlighter() {
  if (!highlighterPromise) {
    highlighterPromise = createHighlighterCore({
      themes: [warmGardenTheme],
      engine: createJavaScriptRegexEngine(),
      langs: [
        typescript,
        javascript,
        python,
        yaml,
        json,
        bash,
        shell,
        html,
        css,
        markdown,
        tsx,
        jsx,
        rust,
        go,
        sql,
        java,
        c,
        cpp,
        ruby,
        php,
        perl,
        swift,
        kotlin,
      ],
    })
  }
  return highlighterPromise
}
