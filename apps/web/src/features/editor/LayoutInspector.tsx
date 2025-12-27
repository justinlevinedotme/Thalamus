import { useState } from "react";
import type { ReactNode } from "react";
import { ArrowDown, ArrowLeft, ArrowRight, ArrowUp, LayoutGrid, Loader2 } from "lucide-react";

import { Input } from "../../components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "../../components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import {
  type LayoutAlgorithm,
  type LayoutDirection,
  defaultLayoutOptions,
} from "../../lib/autoLayout";
import { useGraphStore } from "../../store/graphStore";

const directions: Array<{
  value: LayoutDirection;
  label: string;
  icon: ReactNode;
}> = [
  { value: "RIGHT", label: "Right", icon: <ArrowRight className="h-4 w-4" /> },
  { value: "DOWN", label: "Down", icon: <ArrowDown className="h-4 w-4" /> },
  { value: "LEFT", label: "Left", icon: <ArrowLeft className="h-4 w-4" /> },
  { value: "UP", label: "Up", icon: <ArrowUp className="h-4 w-4" /> },
];

const algorithms: Array<{
  value: LayoutAlgorithm;
  label: string;
  description: string;
}> = [
  { value: "layered", label: "Layered", description: "Hierarchical layout" },
  { value: "force", label: "Force", description: "Force-directed" },
  { value: "radial", label: "Radial", description: "Radial arrangement" },
  { value: "stress", label: "Stress", description: "Stress minimization" },
];

export default function LayoutInspector() {
  const { nodes, autoLayout } = useGraphStore();
  const [direction, setDirection] = useState<LayoutDirection>(defaultLayoutOptions.direction);
  const [algorithm, setAlgorithm] = useState<LayoutAlgorithm>(defaultLayoutOptions.algorithm);
  const [nodeSpacing, setNodeSpacing] = useState(defaultLayoutOptions.nodeSpacing);
  const [layerSpacing, setLayerSpacing] = useState(defaultLayoutOptions.layerSpacing);
  const [isLayouting, setIsLayouting] = useState(false);

  const handleApplyLayout = async () => {
    if (nodes.length === 0) {
      return;
    }
    setIsLayouting(true);
    try {
      await autoLayout({
        direction,
        algorithm,
        nodeSpacing,
        layerSpacing,
      });
    } finally {
      setIsLayouting(false);
    }
  };

  const nodeCount = nodes.length;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700">Auto Layout</h2>

        {/* Direction */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <label className="text-xs font-semibold uppercase text-slate-500">Direction</label>
            <ToggleGroup
              type="single"
              className="h-8 rounded-md border border-slate-200 bg-white"
              value={direction}
              onValueChange={(value) => {
                if (!value) {
                  return;
                }
                setDirection(value as LayoutDirection);
              }}
              aria-label="Layout direction"
            >
              {directions.map((dir) => (
                <Tooltip key={dir.value}>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem
                      value={dir.value}
                      className="h-full w-9 rounded-none border-r border-slate-200 text-slate-500 last:border-r-0 first:rounded-l-[5px] last:rounded-r-[5px] hover:bg-slate-50 hover:text-slate-700 data-[state=on]:bg-slate-100 data-[state=on]:text-slate-900 data-[state=on]:hover:bg-slate-100 data-[state=on]:hover:text-slate-900"
                      variant="ghost"
                    >
                      {dir.icon}
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent>{dir.label}</TooltipContent>
                </Tooltip>
              ))}
            </ToggleGroup>
          </div>
        </div>

        {/* Algorithm */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-4">
            <label className="text-xs font-semibold uppercase text-slate-500">Algorithm</label>
            <ToggleGroup
              type="single"
              className="h-8 rounded-md border border-slate-200 bg-white"
              value={algorithm}
              onValueChange={(value) => {
                if (!value) {
                  return;
                }
                setAlgorithm(value as LayoutAlgorithm);
              }}
              aria-label="Layout algorithm"
            >
              {algorithms.map((algo) => (
                <Tooltip key={algo.value}>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem
                      value={algo.value}
                      className="h-full px-2 rounded-none border-r border-slate-200 text-xs text-slate-500 last:border-r-0 first:rounded-l-[5px] last:rounded-r-[5px] hover:bg-slate-50 hover:text-slate-700 data-[state=on]:bg-slate-100 data-[state=on]:text-slate-900 data-[state=on]:hover:bg-slate-100 data-[state=on]:hover:text-slate-900"
                      variant="ghost"
                    >
                      {algo.label}
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent>{algo.description}</TooltipContent>
                </Tooltip>
              ))}
            </ToggleGroup>
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Spacing Controls */}
        <div className="space-y-3">
          <div className="flex items-center justify-between gap-4">
            <label className="text-xs font-semibold uppercase text-slate-500">Node Gap</label>
            <Input
              type="number"
              className="h-8 w-20 text-center"
              value={nodeSpacing}
              onChange={(event) => setNodeSpacing(Math.max(10, Number(event.target.value)))}
              min={10}
              max={500}
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <label className="text-xs font-semibold uppercase text-slate-500">Layer Gap</label>
            <Input
              type="number"
              className="h-8 w-20 text-center"
              value={layerSpacing}
              onChange={(event) => setLayerSpacing(Math.max(10, Number(event.target.value)))}
              min={10}
              max={500}
            />
          </div>
        </div>

        <hr className="border-slate-100" />

        {/* Apply Button */}
        <button
          className="flex w-full items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800 disabled:opacity-50"
          type="button"
          onClick={handleApplyLayout}
          disabled={isLayouting || nodeCount === 0}
        >
          {isLayouting ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <LayoutGrid className="h-4 w-4" />
          )}
          {isLayouting ? "Applying..." : "Apply Layout"}
        </button>

        {nodeCount === 0 ? (
          <p className="text-center text-xs text-slate-400">Add nodes to use auto layout</p>
        ) : null}
      </div>
    </TooltipProvider>
  );
}
