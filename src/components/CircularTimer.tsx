import type { SessionType, TimerStatus } from "../types";

// SVG geometry constants
export const SIZE = 280;
export const CENTER = SIZE / 2;
export const RADIUS = 118;
export const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export const SESSION_COLORS: Record<SessionType, string> = {
  focus: "#f87171",
  shortBreak: "#34d399",
  longBreak: "#a78bfa",
};

export const SESSION_GLOW: Record<SessionType, string> = {
  focus: "rgba(248,113,113,0.35)",
  shortBreak: "rgba(52,211,153,0.35)",
  longBreak: "rgba(167,139,250,0.35)",
};

export interface CircularTimerProps {
  timeLeft: number;
  totalTime: number;
  sessionType: SessionType;
  status: TimerStatus;
  currentTaskTitle?: string;
}
