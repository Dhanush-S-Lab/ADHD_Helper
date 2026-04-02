import { create } from 'zustand'

export type TimerMode = '2' | '10' | '15' | '25'
const MINUTES_MAP: Record<TimerMode, number> = { '2': 2, '10': 10, '15': 15, '25': 25 }

interface TimerState {
  mode: TimerMode
  timeLeft: number // in seconds
  isRunning: boolean
  
  setMode: (mode: TimerMode) => void
  setTimeLeft: (time: number) => void
  start: () => void
  pause: () => void
  reset: () => void
}

export const useTimerStore = create<TimerState>((set, get) => ({
  mode: '25',
  timeLeft: 25 * 60,
  isRunning: false,
  
  setMode: (mode) => set({ 
    mode, 
    timeLeft: MINUTES_MAP[mode] * 60,
    isRunning: false 
  }),
  
  setTimeLeft: (timeLeft) => set({ timeLeft }),
  
  start: () => set({ isRunning: true }),
  
  pause: () => set({ isRunning: false }),
  
  reset: () => set((state) => ({ 
    isRunning: false, 
    timeLeft: MINUTES_MAP[state.mode] * 60 
  })),
}))
