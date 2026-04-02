'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ListTodo, TimerReset, Smile, UserIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { name: 'Dashboard', href: '/', icon: LayoutDashboard },
  { name: 'Tasks', href: '/tasks', icon: ListTodo },
  { name: 'Focus', href: '/focus', icon: TimerReset },
  { name: 'Mood', href: '/mood', icon: Smile },
  { name: 'Profile', href: '/profile', icon: UserIcon },
]

export function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="fixed bottom-0 left-0 z-40 w-full border-t border-dark-border bg-dark-bg/90 backdrop-blur-xl md:hidden pb-safe">
      <div className="flex h-16 items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = pathname === item.href
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex flex-col items-center justify-center w-full h-full gap-1 transition-colors',
                isActive ? 'text-brand-400' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <div
                className={cn(
                  'flex h-8 w-16 items-center justify-center rounded-xl transition-colors',
                  isActive ? 'bg-brand-500/20' : 'bg-transparent'
                )}
              >
                <item.icon className="h-5 w-5" />
              </div>
              <span className="text-[10px] font-medium leading-none">{item.name}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
