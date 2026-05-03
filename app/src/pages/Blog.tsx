import { useState, useEffect, useMemo, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, ArrowRight, FileSearch, Plus } from 'lucide-react'
import {
  getCategories,
  getPostsByCategory,
  searchPosts,
  type Post,
} from '@/data/posts.ts'
import { useLang } from '@/contexts/LangContext'
import { useAuth } from '@/contexts/AuthContext'

const CATEGORIES = getCategories()

/* ───────────────────────────────────────────────
   Blog Card
   ─────────────────────────────────────────────── */
function BlogCard({
  post,
  index,
  featured = false,
}: {
  post: Post
  index: number
  featured?: boolean
}) {
  const navigate = useNavigate()

  return (
    <motion.article
      layout
      initial={{ opacity: 0, y: 25 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{
        duration: 0.6,
        delay: index * 0.08,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      }}
      className={`group cursor-pointer ${
        featured ? 'md:col-span-2' : ''
      }`}
      onClick={() => navigate(`/blog/${post.slug}`)}
    >
      <div className="bg-Linen/70 border border-Sand rounded-xl overflow-hidden shadow-soft hover:shadow-medium hover:-translate-y-[3px] transition-all duration-[0.35s] ease-[cubic-bezier(0.4,0,0.2,1)]">
        {/* Thumbnail */}
        <div className="relative overflow-hidden aspect-[16/10]">
          <img
            src={`/blog-thumb-${(index % 6) + 1}.jpg`}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-[0.4s] ease-[cubic-bezier(0.25,0.1,0.25,1)] group-hover:scale-[1.04]"
            loading="lazy"
          />
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Category badge */}
          <span className="inline-block px-3 py-1 rounded-full text-[0.8125rem] font-medium tracking-[0.04em] text-Sage bg-Sage/10 mb-3">
            {post.category}
          </span>

          {/* Title */}
          <h4 className="font-display text-[1.25rem] font-semibold leading-[1.3] text-Ink line-clamp-2 group-hover:text-Amber transition-colors duration-[0.35s]">
            {post.title}
          </h4>

          {/* Excerpt */}
          <p className="mt-2 text-[0.9375rem] leading-[1.65] text-Slate line-clamp-3">
            {post.excerpt}
          </p>

          {/* Footer */}
          <div className="flex justify-between items-center mt-4 pt-4 border-t border-Sand">
            <div className="flex items-center gap-2 text-[0.8125rem] font-medium tracking-[0.04em] text-Slate">
              <span>{post.date}</span>
              <span>·</span>
              <span>{post.readingTime}</span>
            </div>
            <ArrowRight
              size={18}
              className="text-Amber opacity-0 group-hover:opacity-100 transition-opacity duration-300 -translate-x-1 group-hover:translate-x-0"
            />
          </div>
        </div>
      </div>
    </motion.article>
  )
}

/* ───────────────────────────────────────────────
   Empty State
   ─────────────────────────────────────────────── */
function EmptyState() {
  const { t } = useLang()
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="col-span-full flex flex-col items-center py-24"
    >
      <FileSearch size={48} className="text-Sand mb-4" />
      <h4 className="font-display text-[1.25rem] font-semibold leading-[1.3] text-Ink mb-2">
        {t('blog.noArticles')}
      </h4>
      <p className="text-[0.9375rem] leading-[1.65] text-Slate">
        {t('blog.noArticlesDesc')}
      </p>
    </motion.div>
  )
}

/* ───────────────────────────────────────────────
   Blog Listing Page
   ─────────────────────────────────────────────── */
