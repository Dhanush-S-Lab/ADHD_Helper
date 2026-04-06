'use client'

import { useEffect } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { TopBar } from '@/components/layout/TopBar'
import { MobileNav } from '@/components/layout/MobileNav'
import { LevelUpModal } from '@/components/rewards/LevelUpModal'
import { Chatbot } from '@/components/ai/Chatbot'
import { createClient } from '@/lib/supabase/client'
import { useUserStore } from '@/store/userStore'
import { useTaskStore } from '@/store/taskStore'
import { useMoodStore } from '@/store/moodStore'
import { Task, MoodLog, Profile } from '@/types'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { setProfile } = useUserStore()
  const { setTasks } = useTaskStore()
  const { setLogs } = useMoodStore()

  useEffect(() => {
    const loadUserData = async () => {
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      // Load Profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()
      
      if (profile) setProfile(profile as Profile)

      // Load Tasks
      const { data: tasks } = await supabase
        .from('tasks')
        .select('*')
        .order('created_at', { ascending: false })
      
      if (tasks) setTasks(tasks as Task[])

      // Load Mood Logs
      const { data: logs } = await supabase
        .from('mood_logs')
        .select('*')
        .order('date', { ascending: false })
      
      if (logs) setLogs(logs as MoodLog[])
    }

    loadUserData()
  }, [setProfile, setTasks, setLogs])

  return (
    <div className="flex h-screen overflow-hidden bg-dark-bg text-foreground">
      <LevelUpModal />
      <Chatbot />
      <Sidebar />
      <div className="flex flex-1 flex-col md:ml-64 relative">
        <TopBar />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 md:p-8 pb-24 md:pb-8">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  )
}
