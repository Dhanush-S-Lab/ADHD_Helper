import { create } from 'zustand'
import { Profile, getLevel } from '@/types'

interface UserState {
  profile: Profile | null
  isLoading: boolean
  justLeveledUpTo: number | null
  soundEnabled: boolean
  
  setProfile: (profile: Profile | null) => void
  updateProfile: (updates: Partial<Profile>) => void
  addXP: (amount: number) => void
  clearLevelUp: () => void
  toggleSound: () => void
}

export const useUserStore = create<UserState>((set) => ({
  profile: null,
  isLoading: true,
  justLeveledUpTo: null,
  soundEnabled: true,
  
  setProfile: (profile) => set({ profile }),
  
  updateProfile: (updates) => set((state) => ({
    profile: state.profile ? { ...state.profile, ...updates } : null
  })),
  
  addXP: (amount) => set((state) => {
    if (!state.profile) return state
    
    const oldLevel = getLevel(state.profile.xp)
    const newXP = state.profile.xp + amount
    const newLevel = getLevel(newXP)

    return {
      profile: {
        ...state.profile,
        xp: newXP
      },
      justLeveledUpTo: newLevel > oldLevel ? newLevel : state.justLeveledUpTo
    }
  }),

  clearLevelUp: () => set({ justLeveledUpTo: null }),
  toggleSound: () => set((state) => ({ soundEnabled: !state.soundEnabled }))
}))
