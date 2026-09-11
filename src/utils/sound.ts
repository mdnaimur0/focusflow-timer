import { playTone as playToneImpl } from "./tones";
import type { Settings } from "../types";

/** Legacy wrapper — kept for backward compat. Uses the selected tone. */
export function playCompletionSound(settings: Settings): void {
  playToneImpl(settings.selectedTone, settings);
}

/** Legacy wrapper — kept for backward compat. Uses the selected tone. */
export function playBreakEndSound(settings: Settings): void {
  playToneImpl(settings.selectedTone, settings);
}

export { playToneImpl as playTone };
