export interface Profile {
  id: string;
  email: string;
  xp: number;
  streak: number;
  last_active_date: string | null;
  created_at: string;
}

export interface Task {
  id: string;
  user_id: string;
  title: string;
  steps: string[];
  completed: boolean;
  completed_at?: string;
  xp_value: number;
  created_at: string;
}

export interface MoodLog {
  id: string;
  user_id: string;
  mood_level: 1 | 2 | 3 | 4 | 5;
  note: string | null;
  date: string;
  created_at: string;
}

export type MoodLevel = 1 | 2 | 3 | 4 | 5;

export const MOOD_EMOJIS: Record<MoodLevel, { emoji: string; label: string; color: string }> = {
  1: { emoji: '😞', label: 'Rough', color: '#EF4444' },
  2: { emoji: '😕', label: 'Meh', color: '#F97316' },
  3: { emoji: '😐', label: 'Okay', color: '#EAB308' },
  4: { emoji: '🙂', label: 'Good', color: '#22C55E' },
  5: { emoji: '😄', label: 'Great', color: '#A78BFA' },
};

export const XP_REWARDS = {
  TASK_COMPLETE: 10,
  FOCUS_SESSION: 15,
  MOOD_LOG: 5,
} as const;

export const LEVEL_THRESHOLDS = [0, 50, 150, 300, 500, 750, 1100, 1500, 2000, 2600, 3300];

export function getLevel(xp: number): number {
  for (let i = LEVEL_THRESHOLDS.length - 1; i >= 0; i--) {
    if (xp >= LEVEL_THRESHOLDS[i]) return i + 1;
  }
  return 1;
}

export function getXPToNextLevel(xp: number): { current: number; next: number; progress: number } {
  const level = getLevel(xp);
  const current = LEVEL_THRESHOLDS[level - 1] ?? 0;
  const next = LEVEL_THRESHOLDS[level] ?? LEVEL_THRESHOLDS[LEVEL_THRESHOLDS.length - 1];
  const progress = next > current ? ((xp - current) / (next - current)) * 100 : 100;
  return { current, next, progress };
}
