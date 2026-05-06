import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, MessageCircle, MapPin, Trash2, Paperclip, BookOpen } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Moment } from '@/types/moment'
import ImageGrid from './ImageGrid'
import { formatRelativeTime } from '@/hooks/useMoments'

interface Props {
  moment: Moment
  index: number
  currentUser?: string
  onLike: (id: string, name: string) => void
  onComment: (id: string, name: string, text: string) => void
  onDelete: (id: string) => void
}

export default function MomentCard({
  moment,
  index,
  currentUser = 'Jasper',
  onLike,
  onComment,
  onDelete,
}: Props) {
  const navigate = useNavigate()
  const [showCommentInput, setShowCommentInput] = useState(false)
  const [commentText, setCommentText] = useState('')

  const isLiked = moment.likes.includes(currentUser)

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return
    onComment(moment.id, currentUser, commentText.trim())
    setCommentText('')
    setShowCommentInput(false)
  }

  const handleAttachmentClick = (att: Moment['attachments'][number]) => {
    if (att.type === 'md-link') {
      navigate(`/obsidian?note=${encodeURIComponent(att.data)}`)
    } else {
      const link = document.createElement('a')
      link.href = att.data
      link.download = att.name
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    }
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.06,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      }}
      className="flex gap-3 px-4 py-4 bg-white dark:bg-[#111]"
    >
      {/* Avatar */}
      <div className="shrink-0">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-Amber to-rose-400 flex items-center justify-center text-white text-base font-bold">
          J
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Nickname */}
        <div className="font-semibold text-[0.9375rem] text-Amber">
          Jasper
        </div>

        {/* Time */}
        <div className="text-[0.75rem] text-gray-500 dark:text-gray-400 mt-0.5">
          {formatRelativeTime(moment.createdAt)}
        </div>

        {/* Text content */}
        {moment.content && (
          <p className="mt-2 text-[0.9375rem] leading-relaxed text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
            {moment.content}
          </p>
        )}

        {/* Images */}
        <ImageGrid images={moment.images} />

        {/* Attachments */}
        {moment.attachments && moment.attachments.length > 0 && (
          <div className="mt-2 flex flex-col gap-1.5">
            {moment.attachments.map((att, i) => (
              <button
                key={i}
                onClick={() => handleAttachmentClick(att)}
                className="flex items-center gap-2 self-start px-3 py-1.5 rounded-lg bg-gray-100 dark:bg-white/5 hover:bg-gray-200 dark:hover:bg-white/10 transition-colors text-left"
              >
                {att.type === 'md-link' ? (
                  <BookOpen size={14} className="text-Amber shrink-0" />
                ) : (
                  <Paperclip size={14} className="text-Slate shrink-0" />
                )}
                <span className="text-[0.8125rem] text-gray-700 dark:text-gray-300 truncate max-w-[200px]">
                  {att.name}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Location */}
        {moment.location && (
          <div className="mt-2 flex items-center gap-1 text-[0.75rem] text-gray-500 dark:text-gray-400">
            <MapPin size={12} />
            <span>{moment.location}</span>
          </div>
        )}

        {/* Action bar */}
        <div className="mt-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => onLike(moment.id, currentUser)}
              className="flex items-center gap-1 text-sm transition-colors"
            >
              <Heart
                size={16}
                className={
                  isLiked
                    ? 'text-red-500 fill-red-500'
                    : 'text-gray-400 dark:text-gray-500 hover:text-red-400'
                }
              />
              <span className={isLiked ? 'text-red-500' : 'text-gray-400 dark:text-gray-500'}>
                {moment.likes.length > 0 ? moment.likes.length : '赞'}
              </span>
            </button>
            <button
              onClick={() => setShowCommentInput((v) => !v)}
              className="flex items-center gap-1 text-sm text-gray-400 dark:text-gray-500 hover:text-Amber transition-colors"
            >
              <MessageCircle size={16} />
              <span>{moment.comments.length > 0 ? moment.comments.length : '评论'}</span>
            </button>
          </div>

          {/* Delete */}
          <button
            onClick={() => {
              if (confirm('确定删除这条动态吗？')) {
                onDelete(moment.id)
              }
            }}
            className="flex items-center gap-1 text-sm text-gray-400 dark:text-gray-500 hover:text-red-500 transition-colors"
            title="删除"
          >
            <Trash2 size={16} />
          </button>
        </div>

        {/* Likes & Comments area */}
        {(moment.likes.length > 0 || moment.comments.length > 0) && (
          <div className="mt-3 bg-gray-100 dark:bg-slate-800 rounded-lg px-3 py-2.5">
            {/* Likes */}
            {moment.likes.length > 0 && (
              <div className="flex items-start gap-1.5 text-sm">
                <Heart size={14} className="text-red-500 fill-red-500 mt-0.5 shrink-0" />
                <span className="text-Amber">
                  {moment.likes.join('、')}
                </span>
              </div>
            )}

            {/* Divider */}
            {moment.likes.length > 0 && moment.comments.length > 0 && (
              <div className="h-px bg-gray-200 dark:bg-white/10 my-1.5" />
            )}

            {/* Comments */}
            {moment.comments.length > 0 && (
              <div className="space-y-1">
                {moment.comments.map((c) => (
                  <div key={c.id} className="text-sm">
                    <span className="font-semibold text-Amber">{c.name}</span>
                    <span className="text-gray-700 dark:text-gray-300">：{c.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Comment input */}
        <AnimatePresence>
          {showCommentInput && (
            <motion.form
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              onSubmit={handleCommentSubmit}
              className="mt-2 flex gap-2 overflow-hidden"
            >
              <input
                type="text"
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                placeholder="写评论..."
                autoFocus
                className="flex-1 bg-gray-100 dark:bg-slate-800 rounded-full px-3 py-1.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="px-3 py-1.5 text-sm text-[#07c160] font-medium disabled:opacity-40"
              >
                发送
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </motion.article>
  )
}
