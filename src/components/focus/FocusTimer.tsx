'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Play, Pause, Square, CheckCircle } from 'lucide-react'
import Confetti from 'react-confetti'
import { useWindowSize } from 'react-use'
import toast from 'react-hot-toast'

import { useTimerStore, TimerMode } from '@/store/timerStore'
import { useTaskStore } from '@/store/taskStore'
import { useUserStore } from '@/store/userStore'
import { XP_REWARDS } from '@/types'
import { Button } from '@/components/ui/Button'
import { createBrowserClient } from '@supabase/ssr'
import { useSoundEffect } from '@/hooks/useSoundEffect'

export function FocusTimer() {
  const { mode, setMode, timeLeft, setTimeLeft, isRunning, start, pause, reset } = useTimerStore()
  const { activeTask, updateTask, setActiveTask } = useTaskStore()
  const { addXP } = useUserStore()
  const playSound = useSoundEffect()
  
  const [showConfetti, setShowConfetti] = useState(false)
  const { width, height } = useWindowSize()

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Timer logic
  useEffect(() => {
    let interval: NodeJS.Timeout
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
    } else if (isRunning && timeLeft === 0) {
      handleComplete()
    }
    return () => clearInterval(interval)
  }, [isRunning, timeLeft])

  const handleComplete = useCallback(async () => {
    pause()
    setShowConfetti(true)
    playSound('chime')
    
    // Reward XP
    addXP(XP_REWARDS.FOCUS_SESSION)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('xp').eq('id', user.id).single()
      if (profile) {
        await supabase.from('profiles').update({ xp: profile.xp + XP_REWARDS.FOCUS_SESSION }).eq('id', user.id)
      }
    }

    toast.success(`Focus session complete! +${XP_REWARDS.FOCUS_SESSION} XP`, {
      icon: '🔥',
      duration: 5000
    })

    setTimeout(() => {
      setShowConfetti(false)
      reset()
    }, 7000)
  }, [addXP, pause, reset])

  const handleTaskComplete = async () => {
    if (!activeTask) return

    playSound('pop')
    const now = new Date().toISOString()
    const { error } = await supabase.from('tasks').update({ completed: true, completed_at: now }).eq('id', activeTask.id)
    if (!error) {
      updateTask(activeTask.id, { completed: true, completed_at: now })
      addXP(activeTask.xp_value || XP_REWARDS.TASK_COMPLETE)
      toast.success('Task finished! Awesome job.')
      setActiveTask(null)
    }
  }

  // Format MM:SS
  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`
  }

  // Calculate progress percentage
  const totalSeconds = parseInt(mode) * 60
  const progress = ((totalSeconds - timeLeft) / totalSeconds) * 100

  return (
    <div className="flex min-h-full flex-col items-center py-10 w-full overflow-y-auto">
      {showConfetti && <Confetti width={width} height={height} recycle={false} numberOfPieces={500} />}
      
      <div className="my-auto flex w-full flex-col items-center max-w-md mx-auto">
        {/* Mode Selector */}
        <div className="relative z-10 mb-12 flex rounded-full bg-dark-surface p-1.5 ring-1 ring-dark-border shadow-sm max-w-full overflow-x-auto justify-center [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {(['2', '10', '15', '25'] as TimerMode[]).map((m) => (
            <button
              key={m}
              onClick={() => {
                if (isRunning) return
                setMode(m)
              }}
              disabled={isRunning}
              className={`rounded-full px-6 py-3 text-sm sm:px-8 sm:text-base font-semibold transition-all duration-200 shrink-0 ${
                mode === m
                  ? 'bg-brand-500 text-white shadow-md scale-100'
                  : 'text-muted-foreground hover:text-foreground hover:bg-brand-500/10 scale-95 hover:scale-100'
              } ${isRunning ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {m} min
            </button>
          ))}
        </div>

        {/* Timer Circle */}
        <div className="relative mb-8 flex h-64 w-64 shrink-0 items-center justify-center sm:h-80 sm:w-80 pointer-events-none mx-auto">
          <svg 
            className="absolute inset-0 h-full w-full -rotate-90 transform overflow-visible" 
            viewBox="0 0 100 100" 
            preserveAspectRatio="xMidYMid meet"
          >
            <circle
              className="text-dark-surface"
              strokeWidth="4"
              stroke="currentColor"
              fill="transparent"
              r="46"
              cx="50"
              cy="50"
            />
            <motion.circle
              className="text-brand-500 drop-shadow-[0_0_15px_rgba(139,92,246,0.5)]"
              strokeWidth="4"
              strokeLinecap="round"
              stroke="currentColor"
              fill="transparent"
              r="46"
              cx="50"
              cy="50"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: progress / 100 }}
              transition={{ duration: 1, ease: 'linear' }}
            />
          </svg>

          <div className="text-center font-mono">
            <div className="text-6xl font-bold tracking-tighter sm:text-7xl">{formatTime(timeLeft)}</div>
            <p className="mt-2 text-sm text-brand-400 font-sans tracking-widest uppercase">
              {isRunning ? 'Focusing...' : 'Ready'}
            </p>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-center gap-6 mt-4 w-full">
          {!isRunning ? (
            <Button onClick={start} className="w-48 h-16 rounded-full text-xl shadow-lg shadow-brand-500/20 transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 !px-0 !py-0">
              <Play className="h-7 w-7 fill-current" /> Start
            </Button>
          ) : (
            <Button onClick={pause} variant="secondary" className="w-48 h-16 rounded-full text-xl border border-dark-border shadow-lg transition-transform hover:scale-105 active:scale-95 flex items-center justify-center gap-3 !px-0 !py-0">
              <Pause className="h-7 w-7 fill-current" /> Pause
            </Button>
          )}
          
          <Button variant="ghost" className="h-16 w-16 shrink-0 rounded-full bg-dark-surface shadow-sm ring-1 ring-dark-border transition-transform hover:scale-105 hover:bg-dark-border active:scale-95 flex items-center justify-center !p-0" onClick={reset}>
            <Square className="h-6 w-6 fill-current text-muted-foreground hover:text-foreground" />
          </Button>
        </div>

        {/* Active Task Info */}
        {activeTask && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-12 w-full mx-auto max-w-sm rounded-2xl border border-brand-500/20 bg-brand-500/5 p-5 text-center"
          >
            <p className="text-sm font-medium text-brand-400 mb-1">Currently Focusing On</p>
            <p className="font-semibold text-lg mb-4 truncate">{activeTask.title}</p>
            <Button 
              variant="secondary" 
              size="sm" 
              className="w-full gap-2 border-success-green/20 text-success-green hover:bg-success-green/10"
              onClick={handleTaskComplete}
            >
              <CheckCircle className="h-4 w-4" />
              Mark Task Complete
            </Button>
          </motion.div>
        )}
      </div>
    </div>
  )
}
