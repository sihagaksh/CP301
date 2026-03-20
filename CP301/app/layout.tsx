import type { Metadata, Viewport } from 'next'
import { DM_Sans, Playfair_Display, JetBrains_Mono } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import Script from 'next/script'
import { AuthProvider } from '@/contexts/AuthContext'
import { ServiceWorkerRegistration } from '@/components/ServiceWorkerRegistration'
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
        url: '/icons/icon-512.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icons/icon-512.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icons/icon-512.png',
        sizes: '512x512',
        type: 'image/png',
      },
    ],
    apple: '/icons/icon-512.png',
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
        {/* Theme flash prevention script */}
      </head>
      <body className={`${dmSans.variable} ${playfair.variable} ${jetBrainsMono.variable} font-sans antialiased`}>
        <Script id="theme-script" strategy="beforeInteractive">
          {`
            (function() {
              const theme = localStorage.getItem('theme');
              const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
              const isDark = theme ? theme === 'dark' : prefersDark;
              if (isDark) document.documentElement.classList.add('dark');
            })();
          `}
        </Script>
        <AuthProvider>
          {children}
          <ServiceWorkerRegistration />
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  )
}
