import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'
import PageSEO from '@/components/PageSEO'
import { getPostsByCategory, type Post } from '@/data/posts.ts'
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
   WeChat-style Image Grid
   ─────────────────────────────────────────────── */
function ImageGrid({ images }: { images: string[] }) {
  const count = Math.min(images.length, 9)

  if (count === 0) return null

  if (count === 1) {
    return (
      <div className="mt-2 max-w-[70%]">
        <img
          src={images[0]}
          alt=""
          className="w-full rounded-[4px] object-cover"
          loading="lazy"
        />
      </div>
    )
  }

  if (count === 2) {
    return (
      <div className="mt-2 grid grid-cols-2 gap-1 max-w-[70%]">
        {images.map((src, i) => (
          <img
            key={i}
            src={src}
            alt=""
            className="w-full aspect-square rounded-[4px] object-cover"
            loading="lazy"
          />
        ))}
      </div>
    )
  }

  if (count === 3) {
    return (
      <div className="mt-2 flex gap-1 max-w-[70%]">
        <img
          src={images[0]}
          alt=""
          className="w-[66%] aspect-square rounded-[4px] object-cover"
          loading="lazy"
        />
        <div className="flex flex-col gap-1 w-[34%]">
          <img
            src={images[1]}
            alt=""
            className="w-full aspect-square rounded-[4px] object-cover"
            loading="lazy"
          />
          <img
            src={images[2]}
            alt=""
            className="w-full aspect-square rounded-[4px] object-cover"
            loading="lazy"
          />
        </div>
      </div>
    )
  }

  if (count === 4) {
    return (
      <div className="mt-2 grid grid-cols-2 gap-1 max-w-[60%]">
        {images.slice(0, 4).map((src, i) => (
          <img
            key={i}
            src={src}
            alt=""
            className="w-full aspect-square rounded-[4px] object-cover"
            loading="lazy"
          />
        ))}
      </div>
    )
  }

  // 5-9 images: 3x3 grid
  return (
    <div className="mt-2 grid grid-cols-3 gap-1 max-w-[70%]">
      {images.slice(0, 9).map((src, i) => (
        <img
          key={i}
          src={src}
          alt=""
          className="w-full aspect-square rounded-[4px] object-cover"
          loading="lazy"
        />
      ))}
    </div>
  )
}

/* ───────────────────────────────────────────────
   Moment Card (朋友圈动态)
   ─────────────────────────────────────────────── */
function MomentCard({ post, index }: { post: Post; index: number }) {
  const navigate = useNavigate()
  const images = useExtractImages(post.content)

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.05,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      }}
      className="flex gap-3 px-4 py-4 bg-white dark:bg-[#111]"
      onClick={() => navigate(`/blog/${post.slug}`)}
    >
      {/* Avatar */}
      <div className="shrink-0">
        <div className="w-10 h-10 rounded-[4px] bg-gradient-to-br from-Amber to-rose-400 flex items-center justify-center text-white text-sm font-bold">
          J
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 cursor-pointer">
        {/* Nickname */}
        <div className="font-semibold text-[0.9375rem] text-[#576b95] dark:text-[#7d90a9]">
          Jasper
        </div>

        {/* Text */}
        <p className="mt-1 text-[0.9375rem] leading-[1.6] text-Ink dark:text-white/90 whitespace-pre-wrap">
          {post.excerpt}
        </p>

        {/* Images */}
        <ImageGrid images={images} />

        {/* Attachments hint */}
        {post.attachments && post.attachments.length > 0 && (
          <div className="mt-2 text-[0.75rem] text-[#576b95] dark:text-[#7d90a9] flex items-center gap-1">
            <span>📎</span>
            <span>{post.attachments.length}个附件</span>
          </div>
        )}

        {/* Footer row */}
        <div className="mt-2 flex items-center justify-between">
          <div className="text-[0.75rem] text-Slate/60 dark:text-white/40">
            {post.date}
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              // TODO: show action sheet (delete / copy link)
            }}
            className="text-[0.75rem] text-Slate/40 dark:text-white/30 hover:text-Slate dark:hover:text-white/60 px-2 py-1"
          >
            ⋯
          </button>
        </div>
      </div>
    </motion.article>
  )
}

