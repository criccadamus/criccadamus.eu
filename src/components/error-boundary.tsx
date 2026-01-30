import { IconAlertTriangle, IconHome, IconRefresh } from "@tabler/icons-react";
import { Link, ErrorComponentProps, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

export function ErrorBoundary({ error, reset }: ErrorComponentProps) {
  useEffect(() => {
    // Log error to console for debugging
    console.error("Application Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 text-center shadow-lg">
        <div className="mb-6">
          <IconAlertTriangle className="mx-auto mb-4 h-16 w-16 text-red-500" />
          <h1 className="mb-2 text-2xl font-bold text-foreground">Something went wrong</h1>
          <p className="text-muted-foreground">
            An unexpected error occurred while loading this page.
          </p>
        </div>

        {error instanceof Error && (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-4 text-left">
            <p className="font-mono text-sm wrap-break-word text-red-400">{error.message}</p>
          </div>
        )}

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={() => reset()}>
            <IconRefresh className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Link to="/">
            <Button variant="outline">
              <IconHome className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function RouteErrorBoundary({ error, reset }: ErrorComponentProps) {
  const router = useRouter();

  useEffect(() => {
    // Log error to console for debugging
    console.error("Route Error:", error);
  }, [error]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mx-auto max-w-md rounded-lg border border-border bg-card p-8 text-center shadow-lg">
        <div className="mb-6">
          <IconAlertTriangle className="mx-auto mb-4 h-12 w-12 text-red-500" />
          <h2 className="mb-2 text-xl font-bold text-foreground">Something went wrong</h2>
          <p className="text-sm text-muted-foreground">
            We encountered an error while loading this content.
          </p>
        </div>

        {error instanceof Error && (
          <div className="mb-6 rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-left">
            <p className="font-mono text-xs wrap-break-word text-red-400">{error.message}</p>
          </div>
        )}

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Button onClick={() => reset()} size="sm">
            <IconRefresh className="mr-1 h-4 w-4" />
            Try Again
          </Button>
          <Button onClick={() => router.history.back()} variant="outline" size="sm">
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
