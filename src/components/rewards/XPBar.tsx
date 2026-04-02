'use client'

import { useUserStore } from '@/store/userStore'
import { getXPToNextLevel, getLevel } from '@/types'
import { motion } from 'framer-motion'
import { Zap } from 'lucide-react'

export function XPBar() {
  const { profile } = useUserStore()
  
  if (!profile) return null

  const level = getLevel(profile.xp)
  const { current, next, progress } = getXPToNextLevel(profile.xp)
  const xpInLevel = profile.xp - current
  const xpNeeded = next - current

  return (
    <div className="flex items-center gap-4">
      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-brand-400">Level {level}</span>
          <span className="text-xs text-muted-foreground">{xpInLevel} / {xpNeeded} XP</span>
        </div>
        
        {/* Progress Bar Container */}
        <div className="h-2 w-32 overflow-hidden rounded-full bg-dark-bg ring-1 ring-inset ring-dark-border sm:w-48">
          <motion.div
            className="h-full bg-gradient-to-r from-brand-500 to-accent-teal"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: 'spring', damping: 20, stiffness: 100 }}
          />
        </div>
      </div>
      
      {/* Streak Badge */}
      <div className="flex h-9 items-center gap-1.5 rounded-full bg-dark-surface px-3 ring-1 ring-brand-500/20">
        <Zap className="h-4 w-4 text-warning-amber" fill="currentColor" />
        <span className="font-bold text-foreground">{profile.streak}</span>
      </div>
    </div>
  )
}
