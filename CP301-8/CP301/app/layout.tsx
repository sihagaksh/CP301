import type { Metadata, Viewport } from 'next'
import { DM_Sans, Playfair_Display, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import Script from 'next/script'
import { AuthProvider } from '@/contexts/AuthContext'
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration'
import { Toaster } from '@/components/ui/toaster'
import './globals.css'

const dmSans = DM_Sans({ subsets: ["latin"], variable: '--font-sans' });
const playfair = Playfair_Display({ subsets: ["latin"], variable: '--font-serif' });
const jetBrainsMono = JetBrains_Mono({ subsets: ["latin"], variable: '--font-mono' });

export const metadata: Metadata = {
  title: 'IIT Ropar Community Platform',
  description: 'Connect, collaborate, and celebrate the IIT Ropar community',
  applicationName: 'IIT Ropar Community Platform',
  keywords: ['IIT Ropar', 'community', 'students', 'events', 'marketplace', 'blogs'],
  authors: [{ name: 'IIT Ropar' }],
  icons: {
    icon: [
      {
        url: '/applogo.svg',
        media: '(prefers-color-scheme: light)',
        type: 'image/svg+xml',
      },
      {
        url: '/applogo-dark.svg',
        media: '(prefers-color-scheme: dark)',
        type: 'image/svg+xml',
      }
    ],
    apple: '/applogo.jpg',
  },
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: '#f59e0b',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Inline theme init — runs before first paint to prevent flash */}
        <Script src="/theme-init.js" strategy="beforeInteractive" />
      </head>
      <body className={`${dmSans.variable} ${playfair.variable} ${jetBrainsMono.variable} font-sans antialiased`}>
        <AuthProvider>
          {children}
          <Toaster />
          <ServiceWorkerRegistration />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
