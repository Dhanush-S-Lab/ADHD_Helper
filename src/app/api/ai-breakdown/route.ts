import { NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

// Fallback steps if AI fails or no API key is provided
const getFallbackSteps = (title: string) => [
  `Open necessary tools or files for "${title}"`,
  'Spend 2 minutes reviewing what needs to be done',
  'Complete the first easy action immediately',
  'Set a timer for 15 minutes to keep going'
]

export async function POST(req: Request) {
  try {
    const { taskTitle } = await req.json()
    
    if (!taskTitle) {
      return NextResponse.json({ error: 'Task title is required' }, { status: 400 })
    }

    const apiKey = process.env.GEMINI_API_KEY
    if (!apiKey) {
      await new Promise(resolve => setTimeout(resolve, 1500))
      return NextResponse.json({ steps: getFallbackSteps(taskTitle) })
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      systemInstruction: 'You break down tasks into 3 to 4 extremely simple, actionable micro-steps for someone with ADHD who is struggling to start. Keep it incredibly short, no fluff, no numbers at the beginning of the steps. Return JSON with a "steps" array of strings.',
      generationConfig: {
        responseMimeType: 'application/json'
      }
    })

    const result = await model.generateContent(`Task: ${taskTitle}`)
    const text = result.response.text()
    const content = JSON.parse(text)
    
    return NextResponse.json({ steps: content.steps || getFallbackSteps(taskTitle) })
  } catch (error) {
    console.error('AI Breakdown Error:', error)
    return NextResponse.json({ steps: getFallbackSteps('this task') })
  }
}
