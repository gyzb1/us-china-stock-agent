import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'US-China Stock Agent',
  description: 'Track top US stocks by volume with news analysis',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
