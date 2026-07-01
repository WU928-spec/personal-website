import { Trash2, CheckCircle2, RotateCcw } from 'lucide-react'

interface Props {
  isCompleted: boolean
  isLoggedIn: boolean
  onEdit: () => void
  onComplete: () => void
  onReactivate: () => void
  onDelete: () => void
}

export default function ProjectActions({
  isCompleted,
  isLoggedIn,
  onEdit,
  onComplete,
  onReactivate,
  onDelete,
}: Props) {
  if (!isLoggedIn) return null

  return (
    <div className="flex items-center gap-2 mt-4 pt-4 border-t border-Sand/50 dark:border-white/5">
      {!isCompleted ? (
        <>
          <button
            onClick={onEdit}
            className="text-label text-Slate/60 dark:text-white/40 hover:text-Amber transition-colors"
          >
            编辑
          </button>
          <button
            onClick={onComplete}
            className="flex items-center gap-1 text-label text-Sage hover:text-Sage/80 transition-colors"
          >
            <CheckCircle2 size={12} />
            标记完成
          </button>
        </>
      ) : (
        <button
          onClick={onReactivate}
          className="flex items-center gap-1 text-label text-Amber hover:text-Amber/80 transition-colors"
        >
          <RotateCcw size={12} />
          重新激活
        </button>
      )}
      <div className="flex-1" />
      <button
        onClick={onDelete}
        className="flex items-center gap-1 text-label text-Slate/40 hover:text-Rose transition-colors"
      >
        <Trash2 size={12} />
        删除
      </button>
    </div>
  )
}
