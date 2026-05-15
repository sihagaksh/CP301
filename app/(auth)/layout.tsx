import { ThemeToggle } from '@/components/ui/ThemeToggle';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header with theme toggle */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border">
        <div className="max-w-screen-2xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-serif font-bold text-lg md:text-xl">
            <img src="/applogo.svg" alt="Logo" className="h-8 w-auto flex-shrink-0 dark:hidden" />
            <img src="/applogo-dark.svg" alt="Logo" className="h-8 w-auto flex-shrink-0 hidden dark:block" />
            <span className="hidden sm:inline text-foreground">IIT Ropar</span>
          </div>
          <ThemeToggle />
        </div>
      </header>

      {/* Main content - centered */}
      <main className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {children}
        </div>
      </main>
    </div>
  )
}
