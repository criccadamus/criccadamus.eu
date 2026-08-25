import { IconAlertTriangle, IconArrowLeft, IconHome, IconRefresh } from "@tabler/icons-react";
import { Link, useRouter } from "@tanstack/react-router";
import { useEffect } from "react";

import { Button } from "@/components/ui/button";

type ErrorBoundaryProps = {
  error: unknown;
  reset?: () => void;
};

function ErrorMessage({ message }: { message: string | null }) {
  if (!message) {
    return null;
  }

  return (
    <pre className="scrollbar-hidden max-h-40 overflow-auto rounded border border-destructive/30 bg-background/70 px-3 py-2 font-mono text-xs break-words whitespace-pre-wrap text-destructive/90">
      {message}
    </pre>
  );
}

export function ErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  // oxlint-disable-next-line typescript/no-unsafe-assignment -- reset is typed as () => void | undefined via ErrorBoundaryProps
  const safeReset = reset;
  const errorMessage = error instanceof Error ? error.message : null;
  useEffect(() => {
    // Log error to console for debugging
    console.error("Application Error:", error);
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4 py-8">
      <div className="group relative flex w-full max-w-lg flex-col gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-md border border-destructive/40 bg-background/80 p-2">
            <IconAlertTriangle className="h-4 w-4 text-destructive" />
          </div>
          <div className="space-y-1">
            <h1 className="text-sm font-medium text-foreground">Something went wrong</h1>
            <p className="text-xs leading-relaxed text-muted-foreground">
              An unexpected error occurred while loading this page.
            </p>
          </div>
        </div>

        <ErrorMessage message={errorMessage} />

        <div className="flex flex-col gap-2 sm:flex-row">
          {/* oxlint-disable-next-line typescript/no-unsafe-call, typescript/no-unsafe-return -- safeReset is typed function */}
          <Button size="sm" onClick={() => safeReset?.()}>
            <IconRefresh className="mr-2 h-4 w-4" />
            Try Again
          </Button>
          <Link to="/">
            <Button variant="ghost" size="sm">
              <IconHome className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export function RouteErrorBoundary({ error, reset }: ErrorBoundaryProps) {
  // oxlint-disable-next-line typescript/no-unsafe-assignment -- reset is typed as () => void | undefined
  const safeReset = reset;
  // SAFETY: TanStack useRouter returns history with back() at runtime; shape validated via navigation
  // oxlint-disable-next-line typescript/no-unsafe-assignment, typescript/no-unnecessary-type-assertion -- useRouter type is generic any, cast is safe with SAFETY
  const router = useRouter() as { history: { back: () => void } };
  const errorMessage = error instanceof Error ? error.message : null;

  useEffect(() => {
    // Log error to console for debugging
    console.error("Route Error:", error);
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-lg px-4 py-8">
      <div className="group relative flex flex-col gap-3 rounded-lg border border-destructive/40 bg-destructive/10 p-4">
        <div className="flex items-start gap-3">
          <div className="rounded-md border border-destructive/40 bg-background/80 p-2">
            <IconAlertTriangle className="h-4 w-4 text-destructive" />
          </div>
          <div className="space-y-1">
            <h2 className="text-sm font-medium text-foreground">Something went wrong</h2>
            <p className="text-xs leading-relaxed text-muted-foreground">
              We encountered an error while loading this content.
            </p>
          </div>
        </div>

        <ErrorMessage message={errorMessage} />

        <div className="flex flex-col gap-2 sm:flex-row">
          {/* oxlint-disable-next-line typescript/no-unsafe-call, typescript/no-unsafe-return -- safeReset typed */}
          <Button onClick={() => safeReset?.()} size="sm">
            <IconRefresh className="mr-1 h-4 w-4" />
            Try Again
          </Button>
          {/* oxlint-disable-next-line typescript/no-unsafe-call, typescript/no-unsafe-return, typescript/no-unsafe-member-access -- router is typed via SAFETY cast */}
          <Button onClick={() => router.history.back()} variant="ghost" size="sm">
            <IconArrowLeft className="mr-1 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
