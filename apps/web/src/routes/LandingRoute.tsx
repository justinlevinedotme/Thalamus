import { Link } from "react-router-dom";
import { ArrowRight, GitBranch, Layout, Share2, Sparkles } from "lucide-react";

import Footer from "../components/Footer";
import Header from "../components/Header";

export default function LandingRoute() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
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
        <section className="border-t border-border bg-card px-6 py-24">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-center text-3xl font-bold text-foreground">Think visually</h2>
            <p className="mx-auto mt-4 max-w-2xl text-center text-muted-foreground">
              Everything you need to organize complex ideas and see the big picture.
            </p>

            <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
              <div className="rounded-xl border border-border bg-background p-6 transition hover:shadow-[0_0_40px_-10px_rgba(0,212,255,0.25)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                  <Sparkles className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">Intuitive Editing</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Double-click to edit nodes, drag to connect, and use keyboard shortcuts for a
                  smooth workflow.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-background p-6 transition hover:shadow-[0_0_40px_-10px_rgba(0,212,255,0.25)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                  <Layout className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">Auto Layout</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Automatically arrange your graph with multiple layout algorithms. Choose the
                  direction and spacing that works best.
                </p>
              </div>

              <div className="rounded-xl border border-border bg-background p-6 transition hover:shadow-[0_0_40px_-10px_rgba(0,212,255,0.25)]">
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-secondary">
                  <Share2 className="h-6 w-6 text-foreground" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">Share & Export</h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  Generate shareable links, export as PNG, PDF, or JSON. Collaborate with your team
                  or publish your work.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-24">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-foreground">Ready to start mapping?</h2>
            <p className="mt-4 text-muted-foreground">
              Create your first graph in seconds. No account required to try.
            </p>
            <Link
              to="/editor"
              className="mt-8 inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition hover:opacity-90 hover:shadow-[0_0_30px_rgba(0,212,255,0.4)]"
            >
              Open Editor
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
