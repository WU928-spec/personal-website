import { useState, useEffect } from 'react'
import CopyButton from './CopyButton'
import { getHighlighter } from './theme'

export default function CodeBlock({
  inline,
  className,
  children,
}: {
  inline?: boolean
  className?: string
  children?: React.ReactNode
}) {
  const [html, setHtml] = useState('')
  const match = /language-(\w+)/.exec(className || '')
  const lang = match ? match[1] : 'text'
  const code = String(children).replace(/\n$/, '')

  useEffect(() => {
    if (!inline && code) {
      getHighlighter().then((h) => {
        setHtml(h.codeToHtml(code, { lang, theme: 'warm-garden' }))
      })
    }
  }, [code, lang, inline])

  if (inline) {
    return (
      <code
        className="rounded px-2 py-0.5 font-mono text-caption bg-muted text-muted"
        style={{ fontFamily: '"JetBrains Mono", monospace' }}
      >
        {children}
      </code>
    )
  }

  return (
    <div className="relative group my-6 rounded-lg overflow-hidden">
      {lang !== 'text' && (
        <div className="absolute top-0 left-0 z-10 flex items-center gap-2 px-4 py-2 rounded-br-md bg-primary/10">
          <span className="text-label font-mono font-medium uppercase tracking-wider text-muted">
            {lang}
          </span>
        </div>
      )}
      <div
        className="overflow-x-auto bg-card rounded-lg"
        style={{
          padding: '20px 24px',
          paddingTop: lang !== 'text' ? '36px' : '20px',
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <CopyButton code={code} />
    </div>
  )
}
