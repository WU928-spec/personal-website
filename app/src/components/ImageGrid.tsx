import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ChevronLeft, ChevronRight } from 'lucide-react'

interface ImageGridProps {
  images: string[]
}

export default function ImageGrid({ images }: ImageGridProps) {
  const [previewIndex, setPreviewIndex] = useState<number | null>(null)
  const count = Math.min(images.length, 9)

  if (count === 0) return null

  const openPreview = (idx: number) => setPreviewIndex(idx)
  const closePreview = () => setPreviewIndex(null)
  const prev = () =>
    setPreviewIndex((i) =>
      i === null || i <= 0 ? i : i - 1
    )
  const next = () =>
    setPreviewIndex((i) =>
      i === null || i >= count - 1 ? i : i + 1
    )

  /* ── Single image: keep original aspect ratio, narrower width ── */
  if (count === 1) {
    return (
      <>
        <div className="mt-2 w-[60%] max-w-[280px]">
          <img
            src={images[0]}
            alt=""
            className="w-full rounded-lg object-cover cursor-zoom-in"
            loading="lazy"
            onClick={() => openPreview(0)}
          />
        </div>
        <PreviewOverlay
          images={images}
          index={previewIndex}
          onClose={closePreview}
          onPrev={prev}
          onNext={next}
        />
      </>
    )
  }

  /* ── 2 images: 2-column grid, wider container ── */
  if (count === 2) {
    return (
      <>
        <div className="mt-2 w-[80%] max-w-[420px] grid grid-cols-2 gap-1">
          {images.slice(0, 2).map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              className="w-full aspect-square rounded-lg object-cover cursor-zoom-in"
              loading="lazy"
              onClick={() => openPreview(i)}
            />
          ))}
        </div>
        <PreviewOverlay
          images={images}
          index={previewIndex}
          onClose={closePreview}
          onPrev={prev}
          onNext={next}
        />
      </>
    )
  }

  /* ── 3–9 images: 3×3 grid (九宫图), wider container for better viewing ── */
  return (
    <>
      <div className="mt-2 w-[80%] max-w-[420px] grid grid-cols-3 gap-1">
        {images.slice(0, 9).map((src, i) => (
          <img
            key={i}
            src={src}
            alt=""
            className="w-full aspect-square rounded-lg object-cover cursor-zoom-in"
            loading="lazy"
            onClick={() => openPreview(i)}
          />
        ))}
      </div>
      <PreviewOverlay
        images={images}
        index={previewIndex}
        onClose={closePreview}
        onPrev={prev}
        onNext={next}
      />
    </>
  )
}

/* ───────────────────────────────────────────────
   Full-screen Image Preview
   ─────────────────────────────────────────────── */
function PreviewOverlay({
  images,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  images: string[]
  index: number | null
  onClose: () => void
  onPrev: () => void
  onNext: () => void
}) {
  const isOpen = index !== null

  /* Keyboard support */
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
    else if (e.key === 'ArrowLeft') onPrev()
    else if (e.key === 'ArrowRight') onNext()
  }

  return (
    <AnimatePresence>
      {isOpen && index !== null && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center"
          onClick={onClose}
          onKeyDown={handleKeyDown}
          tabIndex={-1}
          autoFocus
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white z-10"
          >
            <X size={28} />
          </button>

          {/* Prev */}
          {index > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onPrev()
              }}
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white z-10"
            >
              <ChevronLeft size={36} />
            </button>
          )}

          {/* Next */}
          {index < images.length - 1 && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                onNext()
              }}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white z-10"
            >
              <ChevronRight size={36} />
            </button>
          )}

          {/* Image */}
          <motion.img
            key={index}
            src={images[index]}
            alt=""
            className="max-w-[90vw] max-h-[85vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />

          {/* Counter */}
          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-white/70 text-caption">
            {index + 1} / {images.length}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
