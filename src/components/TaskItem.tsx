import { Check, Pencil, Trash2 } from 'lucide-react';
import { useState } from 'react';
import type { Task } from '../types';
import { formatMinutes } from '../utils/time';

interface TaskItemProps {
  task: Task;
  isCurrent: boolean;
  pomodoroEnabled: boolean;
  onRemove: () => void;
  onToggleComplete: () => void;
  onUpdate: (updates: Partial<Pick<Task, 'title' | 'duration'>>) => void;
}

export function TaskItem({
  task,
  isCurrent,
  pomodoroEnabled,
  onRemove,
  onToggleComplete,
  onUpdate,
}: TaskItemProps) {
  const [hovered, setHovered] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ title: task.title, duration: task.duration });

  const progressPct =
    pomodoroEnabled && task.duration > 0
      ? Math.min(100, (task.timeSpent / (task.duration * 60)) * 100)
      : 0;

  const commitEdit = () => {
    if (draft.title.trim()) {
      onUpdate({ title: draft.title.trim(), duration: Math.max(1, draft.duration) });
    }
    setEditing(false);
  };

  return (
    <div
      className="group relative rounded-xl transition-all duration-200"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: isCurrent
          ? 'rgba(248,113,113,0.08)'
          : hovered
            ? 'rgba(255,255,255,0.04)'
            : 'transparent',
        border: isCurrent ? '1px solid rgba(248,113,113,0.18)' : '1px solid transparent',
      }}
    >
      <div className="flex items-center gap-3 px-3 py-2.5">
        {/* Checkbox */}
        <button
          onClick={onToggleComplete}
          className="flex-shrink-0 w-[18px] h-[18px] rounded border flex items-center justify-center transition-all cursor-pointer"
          style={{
            background: task.completed ? '#f87171' : 'transparent',
            borderColor: task.completed
              ? '#f87171'
              : isCurrent
                ? 'rgba(248,113,113,0.5)'
                : 'rgba(255,255,255,0.2)',
          }}
        >
          {task.completed && <Check size={11} color="#fff" strokeWidth={3} />}
        </button>

        {/* Title (or edit input) */}
        {editing ? (
          <input
            autoFocus
            value={draft.title}
            onChange={e => setDraft(d => ({ ...d, title: e.target.value }))}
            onBlur={commitEdit}
            onKeyDown={e => {
              if (e.key === 'Enter') commitEdit();
              if (e.key === 'Escape') setEditing(false);
            }}
            className="flex-1 bg-transparent text-sm outline-none"
            style={{ color: '#f1f5f9' }}
          />
        ) : (
          <span
            className="flex-1 text-sm truncate cursor-pointer"
            style={{
              color: task.completed
                ? 'rgba(255,255,255,0.3)'
                : isCurrent
                  ? '#f1f5f9'
                  : 'rgba(255,255,255,0.7)',
              textDecoration: task.completed ? 'line-through' : 'none',
            }}
            onDoubleClick={() => {
              if (!task.completed) {
                setDraft({ title: task.title, duration: task.duration });
                setEditing(true);
              }
            }}
          >
            {task.title}
          </span>
        )}

        {/* Duration / edit */}
        {editing ? (
          <div className="flex items-center gap-1 flex-shrink-0">
            <input
              type="number"
              min={1}
              max={480}
              value={draft.duration}
              onChange={e =>
                setDraft(d => ({ ...d, duration: Number(e.target.value) }))
              }
              onBlur={commitEdit}
              className="w-10 text-xs text-right bg-transparent outline-none"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            />
            <span className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
              m
            </span>
          </div>
        ) : (
          <span
            className="text-xs flex-shrink-0"
            style={{ color: isCurrent ? 'rgba(248,113,113,0.6)' : 'rgba(255,255,255,0.25)' }}
          >
            {formatMinutes(task.duration)}
          </span>
        )}

        {/* Action buttons (on hover, not when editing) */}
        {!editing && hovered && !task.completed && (
          <div className="flex items-center gap-0.5 flex-shrink-0">
            <button
              onClick={e => {
                e.stopPropagation();
                setDraft({ title: task.title, duration: task.duration });
                setEditing(true);
              }}
              className="p-1 rounded transition-colors cursor-pointer"
              style={{ color: 'rgba(255,255,255,0.2)' }}
              onMouseEnter={e =>
                ((e.currentTarget as HTMLButtonElement).style.color = '#f87171')
              }
              onMouseLeave={e =>
                ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.2)')
              }
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={e => {
                e.stopPropagation();
                onRemove();
              }}
              className="p-1 rounded transition-colors cursor-pointer"
              style={{ color: 'rgba(255,255,255,0.2)' }}
              onMouseEnter={e =>
                ((e.currentTarget as HTMLButtonElement).style.color = '#f87171')
              }
              onMouseLeave={e =>
                ((e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.2)')
              }
            >
              <Trash2 size={13} />
            </button>
          </div>
        )}
      </div>

      {/* Pomodoro time-spent progress bar */}
      {pomodoroEnabled && task.timeSpent > 0 && !task.completed && (
        <div
          className="absolute bottom-0 left-3 right-3 h-[2px] rounded-full overflow-hidden"
          style={{ background: 'rgba(255,255,255,0.06)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${progressPct}%`,
              background: '#f87171',
            }}
          />
        </div>
      )}

      {/* Current indicator */}
      {isCurrent && (
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-4/5 rounded-full"
          style={{ background: '#f87171' }}
        />
      )}
    </div>
  );
}
