import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import remarkMath from 'remark-math'
import remarkBreaks from 'remark-breaks'
import rehypeSlug from 'rehype-slug'
import rehypeKatex from 'rehype-katex'
import { preprocessMarkdown } from './markdown/parser'
import { buildComponents } from './markdown/render-components'

export { parseFrontmatter, extractToc, preprocessMarkdown } from './markdown/parser'
export type { ParsedFrontmatter, TocItem } from './markdown/parser'

export interface MarkdownRendererProps {
  content: string
  className?: string
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`markdown-content ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm, remarkMath, remarkBreaks]}
        rehypePlugins={[[rehypeKatex, { throwOnError: false, strict: false }], rehypeSlug]}
        components={buildComponents()}
      >
        {preprocessMarkdown(content)}
      </ReactMarkdown>
    </div>
  )
}
