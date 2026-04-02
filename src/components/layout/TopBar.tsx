'use client'

import { useUserStore } from '@/store/userStore'
import { XPBar } from '@/components/rewards/XPBar'
import { Volume2, VolumeX } from 'lucide-react'

export function TopBar() {
  const { soundEnabled, toggleSound } = useUserStore()

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-end border-b border-dark-border bg-dark-bg/80 px-4 backdrop-blur-md md:px-8 gap-4">
      <button 
        onClick={toggleSound}
        className="text-muted-foreground hover:text-foreground transition-colors p-2"
        aria-label="Toggle Sound"
      >
        {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5 opacity-50" />}
      </button>
      <XPBar />
    </header>
  )
}
