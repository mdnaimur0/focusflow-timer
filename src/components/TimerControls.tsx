import { Pause, Play, RotateCcw, SkipForward } from 'lucide-react';
import type { SessionType, TimerStatus } from '../types';

const SESSION_BG: Record<SessionType, string> = {
  focus: '#ef4444',
  shortBreak: '#10b981',
  longBreak: '#8b5cf6',
};

const SESSION_HOVER: Record<SessionType, string> = {
  focus: '#f87171',
  shortBreak: '#34d399',
  longBreak: '#a78bfa',
};

interface TimerControlsProps {
  status: TimerStatus;
  sessionType: SessionType;
  pomodoroEnabled: boolean;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onSkip: () => void;
  canStart?: boolean;
}

export function TimerControls({
  status,
  sessionType,
  pomodoroEnabled,
  onStart,
  onPause,
  onReset,
  onSkip,
  canStart = true,
}: TimerControlsProps) {
  const isRunning = status === 'running';
  const isFinished = status === 'finished';
  const accentBg = SESSION_BG[sessionType];
  const accentHover = SESSION_HOVER[sessionType];

  const startLabel = isFinished ? 'Start Over' : status === 'paused' ? 'Resume' : 'Start';

  return (
    <div className="flex items-center gap-3">
      {/* Reset button */}
      <IconBtn
        onClick={onReset}
        title="Reset (R)"
        disabled={status === 'idle'}
      >
        <RotateCcw size={16} />
      </IconBtn>

      {/* Main Start / Pause button */}
      <button
        onClick={isRunning ? onPause : onStart}
        disabled={!canStart && !isRunning}
        className="flex items-center gap-2 px-7 py-3 rounded-full font-medium text-sm text-white transition-all duration-200 active:scale-95 cursor-pointer"
        style={{
          background: accentBg,
          boxShadow: `0 0 20px ${accentBg}55`,
          minWidth: 130,
          justifyContent: 'center',
          opacity: !canStart && !isRunning ? 0.4 : 1,
        }}
        onMouseEnter={e => {
          if (canStart || isRunning)
            (e.currentTarget as HTMLButtonElement).style.background = accentHover;
        }}
        onMouseLeave={e => {
          (e.currentTarget as HTMLButtonElement).style.background = accentBg;
        }}
      >
        {isRunning ? (
          <>
            <Pause size={16} /> Pause
          </>
        ) : (
          <>
            <Play size={16} /> {startLabel}
          </>
        )}
      </button>

      {/* Skip button (only when pomodoro enabled) */}
      {pomodoroEnabled ? (
        <IconBtn onClick={onSkip} title="Skip session (S)">
          <SkipForward size={16} />
        </IconBtn>
      ) : (
        /* placeholder so layout stays centred */
        <div className="w-10" />
      )}
    </div>
  );
}

// ── Icon button helper ──────────────────────────────────────────────────────

function IconBtn({
  children,
  onClick,
  title,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  title?: string;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      title={title}
      className="w-10 h-10 rounded-full flex items-center justify-center transition-all duration-150 cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed"
      style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.6)' }}
      onMouseEnter={e => {
        if (!disabled) {
          (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.13)';
          (e.currentTarget as HTMLButtonElement).style.color = '#fff';
        }
      }}
      onMouseLeave={e => {
        (e.currentTarget as HTMLButtonElement).style.background = 'rgba(255,255,255,0.07)';
        (e.currentTarget as HTMLButtonElement).style.color = 'rgba(255,255,255,0.6)';
      }}
    >
      {children}
    </button>
  );
}
