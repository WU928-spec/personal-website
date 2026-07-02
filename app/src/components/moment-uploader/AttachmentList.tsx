import { motion, AnimatePresence } from 'framer-motion'
import { BookOpen, Paperclip, X } from 'lucide-react'
import type { MomentAttachment } from '@/types/moment'

interface Props {
  attachments: MomentAttachment[]
  onRemove: (index: number) => void
}

export default function AttachmentList({ attachments, onRemove }: Props) {
  return (
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
              className="flex items-center gap-2 px-2 py-1 rounded-md bg-muted text-label text-foreground"
            >
              {att.type === 'md-link' ? (
                <BookOpen size={12} className="text-Amber" />
              ) : (
                <Paperclip size={12} className="text-Slate" />
              )}
              <span className="truncate max-w-[120px]">{att.name}</span>
              <button onClick={() => onRemove(i)} className="text-muted-foreground hover:text-red-500">
                <X size={12} />
              </button>
            </div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
