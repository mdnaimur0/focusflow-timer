import { CircularTimer } from "./components/CircularTimer.1";
import { Header } from "./components/Header";
import { PomodoroDots } from "./components/PomodoroDots";
import { SessionBadge } from "./components/SessionBadge";
import { SettingsDrawer } from "./components/SettingsDrawer";
import { TaskPanel } from "./components/TaskPanel";
import { TimerControls } from "./components/TimerControls";
import { TimerProvider, useTimer } from "./context/TimerContext";

// ─── Inner app (needs context) ────────────────────────────────────────────────

function TimerApp() {
  const {
    mode,
    status,
    sessionType,
    timeLeft,
    totalTime,
    tasks,
    currentTaskIndex,
    pomodoroCount,
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
    updateSettings,
    setIsSettingsOpen,
  } = useTimer();

  const currentTask = mode === "task" ? tasks[currentTaskIndex] : undefined;
  const canStart =
    mode === "task" ? tasks.filter((t) => !t.completed).length > 0 : true;

  return (
    /*
     * h-screen + overflow-hidden → outer div is exactly the viewport height,
     * preventing the whole page from scrolling.
     */
    <div
      className="flex flex-col overflow-hidden"
      style={{ height: "100dvh", background: "#0c0c14", color: "#f1f5f9" }}
    >
      {/* ── Header (fixed height) ──────────────────────────────────────── */}
      <Header
        mode={mode}
        onModeChange={setMode}
        onSettingsOpen={() => setIsSettingsOpen(true)}
      />

      {/*
       * ── Main content ─────────────────────────────────────────────────
       * flex-1 + min-h-0 → fills remaining viewport height and CAN shrink.
       * overflow-y-auto   → scroll only this area when content overflows.
       * justify-center    → vertically centre the content in Taskless mode.
       * justify-start     → stack from top in Task mode (has task list).
       */}
      <main
        className={`flex-1 min-h-0 flex flex-col items-center overflow-y-auto px-5 ${
          mode === "taskless"
            ? "justify-center py-8"
            : "justify-start pt-6 pb-10"
        }`}
      >
        {/* ── Timer block (always visible) ───────────────────────────── */}
        <div className="w-full max-w-sm flex flex-col items-center gap-5">
          {/* Session type badge */}
          <SessionBadge
            sessionType={sessionType}
            status={status}
            pomodoroEnabled={settings.pomodoroEnabled}
          />

          {/* Circular progress ring */}
          <CircularTimer
            timeLeft={timeLeft}
            totalTime={totalTime}
            sessionType={sessionType}
            status={status}
            currentTaskTitle={currentTask?.title}
          />

          {/* Pomodoro session dots */}
          {settings.pomodoroEnabled && (
            <PomodoroDots
              count={settings.pomodoroConfig.sessionsBeforeLongBreak}
              completed={pomodoroCount}
              sessionType={sessionType}
              status={status}
            />
          )}

          {/* Play / Pause / Reset / Skip controls */}
          <TimerControls
            status={status}
            sessionType={sessionType}
            pomodoroEnabled={settings.pomodoroEnabled}
            onStart={start}
            onPause={pause}
            onReset={reset}
            onSkip={skip}
            canStart={canStart}
          />

          {/* Keyboard hint — only shown while idle */}
          {status === "idle" && (
            <div
              className="flex items-center gap-3 text-xs"
              style={{ color: "rgba(255,255,255,0.2)" }}
            >
              <Kbd>Space</Kbd>
              <span>start</span>
              <Kbd>R</Kbd>
              <span>reset</span>
              {settings.pomodoroEnabled && (
                <>
                  <Kbd>S</Kbd>
                  <span>skip</span>
                </>
              )}
            </div>
          )}
        </div>

        {/* ── Task panel (Task mode only) ─────────────────────────────── */}
        {mode === "task" && (
          <div className="w-full max-w-sm mt-6 flex flex-col gap-3">
            {/* No-tasks hint */}
            {tasks.length === 0 && status === "idle" && (
              <p
                className="text-xs text-center"
                style={{ color: "rgba(255,255,255,0.25)" }}
              >
                Add a task below to start the timer.
              </p>
            )}

            {/* Divider */}
            <div
              className="w-full"
              style={{ height: 1, background: "rgba(255,255,255,0.07)" }}
            />

            <TaskPanel
              tasks={tasks}
              currentTaskIndex={currentTaskIndex}
              pomodoroEnabled={settings.pomodoroEnabled}
              onAddTask={addTask}
              onRemoveTask={removeTask}
              onToggleComplete={toggleTaskComplete}
              onUpdateTask={updateTask}
            />
          </div>
        )}
      </main>

      {/* ── Settings drawer ────────────────────────────────────────────── */}
      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdate={updateSettings}
      />

      {/* ── Toast notifications (portal-like, fixed) ───────────────────── */}
      <div
        className="fixed bottom-6 left-1/2 flex flex-col gap-2 pointer-events-none z-50"
        style={{ transform: "translateX(-50%)" }}
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap"
            style={{
              background: "rgba(18,18,28,0.95)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "#f1f5f9",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
              animation: "slideUp 0.3s ease",
            }}
          >
            <span>{t.emoji}</span>
            <span>{t.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Keyboard badge helper ─────────────────────────────────────────────────────

function Kbd({ children }: { children: React.ReactNode }) {
  return (
    <kbd
      className="px-1.5 py-0.5 rounded"
      style={{
        background: "rgba(255,255,255,0.07)",
        border: "1px solid rgba(255,255,255,0.1)",
        color: "rgba(255,255,255,0.35)",
        fontFamily: "monospace",
        fontSize: 11,
      }}
    >
      {children}
    </kbd>
  );
}

// ─── Root export ──────────────────────────────────────────────────────────────

export default function App() {
  return (
    <TimerProvider>
      <TimerApp />
    </TimerProvider>
  );
}
