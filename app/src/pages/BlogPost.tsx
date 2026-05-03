import { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Github,
  Twitter,
  Linkedin,
  Copy,
  Check,
  Pencil,
  Save,
  X,
} from 'lucide-react'
import {
  getPostBySlug,
  getAdjacentPosts,
  getRelatedPosts,
  getAllSlugs,
  savePost,
  type Post,
} from '@/data/posts.ts'
import MarkdownRenderer, { extractToc } from '@/components/MarkdownRenderer.tsx'
import TableOfContents from '@/components/TableOfContents.tsx'
import { useAuth } from '@/contexts/AuthContext'
import { useLang } from '@/contexts/LangContext'

/* ───────────────────────────────────────────────
   Scroll Progress Bar
   ─────────────────────────────────────────────── */
function ScrollProgressBar() {
  const [progress, setProgress] = useState(0)

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY
      const docHeight =
        document.documentElement.scrollHeight - window.innerHeight
      const pct = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0
      setProgress(Math.min(100, Math.max(0, pct)))
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className="fixed top-0 left-0 right-0 z-50 h-[3px] bg-transparent">
      <div
        className="h-full bg-Amber transition-[width] duration-150 ease-linear"
        style={{ width: `${progress}%` }}
      />
    </div>
  )
}

/* ───────────────────────────────────────────────
   Copy Link Button
   ─────────────────────────────────────────────── */
function CopyLinkButton() {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(window.location.href).then(() => {
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <button
      onClick={handleCopy}
      className="p-2 rounded-lg bg-Linen hover:bg-Mist transition-colors duration-200"
      aria-label="Copy link"
      title="Copy link"
    >
      {copied ? <Check size={16} className="text-Sage" /> : <Copy size={16} className="text-Slate" />}
    </button>
  )
}

/* ───────────────────────────────────────────────
   Author Card
   ─────────────────────────────────────────────── */
function AuthorCard() {
  const { t } = useLang()
  return (
    <div className="mt-8 bg-Linen rounded-xl p-6 shadow-soft">
      <div className="flex items-center gap-4">
        <img
          src="/avatar.jpg"
          alt="Author"
          className="w-16 h-16 rounded-full object-cover"
        />
        <div>
          <h5 className="font-ui text-[1rem] font-semibold leading-[1.4] text-Ink">
            {t('post.authorName')}
          </h5>
          <p className="text-[0.9375rem] leading-[1.65] text-Slate mt-1">
            {t('post.authorDesc')}
          </p>
          <div className="flex items-center gap-3 mt-3">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-Slate hover:text-Amber transition-colors"
              aria-label="GitHub"
            >
              <Github size={16} />
            </a>
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-Slate hover:text-Amber transition-colors"
              aria-label="Twitter"
            >
              <Twitter size={16} />
            </a>
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-Slate hover:text-Amber transition-colors"
              aria-label="LinkedIn"
            >
              <Linkedin size={16} />
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ───────────────────────────────────────────────
   Related Post Card (simpler than BlogCard)
   ─────────────────────────────────────────────── */
function RelatedCard({ post, index }: { post: Post; index: number }) {
  const navigate = useNavigate()

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{
        duration: 0.6,
        delay: index * 0.1,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      }}
      className="group cursor-pointer"
      onClick={() => navigate(`/blog/${post.slug}`)}
    >
      <div className="bg-[rgba(237,232,224,0.7)] border border-Sand rounded-xl overflow-hidden shadow-soft hover:shadow-medium hover:-translate-y-[3px] transition-all duration-[0.35s]">
        <div className="relative overflow-hidden aspect-[16/10]">
          <img
            src={`/blog-thumb-${(index % 6) + 1}.jpg`}
            alt={post.title}
            className="w-full h-full object-cover transition-transform duration-[0.4s] group-hover:scale-[1.04]"
            loading="lazy"
          />
        </div>
        <div className="p-5">
          <span className="inline-block px-3 py-1 rounded-full text-[0.8125rem] font-medium tracking-[0.04em] text-Sage bg-Sage/10 mb-2">
            {post.category}
          </span>
          <h4 className="font-display text-[1.125rem] font-semibold leading-[1.3] text-Ink line-clamp-2 group-hover:text-Amber transition-colors duration-[0.35s]">
            {post.title}
          </h4>
          <p className="mt-2 text-[0.9375rem] leading-[1.65] text-Slate line-clamp-2">
            {post.excerpt}
          </p>
        </div>
      </div>
    </motion.article>
  )
}

/* ───────────────────────────────────────────────
   Prev / Next Navigation
   ─────────────────────────────────────────────── */
function PrevNextNav({ prev, next }: { prev: Post | null; next: Post | null }) {
  const navigate = useNavigate()
  const { t } = useLang()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {prev ? (
        <button
          onClick={() => navigate(`/blog/${prev.slug}`)}
          className="text-left group p-4 rounded-lg hover:bg-Linen transition-colors duration-200"
        >
          <span className="block text-[0.8125rem] font-medium tracking-[0.04em] text-Slate uppercase mb-1">
            ← {t('post.previous')}
          </span>
          <span className="font-display text-[1rem] font-medium leading-[1.3] text-Ink group-hover:text-Amber transition-colors duration-200 line-clamp-2">
            {prev.title}
          </span>
        </button>
      ) : (
        <div />
      )}
      {next ? (
        <button
          onClick={() => navigate(`/blog/${next.slug}`)}
          className="text-right group p-4 rounded-lg hover:bg-Linen transition-colors duration-200"
        >
          <span className="block text-[0.8125rem] font-medium tracking-[0.04em] text-Slate uppercase mb-1">
            {t('post.next')} →
          </span>
          <span className="font-display text-[1rem] font-medium leading-[1.3] text-Ink group-hover:text-Amber transition-colors duration-200 line-clamp-2">
            {next.title}
          </span>
        </button>
      ) : (
        <div />
      )}
    </div>
  )
}

