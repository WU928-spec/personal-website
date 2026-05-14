import type { TodoItem } from '@/types/calendar'
import { formatDuration } from '@/utils/projectAggregation'

interface TaskItemProps {
  todo: TodoItem
}

export default function TaskItem({ todo }: TaskItemProps) {
  const duration = todo.timeRecords.reduce((s, r) => s + (r.duration || 0), 0)

  return (
    <div
      className={`flex items-center gap-2 text-[0.8125rem] ${
        todo.done
          ? 'text-Slate/40 dark:text-white/25 line-through'
          : 'text-Ink/70 dark:text-white/60'
      }`}
    >
      <span className="shrink-0">{todo.done ? '·' : '○'}</span>
      <span className="flex-1 truncate">{todo.text}</span>
      <span className="text-[0.625rem] font-mono text-Slate/40 dark:text-white/25 shrink-0">
        {formatDuration(duration)}
      </span>
    </div>
  )
}
