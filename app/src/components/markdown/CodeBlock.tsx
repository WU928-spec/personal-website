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
        className="rounded px-[6px] py-[2px] font-mono text-[0.875em] bg-Mist text-Slate"
        style={{ fontFamily: '"JetBrains Mono", monospace' }}
      >
        {children}
      </code>
    )
  }

  return (
    <div className="relative group my-6 rounded-lg overflow-hidden">
      {lang !== 'text' && (
        <div className="absolute top-0 left-0 z-10 flex items-center gap-2 px-3 py-1.5 rounded-br-md bg-white/8 backdrop-blur-sm">
          <span className="text-[0.6875rem] font-mono font-medium uppercase tracking-[0.06em] text-white/50">
            {lang}
          </span>
        </div>
      )}
      <div
        className="overflow-x-auto"
        style={{
          background: '#1E1C1A',
          borderRadius: '8px',
          padding: '20px 24px',
          paddingTop: lang !== 'text' ? '36px' : '20px',
        }}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <CopyButton code={code} />
    </div>
  )
}
