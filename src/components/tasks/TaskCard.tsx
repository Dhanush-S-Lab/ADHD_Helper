import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Check, Trash2, ChevronDown, ChevronUp } from 'lucide-react'
import { Task, XP_REWARDS } from '@/types'
import { useTaskStore } from '@/store/taskStore'
import { useUserStore } from '@/store/userStore'
import { createClient } from '@/lib/supabase/client'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { useSoundEffect } from '@/hooks/useSoundEffect'
import toast from 'react-hot-toast'

interface TaskCardProps {
  task: Task
}

export function TaskCard({ task }: TaskCardProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isCompleting, setIsCompleting] = useState(false)
  const { updateTask, removeTask, activeTask, setActiveTask } = useTaskStore()
  const { addXP } = useUserStore()
  const playSound = useSoundEffect()
  
  const supabase = createClient()

  const isActive = activeTask?.id === task.id

  const handleComplete = async () => {
    setIsCompleting(true)
    playSound('pop')
    
    const now = new Date().toISOString()
    const { error } = await supabase
      .from('tasks')
      .update({ completed: true, completed_at: now })
      .eq('id', task.id)

    if (error) {
      toast.error('Failed to complete task')
      setIsCompleting(false)
      return
    }

    // Add XP
    addXP(task.xp_value || XP_REWARDS.TASK_COMPLETE)
    
    // Update Profile XP in DB
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      const { data: profile } = await supabase.from('profiles').select('xp').eq('id', user.id).single()
      if (profile) {
        await supabase.from('profiles').update({ xp: profile.xp + (task.xp_value || XP_REWARDS.TASK_COMPLETE) }).eq('id', user.id)
      }
    }

    toast.success(`Completed! +${task.xp_value || XP_REWARDS.TASK_COMPLETE} XP`, {
      icon: '🎉'
    })
    
    updateTask(task.id, { completed: true, completed_at: now })
    if (isActive) setActiveTask(null)
  }

  const handleDelete = async () => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', task.id)

    if (error) {
      toast.error('Failed to delete task')
      return
    }

    removeTask(task.id)
  }

  if (task.completed) return null

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
    >
      <Card
        className={cn(
          'overflow-hidden transition-all duration-300',
          isActive 
            ? 'border-brand-500/50 bg-brand-500/5 ring-1 ring-brand-500/50' 
            : 'hover:border-dark-border/80'
        )}
      >
        <div className="flex items-start gap-4 p-4">
          <button
            onClick={handleComplete}
            disabled={isCompleting}
            className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 border-muted-foreground/30 text-transparent transition-colors hover:border-success-green hover:text-success-green focus:outline-none focus:ring-2 focus:ring-success-green focus:ring-offset-2 focus:ring-offset-dark-bg disabled:opacity-50"
          >
            <Check className="h-4 w-4" />
          </button>

          <div className="flex-1 space-y-1">
            <h3 className={cn(
              "font-medium tracking-tight",
              isActive ? "text-brand-300" : "text-foreground"
            )}>
              {task.title}
            </h3>
            
            {task.steps && task.steps.length > 0 && (
              <div className="text-sm text-muted-foreground">
                {task.steps.length} micro-step{task.steps.length !== 1 ? 's' : ''}
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {!isActive && (
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setActiveTask(task.id)}
                className="hidden sm:flex"
              >
                Focus
              </Button>
            )}
            
            {task.steps && task.steps.length > 0 && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setIsExpanded(!isExpanded)}
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
              >
                {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </Button>
            )}
            
            <Button
              variant="ghost"
              size="icon"
              onClick={handleDelete}
              className="h-8 w-8 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <AnimatePresence>
          {isExpanded && task.steps && task.steps.length > 0 && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-t border-dark-border/50 bg-dark-bg/30"
            >
              <ul className="space-y-2 p-4 outline-none">
                {task.steps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-sm text-muted-foreground">
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-dark-bg text-[10px] font-medium text-brand-400 ring-1 ring-dark-border">
                      {idx + 1}
                    </span>
                    <span className="mt-0.5 leading-snug">{step}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}
