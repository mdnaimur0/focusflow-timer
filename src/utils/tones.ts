import type { Settings, ToneId, TonePreset } from "../types";

function createCtx(): AudioContext | null {
  try {
    return new (
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    )();
  } catch {
    return null;
  }
}

// ── Normal Tones ─────────────────────────────────────────────────────────────

function playGentleChime(volume: number) {
  const ctx = createCtx();
  if (!ctx) return;
  const notes = [523.25, 659.25, 783.99]; // C5 E5 G5
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.value = freq;
    const t = ctx.currentTime + i * 0.18;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.22 * volume, t + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.8);
    osc.start(t);
    osc.stop(t + 0.85);
  });
  setTimeout(() => ctx.close(), 2500);
}

function playSoftBell(volume: number) {
  const ctx = createCtx();
  if (!ctx) return;
  const freqs = [880, 1318.51]; // A5 E6
  freqs.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.value = freq;
    const t = ctx.currentTime + i * 0.12;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.18 * volume, t + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 1.0);
    osc.start(t);
    osc.stop(t + 1.05);
  });
  setTimeout(() => ctx.close(), 2000);
}

function playDigitalBeep(volume: number) {
  const ctx = createCtx();
  if (!ctx) return;
  [800, 1000].forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.value = freq;
    const t = ctx.currentTime + i * 0.15;
    gain.gain.setValueAtTime(0.2 * volume, t);
    gain.gain.setValueAtTime(0, t + 0.08);
    gain.gain.setValueAtTime(0.2 * volume, t + 0.1);
    gain.gain.setValueAtTime(0, t + 0.15);
    osc.start(t);
    osc.stop(t + 0.16);
  });
  setTimeout(() => ctx.close(), 1000);
}

function playCrystalDrop(volume: number) {
  const ctx = createCtx();
  if (!ctx) return;
  const notes = [1567.98, 2093.0, 2637.02]; // G6 C7 E7
  notes.forEach((freq, i) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sine";
    osc.frequency.value = freq;
    const t = ctx.currentTime + i * 0.1;
    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.12 * volume, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
    osc.start(t);
    osc.stop(t + 0.55);
  });
  setTimeout(() => ctx.close(), 1500);
}

// ── Annoying Tones ───────────────────────────────────────────────────────────

function playAlarmClock(volume: number) {
  const ctx = createCtx();
  if (!ctx) return;
  for (let i = 0; i < 6; i++) {
    [1000, 800].forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "square";
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.3;
      gain.gain.setValueAtTime(0.18 * volume, t);
      gain.gain.setValueAtTime(0, t + 0.12);
      osc.start(t);
      osc.stop(t + 0.15);
    });
  }
  setTimeout(() => ctx.close(), 3000);
}

function playSiren(volume: number) {
  const ctx = createCtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.type = "sawtooth";
  gain.gain.setValueAtTime(0.15 * volume, ctx.currentTime);
  const dur = 2.0;
  for (let i = 0; i < 4; i++) {
    const t = ctx.currentTime + i * (dur / 2);
    osc.frequency.setValueAtTime(600, t);
    osc.frequency.linearRampToValueAtTime(1200, t + dur / 4);
    osc.frequency.linearRampToValueAtTime(600, t + dur / 2);
  }
  gain.gain.setValueAtTime(0.15 * volume, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur * 2);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + dur * 2 + 0.1);
  setTimeout(() => ctx.close(), 5000);
}

function playBuzzer(volume: number) {
  const ctx = createCtx();
  if (!ctx) return;
  for (let i = 0; i < 5; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "sawtooth";
    osc.frequency.value = 180;
    const t = ctx.currentTime + i * 0.25;
    gain.gain.setValueAtTime(0.22 * volume, t);
    gain.gain.setValueAtTime(0, t + 0.15);
    osc.start(t);
    osc.stop(t + 0.18);
  }
  setTimeout(() => ctx.close(), 2000);
}

