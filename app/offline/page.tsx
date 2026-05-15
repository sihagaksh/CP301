'use client';

export default function OfflinePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
      <div className="text-center px-6">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white text-4xl font-bold mx-auto mb-6">
        </div>
        <h1 className="text-2xl font-bold mb-2">You&apos;re offline</h1>
        <p className="text-muted-foreground mb-6 max-w-xs mx-auto">
          It looks like you don&apos;t have an internet connection right now. Please check your network and try again.
        </p>
        <button
          onClick={() => window.location.reload()}
          className="bg-amber-500 hover:bg-amber-600 text-white font-semibold px-6 py-2.5 rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}
