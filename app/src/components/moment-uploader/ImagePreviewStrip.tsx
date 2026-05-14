import { motion, AnimatePresence } from 'framer-motion'
import { Image, X } from 'lucide-react'

interface Props {
  images: string[]
  onRemove: (index: number) => void
  onAdd: () => void
}

export default function ImagePreviewStrip({ images, onRemove, onAdd }: Props) {
  return (
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
                onClick={() => onRemove(i)}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          {images.length < 9 && (
            <button
              onClick={onAdd}
              className="w-20 h-20 rounded-lg border-2 border-dashed border-gray-300 dark:border-white/15 flex flex-col items-center justify-center text-gray-400 hover:border-Amber hover:text-Amber transition-colors"
            >
              <Image size={18} />
              <span className="text-[0.625rem] mt-0.5">图片</span>
            </button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}
