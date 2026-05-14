import { FileText, X } from 'lucide-react'
import type { ProjectSummary } from '@/types/calendar'

interface Props {
  summaries: ProjectSummary[]
  showForm: boolean
  formTitle: string
  formContent: string
  onTitleChange: (v: string) => void
  onContentChange: (v: string) => void
  onSave: () => void
  onCancel: () => void
  onDelete: (summaryId: string) => void
  isLoggedIn: boolean
  isCompleted: boolean
}

export default function SummarySection({
  summaries,
  showForm,
  formTitle,
  formContent,
  onTitleChange,
  onContentChange,
  onSave,
  onCancel,
  onDelete,
  isLoggedIn,
  isCompleted,
}: Props) {
  return (
    <>
      {summaries.length > 0 && (
        <div className="mt-5">
          <h4 className="text-[0.75rem] font-medium text-Slate/60 dark:text-white/40 mb-2 flex items-center gap-1.5">
            <FileText size={12} />
            阶段总结 ({summaries.length})
          </h4>
          <div className="space-y-2">
            {summaries.map((s) => (
              <div
                key={s.id}
                className="relative rounded-lg bg-Mist/30 dark:bg-white/[0.03] px-3 py-2.5"
              >
                {isLoggedIn && !isCompleted && (
                  <button
                    onClick={() => onDelete(s.id)}
                    className="absolute top-1.5 right-1.5 text-Slate/30 hover:text-Rose transition-colors"
                    title="删除"
                  >
                    <X size={12} />
                  </button>
                )}
                <p className="text-[0.8125rem] font-medium text-Ink dark:text-white/80 pr-5">
                  {s.title}
                </p>
                <p className="text-[0.625rem] text-Slate/40 dark:text-white/20 mt-0.5">
                  {new Date(s.createdAt).toLocaleDateString('zh-CN')}
                </p>
                <p className="text-[0.75rem] text-Slate/70 dark:text-white/50 mt-1 whitespace-pre-wrap">
                  {s.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {isLoggedIn && !isCompleted && showForm && (
        <div className="mt-3">
          <div className="rounded-lg bg-Mist/30 dark:bg-white/[0.03] p-3 space-y-2">
            <input
              value={formTitle}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="总结标题"
              className="w-full px-2.5 py-1.5 text-[0.8125rem] bg-white/60 dark:bg-white/5 border border-Sand dark:border-white/10 rounded-md text-Ink dark:text-white placeholder:text-Slate/40 focus:outline-none focus:border-Amber/50"
              autoFocus
            />
            <textarea
              value={formContent}
              onChange={(e) => onContentChange(e.target.value)}
              placeholder="总结内容..."
              rows={3}
              className="w-full px-2.5 py-1.5 text-[0.8125rem] bg-white/60 dark:bg-white/5 border border-Sand dark:border-white/10 rounded-md text-Ink dark:text-white placeholder:text-Slate/40 focus:outline-none focus:border-Amber/50 resize-none"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={onCancel}
                className="px-3 py-1 text-[0.75rem] text-Slate hover:text-Ink dark:hover:text-white transition-colors"
              >
                取消
              </button>
              <button
                onClick={onSave}
                className="px-3 py-1 text-[0.75rem] bg-Sage text-white rounded-md hover:bg-[#5a7a5a] transition-colors"
              >
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
