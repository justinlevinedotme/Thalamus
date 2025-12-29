/**
 * @file LandingRoute.tsx
 * @description Public landing page with hero section, feature highlights, and call-to-action
 * buttons. Showcases the application's capabilities with theme-aware styling.
 */

import { Link } from "react-router-dom";
import { ArrowRight, GitBranch } from "lucide-react";

import { Features } from "../components/Features";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { useTheme } from "../lib/theme";

export default function LandingRoute() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className="relative min-h-screen w-full">
      {/* Horizon Glow */}
      <div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: isDark
            ? "radial-gradient(125% 125% at 50% 90%, #000000 40%, #1a0a00 100%)"
            : "radial-gradient(125% 125% at 50% 90%, #ffffff 40%, #fff5f0 100%)",
        }}
      />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Header />

        {/* Hero */}
        <main className="flex-1">
          <section className="px-6 py-24">
            <div className="mx-auto max-w-4xl text-center">
              <h1 className="text-5xl font-bold tracking-tight text-foreground sm:text-6xl">
                Map your ideas.
                <br />
                <span className="text-accent-brand">Connect your thoughts.</span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
                Thalamus is a visual thinking tool for building knowledge graphs. Create nodes, draw
                connections, and see your ideas take shape.
              </p>
              <div className="mt-10 flex items-center justify-center gap-4">
                <Link
                  to="/editor"
                  className="inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                >
                  Try the Editor
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <a
                  href="https://github.com/thalamusai/thalamus"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-lg border border-border px-6 py-3 text-sm font-medium text-foreground transition hover:bg-secondary"
                >
                  <GitBranch className="h-4 w-4" />
                  View on GitHub
                </a>
              </div>
            </div>
          </section>

          {/* Features */}
          <Features />

          {/* CTA */}
          <section className="px-6 py-24">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold text-foreground">Ready to start mapping?</h2>
              <p className="mt-4 text-muted-foreground">
                Create your first graph in seconds. No account required to try.
              </p>
              <Link
                to="/editor"
                className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 hover:shadow-[0_0_30px_rgba(255,79,0,0.4)]"
              >
                Open Editor
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </section>
        </main>

        <Footer />
      </div>
    </div>
  );
}
