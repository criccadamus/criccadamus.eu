import projectPackage from "../../../package.json";
const VERSION = `${projectPackage.version}`;

/**
 * Footer component displaying app information and links.
 * Shows version, year, and GitHub repository link.
 *
 * @returns Footer element with app metadata
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full select-none border-t border-border mt-auto">
      <div className="flex items-center justify-center py-4 md:py-6 max-w-2xl mx-auto px-4">
        <div className="grid place-items-center border-r border-border pr-3 py-6">
          <div className="grid place-items-center">
            <span className="font-semibold tracking-tight flex items-center text-white">
              criccadamus.eu
            </span>
          </div>
          <span className="text-xs font-mono opacity-85 ml-px mt-2 text-white">
            v{VERSION} | {currentYear}
          </span>
        </div>
        <div className="flex flex-col gap-2 ml-3">
          <a
            href="https://github.com/criccadamus/criccadamus.eu"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-white hover:text-[#eeeeee] transition-colors"
            aria-label="View source code on GitHub"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5c.5.08.66-.23.66-.5v-1.69c-2.77.6-3.36-1.34-3.36-1.34c-.46-1.16-1.11-1.47-1.11-1.47c-.91-.62.07-.6.07-.6c1 .07 1.53 1.03 1.53 1.03c.87 1.52 2.34 1.07 2.91.83c.09-.65.35-1.09.63-1.34c-2.22-.25-4.55-1.11-4.55-4.92c0-1.11.38-2 1.03-2.71c-.1-.25-.45-1.29.1-2.64c0 0 .84-.27 2.75 1.02c.79-.22 1.65-.33 2.5-.33s1.71.11 2.5.33c1.91-1.29 2.75-1.02 2.75-1.02c.55 1.35.2 2.39.1 2.64c.65.71 1.03 1.6 1.03 2.71c0 3.82-2.34 4.66-4.57 4.91c.36.31.69.92.69 1.85V21c0 .27.16.59.67.5C19.14 20.16 22 16.42 22 12A10 10 0 0 0 12 2"
              />
            </svg>
            <span>Source code</span>
          </a>
          <div className="flex items-center gap-1.5 text-xs text-white/70 hover:text-[#eeeeee] transition-colors cursor-help">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path
                fill="currentColor"
                d="M20.177 3.823a2 2 0 0 0-2.159-.442c-4.449 1.787-7.792 4.76-10.517 9.357a2 2 0 0 0-.209.542c-1.38.215-2.6.903-3.442 1.993c-.916 1.185-1.295 2.695-1.066 4.254L3 21l1.473.217q.441.064.88.064c2.743 0 4.949-1.909 5.367-4.564a2 2 0 0 0 .544-.218c4.598-2.728 7.571-6.069 9.355-10.517a2 2 0 0 0-.442-2.159M5.353 19.281q-.288-.001-.59-.044c-.309-2.104 1.055-3.81 3-4.021l1.021 1.021c-.192 1.76-1.605 3.044-3.431 3.044m4.89-4.502l-1.021-1.021c.38-.641.774-1.233 1.178-1.804c.027.041 1.639 1.653 1.639 1.653c-.568.401-1.158.794-1.796 1.172m2.608-1.773s-1.821-1.801-1.879-1.824c2.147-2.784 4.651-4.685 7.791-5.943c-1.255 3.127-3.144 5.623-5.912 7.767"
              />
            </svg>
            <span>
              <span className="font-semibold tracking-tight">Cricca Damus</span>{" "}
              by juurikun
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
