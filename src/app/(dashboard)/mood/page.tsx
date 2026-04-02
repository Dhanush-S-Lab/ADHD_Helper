'use client'

import { MoodPicker } from '@/components/mood/MoodPicker'
import { Card } from '@/components/ui/Card'
import { useMoodStore } from '@/store/moodStore'
import { useTaskStore } from '@/store/taskStore'
import { MOOD_EMOJIS } from '@/types'
import { format, parseISO } from 'date-fns'
import { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { Sparkles, CheckCircle2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function MoodPage() {
  const { logs } = useMoodStore()
  const { tasks } = useTaskStore()
  
  const [analysis, setAnalysis] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const handleGenerateAnalysis = async () => {
    setIsAnalyzing(true)
    try {
      const res = await fetch('/api/mood-analysis', { method: 'POST' })
      const data = await res.json()
      if (data.analysis) {
        setAnalysis(data.analysis)
      } else {
        toast.error(data.error || 'Failed to analyze.')
      }
    } catch (error) {
      toast.error('Failed to generate insights.')
    } finally {
      setIsAnalyzing(false)
    }
  }
  
  // Sort logs by date descending for history
  const historyLogs = [...logs].sort((a, b) => 
    new Date(b.date).getTime() - new Date(a.date).getTime()
  )

  return (
    <div className="mx-auto max-w-3xl space-y-12 pb-12">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Mood Tracker</h1>
        <p className="text-muted-foreground">Log daily to understand your dopamine patterns.</p>
      </div>

      <MoodPicker />

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-brand-400" /> Weekly AI Insights
          </h3>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={handleGenerateAnalysis} 
            isLoading={isAnalyzing}
          >
            {analysis ? 'Regenerate' : 'Analyze Week'}
          </Button>
        </div>
        
        {analysis && (
          <Card className="p-5 border-brand-500/30 bg-brand-500/5 text-sm leading-relaxed text-foreground/90">
            {analysis}
          </Card>
        )}
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Recent History</h3>
        
        {historyLogs.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground border-dashed bg-transparent">
            No entries yet. Log a mood above to start tracking!
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {historyLogs.slice(0, 10).map((log) => {
              const mood = MOOD_EMOJIS[log.mood_level]
              const logDateStr = log.date.split('T')[0]
              
              const completedTasks = tasks.filter(t => 
                t.completed && 
                (t.completed_at ? t.completed_at.startsWith(logDateStr) : t.created_at.startsWith(logDateStr))
              )

              return (
                <Card key={log.id} className="p-4 flex flex-col gap-4 bg-dark-surface hover:bg-dark-surface/80 transition-colors border-dark-border/50">
                  <div className="flex items-center gap-4">
                    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-dark-bg text-2xl ring-1 ring-dark-border">
                      {mood.emoji}
                    </div>
                    <div className="flex flex-col overflow-hidden">
                      <span className="font-medium text-foreground">{mood.label}</span>
                      <span className="text-xs text-muted-foreground">
                        {format(parseISO(log.date), 'MMM d, yyyy')}
                      </span>
                      {log.note && (
                        <span className="mt-1 truncate text-sm italic text-foreground/70">
                          "{log.note}"
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {completedTasks.length > 0 && (
                    <div className="border-t border-dark-border/50 pt-3 mt-1">
                      <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Accomplished</p>
                      <ul className="space-y-1.5">
                        {completedTasks.map(t => (
                          <li key={t.id} className="flex items-start gap-2 text-sm text-foreground/80">
                            <CheckCircle2 className="h-4 w-4 shrink-0 text-success-green mt-0.5" />
                            <span className="leading-tight">{t.title}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </Card>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
