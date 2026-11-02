import { createContext, useContext, useState, useEffect } from 'react'
import CopyButton from './CopyButton'
import { getHighlighter } from './theme'

export async function highlightCode(code: string, lang: string): Promise<string> {
  try {
    const highlighter = await getHighlighter()
    return highlighter.codeToHtml(code, { lang, theme: 'warm-garden' })
  } catch {
    return ''
  }
}

export const CodeBlockContext = createContext(false)

export default function CodeBlock({
  inline,
  className,
  children,
}: {
  inline?: boolean
  className?: string
  children?: React.ReactNode
}) {
  const inBlock = useContext(CodeBlockContext)
  const isBlock = inline ?? inBlock
  const [html, setHtml] = useState('')
  const match = /language-(\w+)/.exec(className || '')
  const lang = match ? match[1] : 'text'
  const code = String(children).replace(/\n$/, '')

  useEffect(() => {
    let active = true
    setHtml('')

    if (isBlock && code) {
      void highlightCode(code, lang).then((nextHtml) => {
        if (active) setHtml(nextHtml)
      })
    }
    return () => { active = false }
  }, [code, lang, isBlock])

  if (!isBlock) {
    return (
      <code
        className="rounded-md px-2 py-0.5 font-mono text-caption bg-muted text-muted"
        style={{ fontFamily: '"JetBrains Mono", monospace' }}
      >
        {children}
      </code>
    )
  }

  return (
    <div className="relative group my-7 overflow-hidden rounded-md bg-Graphite shadow-soft">
      {lang !== 'text' && (
        <div className="absolute left-0 top-0 z-10 rounded-br-md bg-white/10 px-4 py-2">
          <span className="font-mono text-label font-medium uppercase tracking-wider text-white/55">
            {lang}
          </span>
        </div>
      )}
      {html ? (
        <div
          className="overflow-x-auto px-6 py-5 text-sm leading-relaxed"
          style={{ paddingTop: lang !== 'text' ? '44px' : '20px' }}
          dangerouslySetInnerHTML={{ __html: html }}
        />
      ) : (
        <pre
          className="overflow-x-auto px-6 py-5 font-mono text-sm leading-relaxed text-white/80"
          style={{ paddingTop: lang !== 'text' ? '44px' : '20px' }}
        ><code>{code}</code></pre>
      )}
      <CopyButton code={code} />
    </div>
  )
}
