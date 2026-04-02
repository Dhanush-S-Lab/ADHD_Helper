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

    const { currentMood } = await req.json()

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      return NextResponse.json({
        tasks: [
          'Drink a glass of water',
          'Take 5 deep breaths',
          'Stand up and stretch for 1 minute'
        ]
      })
    }

    const systemPrompt = `You are a holistic mental-wellness assistant.
Your goal is to suggest 3 very tiny, low-effort wellness or self-care micro-tasks for a person with ADHD based on their current mood.
If their mood is "Rough" or "Meh", suggest calming, emotional regulation, or peace-of-mind tasks.
If their mood is "Good" or "Great", suggest momentum-building or healthy habit tasks (like drinking water).
Format your response purely as JSON.`

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: systemPrompt,
      generationConfig: {
        responseMimeType: 'application/json'
      }
    })

    const result = await model.generateContent(`Current mood: ${currentMood || 'neutral'}. Return JSON with exactly a "tasks" array of strings.`)
    const text = result.response.text()
    const content = JSON.parse(text)

    return NextResponse.json({ tasks: content.tasks })
  } catch (error) {
    console.error('Wellness Suggestions Error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
