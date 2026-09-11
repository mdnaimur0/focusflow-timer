import type { SessionType, TimerStatus } from '../types';

interface PomodoroDotsProps {
  count: number;          // sessionsBeforeLongBreak
  completed: number;      // pomodoroCount (filled slots)
  sessionType: SessionType;
  status: TimerStatus;
}

export function PomodoroDots({
  count,
  completed,
  sessionType,
  status,
}: PomodoroDotsProps) {
  const isFocusRunning = status === 'running' && sessionType === 'focus';

  return (
    <div className="flex items-center gap-2 h-5">
      {Array.from({ length: count }).map((_, i) => {
        const isFilled = i < completed;
        const isCurrent = i === completed && isFocusRunning;

        return (
          <span
            key={i}
            className="rounded-full transition-all duration-300"
            style={{
              width: isFilled ? 10 : isCurrent ? 10 : 8,
              height: isFilled ? 10 : isCurrent ? 10 : 8,
              background: isFilled
                ? '#f87171'
                : isCurrent
                  ? 'rgba(248,113,113,0.55)'
                  : 'rgba(255,255,255,0.12)',
              boxShadow: isFilled
                ? '0 0 6px #f87171aa'
                : isCurrent
                  ? '0 0 4px rgba(248,113,113,0.4)'
                  : 'none',
            }}
          />
        );
      })}

      {/* Small label */}
      <span className="ml-1 text-xs" style={{ color: 'rgba(255,255,255,0.25)' }}>
        {completed}/{count}
      </span>
    </div>
  );
}
