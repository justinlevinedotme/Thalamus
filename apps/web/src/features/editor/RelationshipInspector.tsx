import { Trash2 } from "lucide-react";
import type { ReactNode } from "react";

import { BezierIcon } from "../../components/icons/BezierIcon";
import { SmoothStepIcon } from "../../components/icons/SmoothStepIcon";
import { StraightIcon } from "../../components/icons/StraightIcon";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion";
import { ColorPicker, ColorSwatch } from "../../components/ui/color-picker";
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
  type EdgeLabelStyle,
  type EdgeLineStyle,
  type EdgeMarkerSize,
  type EdgeMarkerType,
  useGraphStore,
} from "../../store/graphStore";

const defaultLabelStyle: EdgeLabelStyle = {
  backgroundColor: "#ffffff",
  textColor: "#475569",
  borderColor: "#e2e8f0",
  showBorder: true,
};

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
      <svg
        className="h-4 w-4"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <line x1="2" y1="8" x2="14" y2="8" />
      </svg>
    ),
  },
  {
    value: "dashed",
    label: "Dashed",
    icon: (
      <svg
        className="h-4 w-4"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeDasharray="3 2"
      >
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
      <svg
        className="h-4 w-4"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <path d="M3 8h10M10 4l4 4-4 4" />
      </svg>
    ),
  },
  {
    value: "arrowclosed",
    label: "Filled Arrow",
    icon: (
      <svg
        className="h-4 w-4"
        viewBox="0 0 16 16"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1"
      >
        <path d="M3 8h7" fill="none" />
        <path d="M10 4l4 4-4 4z" />
      </svg>
    ),
  },
  {
    value: "circle",
    label: "Circle",
    icon: (
      <svg
        className="h-4 w-4"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      >
        <line x1="2" y1="8" x2="9" y2="8" />
        <circle cx="12" cy="8" r="3" fill="currentColor" />
      </svg>
    ),
  },
  {
    value: "diamond",
    label: "Diamond",
    icon: (
      <svg
        className="h-4 w-4"
        viewBox="0 0 16 16"
        fill="currentColor"
        stroke="currentColor"
        strokeWidth="1"
      >
        <line x1="2" y1="8" x2="8" y2="8" fill="none" />
        <path d="M12 5l3 3-3 3-3-3z" />
      </svg>
    ),
  },
  {
    value: "none",
    label: "None",
    icon: (
      <svg
        className="h-4 w-4"
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
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

export default function RelationshipInspector() {
  const { edges, selectedEdgeId, updateEdgeLabel, updateEdgeStyle } = useGraphStore();

  const selectedEdge = edges.find((edge) => edge.id === selectedEdgeId);
  const hasLabel = (selectedEdge?.label?.toString().trim() ?? "").length > 0;
  const labelStyle = selectedEdge?.data?.style?.labelStyle ?? defaultLabelStyle;

  if (!selectedEdge) {
    return (
      <div className="rounded-lg border border-border bg-background p-4 text-sm text-muted-foreground">
        Select a relationship to edit its label, type, and direction.
      </div>
    );
  }

  return (
    <TooltipProvider delayDuration={300}>
      <div className="rounded-lg border border-border bg-background shadow-sm">
        <h2 className="px-3 pt-3 text-sm font-semibold text-foreground">Path Style</h2>

        {/* Label Input */}
        <div className="flex items-center justify-between gap-4 px-3 py-3">
          <label className="text-xs font-semibold uppercase text-muted-foreground">Label</label>
          <div className="relative flex-1">
            <Input
              className="pr-8"
              value={selectedEdge.label?.toString() ?? ""}
              onChange={(event) => updateEdgeLabel(selectedEdge.id, event.target.value)}
              placeholder="relationship"
            />
            {hasLabel ? (
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground transition hover:text-foreground"
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

        <Accordion type="single" collapsible defaultValue="line-style" className="w-full">
          {/* Line Style Section */}
          <AccordionItem value="line-style" className="border-b-0 border-t border-border">
            <AccordionTrigger className="px-3 py-2 text-xs font-medium text-muted-foreground hover:no-underline hover:bg-secondary">
              Line Style
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3 pt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <label className="text-xs text-muted-foreground">Color</label>
                  <ColorPicker
                    value={selectedEdge.data?.style?.color ?? "#94A3B8"}
                    onChange={(color) => updateEdgeStyle(selectedEdge.id, { color })}
                    showAlpha={false}
                  >
                    <button
                      type="button"
                      className="flex h-7 w-24 cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-2"
                    >
                      <ColorSwatch
                        color={selectedEdge.data?.style?.color ?? "#94A3B8"}
                        className="h-4 w-4"
                      />
                      <span className="text-[10px] text-muted-foreground">Color</span>
                    </button>
                  </ColorPicker>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <label className="text-xs text-muted-foreground">Thickness</label>
                  <ToggleGroup
                    type="single"
                    className="h-7 rounded-md border border-border bg-background"
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
                            className="h-full w-8 rounded-none border-r border-border text-muted-foreground last:border-r-0 first:rounded-l-[5px] last:rounded-r-[5px] hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground data-[state=on]:hover:bg-muted data-[state=on]:hover:text-foreground"
                            variant="ghost"
                          >
                            <svg className="h-4 w-4" viewBox="0 0 16 16" fill="currentColor">
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
                  <label className="text-xs text-muted-foreground">Style</label>
                  <ToggleGroup
                    type="single"
                    className="h-7 rounded-md border border-border bg-background"
                    value={selectedEdge.data?.style?.lineStyle ?? "solid"}
                    onValueChange={(value) => {
                      if (!value) {
                        return;
                      }
                      updateEdgeStyle(selectedEdge.id, {
                        lineStyle: value as EdgeLineStyle,
                      });
                    }}
                    aria-label="Line style"
                  >
                    {lineStyles.map((style) => (
                      <Tooltip key={style.value}>
                        <TooltipTrigger asChild>
                          <ToggleGroupItem
                            value={style.value}
                            className="h-full w-8 rounded-none border-r border-border text-muted-foreground last:border-r-0 first:rounded-l-[5px] last:rounded-r-[5px] hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground data-[state=on]:hover:bg-muted data-[state=on]:hover:text-foreground"
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
                  <label className="text-xs text-muted-foreground">Curvature</label>
                  <ToggleGroup
                    type="single"
                    className="h-7 rounded-md border border-border bg-background"
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
                            className="h-full w-8 rounded-none border-r border-border text-muted-foreground last:border-r-0 first:rounded-l-[5px] last:rounded-r-[5px] hover:bg-secondary hover:text-foreground data-[state=on]:bg-muted data-[state=on]:text-foreground data-[state=on]:hover:bg-muted data-[state=on]:hover:text-foreground"
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
            </AccordionContent>
          </AccordionItem>

          {/* Arrow Section */}
          <AccordionItem value="arrow" className="border-b-0 border-t border-border">
            <AccordionTrigger className="px-3 py-2 text-xs font-medium text-muted-foreground hover:no-underline hover:bg-secondary">
              Arrow
            </AccordionTrigger>
            <AccordionContent className="px-3 pb-3 pt-0">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <label className="text-xs text-muted-foreground">End Type</label>
                  <ToggleGroup
                    type="single"
                    className="h-7 rounded-md border border-border bg-background"
                    value={selectedEdge.data?.style?.markerEnd ?? "arrow"}
                    onValueChange={(value) => {
                      if (!value) {
                        return;
                      }
                      updateEdgeStyle(selectedEdge.id, {
                        markerEnd: value as EdgeMarkerType,
                      });
                    }}
                    aria-label="End marker type"
                  >
                    {markerTypes.map((marker) => (
                      <Tooltip key={marker.value}>
                        <TooltipTrigger asChild>
                          <ToggleGroupItem
                            value={marker.value}
                            className="h-full w-8 rounded-none border-r border-border text-muted-foreground last:border-r-0 first:rounded-l-[5px] last:rounded-r-[5px] hover:bg-secondary hover:text-foreground"
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
                  <label className="text-xs text-muted-foreground">Start Type</label>
                  <ToggleGroup
                    type="single"
                    className="h-7 rounded-md border border-border bg-background"
                    value={selectedEdge.data?.style?.markerStart ?? "none"}
                    onValueChange={(value) => {
                      if (!value) {
                        return;
                      }
                      updateEdgeStyle(selectedEdge.id, {
                        markerStart: value as EdgeMarkerType,
                      });
                    }}
                    aria-label="Start marker type"
                  >
                    {markerTypes.map((marker) => (
                      <Tooltip key={marker.value}>
                        <TooltipTrigger asChild>
                          <ToggleGroupItem
                            value={marker.value}
                            className="h-full w-8 rounded-none border-r border-border text-muted-foreground last:border-r-0 first:rounded-l-[5px] last:rounded-r-[5px] hover:bg-secondary hover:text-foreground"
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
                  <label className="text-xs text-muted-foreground">Size</label>
                  <ToggleGroup
                    type="single"
                    className="h-7 rounded-md border border-border bg-background"
                    value={selectedEdge.data?.style?.markerSize ?? "md"}
                    onValueChange={(value) => {
                      if (!value) {
                        return;
                      }
                      updateEdgeStyle(selectedEdge.id, {
                        markerSize: value as EdgeMarkerSize,
                      });
                    }}
                    aria-label="Marker size"
                  >
                    {markerSizes.map((size) => (
                      <Tooltip key={size.value}>
                        <TooltipTrigger asChild>
                          <ToggleGroupItem
                            value={size.value}
                            className="h-full w-10 rounded-none border-r border-border text-xs text-muted-foreground last:border-r-0 first:rounded-l-[5px] last:rounded-r-[5px] hover:bg-secondary hover:text-foreground"
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
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Label Style Section */}
          {hasLabel ? (
            <AccordionItem value="label-style" className="border-b-0 border-t border-border">
              <AccordionTrigger className="px-3 py-2 text-xs font-medium text-muted-foreground hover:no-underline hover:bg-secondary">
                Label Style
              </AccordionTrigger>
              <AccordionContent className="px-3 pb-3 pt-0">
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <label className="text-xs text-muted-foreground">Background</label>
                    <ColorPicker
                      value={labelStyle.backgroundColor}
                      onChange={(color) =>
                        updateEdgeStyle(selectedEdge.id, {
                          labelStyle: { ...labelStyle, backgroundColor: color },
                        })
                      }
                      showAlpha={false}
                    >
                      <button
                        type="button"
                        className="flex h-7 w-24 cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-2"
                      >
                        <ColorSwatch color={labelStyle.backgroundColor} className="h-4 w-4" />
                        <span className="text-[10px] text-muted-foreground">Color</span>
                      </button>
                    </ColorPicker>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <label className="text-xs text-muted-foreground">Text Color</label>
                    <ColorPicker
                      value={labelStyle.textColor}
                      onChange={(color) =>
                        updateEdgeStyle(selectedEdge.id, {
                          labelStyle: { ...labelStyle, textColor: color },
                        })
                      }
                      showAlpha={false}
                    >
                      <button
                        type="button"
                        className="flex h-7 w-24 cursor-pointer items-center gap-2 rounded-md border border-border bg-background px-2"
                      >
                        <ColorSwatch color={labelStyle.textColor} className="h-4 w-4" />
                        <span className="text-[10px] text-muted-foreground">Color</span>
                      </button>
                    </ColorPicker>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <label className="text-xs text-muted-foreground">Border</label>
                    <div className="flex items-center gap-2">
                      <ColorPicker
                        value={labelStyle.borderColor}
                        onChange={(color) =>
                          updateEdgeStyle(selectedEdge.id, {
                            labelStyle: { ...labelStyle, borderColor: color },
                          })
                        }
                        showAlpha={false}
                      >
                        <button
                          type="button"
                          className={`flex h-7 w-16 cursor-pointer items-center gap-1.5 rounded-md border border-border bg-background px-2 ${!labelStyle.showBorder ? "opacity-50" : ""}`}
                          disabled={!labelStyle.showBorder}
                        >
                          <ColorSwatch color={labelStyle.borderColor} className="h-4 w-4" />
                        </button>
                      </ColorPicker>
                      <button
                        className={`rounded border px-2 py-1 text-xs transition ${
                          labelStyle.showBorder
                            ? "border-muted bg-muted text-foreground"
                            : "border-border bg-background text-muted-foreground"
                        }`}
                        type="button"
                        onClick={() =>
                          updateEdgeStyle(selectedEdge.id, {
                            labelStyle: { ...labelStyle, showBorder: !labelStyle.showBorder },
                          })
                        }
                      >
                        {labelStyle.showBorder ? "On" : "Off"}
                      </button>
                    </div>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          ) : null}
        </Accordion>
      </div>
    </TooltipProvider>
  );
}
