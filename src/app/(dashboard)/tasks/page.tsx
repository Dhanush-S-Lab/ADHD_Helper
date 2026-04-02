'use client'

import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useTaskStore } from '@/store/taskStore'
import { TaskCard } from '@/components/tasks/TaskCard'
import { AddTaskModal } from '@/components/tasks/AddTaskModal'
import { Button } from '@/components/ui/Button'
import { motion } from 'framer-motion'

export default function TasksPage() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { tasks, activeTask } = useTaskStore()
  
  const incompleteTasks = tasks.filter(t => !t.completed)
  
  // Active task first, then others
  const displayTasks = activeTask 
    ? [activeTask, ...incompleteTasks.filter(t => t.id !== activeTask.id)]
    : incompleteTasks

  return (
    <div className="mx-auto max-w-3xl space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
          <p className="text-muted-foreground">What's on your mind today?</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Task
        </Button>
      </div>

      {displayTasks.length === 0 ? (
        <motion.div 
          initial={{ opacity: 0 }} 
          animate={{ opacity: 1 }} 
          className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-dark-border py-20 text-center"
        >
          <div className="mb-4 text-4xl">✨</div>
          <h3 className="mb-1 text-lg font-medium text-foreground">You're all caught up!</h3>
          <p className="mb-6 max-w-sm text-sm text-muted-foreground">
            Your task list is empty. Take a break, or add a new task if there's more to do.
          </p>
          <Button onClick={() => setIsModalOpen(true)} variant="secondary">
            Add your first task
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {displayTasks.map(task => (
            <TaskCard key={task.id} task={task} />
          ))}
        </div>
      )}

      <AddTaskModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  )
}
