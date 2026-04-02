'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, X, Send, Bot, User } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { useSoundEffect } from '@/hooks/useSoundEffect'
import toast from 'react-hot-toast'

interface Message {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export function Chatbot() {
  const formatMessage = (text: string) => {
    if (!text) return ''
    let formatted = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-foreground">$1</strong>')
    formatted = formatted.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    formatted = formatted.replace(/^- (.*)$/gm, '<li class="ml-4 list-disc">$1</li>')
    formatted = formatted.replace(/\n/g, '<br />')
    return formatted
  }
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: "Hi! I'm your ADHD Focus Coach. Overwhelmed? Stuck? Just tell me what's on your mind and we'll figure out the next step together." }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const playSound = useSoundEffect()

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    if (isOpen) {
      scrollToBottom()
    }
  }, [messages, isOpen])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return
    const userMsg: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setIsLoading(true)
    playSound('pop')

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMsg] })
      })
      
      const data = await res.json()
      if (data.content) {
        setMessages(prev => [...prev, { role: 'assistant', content: data.content }])
        playSound('bloop')
      } else {
        toast.error('Coach is taking a nap. Try again!')
      }
    } catch (error) {
      toast.error('Connection issue. Breathe and try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <AnimatePresence>
        {!isOpen && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed bottom-24 md:bottom-6 right-6 z-50"
          >
            <Button 
              onClick={() => setIsOpen(true)}
              className="h-16 w-16 rounded-full shadow-2xl shadow-brand-500/30 hover:scale-105 active:scale-95 transition-transform p-0"
            >
              <MessageCircle className="h-8 w-8 text-white relative z-10" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%', opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: '100%', opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 z-50 h-full w-full sm:w-[400px] bg-dark-bg/95 backdrop-blur-3xl border-l border-brand-500/20 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-dark-border/50 shrink-0">
              <div className="flex items-center gap-3">
                <div className="bg-brand-500/20 p-2 rounded-xl text-brand-400">
                  <Bot className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">ADHD Coach</h3>
                  <p className="text-xs text-success-green flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-success-green block" /> Online
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="rounded-full">
                <X className="h-5 w-5 text-muted-foreground" />
              </Button>
            </div>

            {/* Chat Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg, idx) => (
                <div key={idx} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${msg.role === 'user' ? 'bg-accent-teal/20 text-accent-teal' : 'bg-brand-500/20 text-brand-400'}`}>
                    {msg.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div 
                    className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user' 
                        ? 'bg-accent-teal/10 text-foreground border border-accent-teal/20 rounded-tr-sm' 
                        : 'bg-dark-surface border border-dark-border rounded-tl-sm text-foreground/90'
                    }`}
                    dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                  />
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="shrink-0 h-8 w-8 rounded-full flex items-center justify-center bg-brand-500/20 text-brand-400">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="max-w-[75%] rounded-2xl px-4 py-3 bg-dark-surface border border-dark-border rounded-tl-sm flex items-center gap-1">
                    <span className="h-2 w-2 bg-brand-400 rounded-full animate-bounce" />
                    <span className="h-2 w-2 bg-brand-400 rounded-full animate-bounce delay-75" />
                    <span className="h-2 w-2 bg-brand-400 rounded-full animate-bounce delay-150" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 border-t border-dark-border/50 shrink-0 bg-dark-bg">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex items-center gap-2"
              >
                <div className="relative flex-1">
                  <Input 
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="I don't know where to start..."
                    className="pr-12 py-6 rounded-2xl border-dark-border bg-dark-surface focus-visible:ring-brand-500"
                    disabled={isLoading}
                  />
                  <Button 
                    type="submit"
                    size="icon"
                    className="absolute right-1.5 top-1.5 h-9 w-9 rounded-xl bg-brand-500 text-white hover:bg-brand-400 disabled:opacity-50"
                    disabled={!input.trim() || isLoading}
                  >
                    <Send className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
