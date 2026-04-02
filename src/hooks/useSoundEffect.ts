import { useCallback } from 'react'
import { useUserStore } from '@/store/userStore'

type SoundType = 'pop' | 'chime' | 'bloop'

export function useSoundEffect() {
  const { soundEnabled } = useUserStore()

  const playSound = useCallback((type: SoundType) => {
    if (!soundEnabled || typeof window === 'undefined') return

    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext
      if (!AudioContext) return
      const ctx = new AudioContext()
      
      const osc = ctx.createOscillator()
      const gainNode = ctx.createGain()
      
      osc.connect(gainNode)
      gainNode.connect(ctx.destination)

      const now = ctx.currentTime

      if (type === 'pop') {
        osc.type = 'sine'
        osc.frequency.setValueAtTime(600, now)
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.05)
        
        gainNode.gain.setValueAtTime(0, now)
        gainNode.gain.linearRampToValueAtTime(0.5, now + 0.02)
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1)
        
        osc.start(now)
        osc.stop(now + 0.1)
      } 
      else if (type === 'chime') {
        osc.type = 'sine'
        osc.frequency.setValueAtTime(800, now)
        osc.frequency.setValueAtTime(1200, now + 0.15)
        
        gainNode.gain.setValueAtTime(0, now)
        gainNode.gain.linearRampToValueAtTime(0.3, now + 0.05)
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.6)
        
        osc.start(now)
        osc.stop(now + 0.6)
      }
      else if (type === 'bloop') {
        osc.type = 'sine'
        osc.frequency.setValueAtTime(400, now)
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.1)
        
        gainNode.gain.setValueAtTime(0, now)
        gainNode.gain.linearRampToValueAtTime(0.2, now + 0.02)
        gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.1)
        
        osc.start(now)
        osc.stop(now + 0.1)
      }
    } catch (e) {
      console.error('Audio synthesis failed', e)
    }
  }, [soundEnabled])

  return playSound
}