function playCarHorn(volume: number) {
  const ctx = createCtx();
  if (!ctx) return;
  const freqs = [350, 440];
  for (let i = 0; i < 3; i++) {
    freqs.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sawtooth";
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.4;
      gain.gain.setValueAtTime(0.18 * volume, t);
      gain.gain.setValueAtTime(0, t + 0.25);
      osc.start(t);
      osc.stop(t + 0.28);
    });
  }
  setTimeout(() => ctx.close(), 2000);
}

function playNuclearAlarm(volume: number) {
  const ctx = createCtx();
  if (!ctx) return;
  for (let i = 0; i < 4; i++) {
    [800, 600].forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "square";
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.5;
      gain.gain.setValueAtTime(0.2 * volume, t);
      gain.gain.setValueAtTime(0, t + 0.2);
      osc.start(t);
      osc.stop(t + 0.22);
    });
  }
  setTimeout(() => ctx.close(), 3000);
}

function playFireAlarm(volume: number) {
  const ctx = createCtx();
  if (!ctx) return;
  for (let i = 0; i < 6; i++) {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.type = "square";
    osc.frequency.value = 1000 + (i % 2) * 400;
    const t = ctx.currentTime + i * 0.18;
    gain.gain.setValueAtTime(0.2 * volume, t);
    gain.gain.setValueAtTime(0, t + 0.08);
    gain.gain.setValueAtTime(0.2 * volume, t + 0.1);
    gain.gain.setValueAtTime(0, t + 0.15);
    osc.start(t);
    osc.stop(t + 0.16);
  }
  setTimeout(() => ctx.close(), 2000);
}

// ── Preset Registry ──────────────────────────────────────────────────────────

export const TONE_PRESETS: TonePreset[] = [
  {
    id: "gentle-chime",
    name: "Gentle Chime",
    category: "normal",
    description: "Soft ascending chord",
    play: playGentleChime,
  },
  {
    id: "soft-bell",
    name: "Soft Bell",
    category: "normal",
    description: "Peaceful bell tone",
    play: playSoftBell,
  },
  {
    id: "digital-beep",
    name: "Digital Beep",
    category: "normal",
    description: "Clean electronic beep",
    play: playDigitalBeep,
  },
  {
    id: "crystal-drop",
    name: "Crystal Drop",
    category: "normal",
    description: "High tinkling chime",
    play: playCrystalDrop,
  },
  {
    id: "alarm-clock",
    name: "Alarm Clock",
    category: "annoying",
    description: "Classic twin-bell alarm",
    play: playAlarmClock,
  },
  {
    id: "siren",
    name: "Siren",
    category: "annoying",
    description: "Rising & falling wail",
    play: playSiren,
  },
  {
    id: "buzzer",
    name: "Buzzer",
    category: "annoying",
    description: "Harsh rapid buzz",
    play: playBuzzer,
  },
  {
    id: "car-horn",
    name: "Car Horn",
    category: "annoying",
    description: "Repeated honk blast",
    play: playCarHorn,
  },
  {
    id: "nuclear-alarm",
    name: "Nuclear Alarm",
    category: "annoying",
    description: "Urgent siren pattern",
    play: playNuclearAlarm,
  },
  {
    id: "fire-alarm",
    name: "Fire Alarm",
    category: "annoying",
    description: "Piercing rapid pulse",
    play: playFireAlarm,
  },
];

export function playTone(toneId: ToneId, settings: Settings) {
  const volume = settings.volume / 100;

  if (toneId === "custom" && settings.customToneData) {
    try {
      const audio = new Audio(settings.customToneData);
      audio.volume = volume;
      audio.play().catch(() => {
        // Fallback to gentle chime if custom tone fails
        playGentleChime(volume);
      });
    } catch {
      playGentleChime(volume);
    }
    return;
  }

  const preset = TONE_PRESETS.find((t) => t.id === toneId);
  if (preset) {
    preset.play(volume);
  } else {
    // Fallback
    playGentleChime(volume);
  }
}
