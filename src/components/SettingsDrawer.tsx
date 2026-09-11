import {
  Bell,
  BellOff,
  Music,
  Minus,
  Plus,
  Play,
  Upload,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { useRef } from "react";
import type { Settings, SettingsUpdate, ToneId } from "../types";
import { TONE_PRESETS, playTone } from "../utils/tones";

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  settings: Settings;
  onUpdate: (updates: SettingsUpdate) => void;
}

export function SettingsDrawer({
  isOpen,
  onClose,
  settings,
  onUpdate,
}: SettingsDrawerProps) {
  const pc = settings.pomodoroConfig;

  const requestNotifications = async (enabled: boolean) => {
    if (enabled && Notification.permission === "default") {
      const perm = await Notification.requestPermission();
      if (perm !== "granted") return;
    }
    onUpdate({ notificationsEnabled: enabled });
  };

  const customFileRef = useRef<HTMLInputElement>(null);

  const handleCustomUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      onUpdate({
        selectedTone: "custom",
        customToneName: file.name,
        customToneData: reader.result as string,
      });
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40 transition-opacity duration-300"
        style={{
          background: "rgba(0,0,0,0.6)",
          backdropFilter: "blur(4px)",
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? "auto" : "none",
        }}
        onClick={onClose}
      />

      {/* Drawer panel */}
      <div
        className="fixed top-0 right-0 h-full z-50 overflow-y-auto"
        style={{
          width: 320,
          background: "#111118",
          borderLeft: "1px solid rgba(255,255,255,0.07)",
          transform: isOpen ? "translateX(0)" : "translateX(100%)",
          transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {/* Header */}
        <div
          className="sticky top-0 flex items-center justify-between px-6 py-4 border-b z-10"
          style={{
            background: "#111118",
            borderColor: "rgba(255,255,255,0.06)",
          }}
        >
          <h2 className="font-semibold text-white/90 text-sm tracking-wide">
            Settings
          </h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg transition-colors cursor-pointer"
            style={{ color: "rgba(255,255,255,0.4)" }}
            onMouseEnter={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.color = "#fff")
            }
            onMouseLeave={(e) =>
              ((e.currentTarget as HTMLButtonElement).style.color =
                "rgba(255,255,255,0.4)")
            }
          >
            <X size={16} />
          </button>
        </div>

        <div className="px-6 py-5 flex flex-col gap-7">
          {/* ── Timer ──────────────────────────────────────────────────── */}
          <Section title="Timer">
            <Row label="Default Duration" hint="Taskless normal mode">
              <NumStepper
                value={settings.tasklessDefaultDuration}
                min={1}
                max={240}
                suffix="min"
                onChange={(v) => onUpdate({ tasklessDefaultDuration: v })}
              />
            </Row>
          </Section>

          {/* ── Pomodoro ───────────────────────────────────────────────── */}
          <Section title="Pomodoro">
            <Toggle
              label="Enable Pomodoro"
              description="Work in focused sessions with scheduled breaks"
              checked={settings.pomodoroEnabled}
              onChange={(v) => onUpdate({ pomodoroEnabled: v })}
            />

            {settings.pomodoroEnabled && (
              <div
                className="flex flex-col gap-4 mt-2 pt-4 border-t"
                style={{ borderColor: "rgba(255,255,255,0.06)" }}
              >
                <Row label="Session Length">
                  <NumStepper
                    value={pc.sessionLength}
                    min={1}
                    max={120}
                    suffix="min"
                    onChange={(v) =>
                      onUpdate({ pomodoroConfig: { sessionLength: v } })
                    }
                  />
                </Row>
                <Row label="Short Break">
                  <NumStepper
                    value={pc.shortBreakLength}
                    min={1}
                    max={60}
                    suffix="min"
                    onChange={(v) =>
                      onUpdate({ pomodoroConfig: { shortBreakLength: v } })
                    }
                  />
                </Row>
                <Row label="Long Break">
                  <NumStepper
                    value={pc.longBreakLength}
                    min={1}
                    max={60}
                    suffix="min"
                    onChange={(v) =>
                      onUpdate({ pomodoroConfig: { longBreakLength: v } })
                    }
                  />
                </Row>
                <Row label="Sessions Before Long Break">
                  <NumStepper
                    value={pc.sessionsBeforeLongBreak}
                    min={1}
                    max={10}
                    suffix=""
                    onChange={(v) =>
                      onUpdate({
                        pomodoroConfig: { sessionsBeforeLongBreak: v },
                      })
                    }
                  />
                </Row>
              </div>
            )}
          </Section>

          {/* ── Tasks ──────────────────────────────────────────────────── */}
          <Section title="Tasks">
            <Toggle
              label="Auto-advance"
              description="Automatically move to the next task when the current one finishes"
              checked={settings.autoAdvanceTask}
              onChange={(v) => onUpdate({ autoAdvanceTask: v })}
            />
          </Section>

          {/* ── Notifications ──────────────────────────────────────────── */}
          <Section title="Notifications">
            <Toggle
              label="Browser notifications"
              description="Get notified even when the tab is in the background"
              checked={settings.notificationsEnabled}
              onChange={requestNotifications}
              icon={
                settings.notificationsEnabled ? (
                  <Bell size={14} />
                ) : (
                  <BellOff size={14} />
                )
              }
            />
          </Section>

          {/* ── Tone ────────────────────────────────────────────────────── */}
          <Section title="Tone">
            <Toggle
              label="Sound alerts"
              description="Play a sound when sessions begin and end"
              checked={settings.soundEnabled}
              onChange={(v) => onUpdate({ soundEnabled: v })}
              icon={
                settings.soundEnabled ? (
                  <Volume2 size={14} />
                ) : (
                  <VolumeX size={14} />
                )
              }
            />

            {settings.soundEnabled && (
              <div
                className="flex flex-col gap-3 mt-2 pt-3 border-t"
                style={{ borderColor: "rgba(255,255,255,0.06)" }}
              >
                {/* Volume slider */}
                <div className="flex items-center gap-3">
                  <span
                    className="text-sm"
                    style={{ color: "rgba(255,255,255,0.45)" }}
                  >
                    Volume
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={settings.volume}
                    onChange={(e) =>
                      onUpdate({ volume: Number(e.target.value) })
                    }
                    className="flex-1 h-1 rounded-full appearance-none cursor-pointer"
                    style={{
                      background: `linear-gradient(to right, #ef4444 0%, #ef4444 ${settings.volume}%, rgba(255,255,255,0.1) ${settings.volume}%, rgba(255,255,255,0.1) 100%)`,
                    }}
                  />
                  <span
                    className="text-xs w-8 text-right tabular-nums"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                  >
                    {settings.volume}%
                  </span>
                </div>

                {/* Normal tones */}
                <div>
                  <span
                    className="text-xs font-medium block mb-2"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                  >
                    Normal
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {TONE_PRESETS.filter((t) => t.category === "normal").map(
                      (tone) => (
                        <ToneOption
                          key={tone.id}
                          tone={tone}
                          selected={settings.selectedTone === tone.id}
                          onSelect={() =>
                            onUpdate({ selectedTone: tone.id })
                          }
                          onPreview={() =>
                            playTone(tone.id, settings)
                          }
                        />
                      ),
                    )}
                  </div>
                </div>

                {/* Annoying tones */}
                <div>
                  <span
                    className="text-xs font-medium block mb-2"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                  >
                    Annoying
                  </span>
                  <div className="flex flex-col gap-1.5">
                    {TONE_PRESETS.filter((t) => t.category === "annoying").map(
                      (tone) => (
                        <ToneOption
                          key={tone.id}
                          tone={tone}
                          selected={settings.selectedTone === tone.id}
                          onSelect={() =>
                            onUpdate({ selectedTone: tone.id })
                          }
                          onPreview={() =>
                            playTone(tone.id, settings)
                          }
                        />
                      ),
                    )}
                  </div>
                </div>

                {/* Custom tone */}
                <div>
                  <span
                    className="text-xs font-medium block mb-2"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                  >
                    Custom
                  </span>
                  <div className="flex flex-col gap-1.5">
                    <div
                      className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors"
                      style={{
                        background:
                          settings.selectedTone === "custom"
                            ? "rgba(239,68,68,0.15)"
                            : "rgba(255,255,255,0.04)",
                        border: `1px solid ${
                          settings.selectedTone === "custom"
                            ? "rgba(239,68,68,0.3)"
                            : "rgba(255,255,255,0.06)"
                        }`,
                      }}
                      onClick={() =>
                        onUpdate({ selectedTone: "custom" })
                      }
                    >
                      <div className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0" style={{
                        borderColor: settings.selectedTone === "custom" ? "#ef4444" : "rgba(255,255,255,0.2)",
                      }}>
                        {settings.selectedTone === "custom" && (
                          <div className="w-2 h-2 rounded-full" style={{ background: "#ef4444" }} />
                        )}
                      </div>
                      <Music
                        size={13}
                        style={{ color: "rgba(255,255,255,0.4)" }}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm truncate" style={{ color: "rgba(255,255,255,0.65)" }}>
                          {settings.customToneName || "Upload your own tone"}
                        </p>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          customFileRef.current?.click();
                        }}
                        className="p-1.5 rounded-md transition-colors cursor-pointer"
                        style={{ color: "rgba(255,255,255,0.35)" }}
                        onMouseEnter={(e) =>
                          ((e.currentTarget as HTMLButtonElement).style.color =
                            "#fff")
                        }
                        onMouseLeave={(e) =>
                          ((e.currentTarget as HTMLButtonElement).style.color =
                            "rgba(255,255,255,0.35)")
                        }
                      >
                        <Upload size={13} />
                      </button>
                    </div>
                    <input
                      ref={customFileRef}
                      type="file"
                      accept="audio/*"
                      className="hidden"
                      onChange={handleCustomUpload}
                    />
                  </div>
                </div>
              </div>
            )}
          </Section>

          {/* ── Keyboard shortcuts ─────────────────────────────────────── */}
          <Section title="Keyboard Shortcuts">
            <div className="flex flex-col gap-2">
              {[
                { key: "Space", desc: "Start / Pause" },
                { key: "R", desc: "Reset" },
                { key: "S", desc: "Skip session (Pomodoro)" },
              ].map(({ key, desc }) => (
                <div key={key} className="flex items-center justify-between">
                  <span
                    className="text-sm"
                    style={{ color: "rgba(255,255,255,0.45)" }}
                  >
                    {desc}
                  </span>
                  <kbd
                    className="px-2 py-0.5 rounded text-xs font-mono"
                    style={{
                      background: "rgba(255,255,255,0.07)",
                      color: "rgba(255,255,255,0.5)",
                      border: "1px solid rgba(255,255,255,0.1)",
                    }}
                  >
                    {key}
                  </kbd>
                </div>
              ))}
            </div>
          </Section>
        </div>
      </div>
    </>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4">
      <span
        className="text-xs font-semibold uppercase tracking-widest"
        style={{ color: "rgba(255,255,255,0.25)" }}
      >
        {title}
      </span>
      {children}
    </div>
  );
}

