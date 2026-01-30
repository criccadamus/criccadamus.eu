import { IconHome, IconArrowLeft } from "@tabler/icons-react";
import { Link } from "@tanstack/react-router";

import { Button } from "@/components/ui/button";

export function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md rounded-lg border border-border bg-card p-8 text-center shadow-lg">
        <div className="mb-6">
          <div className="mb-4 text-6xl font-bold text-muted-foreground">404</div>
          <h1 className="mb-2 text-2xl font-bold text-foreground">Page not found</h1>
          <p className="text-muted-foreground">
            The page you're looking for doesn't exist or has been moved.
          </p>
        </div>

        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <Link to="/">
            <Button>
              <IconHome className="mr-2 h-4 w-4" />
              Go Home
            </Button>
          </Link>
          <Button variant="outline" onClick={() => window.history.back()}>
            <IconArrowLeft className="mr-2 h-4 w-4" />
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
