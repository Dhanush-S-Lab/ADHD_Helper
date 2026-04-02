'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Confetti from 'react-confetti'
import { useWindowSize } from 'react-use'
import { useUserStore } from '@/store/userStore'
import { Button } from '@/components/ui/Button'
import { Zap, Trophy } from 'lucide-react'

export function LevelUpModal() {
  const { justLeveledUpTo, clearLevelUp } = useUserStore()
  const { width, height } = useWindowSize()
  const [show, setShow] = useState(false)

  useEffect(() => {
    if (justLeveledUpTo !== null) {
      setShow(true)
    }
  }, [justLeveledUpTo])

  const handleClose = () => {
    setShow(false)
    setTimeout(() => clearLevelUp(), 500) // wait for exit animation
  }

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <Confetti width={width} height={height} recycle={false} numberOfPieces={600} gravity={0.15} />
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -20 }}
            className="flex w-full max-w-sm flex-col items-center justify-center gap-6 rounded-3xl border border-brand-500/30 bg-dark-bg p-8 text-center shadow-2xl shadow-brand-500/20"
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-full bg-brand-500/10 ring-4 ring-brand-500/20">
              <Trophy className="h-12 w-12 text-brand-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-3xl font-black text-foreground">LEVEL UP!</h2>
              <p className="text-muted-foreground">
                Incredible focus. You've reached <strong className="text-brand-400">Level {justLeveledUpTo}</strong>!
              </p>
            </div>
            
            <Button size="lg" className="w-full gap-2 rounded-full py-6 mt-4 text-lg font-bold" onClick={handleClose}>
               Keep It Up <Zap className="h-5 w-5" />
            </Button>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
