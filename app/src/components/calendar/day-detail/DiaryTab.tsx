import type { TodoItem } from '@/types/calendar'

interface Props {
  todos: TodoItem[]
  diary: string
  onDiaryChange: (value: string) => void
  isToday: boolean
  isPast: boolean
  isLoggedIn: boolean
}

export default function DiaryTab({ todos, diary, onDiaryChange, isToday, isPast, isLoggedIn }: Props) {
  return (
    <div className="space-y-4">
      {todos.length > 0 && (
        <div className="bg-white dark:bg-white/5 border border-Sand dark:border-white/10 rounded-lg px-4 py-3">
          <p className="text-label font-medium text-Slate dark:text-white/50 mb-2">
            当日任务回顾
          </p>
          <div className="space-y-1.5">
            {todos.map((t) => (
              <p
                key={t.id}
                className={`text-caption ${
                  t.done
                    ? 'text-Ink/50 dark:text-white/40 line-through'
                    : 'text-Ink dark:text-white/80'
                }`}
              >
                {t.done ? '✅' : '○'} {t.text}
              </p>
            ))}
          </div>
        </div>
      )}

      <div>
        <label className="block text-caption font-medium text-Slate dark:text-white/50 mb-1.5">
          {isToday
            ? '今天还有什么想记录的？'
            : isPast
              ? '回忆这一天...'
              : '提前写点什么...'}
        </label>
        {isLoggedIn ? (
          <textarea
            value={diary}
            onChange={(e) => onDiaryChange(e.target.value)}
            placeholder={
              isToday
                ? '记录下今天的点点滴滴...'
                : isPast
                  ? '写下那天发生的事...'
                  : '对这一天有什么期待...'
            }
            rows={10}
            className="w-full px-3 py-2.5 rounded-lg border border-Sand dark:border-white/15 bg-white dark:bg-white/5 text-Ink dark:text-white text-body placeholder:text-Slate/40 focus:outline-none focus:border-Amber/50 focus:ring-1 focus:ring-Amber/20 resize-none leading-relaxed"
          />
        ) : (
          <div className="w-full px-3 py-2.5 rounded-lg border border-Sand dark:border-white/15 bg-white dark:bg-white/5 text-Ink dark:text-white text-body min-h-[120px]">
            {diary.trim() || (
              <span className="text-Slate/40 dark:text-white/20">
                {isToday
                  ? '登录后可记录今天...'
                  : isPast
                    ? '登录后可记录那天发生的事...'
                    : '登录后可提前规划...'}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
