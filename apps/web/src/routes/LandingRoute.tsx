/**
 * @file LandingRoute.tsx
 * @description Public landing page - conversion focused with rich visuals
 */

import { Link } from "react-router-dom";
import { useEffect, useRef, useState, useMemo } from "react";
import {
  ArrowRight,
  Sparkles,
  Zap,
  Share2,
  Layout,
  MousePointer2,
  Command,
  Download,
} from "lucide-react";
import { motion } from "framer-motion";
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  Handle,
  Position,
  type Node,
  type Edge,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import Header from "../components/Header";
import { useTheme } from "../lib/theme";
import { cn } from "../lib/utils";
import { BaseNode } from "../components/ui/base-node";

function PreviewNode({ data }: { data: { label: string; color?: string } }) {
  return (
    <BaseNode className="px-4 py-2" style={{ backgroundColor: data.color }}>
      <Handle type="target" position={Position.Left} className="!bg-transparent !border-0" />
      <span className="text-sm font-medium">{data.label}</span>
      <Handle type="source" position={Position.Right} className="!bg-transparent !border-0" />
    </BaseNode>
  );
}

const previewNodeTypes = {
  preview: PreviewNode,
};

type DemoGraph = {
  id: string;
  title: string;
  nodes: Node[];
  edges: Edge[];
};

const demoGraphs: DemoGraph[] = [
  {
    id: "bracket",
    title: "Tournament",
    nodes: [
      {
        id: "t1",
        type: "preview",
        position: { x: 0, y: 0 },
        data: { label: "🦁 Lions", color: "rgba(251, 191, 36, 0.2)" },
      },
      {
        id: "t2",
        type: "preview",
        position: { x: 0, y: 70 },
        data: { label: "🐻 Bears", color: "rgba(168, 85, 247, 0.2)" },
      },
      {
        id: "t3",
        type: "preview",
        position: { x: 0, y: 160 },
        data: { label: "🦅 Eagles", color: "rgba(34, 197, 94, 0.2)" },
      },
      {
        id: "t4",
        type: "preview",
        position: { x: 0, y: 230 },
        data: { label: "🐺 Wolves", color: "rgba(59, 130, 246, 0.2)" },
      },
      {
        id: "s1",
        type: "preview",
        position: { x: 180, y: 35 },
        data: { label: "🦁 Lions", color: "rgba(251, 191, 36, 0.3)" },
      },
      {
        id: "s2",
        type: "preview",
        position: { x: 180, y: 195 },
        data: { label: "🦅 Eagles", color: "rgba(34, 197, 94, 0.3)" },
      },
      {
        id: "f1",
        type: "preview",
        position: { x: 360, y: 115 },
        data: { label: "🏆 Champion", color: "rgba(255, 79, 0, 0.3)" },
      },
    ],
    edges: [
      { id: "e1", source: "t1", target: "s1", style: { stroke: "#fbbf24", strokeWidth: 2 } },
      {
        id: "e2",
        source: "t2",
        target: "s1",
        style: { stroke: "#6b7280", strokeWidth: 1, strokeDasharray: "4 4" },
      },
      { id: "e3", source: "t3", target: "s2", style: { stroke: "#22c55e", strokeWidth: 2 } },
      {
        id: "e4",
        source: "t4",
        target: "s2",
        style: { stroke: "#6b7280", strokeWidth: 1, strokeDasharray: "4 4" },
      },
      {
        id: "e5",
        source: "s1",
        target: "f1",
        animated: true,
        style: { stroke: "#fbbf24", strokeWidth: 2 },
      },
      {
        id: "e6",
        source: "s2",
        target: "f1",
        style: { stroke: "#6b7280", strokeWidth: 1, strokeDasharray: "4 4" },
      },
    ],
  },
  {
    id: "mindmap",
    title: "Mind Map",
    nodes: [
      {
        id: "c",
        type: "preview",
        position: { x: 200, y: 100 },
        data: { label: "💡 Big Idea", color: "rgba(255, 79, 0, 0.25)" },
      },
      {
        id: "1",
        type: "preview",
        position: { x: 50, y: 20 },
        data: { label: "Research", color: "rgba(59, 130, 246, 0.2)" },
      },
      {
        id: "2",
        type: "preview",
        position: { x: 350, y: 20 },
        data: { label: "Design", color: "rgba(168, 85, 247, 0.2)" },
      },
      {
        id: "3",
        type: "preview",
        position: { x: 400, y: 120 },
        data: { label: "Prototype", color: "rgba(34, 197, 94, 0.2)" },
      },
      {
        id: "4",
        type: "preview",
        position: { x: 350, y: 200 },
        data: { label: "Test", color: "rgba(251, 191, 36, 0.2)" },
      },
      {
        id: "5",
        type: "preview",
        position: { x: 50, y: 200 },
        data: { label: "Launch", color: "rgba(244, 63, 94, 0.2)" },
      },
      {
        id: "6",
        type: "preview",
        position: { x: 0, y: 120 },
        data: { label: "Iterate", color: "rgba(6, 182, 212, 0.2)" },
      },
    ],
    edges: [
      { id: "ec1", source: "c", target: "1", type: "straight", style: { stroke: "#3b82f6" } },
      { id: "ec2", source: "c", target: "2", type: "straight", style: { stroke: "#a855f7" } },
      { id: "ec3", source: "c", target: "3", type: "straight", style: { stroke: "#22c55e" } },
      { id: "ec4", source: "c", target: "4", type: "straight", style: { stroke: "#eab308" } },
      { id: "ec5", source: "c", target: "5", type: "straight", style: { stroke: "#f43f5e" } },
      { id: "ec6", source: "c", target: "6", type: "straight", style: { stroke: "#06b6d4" } },
    ],
  },
  {
    id: "flowchart",
    title: "Flowchart",
    nodes: [
      {
        id: "start",
        type: "preview",
        position: { x: 180, y: 0 },
        data: { label: "▶ Start", color: "rgba(34, 197, 94, 0.25)" },
      },
      {
        id: "input",
        type: "preview",
        position: { x: 180, y: 70 },
        data: { label: "📥 Get Input", color: "rgba(59, 130, 246, 0.2)" },
      },
      {
        id: "check",
        type: "preview",
        position: { x: 180, y: 140 },
        data: { label: "❓ Valid?", color: "rgba(251, 191, 36, 0.25)" },
      },
      {
        id: "process",
        type: "preview",
        position: { x: 50, y: 210 },
        data: { label: "⚙️ Process", color: "rgba(168, 85, 247, 0.2)" },
      },
      {
        id: "error",
        type: "preview",
        position: { x: 320, y: 210 },
        data: { label: "⚠️ Error", color: "rgba(244, 63, 94, 0.25)" },
      },
      {
        id: "end",
        type: "preview",
        position: { x: 50, y: 280 },
        data: { label: "⏹ End", color: "rgba(107, 114, 128, 0.2)" },
      },
    ],
    edges: [
      { id: "e1", source: "start", target: "input", animated: true },
      { id: "e2", source: "input", target: "check" },
      { id: "e3", source: "check", target: "process", label: "Yes", style: { stroke: "#22c55e" } },
      {
        id: "e4",
        source: "check",
        target: "error",
        label: "No",
        style: { stroke: "#f43f5e", strokeDasharray: "5 5" },
      },
      { id: "e5", source: "process", target: "end" },
      {
        id: "e6",
        source: "error",
        target: "input",
        style: { stroke: "#f43f5e", strokeDasharray: "5 5" },
      },
    ],
  },
];

