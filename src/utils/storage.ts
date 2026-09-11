import type { Settings, Task } from '../types';

const SETTINGS_KEY = 'focusflow:settings';
const TASKS_KEY = 'focusflow:tasks';

export function saveSettings(settings: Settings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    /* storage unavailable */
  }
}

export function loadSettings(defaults: Settings): Settings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw) as Partial<Settings>;
    return {
      ...defaults,
      ...parsed,
      // Deep-merge nested pomodoroConfig
      pomodoroConfig: {
        ...defaults.pomodoroConfig,
        ...(parsed.pomodoroConfig ?? {}),
      },
    };
  } catch {
    return defaults;
  }
}

export function saveTasks(tasks: Task[]): void {
  try {
    localStorage.setItem(TASKS_KEY, JSON.stringify(tasks));
  } catch {
    /* storage unavailable */
  }
}

export function loadTasks(): Task[] {
  try {
    const raw = localStorage.getItem(TASKS_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as Task[];
  } catch {
    return [];
  }
}
