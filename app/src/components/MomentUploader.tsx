import { useState, useRef } from 'react'
import { Image, MapPin, Send, Paperclip, BookOpen } from 'lucide-react'
import type { Moment, MomentAttachment } from '@/types/moment'
import ImagePreviewStrip from './moment-uploader/ImagePreviewStrip'
import AttachmentList from './moment-uploader/AttachmentList'
import NotePicker from './moment-uploader/NotePicker'

interface Props {
  onSubmit: (moment: Omit<Moment, 'id' | 'createdAt' | 'likes' | 'comments' | 'authorId'>) => Promise<void>
  userName?: string
  avatarUrl?: string
}

export default function MomentUploader({ onSubmit, userName = 'Jasper', avatarUrl }: Props) {
  const [content, setContent] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [attachments, setAttachments] = useState<MomentAttachment[]>([])
  const [location, setLocation] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showNotePicker, setShowNotePicker] = useState(false)
  const [locating, setLocating] = useState(false)

  const fileRef = useRef<HTMLInputElement>(null)
  const attachmentRef = useRef<HTMLInputElement>(null)

  const canSubmit = content.trim().length > 0 || images.length > 0 || attachments.length > 0

  const handleLocate = () => {
    if (!navigator.geolocation) {
      setLocation('定位不可用')
      return
    }
    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords
        try {
          const res = await fetch(
            `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=zh`
          )
          if (res.ok) {
            const data = (await res.json()) as {
              city?: string
              locality?: string
              principalSubdivision?: string
            }
            const place = data.city || data.locality || data.principalSubdivision || ''
            setLocation(place)
          } else {
            setLocation(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`)
          }
        } catch {
          setLocation(`${latitude.toFixed(2)}, ${longitude.toFixed(2)}`)
        }
        setLocating(false)
      },
      () => {
        setLocation('定位失败')
        setLocating(false)
      },
      { enableHighAccuracy: false, timeout: 10000 }
    )
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const remaining = 9 - images.length
    files.slice(0, remaining).forEach((file) => {
      const reader = new FileReader()
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string
        setImages((prev) => [...prev, dataUrl])
      }
      reader.readAsDataURL(file)
    })
    e.target.value = ''
  }

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx))
  }

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

  const handleNoteSelect = (item: { name: string; path: string }) => {
    const noteSlug = item.name
      .trim()
      .replace(/\s+/g, '-')
      .replace(/[^a-zA-Z0-9\u4e00-\u9fa5\-_]/g, '')
      .substring(0, 60)
    setAttachments((prev) => [
      ...prev,
      { name: item.name + '.md', type: 'md-link', data: noteSlug },
    ])
    setShowNotePicker(false)
  }

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
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={userName}
            className="w-10 h-10 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-Amber to-rose-400 flex items-center justify-center text-white text-sm font-bold shrink-0">
            {userName[0]}
          </div>
        )}

        <div className="flex-1">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="分享新鲜事..."
            maxLength={500}
            rows={2}
            className="w-full bg-transparent text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-600 text-[0.9375rem] leading-relaxed resize-none focus:outline-none"
          />

          <ImagePreviewStrip
            images={images}
            onRemove={removeImage}
            onAdd={() => fileRef.current?.click()}
          />

          <AttachmentList attachments={attachments} onRemove={removeAttachment} />

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
                onClick={() => setShowNotePicker(true)}
                className="flex items-center gap-1 text-gray-500 dark:text-gray-400 hover:text-Amber transition-colors text-sm"
              >
                <BookOpen size={16} />
                <span>笔记</span>
              </button>
              <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                <button
                  onClick={handleLocate}
                  disabled={locating}
                  className="flex items-center gap-1 hover:text-Amber transition-colors disabled:opacity-50"
                  title="获取当前位置"
                >
                  <MapPin size={14} className={locating ? 'animate-bounce' : ''} />
                </button>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder={locating ? '定位中...' : '所在位置'}
                  disabled={locating}
                  className="bg-transparent text-sm w-24 focus:outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600 disabled:opacity-50"
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

      <NotePicker
        open={showNotePicker}
        onSelect={handleNoteSelect}
        onClose={() => setShowNotePicker(false)}
      />
    </div>
  )
}
