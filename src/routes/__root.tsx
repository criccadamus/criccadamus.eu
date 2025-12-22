import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import { Toaster } from "sonner";

import appCss from "../styles.css?url";
import { ErrorBoundary } from "@/components/error-boundary";
import { NotFound } from "@/components/not-found";
import { Footer } from "@/components/layout/footer";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Criccahub",
      },
      {
        name: "description",
        content: "&quot;why dont you make a linktree?&quot; &quot;i'm a nerd&quot;",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
  errorComponent: ErrorBoundary,
  notFoundComponent: NotFound,
});

function RootDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
                document.documentElement.classList.toggle('dark', prefersDark);
              })();
            `,
          }}
        />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className="min-h-screen flex flex-col">
        <Toaster
          position="bottom-center"
          toastOptions={{
            classNames: {
              toast: "bg-primary text-primary-foreground border-primary",
              title: "text-primary-foreground font-semibold tracking-tight text-lg",
              description: "text-primary-foreground/80 font-mono",
            },
          }}
        />

        <div className="mx-auto w-full max-w-4xl px-4 py-8 flex-1">{children}</div>

        <Footer />
        <Scripts />
      </body>
    </html>
  );
}
