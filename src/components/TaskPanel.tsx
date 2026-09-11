import { Plus, X } from "lucide-react";
import { useRef, useState } from "react";
import type { Task } from "../types";
import { TaskItem } from "./TaskItem";

interface TaskPanelProps {
  tasks: Task[];
  currentTaskIndex: number;
  pomodoroEnabled: boolean;
  onAddTask: (title: string, duration: number) => void;
  onRemoveTask: (id: string) => void;
  onToggleComplete: (id: string) => void;
  onUpdateTask: (
    id: string,
    updates: Partial<Pick<Task, "title" | "duration">>,
  ) => void;
}

export function TaskPanel({
  tasks,
  currentTaskIndex,
  pomodoroEnabled,
  onAddTask,
  onRemoveTask,
  onToggleComplete,
  onUpdateTask,
}: TaskPanelProps) {
  const [adding, setAdding] = useState(false);
  const [title, setTitle] = useState("");
  const [duration, setDuration] = useState(25);
  const titleRef = useRef<HTMLInputElement>(null);

  const openAdd = () => {
    setAdding(true);
    setTitle("");
    setDuration(25);
    setTimeout(() => titleRef.current?.focus(), 50);
  };

  const commit = () => {
    if (title.trim()) {
      onAddTask(title.trim(), Math.max(1, duration));
    }
    setAdding(false);
  };

  const completedCount = tasks.filter((t) => t.completed).length;
  const totalCount = tasks.length;

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Panel header */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: "rgba(255,255,255,0.3)" }}
          >
            Tasks
          </span>
          {totalCount > 0 && (
            <span
              className="text-xs px-1.5 py-0.5 rounded-full"
              style={{
                background: "rgba(255,255,255,0.07)",
                color: "rgba(255,255,255,0.4)",
              }}
            >
              {completedCount}/{totalCount}
            </span>
          )}
        </div>
        <button
          onClick={openAdd}
          className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-lg transition-all cursor-pointer"
          style={{
            color: "rgba(255,255,255,0.4)",
            background: "rgba(255,255,255,0.05)",
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color = "#f87171";
            (e.currentTarget as HTMLButtonElement).style.background =
              "rgba(248,113,113,0.1)";
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.color =
              "rgba(255,255,255,0.4)";
            (e.currentTarget as HTMLButtonElement).style.background =
              "rgba(255,255,255,0.05)";
          }}
        >
          <Plus size={13} />
          Add task
        </button>
      </div>

      {/* Add task form */}
      {adding && (
        <div
          className="rounded-xl p-3 border"
          style={{
            background: "rgba(255,255,255,0.04)",
            borderColor: "rgba(248,113,113,0.25)",
          }}
        >
          <input
            ref={titleRef}
            type="text"
            placeholder="What are you working on?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") commit();
              if (e.key === "Escape") setAdding(false);
            }}
            className="w-full bg-transparent text-sm outline-none placeholder-white/20"
            style={{ color: "#f1f5f9" }}
          />
          <div className="flex items-center justify-between mt-2.5">
            {/* Duration picker */}
            <div className="flex items-center gap-2">
              <span
                className="text-xs"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                Duration
              </span>
              <div
                className="flex items-center rounded-lg px-2 py-1 gap-2"
                style={{ background: "rgba(255,255,255,0.06)" }}
              >
                <button
                  onClick={() => setDuration((d) => Math.max(1, d - 5))}
                  className="text-xs cursor-pointer"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  −
                </button>
                <input
                  type="number"
                  min={1}
                  max={480}
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-8 text-center text-xs bg-transparent outline-none"
                  style={{ color: "#f1f5f9" }}
                />
                <button
                  onClick={() => setDuration((d) => Math.min(480, d + 5))}
                  className="text-xs cursor-pointer"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                >
                  +
                </button>
              </div>
              <span
                className="text-xs"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                min
              </span>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => setAdding(false)}
                className="p-1 cursor-pointer"
                style={{ color: "rgba(255,255,255,0.3)" }}
              >
                <X size={14} />
              </button>
              <button
                onClick={commit}
                className="px-3 py-1 rounded-lg text-xs font-medium cursor-pointer transition-all"
                style={{ background: "#ef4444", color: "#fff" }}
                onMouseEnter={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.background =
                    "#f87171")
                }
                onMouseLeave={(e) =>
                  ((e.currentTarget as HTMLButtonElement).style.background =
                    "#ef4444")
                }
              >
                Add
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task list */}
      {tasks.length === 0 && !adding ? (
        <div className="text-center py-6">
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.2)" }}>
            No tasks yet.
          </p>
          <p
            className="text-xs mt-1"
            style={{ color: "rgba(255,255,255,0.12)" }}
          >
            Add a task to get started.
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-0.5 max-h-52 overflow-y-auto pr-1">
          {tasks.map((task, idx) => (
            <TaskItem
              key={task.id}
              task={task}
              isCurrent={idx === currentTaskIndex}
              pomodoroEnabled={pomodoroEnabled}
              onRemove={() => onRemoveTask(task.id)}
              onToggleComplete={() => onToggleComplete(task.id)}
              onUpdate={(updates) => onUpdateTask(task.id, updates)}
            />
          ))}
        </div>
      )}

      {/* Keyboard tip */}
      {tasks.length > 0 && (
        <p
          className="text-center text-xs"
          style={{ color: "rgba(255,255,255,0.12)" }}
        >
          Double-click or click the pencil to edit
        </p>
      )}
    </div>
  );
}
