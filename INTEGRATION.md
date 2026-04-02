# FocusFlow Integration Guide

Follow these steps to complete the setup of your ADHD-focused productivity app.

## 1. Supabase Setup
1. Create a project on [Supabase](https://supabase.com/).
2. Go to **Project Settings -> API** and copy:
   - `Project URL`
   - `anon public` key
3. Paste these inside your `.env.local` file (copy `.env.local.example` if it doesn't exist).
```env
NEXT_PUBLIC_SUPABASE_URL=your-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## 2. Database Schema
1. Open the Supabase dashboard.
2. Go to the **SQL Editor** in the left sidebar.
3. Copy the entire contents of `supabase/schema.sql` (located in the root of your project).
4. Paste it into the editor and click **Run**.
5. *Success! Your tables, profiles trigger, and security rules are ready.*

## 3. OpenAI Setup (Optional)
If you want the AI task breakdown feature to work with real AI:
1. Get an API key from [OpenAI](https://platform.openai.com/).
2. Add it to your `.env.local`:
```env
OPENAI_API_KEY=your-openapi-key
```
*(If you skip this, the app gracefully falls back to a smart suggestion engine).*

## 4. Run the App
From the `focusflow` directory in your terminal run:
```bash
npm run dev
```

Visit `http://localhost:3000` to register your first user and enter the flow state!
