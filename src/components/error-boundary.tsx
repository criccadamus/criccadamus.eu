import { Link, ErrorComponentProps, useRouter } from '@tanstack/react-router'
import { IconAlertTriangle, IconHome, IconRefresh } from '@tabler/icons-react'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export function ErrorBoundary({ error, reset }: ErrorComponentProps) {
  useEffect(() => {
    // Log error to console for debugging
    console.error('Application Error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card rounded-lg border border-border p-8 text-center shadow-lg">
        <div className="mb-6">
          <IconAlertTriangle className="w-16 h-16 mx-auto text-red-500 mb-4" />
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Something went wrong
          </h1>
          <p className="text-muted-foreground">
            An unexpected error occurred while loading this page.
          </p>
        </div>

        {error instanceof Error && (
          <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-left">
            <p className="text-sm font-mono text-red-400 wrap-break-word">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => reset()}>
            <IconRefresh className="w-4 h-4 mr-2" />
            Try Again
          </Button>
          <Link to="/">
            <Button variant="outline">
              <IconHome className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  )
}

export function RouteErrorBoundary({ error, reset }: ErrorComponentProps) {
  const router = useRouter()

  useEffect(() => {
    // Log error to console for debugging
    console.error('Route Error:', error)
  }, [error])

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="max-w-md mx-auto bg-card rounded-lg border border-border p-8 text-center shadow-lg">
        <div className="mb-6">
          <IconAlertTriangle className="w-12 h-12 mx-auto text-red-500 mb-4" />
          <h2 className="text-xl font-bold text-foreground mb-2">
            Something went wrong
          </h2>
          <p className="text-muted-foreground text-sm">
            We encountered an error while loading this content.
          </p>
        </div>

        {error instanceof Error && (
          <div className="mb-6 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-left">
            <p className="text-xs font-mono text-red-400 wrap-break-word">
              {error.message}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button onClick={() => reset()} size="sm">
            <IconRefresh className="w-4 h-4 mr-1" />
            Try Again
          </Button>
          <Button
            onClick={() => router.history.back()}
            variant="outline"
            size="sm"
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  )
}
