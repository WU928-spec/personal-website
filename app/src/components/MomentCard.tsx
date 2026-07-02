import { useState, memo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, MessageCircle, MapPin, Trash2, Paperclip, BookOpen } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import type { Moment, MomentAttachment } from '@/types/moment'
import ImageGrid from './ImageGrid'
import { formatRelativeTime } from '@/utils/time'
import { useAuth } from '@/contexts/AuthContext'

interface Props {
  moment: Moment
  index: number
  showDelete?: boolean
  onLike: (id: string) => void
  onComment: (id: string, text: string) => void
  onDelete: (id: string) => void
}

function MomentCard({
  moment,
  index,
  showDelete = true,
  onLike,
  onComment,
  onDelete,
}: Props) {
  const navigate = useNavigate()
  const { userId, getUserDisplay, isLoggedIn } = useAuth()
  const [showCommentInput, setShowCommentInput] = useState(false)
  const [commentText, setCommentText] = useState('')

  const author = getUserDisplay(moment.authorId || 'unknown')
  const isLiked = moment.likes.includes(userId)

  const handleCommentSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!commentText.trim()) return
    onComment(moment.id, commentText.trim())
    setCommentText('')
    setShowCommentInput(false)
  }

  const handleAttachmentClick = (att: MomentAttachment) => {
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

  const likeNames = moment.likes
    .map((uid) => getUserDisplay(uid).username)
    .filter(Boolean)
    .join('、')

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: index * 0.06,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      }}
      className="flex gap-4 px-4 py-4 bg-card"
    >
      {/* Avatar */}
      <div className="shrink-0">
        {author.avatar ? (
          <img
            src={author.avatar}
            alt={author.username}
            className="w-12 h-12 rounded-lg object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-Amber to-rose-400 flex items-center justify-center text-white text-body font-bold">
            {author.username[0] || '?'}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Nickname */}
        <div className="font-semibold text-body text-Amber">
          {author.username}
        </div>

        {/* Time */}
        <div className="text-label text-muted-foreground mt-1">
          {formatRelativeTime(moment.createdAt)}
        </div>

        {/* Text content */}
        {moment.content && (
          <p className="mt-2 text-body leading-relaxed text-foreground whitespace-pre-wrap">
            {moment.content}
          </p>
        )}

        {/* Images */}
        <ImageGrid images={moment.images} />

        {/* Attachments */}
        {moment.attachments && moment.attachments.length > 0 && (
          <div className="mt-2 flex flex-col gap-2">
            {moment.attachments.map((att, i) => (
              <button
                key={i}
                onClick={() => handleAttachmentClick(att)}
                className="flex items-center gap-2 self-start px-2 py-2 rounded-lg bg-muted hover:bg-muted/80 transition-colors text-left"
              >
                {att.type === 'md-link' ? (
                  <BookOpen size={14} className="text-Amber shrink-0" />
                ) : (
                  <Paperclip size={14} className="text-Slate shrink-0" />
                )}
                <span className="text-caption text-foreground truncate max-w-[200px]">
                  {att.name}
                </span>
              </button>
            ))}
          </div>
        )}

        {/* Location */}
        {moment.location && (
          <div className="mt-2 flex items-center gap-1 text-label text-muted-foreground">
            <MapPin size={12} />
            <span>{moment.location}</span>
          </div>
        )}

        {/* Action bar */}
        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => isLoggedIn && onLike(moment.id)}
              disabled={!isLoggedIn}
              className={`flex items-center gap-1 text-caption transition-colors ${
                !isLoggedIn ? 'cursor-not-allowed opacity-40' : ''
              }`}
            >
              <Heart
                size={16}
                className={
                  isLiked
                    ? 'text-red-500 fill-red-500'
                    : 'text-muted-foreground hover:text-red-400'
                }
              />
              <span className={isLiked ? 'text-red-500' : 'text-muted-foreground'}>
                {moment.likes.length > 0 ? moment.likes.length : '赞'}
              </span>
            </button>
            <button
              onClick={() => isLoggedIn && setShowCommentInput((v) => !v)}
              disabled={!isLoggedIn}
              className={`flex items-center gap-1 text-caption text-muted-foreground hover:text-Amber transition-colors ${
                !isLoggedIn ? 'cursor-not-allowed opacity-40' : ''
              }`}
            >
              <MessageCircle size={16} />
              <span>{moment.comments.length > 0 ? moment.comments.length : '评论'}</span>
            </button>
          </div>

          {/* Delete */}
          {showDelete && (
            <button
              onClick={() => {
                if (confirm('确定删除这条动态吗？')) {
                  onDelete(moment.id)
                }
              }}
              className="flex items-center gap-1 text-caption text-muted-foreground hover:text-red-500 transition-colors"
              title="删除"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>

        {/* Likes & Comments area */}
        {(moment.likes.length > 0 || moment.comments.length > 0) && (
          <div className="mt-4 bg-muted rounded-lg px-4 py-2">
            {/* Likes */}
            {moment.likes.length > 0 && (
              <div className="flex items-start gap-2 text-caption">
                <Heart size={14} className="text-red-500 fill-red-500 mt-1 shrink-0" />
                <span className="text-Amber">
                  {likeNames}
                </span>
              </div>
            )}

            {/* Divider */}
            {moment.likes.length > 0 && moment.comments.length > 0 && (
              <div className="h-px bg-border my-2" />
            )}

            {/* Comments */}
            {moment.comments.length > 0 && (
              <div className="space-y-2">
                {moment.comments.map((c) => {
                  const commenter = getUserDisplay(c.userId)
                  return (
                    <div key={c.id} className="text-caption">
                      <span className="font-semibold text-Amber">{commenter.username || c.name}</span>
                      <span className="text-foreground">：{c.text}</span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Comment input */}
        <AnimatePresence>
          {isLoggedIn && showCommentInput && (
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
                className="flex-1 bg-muted rounded-lg px-4 py-2 text-caption text-foreground placeholder:text-muted-foreground focus:outline-none"
              />
              <button
                type="submit"
                disabled={!commentText.trim()}
                className="px-2 py-2 text-caption text-green-600 font-medium disabled:opacity-40"
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

export default memo(MomentCard)
