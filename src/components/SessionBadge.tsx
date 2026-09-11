import type { SessionType, TimerStatus } from "../types";

const SESSION_META: Record<
  SessionType,
  { label: string; emoji: string; color: string; bg: string; border: string }
> = {
  focus: {
    label: "Focus Session",
    emoji: "🎯",
    color: "#f87171",
    bg: "rgba(248,113,113,0.10)",
    border: "rgba(248,113,113,0.20)",
  },
  shortBreak: {
    label: "Short Break",
    emoji: "☕",
    color: "#34d399",
    bg: "rgba(52,211,153,0.10)",
    border: "rgba(52,211,153,0.20)",
  },
  longBreak: {
    label: "Long Break",
    emoji: "🌟",
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.10)",
    border: "rgba(167,139,250,0.20)",
  },
};

interface SessionBadgeProps {
  sessionType: SessionType;
  status: TimerStatus;
  pomodoroEnabled: boolean;
}

export function SessionBadge({
  sessionType,
  status,
  pomodoroEnabled,
}: SessionBadgeProps) {
  const meta = SESSION_META[sessionType];

  // Only show the badge when pomodoro is active or the timer is in a non-idle state
  if (!pomodoroEnabled && status === "idle") return null;

  return (
    <div
      className="flex items-center gap-2 px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-300"
      style={{
        color: meta.color,
        background: meta.bg,
        borderColor: meta.border,
      }}
    >
      <span>{meta.emoji}</span>
      <span>{meta.label}</span>
      {status === "running" && (
        <span
          className="w-1.5 h-1.5 rounded-full animate-pulse"
          style={{ background: meta.color }}
        />
      )}
    </div>
  );
}