/* ───────────────────────────────────────────────
   Blog Post Page
   ─────────────────────────────────────────────── */
export default function BlogPost() {
  const { slug } = useParams<{ slug: string }>()
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()
  const { t } = useLang()

  const [post, setPost] = useState<Post | undefined>(undefined)
  const [isEditing, setIsEditing] = useState(false)
  const [editContent, setEditContent] = useState('')
  const [editTitle, setEditTitle] = useState('')
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const p = getPostBySlug(slug || '')
    setPost(p)
    if (p) {
      setEditContent(p.content)
      setEditTitle(p.title)
    }
  }, [slug])

  const tocItems = useMemo(() => {
    if (!post || isEditing) return []
    return extractToc(post.content)
  }, [post, isEditing])

  const adjacent = useMemo(() => {
    if (!post) return { prev: null, next: null }
    return getAdjacentPosts(post.slug)
  }, [post])

  const related = useMemo(() => {
    if (!post) return []
    return getRelatedPosts(post.slug, 3)
  }, [post])

  const allSlugs = useMemo(() => getAllSlugs(), [])

  useEffect(() => {
    if (post === undefined) return
    if (!post) {
      navigate('/blog', { replace: true })
    }
  }, [post, navigate])

  const handleSave = () => {
    if (!post) return
    savePost(post.slug, { title: editTitle, content: editContent })
    setPost({ ...post, title: editTitle, content: editContent })
    setIsEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const handleCancel = () => {
    if (!post) return
    setEditContent(post.content)
    setEditTitle(post.title)
    setIsEditing(false)
  }

  if (!post) {
    return (
      <div className="min-h-[60dvh] bg-Parchment flex items-center justify-center">
        <div className="text-center">
          <p className="text-Slate font-body text-lg">文章加载失败</p>
          <p className="text-Slate/60 text-sm mt-2">请尝试清除浏览器缓存后刷新页面</p>
          <button
            onClick={() => navigate('/blog')}
            className="mt-4 inline-flex items-center bg-Amber text-Parchment font-ui text-[0.875rem] font-semibold uppercase tracking-[0.05em] px-7 py-3 rounded-md hover:bg-[#B06A2F] transition-all duration-300"
          >
            返回博客列表
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-Parchment">
      <ScrollProgressBar />

      {/* ── Post Hero ── */}
      <section
        className="relative min-h-[40vh] max-h-[60vh] flex items-end overflow-hidden"
        style={{
          backgroundImage: 'url(/blog-hero.jpg)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div
          className="absolute inset-0"
          style={{
            background:
              'linear-gradient(to bottom, rgba(45,42,38,0.5) 0%, rgba(45,42,38,0.1) 50%, rgba(247,244,239,1) 100%)',
          }}
        />

        <div className="relative z-10 max-w-4xl mx-auto px-6 pb-12 w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
            }}
            className="flex items-center gap-3 flex-wrap"
          >
            <span
              className="px-3 py-1 rounded-full text-[0.8125rem] font-medium tracking-[0.04em] text-Amber border border-Amber/30"
              style={{ background: 'rgba(196,120,58,0.2)' }}
            >
              {post.category}
            </span>
            <span className="text-[0.8125rem] font-medium tracking-[0.04em] text-Parchment/70">
              {post.date}
            </span>
            <span className="text-Parchment/70">·</span>
            <span className="text-[0.8125rem] font-medium tracking-[0.04em] text-Parchment/70">
              {post.readingTime}
            </span>
            {isLoggedIn && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="ml-auto flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-Parchment/15 backdrop-blur-md border border-Parchment/20 text-Parchment text-[0.8125rem] font-medium hover:bg-Parchment/25 transition-colors"
              >
                <Pencil size={14} />
                {t('post.edit')}
              </button>
            )}
            {isLoggedIn && isEditing && (
              <div className="ml-auto flex items-center gap-2">
                {saved && (
                  <span className="text-[0.8125rem] text-Sage">已保存</span>
                )}
                <button
                  onClick={handleSave}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-Sage text-Parchment text-[0.8125rem] font-medium hover:bg-[#5a7a5a] transition-colors"
                >
                  <Save size={14} />
                  {t('post.save')}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-Parchment/15 backdrop-blur-md border border-Parchment/20 text-Parchment text-[0.8125rem] font-medium hover:bg-Parchment/25 transition-colors"
                >
                  <X size={14} />
                  {t('post.cancel')}
                </button>
              </div>
            )}
          </motion.div>

          {isEditing ? (
            <input
              type="text"
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              className="mt-3 w-full bg-transparent border-b border-Parchment/30 text-Parchment font-display text-[clamp(2rem,4vw,3.5rem)] font-medium placeholder:text-Parchment/40 focus:outline-none focus:border-Parchment/60 pb-2"
            />
          ) : (
            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.7,
                delay: 0.1,
                ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
              }}
              className="font-display text-[clamp(2rem,4vw,3.5rem)] font-medium text-Parchment mt-3 max-w-3xl"
            >
              {post.title}
            </motion.h1>
          )}

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              duration: 0.7,
              delay: 0.2,
              ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
            }}
            className="mt-3 text-[1.0625rem] leading-[1.75] text-Parchment/80 max-w-2xl font-body"
          >
            {post.excerpt}
          </motion.p>
        </div>
      </section>

      {/* ── Article Content ── */}
      <section className="py-16 md:py-24">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* TOC Sidebar */}
            <TableOfContents items={tocItems} />

            {/* Article Body */}
            <div className="lg:col-span-9">
              <div className="max-w-3xl">
                {isEditing ? (
                  <textarea
                    value={editContent}
                    onChange={(e) => setEditContent(e.target.value)}
                    className="w-full min-h-[600px] bg-Linen border border-Sand rounded-xl p-6 text-Ink font-body text-[1rem] leading-[1.75] focus:outline-none focus:border-Amber focus:ring-1 focus:ring-Amber/20 resize-y"
                  />
                ) : (
                  <MarkdownRenderer
                    content={post.content || ''}
                    existingSlugs={allSlugs}
                  />
                )}

                {/* ── Article Footer ── */}
                <div className="mt-12 pt-8 border-t border-Sand">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-2 items-center">
                    <span className="text-[0.8125rem] font-medium tracking-[0.04em] text-Slate mr-1">
                      {t('post.tagged')}
                    </span>
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-[6px] rounded-full text-[0.8125rem] font-medium tracking-[0.04em] text-Slate bg-Linen border border-Sand"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Share Row */}
                  <div className="mt-6 flex items-center gap-3">
                    <span className="text-[0.8125rem] font-medium tracking-[0.04em] text-Slate">
                      {t('post.share')}
                    </span>
                    <a
                      href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(window.location.href)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-Linen hover:bg-Mist transition-colors duration-200"
                      aria-label="Share on Twitter"
                    >
                      <Twitter size={16} className="text-Slate" />
                    </a>
                    <a
                      href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg bg-Linen hover:bg-Mist transition-colors duration-200"
                      aria-label="Share on LinkedIn"
                    >
                      <Linkedin size={16} className="text-Slate" />
                    </a>
                    <CopyLinkButton />
                  </div>

                  {/* Author Card */}
                  <AuthorCard />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Related Posts ── */}
      {related.length > 0 && (
        <section className="py-16 md:py-24 bg-Linen">
          <div className="max-w-6xl mx-auto px-6 md:px-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{
                duration: 0.7,
                ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
              }}
            >
              <h3 className="font-display text-[clamp(1.5rem,2.5vw,2.25rem)] font-medium text-Ink">
                {t('post.continueReading')}
              </h3>
              <p className="mt-2 text-[0.9375rem] leading-[1.65] text-Slate">
                {t('post.moreFromGarden')}
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 mt-8">
              {related.map((rp, i) => (
                <RelatedCard key={rp.slug} post={rp} index={i} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Prev / Next Navigation ── */}
      <section className="py-8 border-t border-Sand">
        <div className="max-w-6xl mx-auto px-6 md:px-12">
          <PrevNextNav prev={adjacent.prev} next={adjacent.next} />
        </div>
      </section>

      {/* ── Back to Blog ── */}
      <section className="pb-12">
        <div className="max-w-6xl mx-auto px-6 md:px-12 flex justify-center">
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-7 py-3 border-[1.5px] border-Ink rounded-md font-ui text-[0.875rem] font-semibold uppercase tracking-[0.05em] text-Ink bg-transparent hover:bg-Ink hover:text-Parchment hover:-translate-y-[1px] transition-all duration-[0.35s]"
          >
            <ArrowLeft size={16} />
            {t('post.backToArticles')}
          </Link>
        </div>
      </section>
    </div>
  )
}
