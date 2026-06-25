import type { Components } from 'react-markdown'
import { Link } from 'react-router-dom'
import CodeBlock from './CodeBlock'
import Blockquote from './Blockquote'
import makeHeading from './Heading'

export function buildComponents(
  existingSlugs: string[],
  onWikilinkClick?: (slug: string) => void
): Components {
  const handleAnchorClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault()
    const id = href.slice(1)
    const element = document.getElementById(id)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' })
      window.history.pushState(null, '', href)
    }
  }

  const makeWikilinkSpan = (slug: string, children: React.ReactNode) => (
    <span
      onClick={(e) => {
        e.preventDefault()
        onWikilinkClick?.(slug)
      }}
      className="obsidian-wikilink"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          onWikilinkClick?.(slug)
        }
      }}
    >
      {children}
    </span>
  )

  return {
    h1: makeHeading(1) as unknown as Components['h1'],
    h2: makeHeading(2) as unknown as Components['h2'],
    h3: makeHeading(3) as unknown as Components['h3'],
    h4: makeHeading(4) as unknown as Components['h4'],

    p: ({ children }) => (
      <p className="text-[1.0625rem] leading-[1.75] text-Ink mb-[1.25em]">{children}</p>
    ),

    a: ({ href, children }) => {
      if (href?.startsWith('#')) {
        return (
          <a
            href={href}
            onClick={(e) => handleAnchorClick(e, href)}
            className="text-Amber border-b border-Amber/30 hover:border-Amber hover:bg-Amber/5 transition-colors duration-200 cursor-pointer"
          >
            {children}
          </a>
        )
      }

      if (href?.startsWith('obsidian-internal://')) {
        const slug = href.replace('obsidian-internal://', '')
        return makeWikilinkSpan(slug, children)
      }

      if (href?.endsWith('.md')) {
        const slug = href.replace('.md', '')
        if (onWikilinkClick) {
          return makeWikilinkSpan(slug, children)
        }
        return (
          <Link
            to={`/obsidian?note=${slug}`}
            className="text-Amber border-b border-Amber/30 hover:border-Amber hover:bg-Amber/5 transition-colors duration-200"
          >
            {children}
          </Link>
        )
      }

      if (href && !href.includes('://') && !href.startsWith('/') && !href.startsWith('#')) {
        const decodedHref = decodeURIComponent(href)
        if (onWikilinkClick && existingSlugs.includes(decodedHref)) {
          return makeWikilinkSpan(decodedHref, children)
        }
      }

      if (href?.startsWith('/blog/') || href?.startsWith('/obsidian')) {
        return (
          <Link
            to={href}
            className="text-Amber border-b border-Amber/30 hover:border-Amber hover:bg-Amber/5 transition-colors duration-200"
          >
            {children}
          </Link>
        )
      }

      return (
        <a
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          className="text-Amber border-b border-Amber/30 hover:border-Amber hover:bg-Amber/5 transition-colors duration-200"
        >
          {children}
        </a>
      )
    },

    code: CodeBlock as unknown as Components['code'],
    pre: ({ children }) => <>{children}</>,
    blockquote: ({ children }) => <Blockquote>{children}</Blockquote>,

    ul: ({ children }) => (
      <ul className="list-disc pl-6 my-4 marker:text-Amber">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal pl-6 my-4 marker:text-Ink">{children}</ol>
    ),
    li: ({ children }) => (
      <li className="mb-2 text-[1.0625rem] leading-[1.75] text-Ink">{children}</li>
    ),

    table: ({ children }) => (
      <div className="overflow-x-auto my-6">
        <table className="w-full border-collapse border border-Sand">{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-Linen font-semibold">{children}</thead>,
    tbody: ({ children }) => <tbody>{children}</tbody>,
    tr: ({ children }) => <tr className="even:bg-Mist/30">{children}</tr>,
    th: ({ children }) => (
      <th className="border border-Sand px-[14px] py-[10px] text-left text-Ink text-[0.9375rem]">
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border border-Sand px-[14px] py-[10px] text-Ink text-[0.9375rem]">
        {children}
      </td>
    ),

    hr: () => (
      <div className="relative my-8 flex items-center justify-center">
        <hr className="w-full border-t border-Sand" />
        <div className="absolute bg-Parchment px-2">
          <div className="w-2 h-2 rotate-45 bg-Amber" />
        </div>
      </div>
    ),

    img: ({ src, alt }) => {
      if (src?.startsWith('data:')) {
        return (
          <img
            src={src}
            alt={alt || ''}
            className="rounded-lg shadow-soft w-full"
            loading="lazy"
          />
        )
      }
      const ext = src?.split('.').pop()?.toLowerCase() || ''
      const audioExts = ['mp3', 'wav', 'm4a', 'ogg', 'webm', 'aac', 'flac']
      const videoExts = ['mp4', 'mov', 'webm', 'mkv']

      if (audioExts.includes(ext)) {
        return (
          <figure className="my-6">
            <audio controls className="w-full rounded-lg" preload="metadata">
              <source src={src} type={`audio/${ext === 'm4a' ? 'mp4' : ext}`} />
            </audio>
            {alt && (
              <figcaption className="text-center mt-2 font-ui text-[0.8125rem] font-medium tracking-[0.04em] text-Slate">
                {alt}
              </figcaption>
            )}
          </figure>
        )
      }

      if (videoExts.includes(ext)) {
        return (
          <figure className="my-6">
            <video controls className="w-full rounded-lg shadow-soft" preload="metadata">
              <source src={src} />
            </video>
            {alt && (
              <figcaption className="text-center mt-2 font-ui text-[0.8125rem] font-medium tracking-[0.04em] text-Slate">
                {alt}
              </figcaption>
            )}
          </figure>
        )
      }

      return (
        <figure className="my-6">
          <img src={src} alt={alt || ''} className="rounded-lg shadow-soft w-full" loading="lazy" />
          {alt && (
            <figcaption className="text-center mt-2 font-ui text-[0.8125rem] font-medium tracking-[0.04em] text-Slate">
              {alt}
            </figcaption>
          )}
        </figure>
      )
    },
  }
}
