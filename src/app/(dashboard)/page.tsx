'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Sparkles, CheckCircle2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useTaskStore } from '@/store/taskStore'
import { useUserStore } from '@/store/userStore'
import { useTimerStore } from '@/store/timerStore'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { TaskCard } from '@/components/tasks/TaskCard'
import { WellnessSuggestions } from '@/components/ai/WellnessSuggestions'

export default function DashboardPage() {
  const router = useRouter()
  const { profile } = useUserStore()
  const { tasks, activeTask, setActiveTask } = useTaskStore()
  const { setMode, start } = useTimerStore()
  
  const incompleteTasks = tasks.filter(t => !t.completed)
  const completedToday = tasks.filter(t => t.completed && t.created_at.startsWith(new Date().toISOString().split('T')[0])).length

  const handleJustStart = () => {
    // If no active task, pick the first incomplete one
    if (!activeTask && incompleteTasks.length > 0) {
      setActiveTask(incompleteTasks[0].id)
    }
    // Switch perfectly to 2 minute mode and auto-start
    setMode('2')
    start()
    
    // Animate and redirect to focus timer
    setTimeout(() => {
      router.push('/focus')
    }, 500)
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* Welcome Banner */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
          Welcome back{profile?.email ? `, ${profile.email.split('@')[0]}` : ''}.
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Ready to turn chaos into flow?
        </p>
      </motion.div>

      {/* Main Focus Area */}
      <div className="grid gap-6 md:grid-cols-5 items-start">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-3"
        >
          <Card className="h-full border-brand-500/20 bg-gradient-to-br from-dark-surface to-brand-950/20 p-8 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-32 bg-brand-500/10 blur-3xl rounded-full" />
            
            <div className="relative z-10 flex h-full flex-col justify-between">
              <div>
                <h2 className="text-xl font-semibold mb-2 flex items-center gap-2 text-brand-300">
                  <Sparkles className="h-5 w-5" />
                  Your Next Move
                </h2>
                
                {activeTask ? (
                  <div className="mt-6 mb-8">
                    <p className="text-sm text-foreground/70 mb-2">Focusing on:</p>
                    <p className="text-2xl font-bold leading-tight">{activeTask.title}</p>
                    {activeTask.steps && activeTask.steps.length > 0 && (
                      <p className="mt-3 text-sm text-brand-400 font-medium">
                        First step: {activeTask.steps[0]}
                      </p>
                    )}
                  </div>
                ) : incompleteTasks.length > 0 ? (
                  <div className="mt-6 mb-8">
                    <p className="text-sm text-foreground/70 mb-2">Up next:</p>
                    <p className="text-2xl font-bold leading-tight">{incompleteTasks[0].title}</p>
                  </div>
                ) : (
                  <div className="mt-6 mb-8">
                    <p className="text-2xl font-bold leading-tight text-muted-foreground px-4 py-8 border-2 border-dashed border-dark-border rounded-xl text-center">
                      No pending tasks!
                    </p>
                  </div>
                )}
              </div>

              <Button 
                size="lg" 
                onClick={handleJustStart}
                disabled={incompleteTasks.length === 0}
                className="w-full text-lg h-16 shadow-[0_0_40px_rgba(124,58,237,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_60px_rgba(139,92,246,0.6)] group rounded-2xl gap-3"
              >
                <Play className="h-6 w-6 fill-current" />
                Just Start (2 mins)
              </Button>
            </div>
          </Card>
        </motion.div>

        {/* Quick Stats */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-2 flex flex-col gap-6"
        >
          <Card className="p-6 flex-1 flex flex-col items-center justify-center text-center">
            <div className="mb-4 rounded-full bg-success-green/10 p-4 text-success-green ring-1 ring-success-green/20">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">Tasks Completed Today</p>
            <p className="text-5xl font-bold mt-2 text-foreground tracking-tighter">{completedToday}</p>
            {completedToday > 0 && (
              <p className="text-xs text-success-green mt-2 font-medium">Awesome job! Keep it up. 🔥</p>
            )}
          </Card>
          
          <WellnessSuggestions />
        </motion.div>
      </div>

      {/* Active Tasks List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className="flex items-center justify-between mt-12 mb-4">
          <h3 className="font-semibold text-lg flex items-center gap-2">
            Tasks 
            <span className="rounded-full bg-brand-500/20 px-2 py-0.5 text-xs text-brand-400">
              {incompleteTasks.length}
            </span>
          </h3>
          <Button variant="ghost" size="sm" onClick={() => router.push('/tasks')}>
            View All
          </Button>
        </div>
        
        <div className="space-y-3">
          {incompleteTasks.slice(0, 3).map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
          {incompleteTasks.length === 0 && (
            <p className="text-sm text-muted-foreground py-8 text-center bg-dark-surface/30 rounded-xl border border-dashed border-dark-border">
              Add a task to get started.
            </p>
          )}
        </div>
      </motion.div>
    </div>
  )
}
