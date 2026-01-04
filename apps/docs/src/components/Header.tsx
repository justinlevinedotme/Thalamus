import { Link } from "react-router-dom";
import { Book, Moon, Sun } from "lucide-react";
import { ThalamusLogo } from "./ThalamusLogo";
import { useTheme } from "@/lib/theme";

export function Header() {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="flex h-14 items-center justify-between px-4 md:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Link to="/" className="flex items-center">
            <ThalamusLogo size="md" />
          </Link>
          <Link
            to="/docs"
            className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            <Book className="h-4 w-4" />
            Docs
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <a
            href="https://thalamus.sh"
            className="text-sm font-medium text-muted-foreground transition hover:text-foreground"
          >
            App
          </a>
          <button
            type="button"
            onClick={toggleTheme}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition hover:bg-secondary hover:text-foreground"
            aria-label={resolvedTheme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>
        </div>
      </nav>
    </header>
  );
}
