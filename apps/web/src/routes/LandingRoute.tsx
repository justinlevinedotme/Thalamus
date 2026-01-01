/**
 * @file LandingRoute.tsx
 * @description Public landing page - conversion focused with rich visuals
 */

import { Link } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import {
  Sparkles,
  Zap,
  Share2,
  Layout,
  MousePointer2,
  Download,
  Lightbulb,
  GitBranch,
  PenTool,
  Cpu,
  Brain,
  BookOpen,
} from "lucide-react";
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

function BentoCard({
  icon: Icon,
  title,
  description,
  className,
  gradient,
  size = "default",
  delay = 0,
  children,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
  className?: string;
  gradient?: string;
  size?: "default" | "large" | "wide";
  delay?: number;
  children?: React.ReactNode;
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
        "group relative overflow-hidden rounded-2xl border border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-500",
        "hover:border-accent-brand/30 hover:shadow-[0_0_40px_-12px] hover:shadow-accent-brand/20",
        size === "large" && "md:col-span-2 md:row-span-2",
        size === "wide" && "md:col-span-2",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {gradient && (
        <div
          className="pointer-events-none absolute inset-0 opacity-50 transition-opacity duration-500 group-hover:opacity-70"
          style={{ background: gradient }}
        />
      )}
      <div className={cn("relative z-10 flex h-full flex-col", size === "large" ? "p-8" : "p-6")}>
        <div
          className={cn(
            "mb-4 flex items-center justify-center rounded-xl bg-accent-brand/10 text-accent-brand transition-all duration-300 group-hover:scale-110 group-hover:bg-accent-brand/20",
            size === "large" ? "size-16" : "size-12"
          )}
        >
          <Icon className={size === "large" ? "size-8" : "size-6"} strokeWidth={1.5} />
        </div>
        <h3
          className={cn(
            "mb-2 font-semibold text-foreground",
            size === "large" ? "text-2xl" : "text-lg"
          )}
        >
          {title}
        </h3>
        <p
          className={cn(
            "text-muted-foreground leading-relaxed",
            size === "large" ? "text-base" : "text-sm"
          )}
        >
          {description}
        </p>
        {children && <div className="mt-auto pt-6">{children}</div>}
      </div>
    </div>
  );
}

function KeyboardShortcut({ keys, label }: { keys: string[]; label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-1">
        {keys.map((key, i) => (
          <kbd
            key={i}
            className="inline-flex h-7 min-w-7 items-center justify-center rounded-md border border-border bg-muted/50 px-2 font-mono text-xs text-muted-foreground"
          >
            {key}
          </kbd>
        ))}
      </div>
      <span className="text-sm text-muted-foreground">{label}</span>
    </div>
  );
}

