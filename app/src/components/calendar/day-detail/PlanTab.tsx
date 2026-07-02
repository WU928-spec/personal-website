import { CheckCircle2, Circle, Plus, Tag, Trash2 } from 'lucide-react'
import type { TodoItem, Project } from '@/types/calendar'
import ProjectTag from './ProjectTag'

interface Props {
  todos: TodoItem[]
  onToggleTodo: (id: string) => void
  onRemoveTodo: (id: string) => void
  newTodo: string
  onNewTodoChange: (value: string) => void
  onAddTodo: () => void
  selectedProjectId: string
  onProjectChange: (id: string) => void
  projects: Project[]
  isLoggedIn: boolean
  isPast: boolean
}

export default function PlanTab({
  todos,
  onToggleTodo,
  onRemoveTodo,
  newTodo,
  onNewTodoChange,
  onAddTodo,
  selectedProjectId,
  onProjectChange,
  projects,
  isLoggedIn,
  isPast,
}: Props) {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      onAddTodo()
    }
  }

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className="flex items-center gap-2 bg-white dark:bg-white/5 border border-Sand dark:border-white/10 rounded-lg px-4 py-2.5 group"
          >
            <button
              onClick={() => isLoggedIn && onToggleTodo(todo.id)}
              className={`shrink-0 transition-colors ${
                !isLoggedIn ? 'cursor-not-allowed opacity-40' : ''
              } ${
                todo.done
                  ? 'text-Sage'
                  : 'text-Slate/40 dark:text-white/30 hover:text-Amber'
              }`}
            >
              {todo.done ? <CheckCircle2 size={18} /> : <Circle size={18} />}
            </button>
            <div className="flex-1 min-w-0">
              <span
                className={`text-body ${
                  todo.done
                    ? 'line-through text-Slate/40 dark:text-white/30'
                    : 'text-Ink dark:text-white'
                }`}
              >
                {todo.text}
              </span>
              {todo.projectId && (
                <ProjectTag projectId={todo.projectId} projects={projects} />
              )}
            </div>
            {isLoggedIn && (
              <button
                onClick={() => onRemoveTodo(todo.id)}
                className="opacity-0 group-hover:opacity-100 text-Slate/40 hover:text-Rose transition-all duration-200 shrink-0"
                aria-label="删除"
              >
                <Trash2 size={15} />
              </button>
            )}
          </div>
        ))}
      </div>

      {todos.length === 0 && (
        <p className="text-center text-caption text-Slate/40 dark:text-white/20 py-8">
          {isPast ? '当天没有计划' : '添加今天的计划...'}
        </p>
      )}

      {isLoggedIn && !isPast && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newTodo}
              onChange={(e) => onNewTodoChange(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="添加待办..."
              className="flex-1 px-4 py-2 rounded-lg border border-Sand dark:border-white/15 bg-white dark:bg-white/5 text-Ink dark:text-white text-body placeholder:text-Slate/40 focus:outline-none focus:border-Amber/50 focus:ring-1 focus:ring-Amber/20"
            />
            <button
              onClick={onAddTodo}
              disabled={!newTodo.trim()}
              className="flex items-center justify-center w-10 h-10 rounded-lg bg-Amber text-white hover:bg-Amber/80 disabled:opacity-30 disabled:hover:bg-Amber transition-colors duration-200 shrink-0"
              aria-label="添加"
            >
              <Plus size={18} />
            </button>
          </div>
          {projects.length > 0 && (
            <div className="flex items-center gap-2">
              <Tag size={14} className="text-Slate/50 dark:text-white/30 shrink-0" />
              <select
                value={selectedProjectId}
                onChange={(e) => onProjectChange(e.target.value)}
                className="flex-1 text-caption px-2 py-1.5 rounded-md border border-Sand dark:border-white/15 bg-white dark:bg-white/5 text-Ink dark:text-white focus:outline-none focus:border-Amber/50"
              >
                <option value="">无项目标签</option>
                {projects
                  .filter((p) => !p.parentId)
                  .map((parent) => (
                    <optgroup key={parent.id} label={parent.name}>
                      <option value={parent.id}>直接归属「{parent.name}」</option>
                      {projects
                        .filter((p) => p.parentId === parent.id)
                        .map((sub) => (
                          <option key={sub.id} value={sub.id}>
                            └ {sub.name}
                          </option>
                        ))}
                    </optgroup>
                  ))}
              </select>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
