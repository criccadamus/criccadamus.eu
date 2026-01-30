import type { ReactNode } from "react";

import { HeadContent, Scripts, createRootRoute } from "@tanstack/react-router";
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

function RootDocument({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                var media = window.matchMedia("(prefers-color-scheme: dark)");
                var apply = function(isDark) {
                  if (isDark) {
                    document.documentElement.classList.add("dark");
                  } else {
                    document.documentElement.classList.remove("dark");
                  }
                };
                apply(media.matches);
                if (typeof media.addEventListener === "function") {
                  media.addEventListener("change", function(e) {
                    apply(e.matches);
                  });
                } else if (typeof media.addListener === "function") {
                  media.addListener(function(e) {
                    apply(e.matches);
                  });
                }
              })();
            `,
          }}
        />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
        <link rel="manifest" href="/site.webmanifest" />
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

        <div className="mx-auto w-full max-w-4xl flex-1 px-4 py-3 md:py-8">{children}</div>

        <Footer />
        <Scripts />
      </body>
    </html>
  );
}
