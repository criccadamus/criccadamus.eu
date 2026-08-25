import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
import type { ReactNode } from "react";
import { Toaster } from "sonner";

import { ErrorBoundary } from "@/components/error-boundary";
import { Footer } from "@/components/layout/footer";
import { ParallaxBackground } from "@/components/layout/parallax-background";
import { NotFound } from "@/components/not-found";

import appCss from "../styles.css?url";

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
        content: '"why dont you make a linktree?" "i\'m a nerd"',
      },
      {
        name: "theme-color",
        content: "#4f46e5",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "manifest",
        href: "/manifest.json",
      },
      {
        rel: "apple-touch-icon",
        href: "/apple-touch-icon.png",
      },
    ],
  }),

  shellComponent: RootDocument,
  errorComponent: ErrorBoundary,
  notFoundComponent: NotFound,
});

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script src="/theme-init.js" />
      </head>
      <body className="flex min-h-screen flex-col">
        <ParallaxBackground />
        <Toaster
          toastOptions={{
            classNames: {
              toast: "font-sans font-semibold text-xl tracking-tight",
            },
          }}
          richColors
          position="bottom-center"
        />
        <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-3 md:py-8">
          {children}
        </div>
        <Footer />
        <Scripts />
        <a href="https://github.com/criccadamus" className="sr-only" rel="me">
          GitHub
        </a>
        <a href="https://twitter.com/criccadamus" className="sr-only" rel="me">
          Twitter
        </a>
        <a
          href="https://bsky.app/profile/criccadamus.eu"
          className="sr-only"
          rel="me"
        >
          Bluesky
        </a>
      </body>
    </html>
  );
}
