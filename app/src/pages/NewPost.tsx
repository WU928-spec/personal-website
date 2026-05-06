import { useState, useRef, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Image, X, Smile, Paperclip } from 'lucide-react'
import { addPost, type Attachment } from '@/data/posts'
import { useAuth } from '@/contexts/AuthContext'
import MarkdownRenderer from '@/components/MarkdownRenderer'

const MOOD_OPTIONS = ['✨', '✍️', '📷', '✈️', '🍜', '🎵', '💻', '📖', '🏃', '🌤️', '🎬', '🎮', '☕', '🌈']

function generateSlug(): string {
  return 'moment-' + Date.now().toString(36)
}

function extractTitle(content: string): string {
  const plain = content
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_~`$\\[\]()!>|-]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return plain.length > 30 ? plain.substring(0, 30) + '…' : plain || '无标题'
}

function extractExcerpt(content: string): string {
  const plain = content
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/[*_~`$\\[\]()!>|-]/g, '')
    .replace(/!\[.*?\]\(.*?\)/g, '')
    .replace(/\[.*?\]\(.*?\)/g, '$1')
    .replace(/\$\$[\s\S]*?\$\$/g, '')
    .replace(/\$[^$]*\$/g, '')
    .replace(/\s+/g, ' ')
    .trim()
  return plain.length > 120 ? plain.substring(0, 120) + '…' : plain
}

function calculateReadingTime(content: string): string {
  const words = content.split(/\s+/).length
  return `${Math.max(1, Math.ceil(words / 200))} min read`
}

