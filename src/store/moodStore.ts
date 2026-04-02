import { create } from 'zustand'
import { MoodLog } from '@/types'

interface MoodState {
  logs: MoodLog[]
  todayLog: MoodLog | null
  isLoading: boolean
  
  setLogs: (logs: MoodLog[]) => void
  addLog: (log: MoodLog) => void
}

export const useMoodStore = create<MoodState>((set) => ({
  logs: [],
  todayLog: null,
  isLoading: true,
  
  setLogs: (logs) => {
    // Find today's log if it exists
    const todayStr = new Date().toISOString().split('T')[0]
    const todayLog = logs.find(log => log.date === todayStr) || null
    set({ logs, todayLog })
  },
  
  addLog: (log) => set((state) => {
    const todayStr = new Date().toISOString().split('T')[0]
    const isToday = log.date === todayStr
    
    // Replace if same date, otherwise append
    const newLogs = state.logs.filter(l => l.date !== log.date)
    return {
      logs: [log, ...newLogs],
      todayLog: isToday ? log : state.todayLog
    }
  }),
}))
