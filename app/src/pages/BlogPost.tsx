import { useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  FileText,
  FileSpreadsheet,
  File,
} from 'lucide-react'
import {
  getPostBySlug,
  getAllSlugs,
} from '@/data/posts.ts'
import MarkdownRenderer from '@/components/MarkdownRenderer.tsx'
import PageSEO from '@/components/PageSEO'
import { useAuth } from '@/contexts/AuthContext'

/* ───────────────────────────────────────────────
   Extract images from markdown content
   ─────────────────────────────────────────────── */
function useExtractImages(content: string) {
  return useMemo(() => {
    const regex = /!\[.*?\]\((.*?)\)/g
    const result: string[] = []
    let match
    while ((match = regex.exec(content)) !== null) {
      result.push(match[1])
    }
    return result
  }, [content])
}

/* ───────────────────────────────────────────────
   WeChat-style Image Grid (full size in detail)
   ─────────────────────────────────────────────── */
function ImageGrid({ images }: { images: string[] }) {
  const count = Math.min(images.length, 9)
  if (count === 0) return null

  if (count === 1) {
    return (
      <div className="mt-2 max-w-[70%]">
        <img src={images[0]} alt="" className="w-full rounded-[4px] object-cover" loading="lazy" />
      </div>
    )
  }

  if (count === 2) {
    return (
      <div className="mt-2 grid grid-cols-2 gap-1 max-w-[70%]">
        {images.map((src, i) => (
          <img key={i} src={src} alt="" className="w-full aspect-square rounded-[4px] object-cover" loading="lazy" />
        ))}
      </div>
    )
  }

  if (count === 3) {
    return (
      <div className="mt-2 flex gap-1 max-w-[70%]">
        <img src={images[0]} alt="" className="w-[66%] aspect-square rounded-[4px] object-cover" loading="lazy" />
        <div className="flex flex-col gap-1 w-[34%]">
          <img src={images[1]} alt="" className="w-full aspect-square rounded-[4px] object-cover" loading="lazy" />
          <img src={images[2]} alt="" className="w-full aspect-square rounded-[4px] object-cover" loading="lazy" />
        </div>
      </div>
    )
  }

  if (count === 4) {
    return (
      <div className="mt-2 grid grid-cols-2 gap-1 max-w-[60%]">
        {images.slice(0, 4).map((src, i) => (
          <img key={i} src={src} alt="" className="w-full aspect-square rounded-[4px] object-cover" loading="lazy" />
        ))}
      </div>
    )
  }

  return (
    <div className="mt-2 grid grid-cols-3 gap-1 max-w-[70%]">
      {images.slice(0, 9).map((src, i) => (
        <img key={i} src={src} alt="" className="w-full aspect-square rounded-[4px] object-cover" loading="lazy" />
      ))}
    </div>
  )
}

/* ───────────────────────────────────────────────
   Attachment Item
   ─────────────────────────────────────────────── */
function AttachmentItem({ attachment }: { attachment: { name: string; type: string; data: string } }) {
  const ext = attachment.name.split('.').pop()?.toLowerCase() || ''
  const isMd = ext === 'md' || ext === 'markdown'

  const handleClick = () => {
    if (isMd) {
      const blob = new Blob([attachment.data], { type: 'text/markdown' })
      const url = URL.createObjectURL(blob)
      window.open(url, '_blank')
      setTimeout(() => URL.revokeObjectURL(url), 60000)
    } else {
      const link = document.createElement('a')
      link.href = attachment.data
      link.download = attachment.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  const Icon =
    ext === 'csv'
      ? FileSpreadsheet
      : ext === 'md' || ext === 'markdown' || ext === 'txt' || ext === 'json'
        ? FileText
        : File

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-2 w-full text-left px-3 py-2 rounded-lg border border-[#e5e5e5] dark:border-white/10 bg-[#f7f7f7] dark:bg-white/5 hover:bg-[#eee] dark:hover:bg-white/10 transition-colors"
    >
      <Icon size={16} className="text-Slate shrink-0" />
      <span className="text-[0.75rem] text-Ink dark:text-white truncate">{attachment.name}</span>
      <span className="text-[0.625rem] text-Slate/60 uppercase ml-auto shrink-0">{ext}</span>
    </button>
  )
}

/* ───────────────────────────────────────────────
   Moment Detail Page (朋友圈详情)
   ─────────────────────────────────────────────── */
export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()

  const post = useMemo(() => getPostBySlug(slug || ''), [slug])
  const images = useExtractImages(post?.content || '')
  const allSlugs = useMemo(() => getAllSlugs(), [])

  if (!post) {
    return (
      <div className="min-h-screen bg-white dark:bg-[#111] flex items-center justify-center">
        <div className="text-center">
          <p className="text-Slate dark:text-white/50">动态不存在</p>
          <button
            onClick={() => navigate('/blog')}
            className="mt-4 text-[#576b95] dark:text-[#7d90a9] text-[0.875rem]"
          >
            返回朋友圈
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white dark:bg-[#111]">
      <PageSEO
        title={post.title}
        description={post.excerpt}
        path={`/blog/${post.slug}`}
      />

      {/* ── Top Navigation ── */}
      <div className="sticky top-0 z-50 bg-white/95 dark:bg-[#111]/95 backdrop-blur border-b border-[#e5e5e5] dark:border-white/5">
        <div className="max-w-2xl mx-auto px-4 flex items-center h-12">
          <button
            onClick={() => navigate('/blog')}
            className="flex items-center text-Ink dark:text-white"
          >
            <ArrowLeft size={20} />
          </button>
          <span className="absolute left-1/2 -translate-x-1/2 text-[1rem] font-medium text-Ink dark:text-white">
            朋友圈
          </span>
        </div>
      </div>

      {/* ── Moment Content ── */}
      <div className="max-w-2xl mx-auto px-4 py-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex gap-3"
        >
          {/* Avatar */}
          <div className="shrink-0">
            <div className="w-10 h-10 rounded-[4px] bg-gradient-to-br from-Amber to-rose-400 flex items-center justify-center text-white text-sm font-bold">
              J
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0 pb-8">
            {/* Nickname */}
            <div className="font-semibold text-[0.9375rem] text-[#576b95] dark:text-[#7d90a9]">
              Jasper
            </div>

            {/* Full Text */}
            <div className="mt-1 text-[0.9375rem] leading-[1.6] text-Ink dark:text-white/90">
              <MarkdownRenderer
                content={post.content || ''}
                existingSlugs={allSlugs}
              />
            </div>

            {/* Images */}
            <ImageGrid images={images} />

            {/* Attachments */}
            {post.attachments && post.attachments.length > 0 && (
              <div className="mt-3 flex flex-col gap-2">
                {post.attachments.map((att, i) => (
                  <AttachmentItem key={i} attachment={att} />
                ))}
              </div>
            )}

            {/* Tags */}
            {post.tags.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-2 py-0.5 rounded text-[0.75rem] text-[#576b95] dark:text-[#7d90a9] bg-[#f2f2f2] dark:bg-white/5"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {/* Footer row */}
            <div className="mt-3 flex items-center justify-between">
              <div className="text-[0.75rem] text-Slate/60 dark:text-white/40">
                {post.date}
              </div>
              {isLoggedIn && (
                <button
                  onClick={() => {
                    // TODO: delete post
                  }}
                  className="text-[0.75rem] text-[#576b95] dark:text-[#7d90a9]"
                >
                  删除
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
