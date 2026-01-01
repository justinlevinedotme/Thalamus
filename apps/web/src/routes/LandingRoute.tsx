/**
 * @file LandingRoute.tsx
 * @description Public landing page - conversion focused with rich visuals
 */

import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { Sparkles, Zap, Share2, Layout, MousePointer2, Download } from "lucide-react";
import { ShimmerButton } from "../components/ui/shimmer-button";
import { motion } from "framer-motion";

import Header from "../components/Header";
import { useTheme } from "../lib/theme";
import { cn } from "../lib/utils";

function EditorPreview() {
  return (
    <div className="relative w-full overflow-hidden rounded-xl border border-border/50 shadow-2xl">
      <div className="flex h-8 items-center gap-2 border-b border-border/50 bg-[#1a1a1a] px-3">
        <div className="flex gap-1.5">
          <div className="size-3 rounded-full bg-[#ff5f57]" />
          <div className="size-3 rounded-full bg-[#febc2e]" />
          <div className="size-3 rounded-full bg-[#28c840]" />
        </div>
        <span className="ml-2 text-xs text-muted-foreground">Fantasy League Playoffs</span>
      </div>
      <img
        src="/assets/demo-screenshot.png"
        alt="Thalamus editor showing a fantasy league playoffs bracket"
        className="w-full"
      />
    </div>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  description,
  className,
  delay = 0,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  className?: string;
  delay?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all duration-500 hover:border-border hover:bg-card/80",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="relative z-10">
        <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-all duration-300 group-hover:scale-110 group-hover:text-accent-brand">
          <Icon className="size-6" strokeWidth={1.5} />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

function UseCaseCard({
  title,
  description,
  tags,
  delay = 0,
}: {
  title: string;
  description: string;
  tags: string[];
  delay?: number;
}) {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={cn(
        "group rounded-xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 p-5 backdrop-blur-sm transition-all duration-500 hover:border-border",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <h4 className="mb-2 font-semibold text-foreground">{title}</h4>
      <p className="mb-3 text-sm text-muted-foreground">{description}</p>
      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-muted/50 px-2.5 py-0.5 text-xs text-muted-foreground transition-colors group-hover:bg-muted"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}

export default function LandingRoute() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: isDark
            ? "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(255,255,255,0.03), transparent)"
            : "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(0,0,0,0.02), transparent)",
        }}
      />

      <div className="relative z-10">
        <Header />

        <main>
          {/* Hero Section */}
          <section className="relative px-6 pb-16 pt-12 md:pb-24 md:pt-20">
            <div className="mx-auto max-w-6xl">
              <div className="mb-12 text-center md:mb-16">
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mb-4 inline-block"
                >
                  <ShimmerButton
                    background="hsl(var(--muted))"
                    shimmerColor="hsl(var(--accent-brand))"
                    className="px-4 py-1.5 text-sm !text-foreground"
                  >
                    Free to use. No signup required.
                  </ShimmerButton>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl"
                >
                  Think in{" "}
                  <span className="underline decoration-accent-brand decoration-2 underline-offset-4">
                    nodes
                  </span>{" "}
                  and{" "}
                  <span className="underline decoration-accent-brand decoration-2 underline-offset-4">
                    connections
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground"
                >
                  Thalamus is a visual canvas for mapping ideas, connecting thoughts, and building
                  knowledge graphs. See your thinking take shape. Self-host or use in the cloud.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
                >
                  <Link
                    to="/editor"
                    className="group inline-flex items-center gap-2 rounded-xl bg-accent-brand px-8 py-4 text-base font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
                  >
                    Open Editor
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/50 px-6 py-4 text-base font-medium text-foreground backdrop-blur-sm transition-all duration-200 hover:bg-card"
                  >
                    Sign in to save your work
                  </Link>
                </motion.div>
              </div>

              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="relative"
              >
                <div className="absolute -inset-px rounded-xl bg-gradient-to-b from-accent-brand/20 via-transparent to-transparent blur-sm" />
                <EditorPreview />
              </motion.div>
            </div>
          </section>

          <section className="border-y border-border/50 bg-card/30 px-6 py-6 backdrop-blur-sm">
            <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground md:gap-16">
              <div className="flex items-center gap-2">
                <Zap className="size-4" />
                <span>Instant start</span>
              </div>
              <div className="flex items-center gap-2">
                <Download className="size-4" />
                <span>Export to PNG, PDF, JSON</span>
              </div>
              <div className="flex items-center gap-2">
                <Share2 className="size-4" />
                <span>Shareable links</span>
              </div>
              <div className="flex items-center gap-2">
                <Layout className="size-4" />
                <span>Auto-layout</span>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section className="px-6 py-20 md:py-32">
            <div className="mx-auto max-w-6xl">
              <div className="mb-12 text-center md:mb-16">
                <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
                  Built for how you think
                </h2>
                <p className="mx-auto max-w-2xl text-muted-foreground">
                  Whether you're brainstorming, researching, or organizing complex ideas, Thalamus
                  adapts to your workflow.
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <FeatureCard
                  icon={MousePointer2}
                  title="Intuitive editing"
                  description="Double-click to create, drag to connect. Everything feels natural. Keyboard shortcuts for power users."
                  delay={0}
                />
                <FeatureCard
                  icon={Layout}
                  title="Smart layouts"
                  description="Auto-arrange your graph with multiple algorithms. Horizontal, vertical, radial — pick what fits."
                  delay={100}
                />
                <FeatureCard
                  icon={Zap}
                  title="Blazing fast"
                  description="Handles hundreds of nodes without breaking a sweat. Smooth pan and zoom at any scale."
                  delay={200}
                />
                <FeatureCard
                  icon={Share2}
                  title="Share anywhere"
                  description="Generate public links, embed in docs, or export as images. Collaboration made simple."
                  delay={300}
                />
                <FeatureCard
                  icon={Sparkles}
                  title="Rich content"
                  description="Add formatted text, links, and styles to your nodes. Make your graphs expressive."
                  delay={400}
                />
                <FeatureCard
                  icon={Download}
                  title="Your data, your way"
                  description="Export to PNG for presentations, PDF for documents, or JSON to move your data anywhere."
                  delay={500}
                />
              </div>
            </div>
          </section>

          {/* Use Cases Section */}
          <section className="border-t border-border/50 bg-card/20 px-6 py-20 md:py-32">
            <div className="mx-auto max-w-6xl">
              <div className="mb-12 text-center md:mb-16">
                <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
                  What will you map?
                </h2>
                <p className="mx-auto max-w-2xl text-muted-foreground">
                  From personal projects to team brainstorms, Thalamus helps you see the big
                  picture.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <UseCaseCard
                  title="Research & Learning"
                  description="Connect concepts, track sources, and build understanding as you learn."
                  tags={["Students", "Researchers", "Self-learners"]}
                  delay={0}
                />
                <UseCaseCard
                  title="Project Planning"
                  description="Map dependencies, track milestones, and visualize your project structure."
                  tags={["Product managers", "Developers", "Designers"]}
                  delay={100}
                />
                <UseCaseCard
                  title="Brainstorming"
                  description="Capture ideas as they flow, then organize and refine them into plans."
                  tags={["Teams", "Creatives", "Strategists"]}
                  delay={200}
                />
                <UseCaseCard
                  title="Writing & Content"
                  description="Outline articles, plan narratives, and organize complex writing projects."
                  tags={["Writers", "Journalists", "Content creators"]}
                  delay={300}
                />
                <UseCaseCard
                  title="System Design"
                  description="Document architectures, map integrations, and communicate technical decisions."
                  tags={["Engineers", "Architects", "Technical leads"]}
                  delay={400}
                />
                <UseCaseCard
                  title="Personal Knowledge"
                  description="Build your second brain. Connect everything you learn and never lose an insight."
                  tags={["PKM enthusiasts", "Note-takers", "Lifelong learners"]}
                  delay={500}
                />
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="px-6 py-20 md:py-32">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
                Ready to start mapping?
              </h2>
              <p className="mb-8 text-lg text-muted-foreground">
                Jump straight into the editor. No account needed, no credit card, no friction.
              </p>
              <Link
                to="/editor"
                className="group inline-flex items-center gap-2 rounded-xl bg-accent-brand px-8 py-4 text-lg font-semibold text-white shadow-lg transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl"
              >
                Open Editor
              </Link>
              <p className="mt-6 text-sm text-muted-foreground">
                Works in your browser. Nothing to install.
              </p>
            </div>
          </section>
        </main>

        {/* Minimal footer - keeping existing for now */}
        <footer className="border-t border-border/50 px-6 py-6">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <p className="text-sm text-muted-foreground">Thalamus is open source under AGPL-3.0.</p>
          </div>
        </footer>
      </div>
    </div>
  );
}
