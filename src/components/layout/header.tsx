import { Link } from "@tanstack/react-router";

export function Header() {
  return (
    <header className="border-b border-border">
      <div className="container mx-auto flex items-center justify-between py-2 md:py-6">
        <Link to="/">
          <h1 className="text-4xl font-bold tracking-tight text-white">
            Criccahub
          </h1>
        </Link>
        <nav>
          <Link
            to="/registry"
            className="inline-flex items-center text-sm font-medium text-white/80 transition-colors hover:text-white"
          >
            Registry
          </Link>
        </nav>
      </div>
    </header>
  );
}