function Row({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <p className="text-sm" style={{ color: "rgba(255,255,255,0.65)" }}>
          {label}
        </p>
        {hint && (
          <p
            className="text-xs mt-0.5"
            style={{ color: "rgba(255,255,255,0.25)" }}
          >
            {hint}
          </p>
        )}
      </div>
      {children}
    </div>
  );
}

function Toggle({
  label,
  description,
  checked,
  onChange,
  icon,
}: {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (v: boolean) => void;
  icon?: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        {icon && (
          <span
            style={{ color: checked ? "#f87171" : "rgba(255,255,255,0.3)" }}
          >
            {icon}
          </span>
        )}
        <div>
          <p className="text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
            {label}
          </p>
          {description && (
            <p
              className="text-xs mt-0.5 leading-relaxed"
              style={{ color: "rgba(255,255,255,0.28)" }}
            >
              {description}
            </p>
          )}
        </div>
      </div>

      {/* Toggle switch */}
      <button
        onClick={() => onChange(!checked)}
        className="relative flex-shrink-0 rounded-full transition-colors duration-200 cursor-pointer"
        style={{
          width: 40,
          height: 22,
          background: checked ? "#ef4444" : "rgba(255,255,255,0.1)",
        }}
      >
        <span
          className="absolute top-0.5 rounded-full bg-white transition-all duration-200"
          style={{
            width: 18,
            height: 18,
            left: checked ? 20 : 2,
          }}
        />
      </button>
    </div>
  );
}