function UseCaseCard({
  icon: Icon,
  title,
  description,
  delay = 0,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
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
        "group relative overflow-hidden rounded-2xl border border-border/50 bg-card/60 p-6 backdrop-blur-sm transition-all duration-500",
        "hover:border-border hover:bg-card/80 hover:shadow-lg",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="absolute -right-6 -top-6 size-24 rounded-full bg-accent-brand/5 transition-transform duration-500 group-hover:scale-150" />
      <div className="relative z-10">
        <div className="mb-4 flex size-10 items-center justify-center rounded-lg bg-muted text-muted-foreground transition-colors duration-300 group-hover:text-accent-brand">
          <Icon className="size-5" strokeWidth={1.5} />
        </div>
        <h4 className="mb-2 text-lg font-semibold text-foreground">{title}</h4>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
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
          <section className="relative px-6 py-20 md:py-32">
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: isDark
                  ? "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255,79,0,0.06), transparent)"
                  : "radial-gradient(ellipse 60% 40% at 50% 0%, rgba(255,79,0,0.04), transparent)",
              }}
            />
            <div className="relative mx-auto max-w-6xl">
              <div className="mb-12 text-center md:mb-16">
                <p className="mb-3 text-sm font-medium uppercase tracking-wider text-accent-brand">
                  Features
                </p>
                <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
                  Built for how you think
                </h2>
                <p className="mx-auto max-w-2xl text-muted-foreground">
                  Whether you're brainstorming, researching, or organizing complex ideas, Thalamus
                  adapts to your workflow.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3 md:grid-rows-2">
                <BentoCard
                  icon={MousePointer2}
                  title="Intuitive editing"
                  description="Double-click to create, drag to connect. Everything feels natural. Keyboard shortcuts for power users who want speed."
                  size="large"
                  gradient="radial-gradient(ellipse at top left, rgba(255,79,0,0.08), transparent 60%)"
                  delay={0}
                >
                  <div className="flex flex-wrap gap-x-6 gap-y-3">
                    <KeyboardShortcut keys={["⌥", "N"]} label="Add node" />
                    <KeyboardShortcut keys={["⌥", "H"]} label="Heading" />
                    <KeyboardShortcut keys={["⌥", "S"]} label="Shape" />
                    <KeyboardShortcut keys={["⌘", "K"]} label="Search" />
                  </div>
                </BentoCard>
                <BentoCard
                  icon={Layout}
                  title="Smart layouts"
                  description="Auto-arrange with multiple algorithms. Horizontal, vertical, radial."
                  delay={100}
                />
                <BentoCard
                  icon={Zap}
                  title="Blazing fast"
                  description="Handles hundreds of nodes. Smooth pan and zoom at any scale."
                  delay={150}
                />
                <BentoCard
                  icon={Share2}
                  title="Share anywhere"
                  description="Generate public links, embed in docs, or export as images."
                  delay={200}
                />
                <BentoCard
                  icon={Download}
                  title="Your data, your way"
                  description="Export to PNG, PDF, or JSON. Take your data anywhere."
                  delay={250}
                />
                <BentoCard
                  icon={Sparkles}
                  title="Rich content"
                  description="Formatted text, links, colors. Make your graphs expressive."
                  delay={300}
                />
              </div>
            </div>
          </section>

          {/* Use Cases Section */}
          <section className="relative border-t border-border/50 px-6 py-20 md:py-32">
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-card/50 to-transparent" />
            <div className="relative mx-auto max-w-6xl">
              <div className="mb-12 text-center md:mb-16">
                <p className="mb-3 text-sm font-medium uppercase tracking-wider text-accent-brand">
                  Use Cases
                </p>
                <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
                  What will you build?
                </h2>
                <p className="mx-auto max-w-2xl text-muted-foreground">
                  From personal projects to team brainstorms, Thalamus helps you see the big
                  picture.
                </p>
              </div>

              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <UseCaseCard
                  icon={BookOpen}
                  title="Research & Learning"
                  description="Connect concepts, track sources, and build understanding as you explore new topics."
                  delay={0}
                />
                <UseCaseCard
                  icon={GitBranch}
                  title="Project Planning"
                  description="Map dependencies, track milestones, and visualize your entire project structure."
                  delay={50}
                />
                <UseCaseCard
                  icon={Lightbulb}
                  title="Brainstorming"
                  description="Capture ideas as they flow, then organize and refine them into actionable plans."
                  delay={100}
                />
                <UseCaseCard
                  icon={PenTool}
                  title="Writing & Content"
                  description="Outline articles, plan narratives, and organize complex writing projects visually."
                  delay={150}
                />
                <UseCaseCard
                  icon={Cpu}
                  title="System Design"
                  description="Document architectures, map integrations, and communicate technical decisions."
                  delay={200}
                />
                <UseCaseCard
                  icon={Brain}
                  title="Personal Knowledge"
                  description="Build your second brain. Connect everything you learn and never lose an insight."
                  delay={250}
                />
              </div>
            </div>
          </section>

          {/* Final CTA */}
          <section className="relative px-6 py-20 md:py-32">
            <div
              className="pointer-events-none absolute inset-0"
              style={{
                background: isDark
                  ? "radial-gradient(ellipse 50% 60% at 50% 100%, rgba(255,79,0,0.08), transparent)"
                  : "radial-gradient(ellipse 50% 60% at 50% 100%, rgba(255,79,0,0.05), transparent)",
              }}
            />
            <div className="relative mx-auto max-w-3xl text-center">
              <h2 className="mb-4 text-3xl font-bold text-foreground md:text-4xl">
                Ready to start mapping?
              </h2>
              <p className="mb-8 text-lg text-muted-foreground">
                Jump straight into the editor. No account needed, no credit card, no friction.
              </p>
              <Link
                to="/editor"
                className="group inline-flex items-center gap-2 rounded-xl bg-accent-brand px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-accent-brand/20 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent-brand/30"
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
