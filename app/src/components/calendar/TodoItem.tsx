import { useState, useMemo } from 'react'
import { Clock, CheckCircle2, Circle, Square, Play, X } from 'lucide-react'
import type { TodoItem as TodoItemType, Project } from '@/types/calendar'
import { formatDurationShort } from '@/utils/projectAggregation'

interface TodoItemProps {
  todo: TodoItemType
  projects: Project[]
  isLoggedIn: boolean
  onToggleDone: () => void
  onToggleTrack: () => void
  onSaveTimeRecords: (records: { id: string; duration: number }[]) => void
}

export default function TodoItem({
  todo,
  projects,
  isLoggedIn,
  onToggleDone,
  onToggleTrack,
  onSaveTimeRecords,
}: TodoItemProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [draftRecords, setDraftRecords] = useState<{ id: string; duration: number }[]>([])

  const isTracking = todo.timeRecords.some((r) => !r.endAt)
  const totalSec = useMemo(
    () =>
      todo.timeRecords.reduce((sum, r) => sum + (r.duration || 0), 0) +
      (isTracking
        ? Math.floor(
            (Date.now() - new Date(todo.timeRecords.find((r) => !r.endAt)!.startAt).getTime()) /
              1000
          )
        : 0),
    [todo.timeRecords, isTracking]
  )

  const startEdit = () => {
    setIsEditing(true)
    setDraftRecords(todo.timeRecords.map((r) => ({ id: r.id, duration: r.duration || 0 })))
  }

  const saveEdit = () => {
    onSaveTimeRecords(draftRecords)
    setIsEditing(false)
  }

  const cancelEdit = () => {
    setIsEditing(false)
  }

  return (
    <div>
      <div
        className={`
          group flex items-center gap-1.5 rounded-lg px-2 py-1.5 border transition-all duration-200
          ${isTracking
            ? 'bg-Amber/5 border-Amber/30'
            : todo.done
              ? 'bg-Sage/5 border-Sage/20 opacity-60'
              : 'bg-transparent border-Sand dark:border-white/10'
          }
        `}
      >
        <button
          onClick={onToggleDone}
          disabled={!isLoggedIn}
          className={`shrink-0 transition-colors ${
            !isLoggedIn ? 'cursor-not-allowed opacity-40' : ''
          } ${
            todo.done
              ? 'text-Sage'
              : 'text-Slate/30 dark:text-white/20 hover:text-Amber'
          }`}
        >
          {todo.done ? <CheckCircle2 size={14} /> : <Circle size={14} />}
        </button>

        <span
          className={`flex-1 text-caption truncate ${
            todo.done
              ? 'line-through text-Slate/40 dark:text-white/30'
              : 'text-Ink dark:text-white/80'
          }`}
        >
          {todo.text}
          {todo.projectId && <ProjectDot projectId={todo.projectId} projects={projects} />}
        </span>

        {totalSec > 0 && (
          <span className="text-label font-mono text-Slate/60 dark:text-white/40 shrink-0">
            {formatDurationShort(totalSec)}
          </span>
        )}

        {totalSec > 0 && isLoggedIn && !isTracking && (
          <button
            onClick={startEdit}
            className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity text-Slate/30 hover:text-Amber"
            title="修改时间"
          >
            <Clock size={12} />
          </button>
        )}

        <button
          onClick={onToggleTrack}
          disabled={!isLoggedIn}
          className={`
            shrink-0 flex items-center justify-center w-6 h-6 rounded-md transition-all duration-200
            ${!isLoggedIn ? 'cursor-not-allowed opacity-40' : ''}
            ${isTracking
              ? 'bg-Amber text-white'
              : 'bg-Mist dark:bg-white/10 text-Slate dark:text-white/50 hover:text-Amber hover:bg-Amber/10'
            }
          `}
          title={isTracking ? '停止计时' : '开始计时'}
        >
          {isTracking ? <Square size={11} /> : <Play size={11} />}
        </button>
      </div>

      {isEditing && (
        <div className="mt-1.5 rounded-lg bg-Mist/30 dark:bg-white/[0.03] p-2 space-y-1">
          {draftRecords.map((record, idx) => (
            <div key={record.id} className="flex items-center gap-2">
              <span className="text-label text-Slate/40 w-4">{idx + 1}.</span>
              <input
                type="number"
                min={0}
                value={Math.round(record.duration / 60)}
                onChange={(e) => {
                  const minutes = parseInt(e.target.value) || 0
                  setDraftRecords((prev) =>
                    prev.map((r, i) => (i === idx ? { ...r, duration: minutes * 60 } : r))
                  )
                }}
                className="w-16 px-1 py-0.5 text-label bg-white/60 dark:bg-white/5 border border-Sand dark:border-white/10 rounded text-Ink dark:text-white text-center"
              />
              <span className="text-label text-Slate/40">分钟</span>
              <button
                onClick={() => setDraftRecords((prev) => prev.filter((_, i) => i !== idx))}
                className="text-Slate/30 hover:text-Rose transition-colors"
                title="删除记录"
              >
                <X size={12} />
              </button>
            </div>
          ))}
          <div className="flex justify-end gap-2 pt-1">
            <button
              onClick={cancelEdit}
              className="px-2 py-0.5 text-label text-Slate hover:text-Ink dark:hover:text-white transition-colors"
            >
              取消
            </button>
            <button
              onClick={saveEdit}
              className="px-2 py-0.5 text-label bg-Sage text-white rounded-md hover:bg-[#5a7a5a] transition-colors"
            >
              保存
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function ProjectDot({ projectId, projects }: { projectId: string; projects: Project[] }) {
  const project = projects.find((p) => p.id === projectId)
  if (!project) return null
  return (
    <span
      className="inline-block w-2 h-2 rounded-full ml-1.5 align-middle"
      style={{ backgroundColor: project.color }}
      title={project.name}
    />
  )
}
