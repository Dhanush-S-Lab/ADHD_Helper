import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { messages } = await req.json()
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: 'Invalid messages format' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini key not configured' }, { status: 500 })
    }

    const systemPrompt = `You are an incredibly compassionate, ADHD-friendly productivity coach named FocusMate.
Your goal is to help the user regulate their emotions, break down paralyzing tasks, or just figure out what step to take next.
Keep your responses extremely brief (1-3 sentences max). Use formatting like bolding occasionally to emphasize the next action. Do not overwhelm the user.`

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt
    })

    let history = messages.slice(0, -1).map((m: any) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content || '' }]
    }))

    // Gemini requires history to start with a 'user' role
    while (history.length > 0 && history[0].role === 'model') {
      history.shift()
    }

    const chat = model.startChat({ history })
    const currentMessage = messages[messages.length - 1].content

    const result = await chat.sendMessage(currentMessage)
    const content = result.response.text()

    return NextResponse.json({ content })
  } catch (error) {
    console.error('Chat API Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
