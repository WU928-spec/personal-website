import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Image, X, MapPin, Send, Paperclip, BookOpen } from 'lucide-react'
import type { Moment, MomentAttachment } from '@/types/moment'

interface ObsidianNote {
  slug: string
  title: string
}

interface Props {
  onSubmit: (moment: Omit<Moment, 'id' | 'createdAt' | 'likes' | 'comments'>) => Promise<void>
  userName?: string
}

export default function MomentUploader({ onSubmit, userName = 'Jasper' }: Props) {
  const [content, setContent] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [attachments, setAttachments] = useState<MomentAttachment[]>([])
  const [location, setLocation] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showNotePicker, setShowNotePicker] = useState(false)
  const [notes, setNotes] = useState<ObsidianNote[]>([])
  const [notesLoading, setNotesLoading] = useState(false)

  const fileRef = useRef<HTMLInputElement>(null)
  const attachmentRef = useRef<HTMLInputElement>(null)

  const canSubmit = content.trim().length > 0 || images.length > 0 || attachments.length > 0

  /* ── Image handling ── */
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const remaining = 9 - images.length
    files.slice(0, remaining).forEach((file) => {
      const url = URL.createObjectURL(file)
      setImages((prev) => [...prev, url])
    })
    e.target.value = ''
  }

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx))
  }

  /* ── Local attachment handling ── */
  const handleAttachmentSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
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
    e.target.value = ''
  }

  const removeAttachment = (idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx))
  }

  /* ── Note picker ── */
  const loadNotes = async () => {
    setNotesLoading(true)
    try {
      const res = await fetch('http://localhost:2667/api/notes')
      if (res.ok) {
        const json = (await res.json()) as { notes: { slug: string; title: string }[] }
        setNotes(json.notes.map((n) => ({ slug: n.slug, title: n.title })))
      }
    } catch {
      // backend unavailable
    }
    setNotesLoading(false)
  }

  const openNotePicker = () => {
    setShowNotePicker(true)
    if (notes.length === 0) loadNotes()
  }

  const selectNote = (note: ObsidianNote) => {
    setAttachments((prev) => [
      ...prev,
      { name: note.title + '.md', type: 'md-link', data: note.slug },
    ])
    setShowNotePicker(false)
  }

  /* ── Submit ── */
  const handleSubmit = async () => {
    if (!canSubmit || submitting) return
    setSubmitting(true)
    await onSubmit({
      content: content.trim(),
      images,
      attachments: attachments.length > 0 ? attachments : undefined,
      location: location.trim() || undefined,
    })
    setContent('')
    setImages([])
    setAttachments([])
    setLocation('')
    setSubmitting(false)
  }

  return (
    <div className="bg-white dark:bg-[#111] border-b border-gray-200 dark:border-white/10 px-4 py-4 relative">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-Amber to-rose-400 flex items-center justify-center text-white text-sm font-bold shrink-0">
          {userName[0]}
        </div>

        <div className="flex-1">
          {/* Textarea */}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="分享新鲜事..."
            maxLength={500}
            rows={2}
            className="w-full bg-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 text-[0.9375rem] leading-relaxed resize-none focus:outline-none"
          />

          {/* Image preview strip */}
          <AnimatePresence>
            {images.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex gap-2 flex-wrap mt-2"
              >
                {images.map((img, i) => (
                  <div key={i} className="relative w-20 h-20">
                    <img src={img} alt="" className="w-full h-full rounded-lg object-cover" />
                    <button
                      onClick={() => removeImage(i)}
                      className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {images.length < 9 && (
                  <button
                    onClick={() => fileRef.current?.click()}
                    className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 dark:border-white/15 flex flex-col items-center justify-center text-gray-400 hover:border-Amber hover:text-Amber transition-colors"
                  >
                    <Image size={18} />
                    <span className="text-[0.625rem] mt-0.5">图片</span>
                  </button>
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Attachment list */}
          <AnimatePresence>
            {attachments.length > 0 && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="flex flex-wrap gap-2 mt-2"
              >
                {attachments.map((att, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-gray-100 dark:bg-white/5 text-[0.75rem] text-gray-700 dark:text-gray-300"
                  >
                    {att.type === 'md-link' ? (
                      <BookOpen size={12} className="text-Amber" />
                    ) : (
                      <Paperclip size={12} className="text-Slate" />
                    )}
                    <span className="truncate max-w-[120px]">{att.name}</span>
                    <button
                      onClick={() => removeAttachment(i)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions row */}
          <div className="flex items-center justify-between mt-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => fileRef.current?.click()}
                className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-Amber transition-colors text-sm"
              >
                <Image size={16} />
                <span>图片</span>
              </button>
              <button
                onClick={() => attachmentRef.current?.click()}
                className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-Amber transition-colors text-sm"
              >
                <Paperclip size={16} />
                <span>附件</span>
              </button>
              <button
                onClick={openNotePicker}
                className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-Amber transition-colors text-sm"
              >
                <BookOpen size={16} />
                <span>笔记</span>
              </button>
              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <MapPin size={14} />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="所在位置"
                  className="bg-transparent text-sm w-24 focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-[#07c160] text-white text-sm font-medium hover:bg-[#06ad56] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Send size={14} />
              {submitting ? '发布中' : '发布'}
            </button>
          </div>
        </div>
      </div>

      {/* Hidden inputs */}
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageSelect}
        className="hidden"
      />
      <input
        ref={attachmentRef}
        type="file"
        accept=".md,.csv,.txt,.json,.pdf"
        onChange={handleAttachmentSelect}
        className="hidden"
      />

      {/* Note picker modal */}
      <AnimatePresence>
        {showNotePicker && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-x-0 top-full z-50 bg-white dark:bg-[#1a1a1a] border border-gray-200 dark:border-white/10 rounded-xl shadow-xl mx-4 mt-2 max-h-64 overflow-y-auto"
          >
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-white/5">
              <span className="text-sm font-medium text-gray-900 dark:text-white">选择笔记</span>
              <button
                onClick={() => setShowNotePicker(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              >
                <X size={16} />
              </button>
            </div>
            {notesLoading ? (
              <div className="flex justify-center py-6">
                <div className="w-5 h-5 border-2 border-Amber border-t-transparent rounded-full animate-spin" />
              </div>
            ) : notes.length === 0 ? (
              <div className="py-6 text-center text-sm text-gray-400">暂无笔记</div>
            ) : (
              <div className="py-1">
                {notes.map((note) => (
                  <button
                    key={note.slug}
                    onClick={() => selectNote(note)}
                    className="w-full text-left px-4 py-2.5 text-sm text-gray-800 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
                  >
                    {note.title}
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
