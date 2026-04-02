import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { subDays } from 'date-fns'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'Gemini key not configured' }, { status: 500 })
    }

    // Get last 7 days date
    const sevenDaysAgo = subDays(new Date(), 7).toISOString()

    // Fetch Moods
    const { data: moods } = await supabase
      .from('mood_logs')
      .select('date, mood_level, note')
      .eq('user_id', user.id)
      .gte('date', sevenDaysAgo.split('T')[0])
      .order('date', { ascending: true })

    // Fetch Tasks
    const { data: tasks } = await supabase
      .from('tasks')
      .select('title, completed_at')
      .eq('user_id', user.id)
      .eq('completed', true)
      .gte('completed_at', sevenDaysAgo)
      .order('completed_at', { ascending: true })

    const summaryContext = JSON.stringify({
      moodsInPast7Days: moods,
      tasksCompletedInPast7Days: tasks?.map(t => ({ title: t.title, date: t.completed_at?.split('T')[0] }))
    })

    const systemPrompt = `You are an empathetic, holistic ADHD and mental-wellness coach.
Review the following user JSON data containing their mood logs and tasks completed over the past 7 days.
Provide a short, extremely encouraging 2-3 sentence analysis. Focus on the relationship between what they accomplished and how they felt.
Acknowledge the unique challenges of ADHD—remind them that productivity shouldn't define their self-worth, and reassure them that fluctuating energy/mood is normal.
Format the output as a simple string without any markdown or conversational filler.`

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt 
    })

    const result = await model.generateContent(summaryContext)
    const content = result.response.text()

    return NextResponse.json({ analysis: content })
  } catch (error) {
    console.error('Mood Analysis Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
