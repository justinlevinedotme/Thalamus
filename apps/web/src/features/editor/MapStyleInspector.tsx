import type { ReactNode } from "react";

import { BezierIcon } from "../../components/icons/BezierIcon";
import { SmoothStepIcon } from "../../components/icons/SmoothStepIcon";
import { StraightIcon } from "../../components/icons/StraightIcon";

import { Input } from "../../components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "../../components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import { Button } from "../../components/ui/button";
import {
  type EdgeCurvature,
  type EdgeLineStyle,
  type EdgeMarkerSize,
  type EdgeMarkerType,
  type EdgePadding,
  type NodeShape,
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

const curvatures: Array<{
  value: EdgeCurvature;
  label: string;
  icon: ReactNode;
}> = [
  { value: "smoothstep", label: "Smooth", icon: <SmoothStepIcon className="h-4 w-4" /> },
  { value: "bezier", label: "Bezier", icon: <BezierIcon className="h-4 w-4" /> },
  { value: "straight", label: "Straight", icon: <StraightIcon className="h-4 w-4" /> },
];

const thicknesses: Array<{ value: number; label: string }> = [
  { value: 1, label: "Thin" },
  { value: 2, label: "Regular" },
  { value: 4, label: "Thick" },
  { value: 6, label: "Bold" },
];

const lineStyles: Array<{ value: EdgeLineStyle; label: string; icon: ReactNode }> = [
  {
    value: "solid",
    label: "Solid",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="2" y1="8" x2="14" y2="8" />
      </svg>
    ),
  },
  {
    value: "dashed",
    label: "Dashed",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeDasharray="3 2">
        <line x1="2" y1="8" x2="14" y2="8" />
      </svg>
    ),
  },
];

const markerTypes: Array<{ value: EdgeMarkerType; label: string; icon: ReactNode }> = [
  {
    value: "arrow",
    label: "Arrow",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M3 8h10M10 4l4 4-4 4" />
      </svg>
    ),
  },
  {
    value: "arrowclosed",
    label: "Filled Arrow",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor" stroke="currentColor" strokeWidth="1">
        <path d="M3 8h7" fill="none" />
        <path d="M10 4l4 4-4 4z" />
      </svg>
    ),
  },
  {
    value: "circle",
    label: "Circle",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
        <line x1="2" y1="8" x2="9" y2="8" />
        <circle cx="12" cy="8" r="3" fill="currentColor" />
      </svg>
    ),
  },
  {
    value: "diamond",
    label: "Diamond",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor" stroke="currentColor" strokeWidth="1">
        <line x1="2" y1="8" x2="8" y2="8" fill="none" />
        <path d="M12 5l3 3-3 3-3-3z" />
      </svg>
    ),
  },
  {
    value: "none",
    label: "None",
    icon: (
      <svg className="h-4 w-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
        <line x1="2" y1="8" x2="14" y2="8" />
      </svg>
    ),
  },
];

const markerSizes: Array<{ value: EdgeMarkerSize; label: string }> = [
  { value: "xs", label: "Extra Small" },
  { value: "sm", label: "Small" },
  { value: "md", label: "Medium" },
  { value: "lg", label: "Large" },
];

