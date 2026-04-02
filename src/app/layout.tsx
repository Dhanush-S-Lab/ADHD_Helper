import type { Metadata } from 'next'
import { Outfit } from 'next/font/google'
import { Toaster } from 'react-hot-toast'
import './globals.css'

const appFont = Outfit({ subsets: ['latin'], variable: '--font-custom' })

export const metadata: Metadata = {
  title: 'FocusFlow | ADHD Productivity',
  description: 'A dopamine-friendly, ADHD-first productivity app.',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <body className={`${appFont.variable} min-h-screen bg-dark-bg font-sans text-foreground antialiased select-none`}>
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: '#161B27',
              color: '#F1F5F9',
              border: '1px solid #2A3143',
              borderRadius: '16px',
            },
            success: {
              iconTheme: { primary: '#10B981', secondary: '#161B27' },
            },
          }}
        />
      </body>
    </html>
  )
}
