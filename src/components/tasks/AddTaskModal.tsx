import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, X, Plus } from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import { useTaskStore } from '@/store/taskStore'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { XP_REWARDS } from '@/types'
import toast from 'react-hot-toast'

interface AddTaskModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddTaskModal({ isOpen, onClose }: AddTaskModalProps) {
  const [title, setTitle] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [steps, setSteps] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  
  const { addTask } = useTaskStore()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
    } else {
      setTitle('')
      setSteps([])
    }
  }, [isOpen])

  const handleBreakdown = async () => {
    if (!title.trim()) {
      toast.error('Enter a task title first')
      return
    }

    setIsGenerating(true)
    try {
      const res = await fetch('/api/ai-breakdown', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ taskTitle: title }),
      })
      
      const data = await res.json()
      if (data.steps) {
        setSteps(data.steps)
        toast.success('Task broken down!')
      } else {
        toast.error('Failed to generate steps')
      }
    } catch (e) {
      toast.error('AI breakdown failed')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    setIsSubmitting(true)
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const newTask = {
      user_id: user.id,
      title: title.trim(),
      steps,
      completed: false,
      xp_value: XP_REWARDS.TASK_COMPLETE
    }

    const { data, error } = await supabase
      .from('tasks')
      .insert(newTask)
      .select()
      .single()

    setIsSubmitting(false)

    if (error) {
      toast.error('Failed to save task')
    } else if (data) {
      addTask(data as any)
      toast.success('Task added')
      onClose()
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-dark-bg/80 backdrop-blur-sm"
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="w-full max-w-lg pointer-events-auto"
            >
              <div className="overflow-hidden rounded-2xl border border-dark-border bg-dark-surface shadow-2xl">
                <div className="flex items-center justify-between border-b border-dark-border px-6 py-4">
                  <h2 className="text-lg font-semibold text-foreground">Add New Task</h2>
                  <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                    <X className="h-4 w-4" />
                  </Button>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                  <div className="space-y-6">
                    <div>
                      <Input
                        ref={inputRef}
                        placeholder="What do you need to do?"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="h-12 border-0 bg-dark-bg/50 px-4 text-lg placeholder:text-muted-foreground/50 focus-visible:ring-1 focus-visible:ring-brand-500"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        onClick={handleBreakdown}
                        disabled={isGenerating || !title.trim()}
                        className="w-full text-brand-400 hover:text-brand-300 gap-2 border border-brand-500/20 bg-brand-500/5 hover:bg-brand-500/10"
                      >
                        {isGenerating ? (
                          <span className="flex items-center gap-2">
                            <span className="h-4 w-4 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
                            Breaking it down...
                          </span>
                        ) : (
                          <>
                            <Sparkles className="h-4 w-4" />
                            AI Breakdown
                          </>
                        )}
                      </Button>
                    </div>

                    {steps.length > 0 && (
                      <div className="space-y-3 rounded-xl bg-dark-bg/50 p-4 ring-1 ring-dark-border">
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Micro-steps
                        </h4>
                        <ul className="space-y-2">
                          {steps.map((step, i) => (
                            <li key={i} className="flex gap-2 text-sm">
                              <span className="text-brand-500 text-xs mt-0.5">•</span>
                              <span className="text-foreground/90">{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex justify-end pt-2">
                      <Button
                        type="submit"
                        disabled={!title.trim() || isSubmitting}
                        isLoading={isSubmitting}
                        className="w-full gap-2 sm:w-auto"
                      >
                        <Plus className="h-4 w-4" />
                        Add Task
                      </Button>
                    </div>
                  </div>
                </form>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
