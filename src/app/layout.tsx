import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'IIT Ropar Community',
  description: 'The unified institute community platform for IIT Ropar — connecting students, faculty, staff, alumni, and visitors.',
  keywords: ['IIT Ropar', 'community', 'campus', 'events', 'blogs', 'marketplace'],
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
