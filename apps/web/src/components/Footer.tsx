import { Moon, Sun } from "lucide-react";
import { useTheme } from "../lib/theme";

export default function Footer() {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <footer className="flex items-center justify-between border-t border-border bg-background px-4 py-3 text-xs text-muted-foreground">
      <span>Thalamus is open source under AGPL-3.0. Source available on GitHub.</span>
      <button
        type="button"
        onClick={toggleTheme}
        className="flex h-7 w-7 items-center justify-center rounded-md transition hover:bg-secondary hover:text-foreground"
        aria-label={`Switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode`}
      >
        {resolvedTheme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </button>
    </footer>
  );
}
