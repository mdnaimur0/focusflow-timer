import { formatTime } from "../utils/time";
import {
  type CircularTimerProps,
  CIRCUMFERENCE,
  SESSION_COLORS,
  SESSION_GLOW,
  SIZE,
  CENTER,
  RADIUS,
} from "./CircularTimer";

export function CircularTimer({
  timeLeft,
  totalTime,
  sessionType,
  status,
  currentTaskTitle,
}: CircularTimerProps) {
  const progress = totalTime > 0 ? timeLeft / totalTime : 1;
  const offset = CIRCUMFERENCE * (1 - progress);
  const color = SESSION_COLORS[sessionType];
  const isRunning = status === "running";
  const glow = SESSION_GLOW[sessionType];

  return (
    <div className="relative shrink-0" style={{ width: SIZE, height: SIZE }}>
      {/* Glow background when running */}
      {isRunning && (
        <div
          className="absolute inset-0 rounded-full transition-opacity duration-700"
          style={{
            background: `radial-gradient(circle, ${glow} 0%, transparent 70%)`,
            opacity: 0.6,
          }}
        />
      )}

      {/* SVG Ring — rotated so arc starts at top */}
      <svg
        viewBox={`0 0 ${SIZE} ${SIZE}`}
        width={SIZE}
        height={SIZE}
        style={{
          transform: "rotate(-90deg)",
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
        }}
      >
        {/* Background track */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke="rgba(255,255,255,0.06)"
          strokeWidth={10}
        />
        {/* Progress arc */}
        <circle
          cx={CENTER}
          cy={CENTER}
          r={RADIUS}
          fill="none"
          stroke={color}
          strokeWidth={10}
          strokeLinecap="round"
          strokeDasharray={CIRCUMFERENCE}
          strokeDashoffset={offset}
          style={{
            transition: "stroke-dashoffset 1s linear, stroke 0.6s ease",
            filter: isRunning ? `drop-shadow(0 0 8px ${color})` : "none",
          }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center select-none">
        {/* Time display */}
        <span
          className="font-light tabular-nums transition-colors duration-500"
          style={{
            fontSize: 62,
            letterSpacing: "-3px",
            lineHeight: 1,
            color: status === "idle" ? "rgba(255,255,255,0.35)" : "#f1f5f9",
            fontFamily:
              '"SF Mono", "Fira Code", ui-monospace, Consolas, monospace',
          }}
        >
          {formatTime(timeLeft)}
        </span>

        {/* Finished label */}
        {status === "finished" && (
          <span
            className="mt-2 text-xs font-medium"
            style={{ color: "#f87171" }}
          >
            SESSION COMPLETE
          </span>
        )}

        {/* Current task name (task mode, non-finished) */}
        {status !== "finished" && currentTaskTitle && (
          <span
            className="mt-2 text-xs max-w-[160px] text-center truncate"
            style={{ color: "rgba(255,255,255,0.35)" }}
          >
            {currentTaskTitle}
          </span>
        )}

        {/* Idle hint */}
        {status === "idle" && !currentTaskTitle && (
          <span
            className="mt-1 text-xs"
            style={{ color: "rgba(255,255,255,0.2)" }}
          >
            press space to start
          </span>
        )}
      </div>
    </div>
  );
}
