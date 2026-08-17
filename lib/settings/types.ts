export type ViewName = "family" | "popo";

export interface Settings {
  textScale: 1.0 | 1.25 | 1.5 | 1.75 | 2.0 | 2.5;
  contrast: "standard" | "high";
  motion: "full" | "reduced";
  voiceRate: number; // slider snaps to 0.7/0.8/0.9/1.0 in family settings; Popo default is 0.85
  showCaptions: boolean;
  theme: "cream" | "high-contrast-dark";
}

export const DEFAULTS: Record<ViewName, Settings> = {
  family: {
    textScale: 1.0,
    contrast: "standard",
    motion: "full",
    voiceRate: 0.9,
    showCaptions: true,
    theme: "cream",
  },
  popo: {
    textScale: 1.75,
    contrast: "standard",
    motion: "reduced",
    voiceRate: 0.85,
    showCaptions: true,
    theme: "cream",
  },
};

export const TEXT_SCALES: Settings["textScale"][] = [1.0, 1.25, 1.5, 1.75, 2.0, 2.5];
export const VOICE_RATES: number[] = [0.7, 0.8, 0.9, 1.0];

export function storageKey(view: ViewName) {
  return `caretaker.prefs.${view}`;
}
