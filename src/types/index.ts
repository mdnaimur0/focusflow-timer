export type AppMode = "taskless" | "task";
export type TimerStatus = "idle" | "running" | "paused" | "finished";
export type SessionType = "focus" | "shortBreak" | "longBreak";

export type ToneCategory = "normal" | "annoying";
export type ToneId =
  | "gentle-chime"
  | "soft-bell"
  | "digital-beep"
  | "crystal-drop"
  | "alarm-clock"
  | "siren"
  | "buzzer"
  | "car-horn"
  | "nuclear-alarm"
  | "fire-alarm"
  | "custom";

export interface Task {
  id: string;
  title: string;
  duration: number; // minutes
  completed: boolean;
  timeSpent: number; // seconds (tracks accumulated focus time in pomodoro mode)
}

export interface PomodoroConfig {
  sessionLength: number; // minutes  default: 25
  shortBreakLength: number; // minutes  default: 5
  longBreakLength: number; // minutes  default: 15
  sessionsBeforeLongBreak: number; //          default: 4
}

export interface Settings {
  pomodoroEnabled: boolean;
  pomodoroConfig: PomodoroConfig;
  autoAdvanceTask: boolean;
  soundEnabled: boolean;
  notificationsEnabled: boolean;
  tasklessDefaultDuration: number; // minutes  default: 25
  selectedTone: ToneId;
  customToneName: string; // filename of uploaded tone
  customToneData: string; // base64 data URL of uploaded audio
  volume: number; // 0-100
}

export interface TonePreset {
  id: ToneId;
  name: string;
  category: ToneCategory;
  description: string;
  play: (volume: number) => void;
}

/** Partial update bag — pomodoroConfig may be partially specified. */
export interface SettingsUpdate extends Partial<
  Omit<Settings, "pomodoroConfig">
> {
  pomodoroConfig?: Partial<PomodoroConfig>;
}

export interface ToastMessage {
  id: number;
  emoji: string;
  message: string;
}
