import { HTMLAttributes, forwardRef } from 'react'
import { cn } from '@/lib/utils'

const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      'rounded-2xl border border-dark-border bg-dark-surface/50 text-foreground shadow-sm backdrop-blur-xl',
      className
    )}
    {...props}
  />
))
Card.displayName = 'Card'

export { Card }
