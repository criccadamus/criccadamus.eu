import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import { Toaster } from 'sonner'

import appCss from '../styles.css?url'
import { ErrorBoundary } from '@/components/error-boundary'
import { NotFound } from '@/components/not-found'
import { Footer } from '@/components/footer'

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: 'utf-8',
      },
      {
        name: 'viewport',
        content: 'width=device-width, initial-scale=1',
      },
      {
        title: 'Criccahub',
      },
      {
        name: 'description',
        content: 'Personal hub for Criccadamus - Gaming, streaming, and more',
      },
    ],
    links: [
      {
        rel: 'stylesheet',
        href: appCss,
      },
    ],
  }),

  shellComponent: RootDocument,
  errorComponent: ErrorBoundary,
  notFoundComponent: NotFound,
})

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
      </head>
      <body>
        <Toaster
          position="bottom-center"
          toastOptions={{
            classNames: {
              toast: 'bg-primary text-primary-foreground border-primary',
              title: 'text-primary-foreground',
              description: 'text-primary-foreground/80',
            },
          }}
        />
        <div className="mx-auto w-full max-w-4xl px-4 py-8">{children}</div>
        <Footer />
        <TanStackDevtools
          config={{
            position: 'bottom-right',
          }}
          plugins={[
            {
              name: 'Tanstack Router',
              render: <TanStackRouterDevtoolsPanel />,
            },
          ]}
        />
        <Scripts />
      </body>
    </html>
  )
}
