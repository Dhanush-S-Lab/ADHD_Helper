'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { createBrowserClient } from '@supabase/ssr'
import toast from 'react-hot-toast'
import { format } from 'date-fns'

import { useMoodStore } from '@/store/moodStore'
import { useUserStore } from '@/store/userStore'
import { MOOD_EMOJIS, MoodLevel, XP_REWARDS } from '@/types'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'

export function MoodPicker() {
  const { todayLog, addLog } = useMoodStore()
  const { addXP } = useUserStore()
  const [selectedMood, setSelectedMood] = useState<MoodLevel | null>(todayLog?.mood_level || null)
  const [note, setNote] = useState(todayLog?.note || '')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSubmit = async () => {
    if (!selectedMood) return
    setIsSubmitting(true)

    const dateStr = new Date().toISOString().split('T')[0]
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      setIsSubmitting(false)
      return
    }

    const payload = {
      user_id: user.id,
      mood_level: selectedMood,
      note: note.trim() || null,
      date: dateStr,
    }

    // Try update if exist, else insert
    let res: any
    if (todayLog) {
      res = await supabase
        .from('mood_logs')
        .update(payload)
        .eq('id', todayLog.id)
        .select()
        .single()
    } else {
      res = await supabase
        .from('mood_logs')
        .insert(payload)
        .select()
        .single()
    }

    if (res.error) {
      toast.error('Failed to save mood')
      setIsSubmitting(false)
      return
    }

    addLog(res.data)

    // Reward XP if it's a first time log for today
    if (!todayLog) {
      addXP(XP_REWARDS.MOOD_LOG)
      
      const { data: profile } = await supabase.from('profiles').select('xp').eq('id', user.id).single()
      if (profile) {
        await supabase.from('profiles').update({ xp: profile.xp + XP_REWARDS.MOOD_LOG }).eq('id', user.id)
      }
      toast.success(`Mood logged! +${XP_REWARDS.MOOD_LOG} XP`)
    } else {
      toast.success('Mood updated')
    }

    setIsSubmitting(false)
  }

  return (
    <Card className="p-8 pb-10 text-center mx-auto max-w-2xl bg-dark-surface/80">
      <h2 className="text-2xl font-bold mb-2">How are you feeling today?</h2>
      <p className="text-muted-foreground mb-8 text-sm">
        {format(new Date(), 'EEEE, MMMM do')}
      </p>

      <div className="flex justify-center gap-2 sm:gap-6 mb-8 flex-wrap">
        {(Object.keys(MOOD_EMOJIS) as unknown as MoodLevel[]).map((level) => {
          const mood = MOOD_EMOJIS[level]
          const isSelected = selectedMood === Number(level)
          return (
            <motion.button
              key={level}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setSelectedMood(Number(level) as MoodLevel)}
              className={`flex flex-col items-center gap-3 rounded-2xl p-4 transition-colors ${
                isSelected 
                  ? 'bg-dark-surface ring-2 ring-brand-500 shadow-xl scale-110' 
                  : 'hover:bg-dark-surface opacity-60 hover:opacity-100'
              }`}
            >
              <span className="text-5xl">{mood.emoji}</span>
              <span className={`text-xs font-semibold tracking-wider uppercase ${isSelected ? 'text-brand-400' : 'text-muted-foreground'}`}>
                {mood.label}
              </span>
            </motion.button>
          )
        })}
      </div>

      <AnimatePresence>
        {selectedMood && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="space-y-4 max-w-md mx-auto"
          >
            <Input
              placeholder="Any context? (Optional brief note)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              className="text-center bg-dark-bg/50 border-dark-border"
              maxLength={100}
            />
            <Button 
              onClick={handleSubmit} 
              isLoading={isSubmitting}
              className="w-full text-base h-12 rounded-xl bg-brand-600 hover:bg-brand-500 text-white shadow-[0_0_20px_rgba(124,58,237,0.3)]"
            >
              {todayLog ? 'Update Entry' : 'Log Mood'}
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  )
}
