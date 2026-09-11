import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import type {
  AppMode,
  PomodoroConfig,
  SessionType,
  Settings,
  SettingsUpdate,
  Task,
  TimerStatus,
  ToastMessage,
} from "../types";
import { playTone } from "../utils/sound";
import {
  loadSettings,
  saveSettings,
  loadTasks,
  saveTasks,
} from "../utils/storage";
import { formatTime } from "../utils/time";

// ─── Defaults ────────────────────────────────────────────────────────────────

const DEFAULT_POMODORO: PomodoroConfig = {
  sessionLength: 25,
  shortBreakLength: 5,
  longBreakLength: 15,
  sessionsBeforeLongBreak: 4,
};

const DEFAULT_SETTINGS: Settings = {
  pomodoroEnabled: false,
  pomodoroConfig: DEFAULT_POMODORO,
  autoAdvanceTask: true,
  soundEnabled: true,
  notificationsEnabled: false,
  tasklessDefaultDuration: 25,
  selectedTone: "gentle-chime",
  customToneName: "",
  customToneData: "",
  volume: 80,
};

// ─── Helper ──────────────────────────────────────────────────────────────────

/** Computes the initial segment time (seconds) for a fresh focus session. */
function calcFocusTime(
  mode: AppMode,
  settings: Settings,
  tasks: Task[],
  taskIdx: number,
): number {
  if (settings.pomodoroEnabled)
    return settings.pomodoroConfig.sessionLength * 60;
  if (mode === "task" && tasks[taskIdx]) return tasks[taskIdx].duration * 60;
  return settings.tasklessDefaultDuration * 60;
}

// ─── Context type ─────────────────────────────────────────────────────────────

interface TimerContextType {
  // ── state
  mode: AppMode;
  status: TimerStatus;
  sessionType: SessionType;
  /** Seconds left in the CURRENT segment (focus or break). */
  timeLeft: number;
  /** Total seconds for the current segment (used to compute ring progress). */
  totalTime: number;
  tasks: Task[];
  currentTaskIndex: number;
  /** How many focus sessions completed since the last long break (0-based). */
  pomodoroCount: number;
  totalPomodorosCompleted: number;
  settings: Settings;
  isSettingsOpen: boolean;
  toasts: ToastMessage[];
  // ── actions
  setMode: (m: AppMode) => void;
  start: () => void;
  pause: () => void;
  reset: () => void;
  skip: () => void;
  addTask: (title: string, duration: number) => void;
  removeTask: (id: string) => void;
  updateTask: (
    id: string,
    updates: Partial<Pick<Task, "title" | "duration">>,
  ) => void;
  toggleTaskComplete: (id: string) => void;
  reorderTasks: (from: number, to: number) => void;
  updateSettings: (updates: SettingsUpdate) => void;
  setIsSettingsOpen: (v: boolean) => void;
}

const TimerContext = createContext<TimerContextType | null>(null);

export function useTimer(): TimerContextType {
  const ctx = useContext(TimerContext);
  if (!ctx) throw new Error("useTimer must be used inside <TimerProvider>");
  return ctx;
}

// ─── Provider ────────────────────────────────────────────────────────────────