/* ───────────────────────────────────────────────
   Empty State
   ─────────────────────────────────────────────── */
function EmptyState() {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center py-20 text-center px-6"
    >
      <div className="w-16 h-16 rounded-full bg-Linen dark:bg-white/5 flex items-center justify-center mb-4">
        <span className="text-2xl">📷</span>
      </div>
      <p className="text-[0.9375rem] text-Slate dark:text-white/50">
        还没有动态
      </p>
      <p className="text-[0.8125rem] text-Slate/60 dark:text-white/30 mt-1">
        点击右下角按钮发布第一条
      </p>
    </motion.div>
  )
}

/* ───────────────────────────────────────────────
   Moments Feed Page (朋友圈)
   ─────────────────────────────────────────────── */
export default function Blog() {
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()
  const [visibleCount, setVisibleCount] = useState(8)

  const allMoments = useMemo(() => {
    return [...getPostsByCategory('All')].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    )
  }, [])

  const visibleMoments = allMoments.slice(0, visibleCount)
  const hasMore = visibleCount < allMoments.length

  return (
    <div className="min-h-screen bg-[#ededed] dark:bg-[#111]">
      <PageSEO
        title="朋友圈"
        description="记录生活中的每一个瞬间"
        path="/blog"
      />

      {/* ── Cover + Profile Header ── */}
      <div className="relative">
        {/* Cover Image */}
        <div className="h-[280px] w-full bg-gradient-to-b from-[#2c3e50] to-[#4a6741] dark:from-[#1a1a2e] dark:to-[#16213e]" />

        {/* Profile Info (overlapping cover bottom) */}
        <div className="max-w-2xl mx-auto px-4 relative">
          <div className="flex items-end justify-end gap-3 -mt-10 pb-4">
            <div className="text-right pb-2">
              <h1 className="text-white text-[1.125rem] font-medium drop-shadow-md">
                Jasper
              </h1>
            </div>
            <div className="w-20 h-20 rounded-[4px] bg-gradient-to-br from-Amber to-rose-400 flex items-center justify-center text-white text-2xl font-bold border-4 border-white dark:border-[#111] shadow-lg shrink-0">
              J
            </div>
          </div>
        </div>
      </div>

      {/* ── Moments Feed ── */}
      <div className="max-w-2xl mx-auto mt-2">
        <AnimatePresence mode="popLayout">
          {visibleMoments.length > 0 ? (
            <div className="flex flex-col">
              {visibleMoments.map((post, i) => (
                <div key={post.slug}>
                  <MomentCard post={post} index={i} />
                  {i < visibleMoments.length - 1 && (
                    <div className="h-[1px] bg-[#e5e5e5] dark:bg-white/5 mx-4" />
                  )}
                </div>
              ))}
            </div>
          ) : (
            <EmptyState key="empty" />
          )}
        </AnimatePresence>

        {/* Load More */}
        {hasMore && (
          <div className="flex justify-center py-6">
            <button
              onClick={() => setVisibleCount((prev) => prev + 8)}
              className="text-[0.8125rem] text-Slate/60 dark:text-white/40 hover:text-Slate dark:hover:text-white/60 transition-colors"
            >
              加载更多
            </button>
          </div>
        )}
      </div>

      {/* ── FAB (发碎片) ── */}
      {isLoggedIn && (
        <button
          onClick={() => navigate('/blog/new')}
          className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-[#07c160] text-white shadow-lg flex items-center justify-center hover:bg-[#06ad56] active:scale-95 transition-all z-50"
        >
          <Plus size={24} strokeWidth={2.5} />
        </button>
      )}
    </div>
  )
}
