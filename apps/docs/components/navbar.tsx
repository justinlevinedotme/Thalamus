"use client";

import Link from "next/link";
import { useTheme } from "next-themes";
import { Moon, Sun, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@thalamus/ui";
import { ThalamusLogo } from "./thalamus-logo";

const docsLinks = [
  {
    title: "Introduction",
    href: "/docs",
    description: "Welcome to Thalamus documentation.",
  },
  {
    title: "Getting Started",
    href: "/docs/getting-started",
    description: "Quick start guide for new users.",
  },
  {
    title: "Creating Diagrams",
    href: "/docs/guides/creating-diagrams",
    description: "Learn how to build your first diagram.",
  },
];

export function Navbar() {
  const { resolvedTheme, setTheme } = useTheme();

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  return (
    <header className="sticky top-0 z-50 bg-background px-4 py-4 after:absolute after:-bottom-8 after:left-0 after:right-0 after:h-8 after:bg-gradient-to-b after:from-background after:to-transparent after:pointer-events-none">
      <nav className="flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/docs" className="flex items-center">
            <ThalamusLogo size="md" />
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger className="group flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium text-foreground hover:bg-accent hover:text-accent-foreground outline-none">
              Docs
              <ChevronDown className="h-4 w-4 transition-transform duration-200 group-data-[state=open]:rotate-180" />
            </DropdownMenuTrigger>
            <DropdownMenuContent
              align="start"
              className="w-[280px] bg-popover border border-border shadow-lg"
            >
              {docsLinks.map((link) => (
                <DropdownMenuItem
                  key={link.href}
                  asChild
                  className="flex-col items-start gap-1 p-3"
                >
                  <Link href={link.href}>
                    <div className="text-sm font-medium">{link.title}</div>
                    <p className="text-sm text-muted-foreground">{link.description}</p>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="http://localhost:5175"
            className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:opacity-90"
          >
            Get Started
          </Link>
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
