import { useState, useRef } from 'react'
import { Image, MapPin, Send, Paperclip, BookOpen, Loader2 } from 'lucide-react'
import type { Moment, MomentAttachment } from '@/types/moment'
import ImagePreviewStrip from './moment-uploader/ImagePreviewStrip'
import AttachmentList from './moment-uploader/AttachmentList'
import NotePicker from './moment-uploader/NotePicker'
import { slugifyNotePath } from '@/services/obsidianClient'
import { uploadMomentImage, isBase64Image } from '@/services/momentImageUpload'
import { AMAP_KEY } from '@/lib/amap'

interface Props {
  onSubmit: (moment: Omit<Moment, 'id' | 'createdAt' | 'likes' | 'comments' | 'authorId'>) => Promise<void>
  userName?: string
  avatarUrl?: string
  userId?: string
}

export default function MomentUploader({ onSubmit, userName = 'Jasper', avatarUrl, userId }: Props) {
  const [content, setContent] = useState('')
  const [images, setImages] = useState<string[]>([])
  const [uploadingImages, setUploadingImages] = useState<Set<number>>(new Set())
  const [attachments, setAttachments] = useState<MomentAttachment[]>([])
  const [location, setLocation] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [showNotePicker, setShowNotePicker] = useState(false)
  const [locating, setLocating] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)

  const fileRef = useRef<HTMLInputElement>(null)
  const attachmentRef = useRef<HTMLInputElement>(null)

  const canSubmit =
    content.trim().length > 0 || images.length > 0 || attachments.length > 0
  const isUploading = uploadingImages.size > 0

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
            `https://restapi.amap.com/v3/geocode/regeo?key=${AMAP_KEY}&location=${longitude},${latitude}`
          )
          const data = (await res.json()) as {
            status?: string
            info?: string
            regeocode?: {
              formatted_address?: string
              addressComponent?: {
                district?: string
                street?: string
                streetNumber?: string
                township?: string
              }
            }
          }
          if (data.status === '1' && data.regeocode) {
            const comp = data.regeocode.addressComponent
            const place = comp?.district && comp?.street
              ? `${comp.district}${comp.street}${comp.streetNumber || ''}`
              : data.regeocode.formatted_address || `${latitude.toFixed(2)}, ${longitude.toFixed(2)}`
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

  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    const remaining = 9 - images.length
    const selectedFiles = files.slice(0, remaining)
    if (selectedFiles.length === 0) return

    e.target.value = ''

    // 先展示 base64 预览
    const base64Urls: string[] = []
    for (const file of selectedFiles) {
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onload = (ev) => resolve(ev.target?.result as string)
        reader.readAsDataURL(file)
      })
      base64Urls.push(dataUrl)
    }

    const startIdx = images.length
    setImages((prev) => [...prev, ...base64Urls])
    setUploadError(null)

    // 后台上传到 Storage
    if (!userId) return
    for (let i = 0; i < selectedFiles.length; i++) {
      const idx = startIdx + i
      setUploadingImages((prev) => new Set(prev).add(idx))
      try {
        const url = await uploadMomentImage(selectedFiles[i], userId)
        setImages((prev) => {
          const next = [...prev]
          next[idx] = url
          return next
        })
      } catch (err) {
        const msg = err instanceof Error ? err.message : '上传失败'
        setUploadError(msg)
      } finally {
        setUploadingImages((prev) => {
          const next = new Set(prev)
          next.delete(idx)
          return next
        })
      }
    }
  }

  const removeImage = (idx: number) => {
    setImages((prev) => prev.filter((_, i) => i !== idx))
    setUploadingImages((prev) => {
      const next = new Set(prev)
      next.delete(idx)
      // 重新索引：所有大于 idx 的索引减 1
      const result = new Set<number>()
      for (const v of next) {
        result.add(v > idx ? v - 1 : v)
      }
      return result
    })
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
    const noteSlug = slugifyNotePath(item.path)
    setAttachments((prev) => [
      ...prev,
      { name: item.name + '.md', type: 'md-link', data: noteSlug },
    ])
    setShowNotePicker(false)
  }

  const handleSubmit = async () => {
    if (!canSubmit || submitting || isUploading) return

    // 如果还有未上传成功的 base64 图片，先上传
    const hasBase64 = images.some(isBase64Image)
    if (hasBase64 && userId) {
      setSubmitting(true)
      try {
        const { migrateImagesToStorage } = await import('@/services/momentImageUpload')
        const migrated = await migrateImagesToStorage(images, userId)
        await onSubmit({
          content: content.trim(),
          images: migrated,
          attachments: attachments.length > 0 ? attachments : undefined,
          location: location.trim() || undefined,
        })
        setContent('')
        setImages([])
        setAttachments([])
        setLocation('')
        setUploadError(null)
      } catch (err) {
        console.error('发布失败:', err)
        alert('发布失败，请检查网络后重试')
      } finally {
        setSubmitting(false)
      }
      return
    }

    setSubmitting(true)
    try {
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
      setUploadError(null)
    } catch (err) {
      console.error('发布失败:', err)
      alert('发布失败，请检查网络后重试')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-card border-b border-border px-4 py-4 relative">
      {uploadError && (
        <div className="mb-3 px-4 py-2 rounded-lg bg-Rose/10 text-Rose text-label">
          {uploadError}
        </div>
      )}
      <div className="flex gap-4">
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={userName}
            className="w-10 h-10 rounded-full object-cover shrink-0"
          />
        ) : (
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-Amber to-rose-400 flex items-center justify-center text-white text-caption font-bold shrink-0">
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
            className="w-full bg-transparent text-foreground placeholder:text-muted-foreground text-body leading-relaxed resize-none focus:outline-none"
          />

          <ImagePreviewStrip
            images={images}
            onRemove={removeImage}
            onAdd={() => fileRef.current?.click()}
          />

          <AttachmentList attachments={attachments} onRemove={removeAttachment} />

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => fileRef.current?.click()}
                disabled={isUploading}
                className="flex items-center gap-1 text-muted-foreground hover:text-Amber transition-colors text-caption disabled:opacity-50"
              >
                <Image size={16} />
                <span>图片</span>
                {isUploading && <Loader2 size={12} className="animate-spin ml-1" />}
              </button>
              <button
                onClick={() => attachmentRef.current?.click()}
                className="flex items-center gap-1 text-muted-foreground hover:text-Amber transition-colors text-caption"
              >
                <Paperclip size={16} />
                <span>附件</span>
              </button>
              <button
                onClick={() => setShowNotePicker(true)}
                className="flex items-center gap-1 text-muted-foreground hover:text-Amber transition-colors text-caption"
              >
                <BookOpen size={16} />
                <span>笔记</span>
              </button>
              <div className="flex items-center gap-1 text-muted-foreground">
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
                  className="bg-transparent text-caption w-24 focus:outline-none placeholder:text-muted-foreground disabled:opacity-50"
                />
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={!canSubmit || submitting || isUploading}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-600 text-white text-caption font-medium hover:bg-green-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <Send size={14} />
              {submitting ? '发布中' : isUploading ? '上传中' : '发布'}
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
