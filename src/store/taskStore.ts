import { create } from 'zustand'
import { Task } from '@/types'

interface TaskState {
  tasks: Task[]
  activeTask: Task | null
  isLoading: boolean
  
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (id: string, updates: Partial<Task>) => void
  removeTask: (id: string) => void
  setActiveTask: (id: string | null) => void
  setLoading: (loading: boolean) => void
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  activeTask: null,
  isLoading: true,
  
  setTasks: (tasks) => set({ tasks }),
  
  addTask: (task) => set((state) => ({ 
    tasks: [task, ...state.tasks] 
  })),
  
  updateTask: (id, updates) => set((state) => ({
    tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    activeTask: state.activeTask?.id === id ? { ...state.activeTask, ...updates } : state.activeTask
  })),
  
  removeTask: (id) => set((state) => ({
    tasks: state.tasks.filter((t) => t.id !== id),
    activeTask: state.activeTask?.id === id ? null : state.activeTask
  })),
  
  setActiveTask: (id) => set((state) => ({
    activeTask: id ? state.tasks.find((t) => t.id === id) || null : null
  })),
  
  setLoading: (isLoading) => set({ isLoading }),
}))