export default function Blog() {
  const { t } = useLang()
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [activeCategory, setActiveCategory] = useState('All')
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest')
  const [visibleCount, setVisibleCount] = useState(6)
  const [isSticky, setIsSticky] = useState(false)
  const filterRef = useRef<HTMLDivElement>(null)

  // Filter + search
  const filteredPosts = useMemo(() => {
    let result =
      searchQuery.trim() && activeCategory === 'All'
        ? searchPosts(searchQuery)
        : getPostsByCategory(activeCategory)

    if (searchQuery.trim() && activeCategory !== 'All') {
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
          p.tags.some((t) =>
            t.toLowerCase().includes(searchQuery.toLowerCase())
          )
      )
    }

    if (sortOrder === 'newest') {
      result = [...result].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      )
    } else {
      result = [...result].sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      )
    }

    return result
  }, [searchQuery, activeCategory, sortOrder])

  const visiblePosts = filteredPosts.slice(0, visibleCount)
  const hasMore = visibleCount < filteredPosts.length

  // Reset visible count when filter changes
  useEffect(() => {
    setVisibleCount(6)
  }, [searchQuery, activeCategory, sortOrder])

  // Sticky filter bar detection
  useEffect(() => {
    const handleScroll = () => {
      if (filterRef.current) {
        const rect = filterRef.current.getBoundingClientRect()
        setIsSticky(rect.top <= 0)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const loadMore = () => {
    setVisibleCount((prev) => prev + 3)
  }

  return (
    <div className="bg-Parchment">
      {/* ── Hero ── */}
      <section className="relative h-[50vh] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center hero-bg-image"
          style={{ backgroundImage: 'url(/blog-hero.jpg)' }}
        />
        <div className="absolute inset-0 hero-overlay" />

        <div className="relative z-10 max-w-4xl mx-auto text-center px-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
            }}
            className="font-display text-[clamp(2rem,4vw,3.5rem)] font-medium text-Ink"
          >
            {t('blog.garden')}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.3,
              ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
            }}
            className="mt-4 text-[1.0625rem] leading-[1.75] text-Ink/80 max-w-xl mx-auto font-body"
          >
            {t('blog.gardenDesc')}
          </motion.p>

          {/* Search */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.8,
              delay: 0.5,
              ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
            }}
            className="mt-8 max-w-md mx-auto relative"
          >
            <Search
              size={18}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-Ink/50"
            />
            <input
              type="text"
              placeholder={t('blog.searchPlaceholder')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-Ink/10 backdrop-blur-md border border-Ink/20 rounded-full py-3 pl-11 pr-5 text-Ink placeholder:text-Ink/60 focus:outline-none focus:border-Ink/40 focus:bg-Ink/15 focus:shadow-[0_0_0_3px_rgba(196,120,58,0.25)] transition-all duration-300 font-body"
            />
          </motion.div>
        </div>
      </section>

      {/* ── Filter Bar ── */}
      <div
        ref={filterRef}
        className={`sticky top-0 z-40 transition-all duration-300 ${
          isSticky
            ? 'bg-Parchment/90 backdrop-blur-xl border-b border-Sand'
            : 'bg-Parchment'
        }`}
      >
        <div className="max-w-6xl mx-auto px-6 md:px-12 py-6 flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Category Tags */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 no-scrollbar">
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat
              return (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`relative px-[14px] py-[6px] rounded-full text-[0.8125rem] font-medium tracking-[0.04em] whitespace-nowrap cursor-pointer transition-all duration-200 ${
                    isActive
                      ? 'text-Parchment'
                      : 'text-Slate bg-Linen border border-Sand hover:border-Amber hover:text-Ink'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="activeCategory"
                      className="absolute inset-0 bg-Amber rounded-full"
                      transition={{
                        type: 'spring',
                        stiffness: 400,
                        damping: 30,
                      }}
                    />
                  )}
                  <span className="relative z-10">{cat === 'All' ? t('blog.allCategories') : cat}</span>
                </button>
              )
            })}
          </div>

          {/* Right side: sort + count + new post */}
          <div className="flex items-center gap-4 shrink-0">
            {isLoggedIn && (
              <button
                onClick={() => navigate('/blog/new')}
                className="flex items-center gap-1.5 bg-Amber text-Parchment font-ui text-[0.8125rem] font-semibold px-4 py-[6px] rounded-lg hover:bg-[#B06A2F] transition-colors"
              >
                <Plus size={14} />
                {t('blog.newPost')}
              </button>
            )}
            <span className="text-[0.8125rem] font-medium tracking-[0.04em] text-Slate">
              {filteredPosts.length} {t('blog.articles')}
            </span>

            {/* Sort dropdown */}
            <select
              value={sortOrder}
              onChange={(e) =>
                setSortOrder(e.target.value as 'newest' | 'oldest')
              }
              className="hidden md:block bg-Linen border border-Sand rounded-lg px-3 py-[6px] text-[0.8125rem] font-medium text-Slate focus:outline-none focus:border-Amber cursor-pointer"
            >
              <option value="newest">{t('blog.newestFirst')}</option>
              <option value="oldest">{t('blog.oldestFirst')}</option>
            </select>
          </div>
        </div>
      </div>

      {/* ── Blog Grid ── */}
      <section className="py-12 md:py-16 pb-24">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8"
          >
            <AnimatePresence mode="popLayout">
              {visiblePosts.length > 0 ? (
                visiblePosts.map((post, i) => (
                  <BlogCard
                    key={post.slug}
                    post={post}
                    index={i}
                    featured={i === 0 && activeCategory === 'All' && !searchQuery}
                  />
                ))
              ) : (
                <EmptyState key="empty" />
              )}
            </AnimatePresence>
          </motion.div>

          {/* Load More */}
          {hasMore && (
            <div className="flex justify-center mt-12">
              <button
                onClick={loadMore}
                className="px-7 py-3 border-[1.5px] border-Ink rounded-md font-ui text-[0.875rem] font-semibold uppercase tracking-[0.05em] text-Ink bg-transparent hover:bg-Ink hover:text-Parchment hover:-translate-y-[1px] transition-all duration-[0.35s] ease-[cubic-bezier(0.4,0,0.2,1)]"
              >
                {t('blog.loadMore')}
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