function NumStepper({
  value,
  min,
  max,
  suffix,
  onChange,
}: {
  value: number;
  min: number;
  max: number;
  suffix: string;
  onChange: (v: number) => void;
}) {
  const clamp = (n: number) => Math.min(max, Math.max(min, n));

  return (
    <div className="flex items-center gap-1.5 flex-shrink-0">
      <StepBtn
        onClick={() => onChange(clamp(value - 1))}
        disabled={value <= min}
      >
        <Minus size={11} />
      </StepBtn>
      <span
        className="text-sm w-8 text-center tabular-nums"
        style={{ color: "#f1f5f9" }}
      >
        {value}
      </span>
      <StepBtn
        onClick={() => onChange(clamp(value + 1))}
        disabled={value >= max}
      >
        <Plus size={11} />
      </StepBtn>
      {suffix && (
        <span className="text-xs" style={{ color: "rgba(255,255,255,0.3)" }}>
          {suffix}
        </span>
      )}
    </div>
  );
}

function StepBtn({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="w-6 h-6 rounded-md flex items-center justify-center transition-all cursor-pointer disabled:opacity-30"
      style={{
        background: "rgba(255,255,255,0.08)",
        color: "rgba(255,255,255,0.6)",
      }}
      onMouseEnter={(e) => {
        if (!disabled) {
          (e.currentTarget as HTMLButtonElement).style.background =
            "rgba(255,255,255,0.15)";
          (e.currentTarget as HTMLButtonElement).style.color = "#fff";
        }
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background =
          "rgba(255,255,255,0.08)";
        (e.currentTarget as HTMLButtonElement).style.color =
          "rgba(255,255,255,0.6)";
      }}
    >
      {children}
    </button>
  );
}