function EditorPreview() {
  const { resolvedTheme } = useTheme();
  const [activeTab, setActiveTab] = useState(0);
  const activeGraph = demoGraphs[activeTab];

  return (
    <div
      className="relative w-full overflow-hidden rounded-xl border border-border/50 bg-card/50 backdrop-blur-sm shadow-2xl"
      style={{ height: "400px" }}
    >
      <div className="flex h-10 items-center gap-2 border-b border-border/50 bg-card/80 px-4">
        <div className="flex gap-1.5">
          <div className="size-3 rounded-full bg-red-500/60" />
          <div className="size-3 rounded-full bg-yellow-500/60" />
          <div className="size-3 rounded-full bg-green-500/60" />
        </div>
        <div className="ml-4 flex items-center gap-1">
          {demoGraphs.map((graph, i) => (
            <button
              key={graph.id}
              onClick={() => setActiveTab(i)}
              className={cn(
                "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                activeTab === i
                  ? "bg-muted text-foreground"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {graph.title}
            </button>
          ))}
        </div>
      </div>

      <div className="absolute left-3 top-14 z-10 flex flex-col gap-1 rounded-lg border border-border/30 bg-card/60 p-1.5 backdrop-blur-sm">
        {[MousePointer2, Layout, Sparkles].map((Icon, i) => (
          <div
            key={i}
            className="flex size-7 items-center justify-center rounded-md text-muted-foreground hover:bg-muted/50"
          >
            <Icon className="size-3.5" />
          </div>
        ))}
      </div>

      <div style={{ height: "calc(100% - 40px)", width: "100%" }}>
        <ReactFlow
          key={activeGraph.id}
          nodes={activeGraph.nodes}
          edges={activeGraph.edges}
          nodeTypes={previewNodeTypes}
          fitView
          fitViewOptions={{ padding: 0.3, maxZoom: 1 }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          panOnDrag={false}
          zoomOnScroll={false}
          zoomOnPinch={false}
          zoomOnDoubleClick={false}
          preventScrolling={false}
          colorMode={resolvedTheme}
          proOptions={{ hideAttribution: true }}
          defaultEdgeOptions={{
            style: { strokeWidth: 2 },
            labelBgPadding: [6, 4],
            labelBgBorderRadius: 4,
            labelStyle: { fontSize: 10, fontWeight: 500 },
          }}
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} className="opacity-50" />
        </ReactFlow>
      </div>

      <motion.div
        className="absolute bottom-4 right-4 z-10 flex items-center gap-2 rounded-full bg-card/80 px-3 py-1.5 text-xs text-muted-foreground backdrop-blur-sm"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.5 }}
      >
        <Command className="size-3" />
        <span>K to search</span>
      </motion.div>
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
        "group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-6 backdrop-blur-sm transition-all duration-500 hover:border-accent-brand/30 hover:shadow-[0_0_40px_-10px_rgba(255,79,0,0.2)]",
        isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8",
        className
      )}
      style={{ transitionDelay: `${delay}ms` }}
    >
      <div className="relative z-10">
        <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-accent-brand/10 text-accent-brand transition-transform duration-300 group-hover:scale-110">
          <Icon className="size-6" strokeWidth={1.5} />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
      </div>
      <div className="absolute -right-8 -top-8 size-32 rounded-full bg-accent-brand/5 transition-transform duration-500 group-hover:scale-150" />
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
        "rounded-xl border border-border/50 bg-gradient-to-br from-card/80 to-card/40 p-5 backdrop-blur-sm transition-all duration-500",
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
            className="rounded-full bg-muted/50 px-2.5 py-0.5 text-xs text-muted-foreground"
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
      {/* Background gradient */}
      <div
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: isDark
            ? "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(255,79,0,0.15), transparent), radial-gradient(ellipse 60% 50% at 50% 120%, rgba(255,79,0,0.1), transparent)"
            : "radial-gradient(ellipse 80% 50% at 50% -20%, rgba(255,79,0,0.08), transparent), radial-gradient(ellipse 60% 50% at 50% 120%, rgba(255,79,0,0.05), transparent)",
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
                  className="mb-4 inline-flex items-center gap-2 rounded-full border border-accent-brand/20 bg-accent-brand/10 px-4 py-1.5 text-sm text-accent-brand"
                >
                  <Sparkles className="size-4" />
                  <span>Free to use. No signup required.</span>
                </motion.div>

                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 }}
                  className="mb-6 text-4xl font-bold tracking-tight text-foreground sm:text-5xl md:text-6xl"
                >
                  Think in
                  <span className="relative mx-3 inline-block">
                    <span className="relative z-10 text-accent-brand">nodes</span>
                    <span className="absolute -inset-1 -z-0 rounded-lg bg-accent-brand/10" />
                  </span>
                  and
                  <span className="relative mx-3 inline-block">
                    <span className="relative z-10 text-accent-brand">connections</span>
                    <span className="absolute -inset-1 -z-0 rounded-lg bg-accent-brand/10" />
                  </span>
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground"
                >
                  Thalamus is a visual canvas for mapping ideas, connecting thoughts, and building
                  knowledge graphs. See your thinking take shape.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center"
                >
                  <Link
                    to="/editor"
                    className="group inline-flex items-center gap-2 rounded-xl bg-accent-brand px-8 py-4 text-base font-semibold text-white shadow-lg shadow-accent-brand/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent-brand/30"
                  >
                    Open Editor
                    <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                  <Link
                    to="/login"
                    className="inline-flex items-center gap-2 rounded-xl border border-border bg-card/50 px-6 py-4 text-base font-medium text-foreground backdrop-blur-sm transition-all duration-200 hover:bg-card"
                  >
                    Sign in to save your work
                  </Link>
                </motion.div>
              </div>

              {/* Product Preview */}
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="relative"
              >
                <div className="absolute -inset-4 rounded-2xl bg-gradient-to-r from-accent-brand/20 via-purple-500/10 to-blue-500/20 blur-3xl" />
                <EditorPreview />
              </motion.div>
            </div>
          </section>

          {/* Trust bar */}
          <section className="border-y border-border/50 bg-card/30 px-6 py-6 backdrop-blur-sm">
            <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-8 text-sm text-muted-foreground md:gap-16">
              <div className="flex items-center gap-2">
                <Zap className="size-4 text-accent-brand" />
                <span>Instant start</span>
              </div>
              <div className="flex items-center gap-2">
                <Download className="size-4 text-accent-brand" />
                <span>Export to PNG, PDF, JSON</span>
              </div>
              <div className="flex items-center gap-2">
                <Share2 className="size-4 text-accent-brand" />
                <span>Shareable links</span>
              </div>
              <div className="flex items-center gap-2">
                <Layout className="size-4 text-accent-brand" />
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
                className="group inline-flex items-center gap-2 rounded-xl bg-accent-brand px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-accent-brand/25 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-xl hover:shadow-accent-brand/30"
              >
                Open Editor
                <ArrowRight className="size-5 transition-transform group-hover:translate-x-1" />
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
