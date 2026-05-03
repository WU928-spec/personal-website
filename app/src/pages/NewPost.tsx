import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, FileUp, Eye, Edit3, Save, Plus } from 'lucide-react'
import { addPost } from '@/data/posts'
import { useAuth } from '@/contexts/AuthContext'
import { useLang } from '@/contexts/LangContext'
import MarkdownRenderer from '@/components/MarkdownRenderer'

function estimateReadingTime(content: string): string {
  const words = content.trim().split(/\s+/).length
  const minutes = Math.max(1, Math.ceil(words / 200))
  return `${minutes} min read`
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .substring(0, 60)
}

export default function NewPost() {
  const { t } = useLang()
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [preview, setPreview] = useState(false)

  const [title, setTitle] = useState('')
  const [slug, setSlug] = useState('')
  const [category, setCategory] = useState(t('newPost.defaultCategory'))
  const [tags, setTags] = useState('')
  const [excerpt, setExcerpt] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [saved, setSaved] = useState(false)

  if (!isLoggedIn) {
    return (
      <div className="min-h-[60dvh] bg-Parchment flex items-center justify-center">
        <div className="text-center">
          <p className="text-Slate font-body text-lg">{t('profile.pleaseLogin')}</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 inline-flex items-center bg-Amber text-Parchment font-ui text-[0.875rem] font-semibold uppercase tracking-[0.05em] px-7 py-3 rounded-md hover:bg-[#B06A2F] transition-all duration-300"
          >
            {t('profile.goLogin')}
          </button>
        </div>
      </div>
    )
  }

  const handleTitleChange = (value: string) => {
    setTitle(value)
    if (!slug || slug === slugify(title)) {
      setSlug(slugify(value))
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const reader = new FileReader()
    reader.onload = (event) => {
      const text = event.target?.result as string
      parseMarkdownFile(text)
    }
    reader.readAsText(file)
  }

  const parseMarkdownFile = (text: string) => {
    // Try to parse YAML frontmatter
    const frontmatterMatch = text.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
    if (frontmatterMatch) {
      const fm = frontmatterMatch[1]
      const body = frontmatterMatch[2].trim()

      const titleMatch = fm.match(/^title:\s*(.+)$/m)
      const slugMatch = fm.match(/^slug:\s*(.+)$/m)
      const categoryMatch = fm.match(/^category:\s*(.+)$/m)
      const tagsMatch = fm.match(/^tags:\s*\[(.*?)\]$/m)
      const excerptMatch = fm.match(/^excerpt:\s*(.+)$/m)

      if (titleMatch) setTitle(titleMatch[1].trim().replace(/^["']|["']$/g, ''))
      if (slugMatch) setSlug(slugMatch[1].trim())
      if (categoryMatch) setCategory(categoryMatch[1].trim())
      if (tagsMatch) {
        const tagList = tagsMatch[1].split(',').map((t) => t.trim().replace(/^["']|["']$/g, ''))
        setTags(tagList.join(', '))
      }
      if (excerptMatch) setExcerpt(excerptMatch[1].trim().replace(/^["']|["']$/g, ''))
      setContent(body)
    } else {
      // No frontmatter, treat entire file as content
      setContent(text)
      // Try to extract title from first h1
      const h1Match = text.match(/^#\s+(.+)$/m)
      if (h1Match && !title) {
        setTitle(h1Match[1].trim())
        setSlug(slugify(h1Match[1].trim()))
      }
    }
  }

  const handleSave = () => {
    setError('')
    if (!title.trim()) {
      setError(t('newPost.errorTitle'))
      return
    }
    if (!slug.trim()) {
      setError(t('newPost.errorSlug'))
      return
    }
    if (!content.trim()) {
      setError(t('newPost.errorContent'))
      return
    }

    const finalSlug = slug.trim() || slugify(title)
    const now = new Date().toISOString().split('T')[0]
    const tagList = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    const newPost = {
      slug: finalSlug,
      title: title.trim(),
      date: now,
      category: category.trim() || t('newPost.uncategorized'),
      tags: tagList.length > 0 ? tagList : [t('newPost.defaultTag')],
      excerpt: excerpt.trim() || content.trim().substring(0, 120).replace(/[#*`]/g, '') + '...',
      readingTime: estimateReadingTime(content),
      content: content.trim(),
    }

    addPost(newPost)
    setSaved(true)
    setTimeout(() => {
      navigate(`/blog/${finalSlug}`)
    }, 800)
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && file.name.endsWith('.md')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        parseMarkdownFile(event.target?.result as string)
      }
      reader.readAsText(file)
    }
  }, [parseMarkdownFile])

  return (
    <div className="min-h-[100dvh] bg-Parchment pt-24 pb-16">
      <div className="max-w-4xl mx-auto px-6 md:px-12">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 text-Slate hover:text-Amber transition-colors mb-8 font-body"
        >
          <ArrowLeft size={16} />
          {t('post.cancel')}
        </button>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
        >
          <h1 className="font-display text-[clamp(1.5rem,2.5vw,2.25rem)] font-medium text-Ink mb-2">
            {t('newPost.title')}
          </h1>
          <p className="text-Slate font-body mb-8">{t('newPost.subtitle')}</p>

          {/* Upload area */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onClick={() => fileInputRef.current?.click()}
            className="mb-8 p-8 border-2 border-dashed border-Sand rounded-xl bg-Linen hover:border-Amber hover:bg-Amber/5 transition-all duration-300 cursor-pointer text-center"
          >
            <FileUp size={32} className="text-Slate mx-auto mb-3" />
            <p className="text-Ink font-body font-medium">{t('newPost.dragDrop')}</p>
            <p className="text-Slate text-sm mt-1">{t('newPost.orClick')}</p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".md,.markdown"
              onChange={handleFileUpload}
              className="hidden"
            />
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-3 mb-6">
            <button
              onClick={() => setPreview(false)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[0.8125rem] font-medium transition-colors ${
                !preview ? 'bg-Amber text-Parchment' : 'bg-Linen text-Slate hover:text-Ink'
              }`}
            >
              <Edit3 size={14} />
              {t('newPost.edit')}
            </button>
            <button
              onClick={() => setPreview(true)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-[0.8125rem] font-medium transition-colors ${
                preview ? 'bg-Amber text-Parchment' : 'bg-Linen text-Slate hover:text-Ink'
              }`}
            >
              <Eye size={14} />
              {t('newPost.preview')}
            </button>
          </div>

          {preview ? (
            <div className="bg-Linen rounded-xl border border-Sand p-8 min-h-[400px]">
              <h2 className="font-display text-2xl font-medium text-Ink mb-4">{title || t('newPost.noTitle')}</h2>
              <MarkdownRenderer content={content || `*${t('newPost.noContent')}*`} />
            </div>
          ) : (
            <div className="space-y-5">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block font-ui text-[0.8125rem] font-medium tracking-[0.04em] text-Slate mb-2">
                    {t('newPost.titleLabel')} *
                  </label>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder={t('newPost.titlePlaceholder')}
                    className="w-full bg-Linen border border-Sand rounded-xl py-3 px-4 text-Ink placeholder:text-Slate/40 focus:outline-none focus:border-Amber focus:ring-1 focus:ring-Amber/20 transition-all duration-200 font-body"
                  />
                </div>
                <div>
                  <label className="block font-ui text-[0.8125rem] font-medium tracking-[0.04em] text-Slate mb-2">
                    {t('newPost.slugLabel')} *
                  </label>
                  <input
                    type="text"
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder={t('newPost.slugPlaceholder')}
                    className="w-full bg-Linen border border-Sand rounded-xl py-3 px-4 text-Ink placeholder:text-Slate/40 focus:outline-none focus:border-Amber focus:ring-1 focus:ring-Amber/20 transition-all duration-200 font-body"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block font-ui text-[0.8125rem] font-medium tracking-[0.04em] text-Slate mb-2">
                    {t('newPost.categoryLabel')}
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder={t('newPost.categoryPlaceholder')}
                    className="w-full bg-Linen border border-Sand rounded-xl py-3 px-4 text-Ink placeholder:text-Slate/40 focus:outline-none focus:border-Amber focus:ring-1 focus:ring-Amber/20 transition-all duration-200 font-body"
                  />
                </div>
                <div>
                  <label className="block font-ui text-[0.8125rem] font-medium tracking-[0.04em] text-Slate mb-2">
                    {t('newPost.tagsLabel')}
                  </label>
                  <input
                    type="text"
                    value={tags}
                    onChange={(e) => setTags(e.target.value)}
                    placeholder={t('newPost.tagsPlaceholder')}
                    className="w-full bg-Linen border border-Sand rounded-xl py-3 px-4 text-Ink placeholder:text-Slate/40 focus:outline-none focus:border-Amber focus:ring-1 focus:ring-Amber/20 transition-all duration-200 font-body"
                  />
                </div>
              </div>

              <div>
                <label className="block font-ui text-[0.8125rem] font-medium tracking-[0.04em] text-Slate mb-2">
                  {t('newPost.excerptLabel')}
                </label>
                <input
                  type="text"
                  value={excerpt}
                  onChange={(e) => setExcerpt(e.target.value)}
                  placeholder={t('newPost.excerptPlaceholder')}
                  className="w-full bg-Linen border border-Sand rounded-xl py-3 px-4 text-Ink placeholder:text-Slate/40 focus:outline-none focus:border-Amber focus:ring-1 focus:ring-Amber/20 transition-all duration-200 font-body"
                />
              </div>

              <div>
                <label className="block font-ui text-[0.8125rem] font-medium tracking-[0.04em] text-Slate mb-2">
                  {t('newPost.contentLabel')} *
                </label>
                <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={t('newPost.contentPlaceholder')}
                  className="w-full min-h-[400px] bg-Linen border border-Sand rounded-xl p-4 text-Ink placeholder:text-Slate/40 focus:outline-none focus:border-Amber focus:ring-1 focus:ring-Amber/20 resize-y font-body text-[0.9375rem] leading-[1.75]"
                />
              </div>
            </div>
          )}

          {error && (
            <p className="mt-4 text-sm text-red-600 font-medium">{error}</p>
          )}

          <div className="mt-8 flex items-center gap-4">
            <button
              onClick={handleSave}
              className="inline-flex items-center gap-2 bg-Amber text-Parchment font-ui text-[0.875rem] font-semibold uppercase tracking-[0.05em] px-7 py-3.5 rounded-xl hover:bg-[#B06A2F] hover:shadow-amber hover:-translate-y-px transition-all duration-300"
            >
              <Save size={16} />
              {saved ? t('newPost.published') : t('newPost.publish')}
            </button>
            <button
              onClick={() => navigate('/blog')}
              className="inline-flex items-center border-[1.5px] border-Sand text-Slate font-ui text-[0.875rem] font-semibold uppercase tracking-[0.05em] px-7 py-3.5 rounded-xl hover:border-Ink hover:text-Ink transition-all duration-300"
            >
              {t('post.cancel')}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}
