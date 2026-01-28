import { Link } from "@tanstack/react-router";

export function Header() {
  return (
    <header className="border-b border-border">
      <div className="container mx-auto py-2 md:py-6 flex items-center justify-between">
        <Link to="/">
          <h1 className="text-4xl text-white font-bold tracking-tight">Criccahub</h1>
        </Link>
        <nav>
          <Link
            to="/registry"
            className="text-sm font-medium text-muted-foreground hover:text-white transition-colors"
          >
            Registry
          </Link>
        </nav>
      </div>
    </header>
  );
}
