import type { Components } from 'react-markdown'
import { Link } from 'react-router-dom'
import CodeBlock, { CodeBlockContext } from './CodeBlock'
import Blockquote from './Blockquote'
import makeHeading from './Heading'

const linkClass = 'text-Amber underline decoration-Amber/30 underline-offset-4 transition-colors hover:decoration-Amber'

export function buildComponents(): Components {
  return {
    h1: makeHeading(1) as Components['h1'],
    h2: makeHeading(2) as Components['h2'],
    h3: makeHeading(3) as Components['h3'],
    h4: makeHeading(4) as Components['h4'],
    p: ({ children }) => <p className="mb-5 text-[1.0625rem] leading-[1.9] text-Ink/85 dark:text-white/80">{children}</p>,
    a: ({ href = '', children }) => {
      if (href.startsWith('/notes')) {
        return <Link to={href} className={linkClass}>{children}</Link>
      }
      if (href.endsWith('.md')) {
        const slug = href.replace(/\.md$/, '')
        return <Link to={`/notes?note=${encodeURIComponent(slug)}`} className={linkClass}>{children}</Link>
      }
      return (
        <a href={href} target={href.startsWith('#') ? undefined : '_blank'} rel="noopener noreferrer" className={linkClass}>
          {children}
        </a>
      )
    },
    code: CodeBlock as Components['code'],
    pre: ({ children }) => <CodeBlockContext.Provider value={true}>{children}</CodeBlockContext.Provider>,
    blockquote: ({ children }) => <Blockquote>{children}</Blockquote>,
    ul: ({ children }) => <ul className="my-5 list-disc space-y-2 pl-6 marker:text-Amber/70">{children}</ul>,
    ol: ({ children }) => <ol className="my-5 list-decimal space-y-2 pl-6 marker:text-Amber/70">{children}</ol>,
    li: ({ children }) => <li className="pl-1 text-[1.0625rem] leading-[1.85] text-Ink/85 dark:text-white/80">{children}</li>,
    table: ({ children }) => (
      <div className="my-8 overflow-x-auto border-y border-Sand/70 dark:border-white/10">
        <table className="w-full border-collapse text-left">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-Linen/80 font-semibold dark:bg-white/[0.06]">{children}</thead>,
    tr: ({ children }) => <tr className="border-b border-Sand/60 last:border-0 dark:border-white/10">{children}</tr>,
    th: ({ children }) => <th className="px-4 py-3 text-sm text-Ink dark:text-white">{children}</th>,
    td: ({ children }) => <td className="px-4 py-3 text-sm text-Ink/80 dark:text-white/75">{children}</td>,
    hr: () => <hr className="my-12 border-0 border-t border-Sand/80 dark:border-white/10" />,
    img: ({ src, alt }) => (
      <figure className="my-9">
        <img src={src} alt={alt || ''} className="aspect-auto w-full object-cover" loading="lazy" />
        {alt && <figcaption className="mt-3 text-center text-caption text-Slate">{alt}</figcaption>}
      </figure>
    ),
  }
}