export default function MapStyleInspector() {
  const { nodes, edges, updateAllNodeStyles, updateAllEdgeStyles, clearAllEdgeLabels } = useGraphStore();

  const nodeCount = nodes.length;
  const edgeCount = edges.length;

  return (
    <TooltipProvider delayDuration={300}>
      <div className="space-y-4 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
        <h2 className="text-sm font-semibold text-slate-700">Map Style</h2>

        {/* Node Styles Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-slate-600">
              All Nodes ({nodeCount})
            </h3>
          </div>

          <div className="flex items-center justify-between gap-4">
            <label className="text-xs font-semibold uppercase text-slate-500">
              Color
            </label>
            <Input
              type="color"
              className="h-8 w-36 cursor-pointer"
              defaultValue="#E2E8F0"
              onChange={(event) =>
                updateAllNodeStyles({ color: event.target.value })
              }
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <label className="text-xs font-semibold uppercase text-slate-500">
              Shape
            </label>
            <ToggleGroup
              type="single"
              className="h-8 rounded-md border border-slate-200 bg-white"
              onValueChange={(value) => {
                if (!value) {
                  return;
                }
                updateAllNodeStyles({ shape: value as NodeShape });
              }}
              aria-label="Node shape"
            >
              {nodeShapes.map((shape) => (
                <Tooltip key={shape.value}>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem
                      value={shape.value}
                      className="h-full w-9 rounded-none border-r border-slate-200 text-slate-500 last:border-r-0 first:rounded-l-[5px] last:rounded-r-[5px] hover:bg-slate-50 hover:text-slate-700 data-[state=on]:bg-slate-100 data-[state=on]:text-slate-900 data-[state=on]:hover:bg-slate-100 data-[state=on]:hover:text-slate-900"
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
            <label className="text-xs font-semibold uppercase text-slate-500">
              Edge Padding
            </label>
            <ToggleGroup
              type="single"
              className="h-8 rounded-md border border-slate-200 bg-white"
              onValueChange={(value) => {
                if (!value) {
                  return;
                }
                updateAllNodeStyles({ edgePadding: value as EdgePadding });
              }}
              aria-label="Edge padding"
            >
              {edgePaddings.map((padding) => (
                <Tooltip key={padding.value}>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem
                      value={padding.value}
                      className="h-full w-11 rounded-none border-r border-slate-200 text-xs text-slate-500 last:border-r-0 first:rounded-l-[5px] last:rounded-r-[5px] hover:bg-slate-50 hover:text-slate-700 data-[state=on]:bg-slate-100 data-[state=on]:text-slate-900 data-[state=on]:hover:bg-slate-100 data-[state=on]:hover:text-slate-900"
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

        <hr className="border-slate-100" />

        {/* Edge Styles Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-medium text-slate-600">
              All Paths ({edgeCount})
            </h3>
          </div>

          <div className="flex items-center justify-between gap-4">
            <label className="text-xs font-semibold uppercase text-slate-500">
              Color
            </label>
            <Input
              type="color"
              className="h-8 w-36 cursor-pointer"
              defaultValue="#94A3B8"
              onChange={(event) =>
                updateAllEdgeStyles({ color: event.target.value })
              }
            />
          </div>

          <div className="flex items-center justify-between gap-4">
            <label className="text-xs font-semibold uppercase text-slate-500">
              Thickness
            </label>
            <ToggleGroup
              type="single"
              className="h-8 rounded-md border border-slate-200 bg-white"
              onValueChange={(value) => {
                if (!value) {
                  return;
                }
                updateAllEdgeStyles({ thickness: Number(value) });
              }}
              aria-label="Edge thickness"
            >
              {thicknesses.map((thickness) => (
                <Tooltip key={thickness.value}>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem
                      value={String(thickness.value)}
                      className="h-full w-9 rounded-none border-r border-slate-200 text-slate-500 last:border-r-0 first:rounded-l-[5px] last:rounded-r-[5px] hover:bg-slate-50 hover:text-slate-700 data-[state=on]:bg-slate-100 data-[state=on]:text-slate-900 data-[state=on]:hover:bg-slate-100 data-[state=on]:hover:text-slate-900"
                      variant="ghost"
                    >
                      <svg
                        className="h-4 w-4"
                        viewBox="0 0 16 16"
                        fill="currentColor"
                      >
                        <rect
                          x="2"
                          y={8 - thickness.value / 2}
                          width="12"
                          height={thickness.value}
                          rx={thickness.value / 2}
                        />
                      </svg>
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent>{thickness.label}</TooltipContent>
                </Tooltip>
              ))}
            </ToggleGroup>
          </div>

          <div className="flex items-center justify-between gap-4">
            <label className="text-xs font-semibold uppercase text-slate-500">
              Style
            </label>
            <ToggleGroup
              type="single"
              className="h-8 rounded-md border border-slate-200 bg-white"
              onValueChange={(value) => {
                if (!value) {
                  return;
                }
                updateAllEdgeStyles({ lineStyle: value as EdgeLineStyle });
              }}
              aria-label="Line style"
            >
              {lineStyles.map((style) => (
                <Tooltip key={style.value}>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem
                      value={style.value}
                      className="h-full w-9 rounded-none border-r border-slate-200 text-slate-500 last:border-r-0 first:rounded-l-[5px] last:rounded-r-[5px] hover:bg-slate-50 hover:text-slate-700 data-[state=on]:bg-slate-100 data-[state=on]:text-slate-900 data-[state=on]:hover:bg-slate-100 data-[state=on]:hover:text-slate-900"
                      variant="ghost"
                    >
                      {style.icon}
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent>{style.label}</TooltipContent>
                </Tooltip>
              ))}
            </ToggleGroup>
          </div>

          <div className="flex items-center justify-between gap-4">
            <label className="text-xs font-semibold uppercase text-slate-500">
              Curvature
            </label>
            <ToggleGroup
              type="single"
              className="h-8 rounded-md border border-slate-200 bg-white"
              onValueChange={(value) => {
                if (!value) {
                  return;
                }
                updateAllEdgeStyles({ curvature: value as EdgeCurvature });
              }}
              aria-label="Edge curvature"
            >
              {curvatures.map((curvature) => (
                <Tooltip key={curvature.value}>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem
                      value={curvature.value}
                      className="h-full w-9 rounded-none border-r border-slate-200 text-slate-500 last:border-r-0 first:rounded-l-[5px] last:rounded-r-[5px] hover:bg-slate-50 hover:text-slate-700 data-[state=on]:bg-slate-100 data-[state=on]:text-slate-900 data-[state=on]:hover:bg-slate-100 data-[state=on]:hover:text-slate-900"
                      variant="ghost"
                    >
                      {curvature.icon}
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent>{curvature.label}</TooltipContent>
                </Tooltip>
              ))}
            </ToggleGroup>
          </div>

          <div className="flex items-center justify-between gap-4">
            <label className="text-xs font-semibold uppercase text-slate-500">
              End Type
            </label>
            <ToggleGroup
              type="single"
              className="h-8 rounded-md border border-slate-200 bg-white"
              onValueChange={(value) => {
                if (!value) {
                  return;
                }
                updateAllEdgeStyles({ markerEnd: value as EdgeMarkerType });
              }}
              aria-label="End marker type"
            >
              {markerTypes.map((marker) => (
                <Tooltip key={marker.value}>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem
                      value={marker.value}
                      className="h-full w-9 rounded-none border-r border-slate-200 text-slate-500 last:border-r-0 first:rounded-l-[5px] last:rounded-r-[5px] hover:bg-slate-50 hover:text-slate-700 data-[state=on]:bg-slate-100 data-[state=on]:text-slate-900 data-[state=on]:hover:bg-slate-100 data-[state=on]:hover:text-slate-900"
                      variant="ghost"
                    >
                      {marker.icon}
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent>{marker.label}</TooltipContent>
                </Tooltip>
              ))}
            </ToggleGroup>
          </div>

          <div className="flex items-center justify-between gap-4">
            <label className="text-xs font-semibold uppercase text-slate-500">
              Start Type
            </label>
            <ToggleGroup
              type="single"
              className="h-8 rounded-md border border-slate-200 bg-white"
              onValueChange={(value) => {
                if (!value) {
                  return;
                }
                updateAllEdgeStyles({ markerStart: value as EdgeMarkerType });
              }}
              aria-label="Start marker type"
            >
              {markerTypes.map((marker) => (
                <Tooltip key={marker.value}>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem
                      value={marker.value}
                      className="h-full w-9 rounded-none border-r border-slate-200 text-slate-500 last:border-r-0 first:rounded-l-[5px] last:rounded-r-[5px] hover:bg-slate-50 hover:text-slate-700 data-[state=on]:bg-slate-100 data-[state=on]:text-slate-900 data-[state=on]:hover:bg-slate-100 data-[state=on]:hover:text-slate-900"
                      variant="ghost"
                    >
                      {marker.icon}
                    </ToggleGroupItem>
                  </TooltipTrigger>
                  <TooltipContent>{marker.label}</TooltipContent>
                </Tooltip>
              ))}
            </ToggleGroup>
          </div>

          <div className="flex items-center justify-between gap-4">
            <label className="text-xs font-semibold uppercase text-slate-500">
              Arrow Size
            </label>
            <ToggleGroup
              type="single"
              className="h-8 rounded-md border border-slate-200 bg-white"
              onValueChange={(value) => {
                if (!value) {
                  return;
                }
                updateAllEdgeStyles({ markerSize: value as EdgeMarkerSize });
              }}
              aria-label="Marker size"
            >
              {markerSizes.map((size) => (
                <Tooltip key={size.value}>
                  <TooltipTrigger asChild>
                    <ToggleGroupItem
                      value={size.value}
                      className="h-full w-11 rounded-none border-r border-slate-200 text-xs text-slate-500 last:border-r-0 first:rounded-l-[5px] last:rounded-r-[5px] hover:bg-slate-50 hover:text-slate-700 data-[state=on]:bg-slate-100 data-[state=on]:text-slate-900 data-[state=on]:hover:bg-slate-100 data-[state=on]:hover:text-slate-900"
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

          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={clearAllEdgeLabels}
          >
            Delete all path labels
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
}
