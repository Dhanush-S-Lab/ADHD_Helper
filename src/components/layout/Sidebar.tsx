'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion } from 'framer-motion'
import {
  RocketIcon,
  LayoutDashboard,
  ListTodo,
  TimerReset,
  Smile,
  LogOut,
  UserIcon
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Tasks', href: '/tasks', icon: ListTodo },
  { name: 'Focus', href: '/focus', icon: TimerReset },
  { name: 'Mood', href: '/mood', icon: Smile },
  { name: 'Profile', href: '/profile', icon: UserIcon },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  
  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <aside className="fixed left-0 top-0 z-40 hidden h-screen w-64 flex-col border-r border-dark-border bg-dark-bg/50 backdrop-blur-xl md:flex">
      <div className="flex h-16 items-center px-6">
        <Link href="/" className="flex items-center gap-2 font-bold tracking-tight">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500/10 text-brand-500">
            <RocketIcon className="h-5 w-5" />
          </div>
          <span className="text-xl">FocusFlow</span>
        </Link>
      </div>

      <nav className="flex-1 space-y-2 p-4">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors relative',
                isActive 
                  ? 'text-foreground' 
                  : 'text-muted-foreground hover:bg-dark-surface hover:text-foreground'
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute inset-0 bg-brand-500/10 rounded-xl"
                  initial={false}
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <item.icon className={cn('h-5 w-5 relative z-10', isActive ? 'text-brand-400' : '')} />
              <span className="relative z-10">{item.name}</span>
            </Link>
          )
        })}
      </nav>

      <div className="p-4 border-t border-dark-border">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-rose-500/10 hover:text-rose-500"
        >
          <LogOut className="h-5 w-5" />
          Sign Out
        </button>
      </div>
    </aside>
  )
}
