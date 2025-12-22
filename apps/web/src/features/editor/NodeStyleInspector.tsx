import type { ReactNode } from "react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";
import { Input } from "../../components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "../../components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import {
  type EdgePadding,
  type NodeShape,
  type NodeSize,
  useGraphStore,
} from "../../store/graphStore";

const edgePaddings: Array<{ value: EdgePadding; label: string }> = [
  { value: "none", label: "None" },
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
];

const nodeShapes: Array<{ value: NodeShape; label: string; icon: ReactNode }> = [
  {
    value: "rounded",
    label: "Rounded",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="4" width="12" height="8" rx="2" />
      </svg>
    ),
  },
  {
    value: "pill",
    label: "Pill",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="2" y="4" width="12" height="8" rx="4" />
      </svg>
    ),
  },
  {
    value: "circle",
    label: "Circle",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <circle cx="8" cy="8" r="5" />
      </svg>
    ),
  },
  {
    value: "square",
    label: "Square",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <rect x="3" y="4" width="10" height="8" />
      </svg>
    ),
  },
];

const nodeSizes: Array<{ value: NodeSize; label: string }> = [
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
];

export default function NodeStyleInspector() {
  const {
    nodes,
    selectedNodeId,
    updateNodeStyle,
    updateNodeHandles,
  } = useGraphStore();

  const selectedNode = nodes.find((node) => node.id === selectedNodeId);

  const sourceHandleCount = selectedNode?.data?.sourceHandles?.length ?? 1;
  const targetHandleCount = selectedNode?.data?.targetHandles?.length ?? 1;

  if (!selectedNode) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">
        Select a node to edit its type and style.
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <h2 className="px-3 pt-3 text-sm font-semibold text-slate-700">Node Style</h2>

        {/* Handles - always visible */}
        <div className="space-y-3 px-3 py-3">
          <div className="flex items-center justify-between gap-4">
            <label className="text-xs font-semibold uppercase text-slate-500">Inputs</label>
            <div className="flex items-center gap-1">
              <button
                className="flex h-7 w-7 items-center justify-center rounded-l-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                type="button"
                onClick={() =>
                  updateNodeHandles(
                    selectedNode.id,
                    sourceHandleCount,
                    Math.max(1, targetHandleCount - 1)
                  )
                }
                disabled={targetHandleCount <= 1}
                aria-label="Decrease input handles"
              >
                −
              </button>
              <span className="flex h-7 w-8 items-center justify-center border-y border-slate-200 bg-white text-xs text-slate-700">
                {targetHandleCount}
              </span>
              <button
                className="flex h-7 w-7 items-center justify-center rounded-r-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                type="button"
                onClick={() =>
                  updateNodeHandles(
                    selectedNode.id,
                    sourceHandleCount,
                    Math.min(8, targetHandleCount + 1)
                  )
                }
                disabled={targetHandleCount >= 8}
                aria-label="Increase input handles"
              >
                +
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between gap-4">
            <label className="text-xs font-semibold uppercase text-slate-500">Outputs</label>
            <div className="flex items-center gap-1">
              <button
                className="flex h-7 w-7 items-center justify-center rounded-l-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                type="button"
                onClick={() =>
                  updateNodeHandles(
                    selectedNode.id,
                    Math.max(1, sourceHandleCount - 1),
                    targetHandleCount
                  )
                }
                disabled={sourceHandleCount <= 1}
                aria-label="Decrease output handles"
              >
                −
              </button>
              <span className="flex h-7 w-8 items-center justify-center border-y border-slate-200 bg-white text-xs text-slate-700">
                {sourceHandleCount}
              </span>
              <button
                className="flex h-7 w-7 items-center justify-center rounded-r-md border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-50"
                type="button"
                onClick={() =>
                  updateNodeHandles(
                    selectedNode.id,
                    Math.min(8, sourceHandleCount + 1),
                    targetHandleCount
                  )
                }
                disabled={sourceHandleCount >= 8}
                aria-label="Increase output handles"
              >
                +
              </button>
            </div>
          </div>
        </div>

        <Accordion type="single" collapsible defaultValue="appearance" className="w-full">
          <AccordionItem value="appearance" className="border-b-0 border-t border-slate-200">
            <AccordionTrigger className="px-3 py-2 text-xs font-medium text-slate-600 hover:no-underline hover:bg-slate-50">
              Appearance
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3 pt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <label className="text-xs text-slate-500">Background</label>
                  <Input
                    type="color"
                    className="h-7 w-24 cursor-pointer"
                    value={selectedNode.data.style?.color ?? "#E2E8F0"}
                    onChange={(event) =>
                      updateNodeStyle(selectedNode.id, { color: event.target.value })
                    }
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <label className="text-xs text-slate-500">Shape</label>
                  <ToggleGroup
                    type="single"
                    className="h-7 rounded-md border border-slate-200 bg-white"
                    value={selectedNode.data.style?.shape ?? "rounded"}
                    onValueChange={(value) => {
                      if (!value) {
                        return;
                      }
                      updateNodeStyle(selectedNode.id, { shape: value as NodeShape });
                    }}
                    aria-label="Node shape"
                  >
                    {nodeShapes.map((shape) => (
                      <Tooltip key={shape.value}>
                        <TooltipTrigger asChild>
                          <ToggleGroupItem
                            value={shape.value}
                            className="h-full w-8 rounded-none border-r border-slate-200 text-slate-500 last:border-r-0 first:rounded-l-[5px] last:rounded-r-[5px] hover:bg-slate-50 hover:text-slate-700 data-[state=on]:bg-slate-200 data-[state=on]:text-slate-900 data-[state=on]:hover:bg-slate-200 data-[state=on]:hover:text-slate-900"
                            variant="ghost"
                          >
                            {shape.icon}
                          </ToggleGroupItem>
                        </TooltipTrigger>
                        <TooltipContent>{shape.label}</TooltipContent>
                      </Tooltip>
                    ))}
                  </ToggleGroup>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <label className="text-xs text-slate-500">Size</label>
                  <ToggleGroup
                    type="single"
                    className="h-7 rounded-md border border-slate-200 bg-white"
                    value={selectedNode.data.style?.size ?? "md"}
                    onValueChange={(value) => {
                      if (!value) {
                        return;
                      }
                      updateNodeStyle(selectedNode.id, { size: value as NodeSize });
                    }}
                    aria-label="Node size"
                  >
                    {nodeSizes.map((size) => (
                      <Tooltip key={size.value}>
                        <TooltipTrigger asChild>
                          <ToggleGroupItem
                            value={size.value}
                            className="h-full w-10 rounded-none border-r border-slate-200 text-xs text-slate-500 last:border-r-0 first:rounded-l-[5px] last:rounded-r-[5px] hover:bg-slate-50 hover:text-slate-700 data-[state=on]:bg-slate-200 data-[state=on]:text-slate-900 data-[state=on]:hover:bg-slate-200 data-[state=on]:hover:text-slate-900"
                            variant="ghost"
                          >
                            {size.value.toUpperCase()}
                          </ToggleGroupItem>
                        </TooltipTrigger>
                        <TooltipContent>{size.label}</TooltipContent>
                      </Tooltip>
                    ))}
                  </ToggleGroup>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <label className="text-xs text-slate-500">Edge Padding</label>
                  <ToggleGroup
                    type="single"
                    className="h-7 rounded-md border border-slate-200 bg-white"
                    value={selectedNode.data.style?.edgePadding ?? "none"}
                    onValueChange={(value) => {
                      if (!value) {
                        return;
                      }
                      updateNodeStyle(selectedNode.id, { edgePadding: value as EdgePadding });
                    }}
                    aria-label="Edge padding"
                  >
                    {edgePaddings.map((padding) => (
                      <Tooltip key={padding.value}>
                        <TooltipTrigger asChild>
                          <ToggleGroupItem
                            value={padding.value}
                            className="h-full w-10 rounded-none border-r border-slate-200 text-xs text-slate-500 last:border-r-0 first:rounded-l-[5px] last:rounded-r-[5px] hover:bg-slate-50 hover:text-slate-700 data-[state=on]:bg-slate-200 data-[state=on]:text-slate-900 data-[state=on]:hover:bg-slate-200 data-[state=on]:hover:text-slate-900"
                            variant="ghost"
                          >
                            {padding.value === "none" ? "0" : padding.value.toUpperCase()}
                          </ToggleGroupItem>
                        </TooltipTrigger>
                        <TooltipContent>{padding.label}</TooltipContent>
                      </Tooltip>
                    ))}
                  </ToggleGroup>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="text" className="border-b-0 border-t border-slate-200">
            <AccordionTrigger className="px-3 py-2 text-xs font-medium text-slate-600 hover:no-underline hover:bg-slate-50">
              Text
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3 pt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <label className="text-xs text-slate-500">Title</label>
                  <Input
                    type="color"
                    className="h-7 w-24 cursor-pointer"
                    value={selectedNode.data.style?.textColor ?? "#1e293b"}
                    onChange={(event) =>
                      updateNodeStyle(selectedNode.id, { textColor: event.target.value })
                    }
                  />
                </div>

                <div className="flex items-center justify-between gap-4">
                  <label className="text-xs text-slate-500">Body</label>
                  <Input
                    type="color"
                    className="h-7 w-24 cursor-pointer"
                    value={selectedNode.data.style?.bodyTextColor ?? selectedNode.data.style?.textColor ?? "#475569"}
                    onChange={(event) =>
                      updateNodeStyle(selectedNode.id, { bodyTextColor: event.target.value })
                    }
                  />
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </TooltipProvider>
  );
}