function ToneOption({
  tone,
  selected,
  onSelect,
  onPreview,
}: {
  tone: { id: ToneId; name: string; description: string };
  selected: boolean;
  onSelect: () => void;
  onPreview: () => void;
}) {
  return (
    <div
      className="flex items-center gap-2 px-3 py-2 rounded-lg cursor-pointer transition-colors"
      style={{
        background: selected
          ? "rgba(239,68,68,0.15)"
          : "rgba(255,255,255,0.04)",
        border: `1px solid ${
          selected ? "rgba(239,68,68,0.3)" : "rgba(255,255,255,0.06)"
        }`,
      }}
      onClick={onSelect}
    >
      <div
        className="w-4 h-4 rounded-full border-2 flex items-center justify-center flex-shrink-0"
        style={{
          borderColor: selected ? "#ef4444" : "rgba(255,255,255,0.2)",
        }}
      >
        {selected && (
          <div
            className="w-2 h-2 rounded-full"
            style={{ background: "#ef4444" }}
          />
        )}
      </div>
      <Music size={13} style={{ color: "rgba(255,255,255,0.4)" }} />
      <div className="flex-1 min-w-0">
        <p
          className="text-sm"
          style={{ color: "rgba(255,255,255,0.65)" }}
        >
          {tone.name}
        </p>
        <p
          className="text-xs"
          style={{ color: "rgba(255,255,255,0.25)" }}
        >
          {tone.description}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onPreview();
        }}
        className="p-1.5 rounded-md transition-colors cursor-pointer"
        style={{ color: "rgba(255,255,255,0.35)" }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.color = "#fff")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLButtonElement).style.color =
            "rgba(255,255,255,0.35)")
        }
      >
        <Play size={13} />
      </button>
    </div>
  );
}
