'use client'

import { useState, useEffect } from 'react'
import { Card } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Sparkles, Plus, Check } from 'lucide-react'
import { useMoodStore } from '@/store/moodStore'
import { MOOD_EMOJIS } from '@/types'
import { useTaskStore } from '@/store/taskStore'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export function WellnessSuggestions() {
  const { logs } = useMoodStore()
  const { addTask } = useTaskStore()
  const [suggestions, setSuggestions] = useState<string[]>([])
  const [loading, setLoading] = useState(false)
  const [addedTasks, setAddedTasks] = useState<Set<number>>(new Set())

  // Get today's mood (most recent log)
  const todayLog = [...logs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]

  useEffect(() => {
    if (!todayLog) return
    const fetchSuggestions = async () => {
      setLoading(true)
      try {
        const moodLabel = MOOD_EMOJIS[todayLog.mood_level].label
        const res = await fetch('/api/wellness-suggestions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ currentMood: moodLabel })
        })
        const data = await res.json()
        if (data.tasks) {
          setSuggestions(data.tasks)
        }
      } catch (error) {
        console.error(error)
      } finally {
        setLoading(false)
      }
    }
    
    // Only fetch if we haven't fetched yet for this session to save API calls
    if (suggestions.length === 0) {
      fetchSuggestions()
    }
  }, [todayLog])

  if (!todayLog) return null // Wait until they log a mood
  if (loading && suggestions.length === 0) {
    return (
      <Card className="p-6 border-dashed border-dark-border/50 bg-dark-surface/30 animate-pulse flex items-center justify-center">
        <p className="text-sm text-brand-400">Consulting AI Coach for wellness acts...</p>
      </Card>
    )
  }

  if (suggestions.length === 0) return null

  const handleAdd = async (taskString: string, idx: number) => {
    const supabase = createClient()
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const { data, error } = await supabase.from('tasks').insert({
      user_id: user.id,
      title: taskString + ' (Self Care)',
      xp_value: 5,
      steps: []
    }).select().single()

    if (error) {
      toast.error('Failed to add task')
      return
    }

    addTask(data)
    toast.success('Self-care task added!')
    setAddedTasks(prev => new Set(prev).add(idx))
  }

  return (
    <Card className="p-6 border-brand-500/20 bg-gradient-to-tr from-brand-950/20 to-dark-surface">
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-brand-400" />
        <h3 className="font-semibold text-lg text-foreground">AI Guided Serenity</h3>
      </div>
      <p className="text-sm text-foreground/70 mb-4">
        Because you felt <strong className="text-brand-300">{MOOD_EMOJIS[todayLog.mood_level].label}</strong> today, taking some physical & mental space might help. Try adding one of these 5XP tasks to your plate:
      </p>
      
      <div className="space-y-2">
        {suggestions.map((suggestion, idx) => {
          const isAdded = addedTasks.has(idx)
          return (
            <div key={idx} className="flex items-center justify-between gap-4 p-3 rounded-xl bg-dark-bg/50 border border-dark-border/50">
              <span className="text-sm font-medium text-foreground/90">{suggestion}</span>
              <Button 
                variant={isAdded ? "secondary" : "ghost"}
                size="sm"
                className={`shrink-0 rounded-full h-8 px-3 ${isAdded ? 'text-success-green border-success-green/20 pointer-events-none' : 'hover:bg-brand-500/10 hover:text-brand-300'}`}
                onClick={() => handleAdd(suggestion, idx)}
              >
                {isAdded ? <Check className="h-4 w-4 mr-1" /> : <Plus className="h-4 w-4 mr-1" />}
                {isAdded ? 'Added' : 'Add'}
              </Button>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