export function TimerProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettingsRaw] = useState<Settings>(() =>
    loadSettings(DEFAULT_SETTINGS),
  );
  const [tasks, setTasksRaw] = useState<Task[]>(() => loadTasks());

  const [mode, setModeRaw] = useState<AppMode>("taskless");
  const [status, setStatus] = useState<TimerStatus>("idle");
  const [sessionType, setSessionType] = useState<SessionType>("focus");
  const [timeLeft, setTimeLeft] = useState<number>(() =>
    calcFocusTime("taskless", loadSettings(DEFAULT_SETTINGS), [], 0),
  );
  const [totalTime, setTotalTime] = useState<number>(() =>
    calcFocusTime("taskless", loadSettings(DEFAULT_SETTINGS), [], 0),
  );
  const [currentTaskIndex, setCurrentTaskIndex] = useState(0);
  const [pomodoroCount, setPomodoroCount] = useState(0);
  const [totalPomodorosCompleted, setTotalPomodorosCompleted] = useState(0);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  // ── Toast helper ─────────────────────────────────────────────────────────

  const pushToast = useCallback((emoji: string, message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, emoji, message }]);
    setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.id !== id)),
      3500,
    );
  }, []);

  // ── Browser notification helper ───────────────────────────────────────────

  const notify = useCallback(
    (title: string, body: string) => {
      if (
        settings.notificationsEnabled &&
        Notification.permission === "granted"
      ) {
        new Notification(title, { body });
      }
    },
    [settings.notificationsEnabled],
  );

  // ── handleSessionEnd (the state machine heart) ────────────────────────────
  //    Called inside the timer effect when timeLeft hits 0.
  //    All values it reads come from the closure — the effect re-runs every
  //    second so the closure is always fresh.

  const handleSessionEnd = useCallback(() => {
    const { pomodoroEnabled, pomodoroConfig, autoAdvanceTask, soundEnabled } =
      settings;

    // ── Play sound ─────────────────────────────────────────────────────────
    if (soundEnabled) {
      playTone(settings.selectedTone, settings);
    }

    // ══ POMODORO MODE ══════════════════════════════════════════════════════
    if (pomodoroEnabled) {
      if (sessionType === "focus") {
        // Focus session ended → start a break
        const nextCount = pomodoroCount + 1;
        const isLongBreak =
          nextCount % pomodoroConfig.sessionsBeforeLongBreak === 0;

        setPomodoroCount(isLongBreak ? 0 : nextCount);
        setTotalPomodorosCompleted((n) => n + 1);

        // In task+pomodoro mode: accumulate time spent on current task
        if (mode === "task") {
          const sessionSecs = pomodoroConfig.sessionLength * 60;
          setTasksRaw((prev) => {
            const updated = [...prev];
            const t = updated[currentTaskIndex];
            if (t) {
              const newSpent = t.timeSpent + sessionSecs;
              updated[currentTaskIndex] = {
                ...t,
                timeSpent: newSpent,
                completed: newSpent >= t.duration * 60,
              };
              saveTasks(updated);
            }
            return updated;
          });
        }

        // Transition → break
        const breakLen = isLongBreak
          ? pomodoroConfig.longBreakLength
          : pomodoroConfig.shortBreakLength;
        const bType: SessionType = isLongBreak ? "longBreak" : "shortBreak";
        const breakSecs = breakLen * 60;

        setSessionType(bType);
        setTimeLeft(breakSecs);
        setTotalTime(breakSecs);
        setStatus("running");

        if (isLongBreak) {
          pushToast("🌟", "Long break — well deserved!");
          notify("🌟 Long Break!", "Great work. Take a 15-minute break.");
        } else {
          pushToast("☕", "Short break — breathe!");
          notify("☕ Break Time!", "Nice session. Take a 5-minute breather.");
        }
      } else {
        // Break ended → start new focus session
        // (In task+pomodoro, check if current task is done and advance)
        let nextTaskIndex = currentTaskIndex;

        if (mode === "task") {
          setTasksRaw((currentTasks) => {
            const cur = currentTasks[currentTaskIndex];
            if (cur?.completed && autoAdvanceTask) {
              const nxt = currentTasks.findIndex(
                (t, i) => i > currentTaskIndex && !t.completed,
              );
              if (nxt !== -1) {
                nextTaskIndex = nxt;
                setCurrentTaskIndex(nxt);
              } else {
                // All tasks done
                setStatus("finished");
                pushToast("🎉", "All tasks complete!");
                notify("🎉 All Done!", "You finished every task!");
                return currentTasks;
              }
            }
            return currentTasks;
          });
        }

        void nextTaskIndex; // suppress lint warning (used via closure mutation above)

        setSessionType("focus");
        const focusSecs = pomodoroConfig.sessionLength * 60;
        setTimeLeft(focusSecs);
        setTotalTime(focusSecs);
        setStatus("running");

        pushToast("🎯", "Focus time — let's go!");
        notify("🎯 Focus!", "Break over. Time to concentrate.");
      }
    } else {
      // ══ NORMAL MODE ════════════════════════════════════════════════════════
      if (mode === "task" && tasks.length > 0) {
        // Mark current task complete, then optionally advance
        setTasksRaw((prev) => {
          const updated = [...prev];
          const cur = updated[currentTaskIndex];
          if (cur && !cur.completed) {
            updated[currentTaskIndex] = { ...cur, completed: true };
          }

          if (autoAdvanceTask) {
            const nextIdx = updated.findIndex(
              (t, i) => i > currentTaskIndex && !t.completed,
            );
            if (nextIdx !== -1) {
              setCurrentTaskIndex(nextIdx);
              const nextSecs = updated[nextIdx].duration * 60;
              setTimeLeft(nextSecs);
              setTotalTime(nextSecs);
              setStatus("running");
              pushToast("⏭", `Next: ${updated[nextIdx].title}`);
            } else {
              setStatus("finished");
              pushToast("🎉", "All tasks complete!");
              notify("🎉 All Done!", "All tasks are finished!");
            }
          } else {
            setStatus("finished");
            pushToast("✅", `${cur?.title ?? "Task"} complete!`);
          }

          saveTasks(updated);
          return updated;
        });
      } else {
        // Taskless normal mode
        setStatus("finished");
        pushToast("⏰", "Time's up!");
        notify("⏰ Done!", "Your timer has ended.");
      }
    }
  }, [
    settings,
    sessionType,
    pomodoroCount,
    mode,
    tasks,
    currentTaskIndex,
    pushToast,
    notify,
  ]);

  // ── Timer tick (timeout chain for fresh closures) ─────────────────────────

  useEffect(() => {
    if (status !== "running") return;

    if (timeLeft <= 0) {
      handleSessionEnd();
      return;
    }

    const id = setTimeout(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearTimeout(id);
  }, [status, timeLeft, handleSessionEnd]);

  // ── Document title ────────────────────────────────────────────────────────

  useEffect(() => {
    if (status === "running") {
      const icon = sessionType === "focus" ? "🎯" : "☕";
      document.title = `${formatTime(timeLeft)} ${icon} — FocusFlow`;
    } else if (status === "finished") {
      document.title = "✅ Done — FocusFlow";
    } else {
      document.title = "FocusFlow";
    }
  }, [timeLeft, status, sessionType]);

  // ── Update idle preview when relevant settings/mode change ───────────────

  useEffect(() => {
    if (status !== "idle") return;
    const t = calcFocusTime(mode, settings, tasks, currentTaskIndex);
    setTimeLeft(t);
    setTotalTime(t);
  }, [
    status,
    mode,
    settings.pomodoroEnabled,
    settings.pomodoroConfig.sessionLength,
    settings.tasklessDefaultDuration,
    // tasks[currentTaskIndex]?.duration — can't use this directly; approximate:
    currentTaskIndex,
    tasks,
  ]);

  // ── Keyboard shortcuts ────────────────────────────────────────────────────

  const start = useCallback(() => {
    if (status === "paused") {
      setStatus("running");
      return;
    }
    if (mode === "task" && tasks.length === 0) return;

    // Determine start index
    let startIdx = 0;
    if (mode === "task") {
      if (status === "finished" && tasks.every((t) => t.completed)) {
        // All done → full reset
        setTasksRaw((prev) => {
          const r = prev.map((t) => ({ ...t, completed: false, timeSpent: 0 }));
          saveTasks(r);
          return r;
        });
        startIdx = 0;
      } else if (status === "finished") {
        startIdx = tasks.findIndex((t) => !t.completed);
        if (startIdx === -1) startIdx = 0;
      } else {
        startIdx = currentTaskIndex;
      }
    }

    setCurrentTaskIndex(startIdx);
    setPomodoroCount(0);
    setSessionType("focus");

    // Compute fresh time using the latest tasks (functional update isn't possible here
    // since we need the value; use the state directly — it's fresh in this callback)
    const t = calcFocusTime(mode, settings, tasks, startIdx);
    setTimeLeft(t);
    setTotalTime(t);
    setStatus("running");
  }, [status, mode, tasks, currentTaskIndex, settings]);

  const pause = useCallback(() => {
    if (status === "running") setStatus("paused");
  }, [status]);

  const reset = useCallback(() => {
    setStatus("idle");
    setSessionType("focus");
    setPomodoroCount(0);

    // Move back to first incomplete task in task mode
    if (mode === "task") {
      const firstIncomplete = tasks.findIndex((t) => !t.completed);
      const idx = firstIncomplete !== -1 ? firstIncomplete : 0;
      setCurrentTaskIndex(idx);
    } else {
      setCurrentTaskIndex(0);
    }
    // timeLeft will be updated by the idle-preview effect
  }, [mode, tasks]);

  const skip = useCallback(() => {
    if (!settings.pomodoroEnabled) return;

    if (sessionType === "focus") {
      const nextCount = pomodoroCount + 1;
      const isLong =
        nextCount % settings.pomodoroConfig.sessionsBeforeLongBreak === 0;
      setPomodoroCount(isLong ? 0 : nextCount);
      const bType: SessionType = isLong ? "longBreak" : "shortBreak";
      const bLen =
        (isLong
          ? settings.pomodoroConfig.longBreakLength
          : settings.pomodoroConfig.shortBreakLength) * 60;
      setSessionType(bType);
      setTimeLeft(bLen);
      setTotalTime(bLen);
      if (status !== "running") setStatus("running");
    } else {
      setSessionType("focus");
      const fLen = settings.pomodoroConfig.sessionLength * 60;
      setTimeLeft(fLen);
      setTotalTime(fLen);
      if (status !== "running") setStatus("running");
    }
  }, [settings, sessionType, pomodoroCount, status]);

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement).tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.key === " ") {
        e.preventDefault();
        status === "running" ? pause() : start();
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        reset();
      } else if ((e.key === "s" || e.key === "S") && settings.pomodoroEnabled) {
        e.preventDefault();
        skip();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [status, start, pause, reset, skip, settings.pomodoroEnabled]);

  // ── Task CRUD ─────────────────────────────────────────────────────────────

  const addTask = useCallback((title: string, duration: number) => {
    const task: Task = {
      id: crypto.randomUUID(),
      title,
      duration,
      completed: false,
      timeSpent: 0,
    };
    setTasksRaw((prev) => {
      const updated = [...prev, task];
      saveTasks(updated);
      return updated;
    });
  }, []);

  const removeTask = useCallback((id: string) => {
    setTasksRaw((prev) => {
      const updated = prev.filter((t) => t.id !== id);
      saveTasks(updated);
      return updated;
    });
    setCurrentTaskIndex((idx) => Math.max(0, idx - 1));
  }, []);

  const updateTask = useCallback(
    (id: string, updates: Partial<Pick<Task, "title" | "duration">>) => {
      setTasksRaw((prev) => {
        const updated = prev.map((t) =>
          t.id === id ? { ...t, ...updates } : t,
        );
        saveTasks(updated);
        return updated;
      });
    },
    [],
  );

  const toggleTaskComplete = useCallback((id: string) => {
    setTasksRaw((prev) => {
      const updated = prev.map((t) =>
        t.id === id ? { ...t, completed: !t.completed, timeSpent: 0 } : t,
      );
      saveTasks(updated);
      return updated;
    });
  }, []);

  const reorderTasks = useCallback((from: number, to: number) => {
    setTasksRaw((prev) => {
      const updated = [...prev];
      const [item] = updated.splice(from, 1);
      updated.splice(to, 0, item);
      saveTasks(updated);
      return updated;
    });
  }, []);

  // ── Settings ──────────────────────────────────────────────────────────────

  const updateSettings = useCallback((updates: SettingsUpdate) => {
    setSettingsRaw((prev) => {
      const next: Settings = {
        ...prev,
        ...updates,
        pomodoroConfig: {
          ...prev.pomodoroConfig,
          ...(updates.pomodoroConfig ?? {}),
        },
      };
      saveSettings(next);
      return next;
    });
  }, []);

  const setMode = useCallback((m: AppMode) => {
    setModeRaw(m);
    setStatus("idle");
    setSessionType("focus");
    setPomodoroCount(0);
    setCurrentTaskIndex(0);
  }, []);

  // ── Context value ─────────────────────────────────────────────────────────

  const value: TimerContextType = {
    mode,
    status,
    sessionType,
    timeLeft,
    totalTime,
    tasks,
    currentTaskIndex,
    pomodoroCount,
    totalPomodorosCompleted,
    settings,
    isSettingsOpen,
    toasts,
    setMode,
    start,
    pause,
    reset,
    skip,
    addTask,
    removeTask,
    updateTask,
    toggleTaskComplete,
    reorderTasks,
    updateSettings,
    setIsSettingsOpen,
  };

  return (
    <TimerContext.Provider value={value}>{children}</TimerContext.Provider>
  );
}
