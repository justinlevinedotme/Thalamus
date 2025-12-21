import { ArrowLeft, ArrowLeftRight, ArrowRight, Minus, Trash2 } from "lucide-react";

import { BezierIcon } from "../../components/icons/BezierIcon";
import { SmoothStepIcon } from "../../components/icons/SmoothStepIcon";
import { StraightIcon } from "../../components/icons/StraightIcon";
import type { ReactNode } from "react";

import { Input } from "../../components/ui/input";
import { ToggleGroup, ToggleGroupItem } from "../../components/ui/toggle-group";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../../components/ui/tooltip";
import {
  type EdgeCurvature,
  type RelationshipDirection,
  useGraphStore,
} from "../../store/graphStore";

const directions: Array<{
  value: RelationshipDirection;
  label: string;
  icon: ReactNode;
}> = [
  { value: "forward", label: "Forward", icon: <ArrowRight className="h-4 w-4" /> },
  { value: "backward", label: "Backward", icon: <ArrowLeft className="h-4 w-4" /> },
  { value: "both", label: "Both", icon: <ArrowLeftRight className="h-4 w-4" /> },
  { value: "none", label: "None", icon: <Minus className="h-4 w-4" /> },
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

export default function RelationshipInspector() {
  const {
    edges,
    selectedEdgeId,
    updateEdgeLabel,
    updateEdgeData,
    updateEdgeStyle,
  } = useGraphStore();

  const selectedEdge = edges.find((edge) => edge.id === selectedEdgeId);
  const hasLabel =
    (selectedEdge?.label?.toString().trim() ?? "").length > 0;

  if (!selectedEdge) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-500">
        Select a relationship to edit its label, type, and direction.
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="space-y-3 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
      <h2 className="text-sm font-semibold text-slate-700">Path Style</h2>

      <div className="flex items-center justify-between gap-4">
        <label className="text-xs font-semibold uppercase text-slate-500">
          Label
        </label>
        <div className="relative flex-1">
          <Input
            className="pr-8"
            value={selectedEdge.label?.toString() ?? ""}
            onChange={(event) =>
              updateEdgeLabel(selectedEdge.id, event.target.value)
            }
            placeholder="relationship"
          />
          {hasLabel ? (
            <Tooltip>
              <TooltipTrigger asChild>
                <button
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-slate-400 transition hover:text-slate-600"
                  type="button"
                  onClick={() => updateEdgeLabel(selectedEdge.id, "")}
                  aria-label="Clear label"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </TooltipTrigger>
              <TooltipContent>Clear label</TooltipContent>
            </Tooltip>
          ) : null}
        </div>
      </div>

      <div className="flex items-center justify-between gap-4">
        <label className="text-xs font-semibold uppercase text-slate-500">
          Color
        </label>
        <Input
          type="color"
          className="h-8 w-36 cursor-pointer"
          value={selectedEdge.data?.style?.color ?? "#94A3B8"}
          onChange={(event) =>
            updateEdgeStyle(selectedEdge.id, { color: event.target.value })
          }
        />
      </div>

      <div className="flex items-center justify-between gap-4">
        <label className="text-xs font-semibold uppercase text-slate-500">
          Arrow Direction
        </label>
        <ToggleGroup
          type="single"
          className="h-8 rounded-md border border-slate-200 bg-white"
          value={selectedEdge.data?.direction ?? "forward"}
          onValueChange={(value) => {
            if (!value) {
              return;
            }
            updateEdgeData(selectedEdge.id, {
              direction: value as RelationshipDirection,
            });
          }}
          aria-label="Arrow direction"
        >
          {directions.map((direction) => (
            <Tooltip key={direction.value}>
              <TooltipTrigger asChild>
                <ToggleGroupItem
                  value={direction.value}
                  className="h-full w-9 rounded-none border-r border-slate-200 text-slate-500 last:border-r-0 first:rounded-l-[5px] last:rounded-r-[5px] hover:bg-slate-50 hover:text-slate-700 data-[state=on]:bg-slate-100 data-[state=on]:text-slate-900 data-[state=on]:hover:bg-slate-100 data-[state=on]:hover:text-slate-900"
                  variant="ghost"
                >
                  {direction.icon}
                </ToggleGroupItem>
              </TooltipTrigger>
              <TooltipContent>{direction.label}</TooltipContent>
            </Tooltip>
          ))}
        </ToggleGroup>
      </div>

      <div className="flex items-center justify-between gap-4">
        <label className="text-xs font-semibold uppercase text-slate-500">
          Thickness
        </label>
        <ToggleGroup
          type="single"
          className="h-8 rounded-md border border-slate-200 bg-white"
          value={String(selectedEdge.data?.style?.thickness ?? 2)}
          onValueChange={(value) => {
            if (!value) {
              return;
            }
            updateEdgeStyle(selectedEdge.id, {
              thickness: Number(value),
            });
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
          Curvature
        </label>
        <ToggleGroup
          type="single"
          className="h-8 rounded-md border border-slate-200 bg-white"
          value={selectedEdge.data?.style?.curvature ?? "smoothstep"}
          onValueChange={(value) => {
            if (!value) {
              return;
            }
            updateEdgeStyle(selectedEdge.id, {
              curvature: value as EdgeCurvature,
            });
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
      </div>
    </TooltipProvider>
  );
}
