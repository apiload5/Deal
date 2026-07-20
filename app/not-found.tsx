export default function NotFound() {
  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
      <h1 className="text-6xl font-bold gradient-text">404</h1>
      <h2 className="mt-4 text-2xl font-semibold">Page Not Found</h2>
      <p className="mt-2 text-muted-foreground">
        The page you are looking for does not exist or has been moved.
      </p>
      <div className="mt-6 flex flex-wrap gap-4">
        <a
          href="/"
          className="inline-flex items-center gap-2 rounded-full bg-gradient-to-r from-orange-500 to-yellow-500 px-6 py-3 text-white font-semibold transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-orange-500/25"
        >
          🏠 Go Home
        </a>
        <a
          href="/properties"
          className="inline-flex items-center gap-2 rounded-full border border-input bg-background px-6 py-3 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
        >
          🔍 Browse Properties
        </a>
      </div>
    </div>
  )
}
