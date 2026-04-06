'use client'

import { useUserStore } from '@/store/userStore'
import { useTaskStore } from '@/store/taskStore'
import { useMoodStore } from '@/store/moodStore'
import { getLevel, getXPToNextLevel, MOOD_EMOJIS, MoodLevel } from '@/types'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Trophy, Zap, Target, LayoutGrid, CheckCircle2, Flame, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'

export default function ProfilePage() {
  const { profile } = useUserStore()
  const { tasks } = useTaskStore()
  const { logs } = useMoodStore()
  const router = useRouter()

  if (!profile) return null

  const level = getLevel(profile.xp)
  const { progress } = getXPToNextLevel(profile.xp)

  const completedTasks = tasks.filter(t => t.completed).length
  const pendingTasks = tasks.filter(t => !t.completed).length

  // Calculate mood distribution
  const moodCounts = logs.reduce((acc, log) => {
    acc[log.mood_level] = (acc[log.mood_level] || 0) + 1
    return acc
  }, {} as Record<number, number>)

  const topMood = Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]
  const topMoodLevel = topMood ? parseInt(topMood[0]) as MoodLevel : null

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="mx-auto max-w-4xl space-y-8 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
        <p className="text-muted-foreground">Command center for your growth and dopamine.</p>
      </div>

      {/* Gamification Hero */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="relative overflow-hidden border-brand-500/30 bg-gradient-to-br from-dark-surface to-brand-950/20 p-8 shadow-2xl">
          <div className="absolute top-0 right-0 p-32 bg-brand-500/10 blur-3xl rounded-full" />
          <div className="relative z-10 flex flex-col md:flex-row items-center gap-8">
            <div className="flex h-32 w-32 shrink-0 items-center justify-center rounded-full bg-brand-500/10 ring-4 ring-brand-500/30 shadow-[0_0_30px_rgba(139,92,246,0.3)]">
              <Trophy className="h-16 w-16 text-brand-400" />
            </div>
            
            <div className="flex-1 text-center md:text-left space-y-4 w-full">
              <div>
                <h2 className="text-3xl font-black text-foreground">Level {level}</h2>
                <p className="text-brand-300 font-medium">{profile.xp} Total XP</p>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm text-foreground/70">
                  <span>Progress to Level {level + 1}</span>
                  <span>{Math.round(progress)}%</span>
                </div>
                <div className="h-3 w-full overflow-hidden rounded-full bg-dark-bg ring-1 ring-inset ring-dark-border">
                  <div
                    className="h-full bg-gradient-to-r from-brand-500 to-accent-teal transition-all duration-1000 ease-out"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="flex flex-col items-center justify-center rounded-2xl bg-dark-bg/50 px-8 py-6 ring-1 ring-dark-border text-center">
              <Flame className="h-8 w-8 text-warning-amber mb-2" />
              <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Current Streak</p>
              <p className="text-4xl font-bold text-foreground">{profile.streak} <span className="text-lg text-muted-foreground">days</span></p>
            </div>
          </div>
        </Card>
      </motion.div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }}>
          <Card className="p-6 bg-dark-surface border-dark-border/50">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-accent-teal/10 text-accent-teal">
                <Target className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-lg">Task Mastery</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-dark-bg rounded-xl p-4 ring-1 ring-dark-border">
                <p className="text-sm text-muted-foreground mb-1">Completed</p>
                <p className="text-3xl font-bold text-success-green flex items-center gap-2">
                  <CheckCircle2 className="h-6 w-6" /> {completedTasks}
                </p>
              </div>
              <div className="bg-dark-bg rounded-xl p-4 ring-1 ring-dark-border">
                <p className="text-sm text-muted-foreground mb-1">Pending</p>
                <p className="text-3xl font-bold text-brand-300 flex items-center gap-2">
                  <LayoutGrid className="h-6 w-6" /> {pendingTasks}
                </p>
              </div>
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}>
          <Card className="p-6 bg-dark-surface border-dark-border/50 h-full">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 rounded-lg bg-warning-amber/10 text-warning-amber">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="font-semibold text-lg">Mood Ecosystem</h3>
            </div>

            {topMoodLevel ? (
              <div className="flex items-center gap-6">
                <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-dark-bg text-4xl ring-1 ring-dark-border">
                  {MOOD_EMOJIS[topMoodLevel].emoji}
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Most Frequent Mood</p>
                  <p className="text-2xl font-bold" style={{ color: MOOD_EMOJIS[topMoodLevel].color }}>
                    {MOOD_EMOJIS[topMoodLevel].label}
                  </p>
                  <p className="text-sm text-foreground/60 mt-1">
                    Logged {moodCounts[topMoodLevel]} times
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-center py-6 text-muted-foreground">
                No mood data yet! Start logging to see insights.
              </div>
            )}
          </Card>
        </motion.div>
      </div>

      {/* Settings / Danger Zone */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="pt-8 border-t border-dark-border">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg text-foreground">Account Settings</h3>
            <p className="text-sm text-muted-foreground">Signed in as {profile.email}</p>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-rose-500 hover:text-rose-400 hover:bg-rose-500/10 gap-2">
            <LogOut className="h-4 w-4" /> Sign Out
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
