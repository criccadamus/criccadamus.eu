import { Link } from '@tanstack/react-router'
import { IconHome, IconArrowLeft } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'

export function NotFound() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-card rounded-lg border border-border p-8 text-center shadow-lg">
        <div className="mb-6">
          <div className="text-6xl font-bold text-muted-foreground mb-4">
            404
          </div>
          <h1 className="text-2xl font-bold text-foreground mb-2">
            Page not found
          </h1>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link to="/">
            <Button>
              <IconHome className="w-4 h-4 mr-2" />
              Go Home
            </Button>
          </Link>
          <Button variant="outline" onClick={() => window.history.back()}>
            <IconArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  )
}