export default function NewPost() {
  const { isLoggedIn } = useAuth()
  const navigate = useNavigate()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const attachmentInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const [content, setContent] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [category, setCategory] = useState('日常')
  const [tags, setTags] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  if (!isLoggedIn) {
    return (
      <div className="min-h-[60dvh] bg-Parchment flex items-center justify-center">
        <div className="text-center">
          <p className="text-Slate font-body text-lg">请先登录</p>
          <button
            onClick={() => navigate('/login')}
            className="mt-4 inline-flex items-center bg-Amber text-Parchment font-ui text-[0.875rem] font-semibold uppercase tracking-[0.05em] px-7 py-3 rounded-md hover:bg-[#B06A2F] transition-all duration-300"
          >
            前往登录
          </button>
        </div>
      </div>
    )
  }

  const handleImageAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      setImages((prev) => [...prev, dataUrl])
    }
    reader.readAsDataURL(file)
  }

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleAttachmentAdd = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      const ext = file.name.split('.').pop()?.toLowerCase() || ''
      setAttachments((prev) => [
        ...prev,
        { name: file.name, type: ext, data: dataUrl },
      ])
    }
    reader.readAsDataURL(file)
  }

  const removeAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx))
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (!file || !file.type.startsWith('image/')) return
    const reader = new FileReader()
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result as string
      setImages((prev) => [...prev, dataUrl])
    }
    reader.readAsDataURL(file)
  }, [])

  const handlePublish = () => {
    setError('')
    if (!content.trim() && images.length === 0) {
      setError('写点什么吧')
      textareaRef.current?.focus()
      return
    }
    setSaving(true)

    const tagList = tags
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean)

    // Build content: images as markdown + user text
    const imageMd = images.map((url) => `![](${url})`).join('\n')
    const fullContent = [imageMd, content.trim()].filter(Boolean).join('\n\n')

    const newPost = {
      slug: generateSlug(),
      title: extractTitle(content || '分享图片'),
      date: new Date().toISOString().split('T')[0],
      category,
      tags: tagList.length > 0 ? tagList : ['日常'],
      excerpt: extractExcerpt(content || '分享图片'),
      readingTime: calculateReadingTime(content),
      content: fullContent.trim(),
      attachments: attachments.length > 0 ? attachments : undefined,
    }

    addPost(newPost)
    setTimeout(() => {
      navigate('/blog')
    }, 300)
  }

  return (
    <div className="min-h-screen bg-Parchment dark:bg-Graphite">
      {/* ── Top Bar ── */}
      <div className="sticky top-0 z-50 bg-Parchment/95 backdrop-blur-xl border-b border-Sand/50 dark:bg-Graphite/95 dark:border-white/10">
        <div className="max-w-2xl mx-auto px-4 flex items-center justify-between h-14">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 text-Slate hover:text-Ink dark:text-white/60 dark:hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <span className="text-[0.9375rem] font-medium text-Ink dark:text-white">
            发碎片
          </span>
          <button
            onClick={handlePublish}
            disabled={saving}
            className="px-5 py-1.5 rounded-full bg-Amber text-white text-[0.8125rem] font-semibold hover:bg-[#B06A2F] disabled:opacity-50 transition-all duration-200"
          >
            {saving ? '发布中…' : '发布'}
          </button>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-4 py-6">
        {/* ── Text Editor ── */}
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          placeholder="记录这一刻…&#10;支持 Markdown 和 $LaTeX$ 数学公式"
          className="w-full min-h-[200px] bg-transparent text-Ink dark:text-white placeholder:text-Slate/40 dark:placeholder:text-white/20 font-body text-[1.0625rem] leading-[1.75] resize-none focus:outline-none"
          autoFocus
        />

        {/* ── Image Strip (below text, like Weibo) ── */}
        <div className="mt-4">
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {images.map((img, i) => (
              <div key={i} className="relative shrink-0">
                <img
                  src={img}
                  alt=""
                  className="w-24 h-24 object-cover rounded-lg border border-Sand/50 dark:border-white/10"
                />
                <button
                  onClick={() => removeImage(i)}
                  className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-Ink/80 text-white flex items-center justify-center hover:bg-Ink transition-colors"
                >
                  <X size={11} />
                </button>
              </div>
            ))}
            {images.length < 9 && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="shrink-0 w-24 h-24 rounded-lg border-2 border-dashed border-Sand dark:border-white/15 flex flex-col items-center justify-center text-Slate dark:text-white/30 hover:border-Amber hover:text-Amber transition-colors gap-1"
              >
                <Image size={20} />
                <span className="text-[0.625rem]">照片</span>
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageAdd}
            className="hidden"
          />
        </div>

        {/* ── Attachment Area ── */}
        <div className="mt-4">
          <div className="flex flex-wrap gap-2">
            {attachments.map((att, i) => (
              <div
                key={i}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-Sand/50 dark:border-white/10 bg-white/30 dark:bg-white/5 text-[0.75rem] text-Ink dark:text-white"
              >
                <Paperclip size={12} className="text-Slate shrink-0" />
                <span className="truncate max-w-[120px]">{att.name}</span>
                <span className="text-[0.625rem] text-Slate/60 uppercase">{att.type}</span>
                <button
                  onClick={() => removeAttachment(i)}
                  className="text-Slate/50 hover:text-rose-500 transition-colors"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            <button
              onClick={() => attachmentInputRef.current?.click()}
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-dashed border-Sand dark:border-white/15 text-[0.75rem] text-Slate dark:text-white/40 hover:border-Amber hover:text-Amber transition-colors"
            >
              <Paperclip size={12} />
              附件
            </button>
          </div>
          <input
            ref={attachmentInputRef}
            type="file"
            accept=".md,.csv,.txt,.json,.pdf"
            onChange={handleAttachmentAdd}
            className="hidden"
          />
        </div>

        {/* Divider */}
        <div className="border-t border-Sand/30 dark:border-white/5 my-4" />

        {/* ── Real-time Preview ── */}
        {(content.trim() || images.length > 0) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-white/50 dark:bg-white/5 border border-Sand/30 dark:border-white/5 rounded-xl p-5"
          >
            <div className="text-[0.6875rem] text-Slate/50 dark:text-white/30 mb-3 uppercase tracking-[0.06em] font-medium">
              预览
            </div>
            {/* Images in preview */}
            {images.length > 0 && (
              <div className="flex gap-3 overflow-x-auto pb-3 mb-3 no-scrollbar">
                {images.map((img, i) => (
                  <img
                    key={i}
                    src={img}
                    alt=""
                    className="shrink-0 w-24 h-24 object-cover rounded-xl border border-Sand/50 dark:border-white/10"
                  />
                ))}
              </div>
            )}
            {content.trim() && (
              <div className="prose-custom">
                <MarkdownRenderer content={content} existingSlugs={[]} />
              </div>
            )}
          </motion.div>
        )}

        {/* ── Bottom Metadata ── */}
        <div className="mt-6 space-y-4">
          {/* Mood Picker */}
          <div>
            <label className="flex items-center gap-1.5 text-[0.75rem] text-Slate dark:text-white/50 mb-2">
              <Smile size={14} />
              心情
            </label>
            <div className="flex flex-wrap gap-2">
              {MOOD_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => setCategory(emoji === category ? '日常' : emoji)}
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-lg transition-all duration-200 ${
                    MOOD_OPTIONS.indexOf(emoji) === MOOD_OPTIONS.indexOf(category) || (category === emoji)
                      ? 'bg-Amber/10 ring-2 ring-Amber/30 scale-110'
                      : 'hover:bg-Linen dark:hover:bg-white/5'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="mt-2 w-full bg-transparent text-[0.8125rem] text-Slate dark:text-white/50 border-b border-transparent hover:border-Sand dark:hover:border-white/10 focus:border-Amber focus:outline-none transition-colors"
              placeholder="自定义分类"
            />
          </div>

          {/* Tags */}
          <div>
            <label className="text-[0.75rem] text-Slate dark:text-white/50 mb-1 block">
              标签（逗号分隔）
            </label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="旅行, 美食, 咖啡"
              className="w-full bg-transparent text-[0.9375rem] text-Ink dark:text-white placeholder:text-Slate/30 dark:placeholder:text-white/15 border-b border-Sand/30 dark:border-white/5 focus:border-Amber focus:outline-none py-1 transition-colors font-body"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="mt-4 text-[0.8125rem] text-rose-500 font-medium">{error}</p>
        )}
      </div>
    </div>
  )
}
