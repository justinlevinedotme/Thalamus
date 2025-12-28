import { memo } from "react";
import { type Node, type NodeProps } from "@xyflow/react";
import type { TimelineEventData } from "../types";

type TimelineEventNodeType = Node<TimelineEventData, "timelineEvent">;

// Marker sits on the timeline, content card floats above
const MARKER_SIZE = 12;
const STEM_HEIGHT = 8;

// Timeline event node - marker on timeline with content card above
export const TimelineEventNode = memo(function TimelineEventNode({
  data,
  selected,
}: NodeProps<TimelineEventNodeType>) {
  const markerColor = selected ? "hsl(var(--primary))" : (data.color ?? "hsl(var(--primary))");

  return (
    <div className="relative flex flex-col items-center">
      {/* Content card above the marker */}
      <div
        className={`
          px-3 py-2 rounded-lg border bg-background shadow-md
          transition-all duration-150 max-w-[140px]
          ${selected ? "border-primary ring-2 ring-primary/20 shadow-lg" : "border-border"}
        `}
      >
        {/* Icon if present */}
        {data.icon && (
          <div className="text-base mb-1 text-center">
            {data.icon.type === "emoji" && data.icon.value}
          </div>
        )}

        {/* Label */}
        <div className="text-sm font-medium text-foreground text-center truncate">{data.label}</div>

        {/* Description preview */}
        {data.description && (
          <div className="text-xs text-muted-foreground text-center truncate mt-0.5">
            {data.description}
          </div>
        )}
      </div>

      {/* Stem connecting card to marker */}
      <div
        className="transition-colors duration-150"
        style={{
          width: 2,
          height: STEM_HEIGHT,
          backgroundColor: markerColor,
        }}
      />

      {/* Marker dot on the timeline */}
      <div
        className={`
          rounded-full border-2 transition-all duration-150
          ${selected ? "border-primary bg-primary" : "border-primary bg-background"}
        `}
        style={{
          width: MARKER_SIZE,
          height: MARKER_SIZE,
          borderColor: markerColor,
          backgroundColor: selected ? markerColor : undefined,
        }}
      />
    </div>
  );
});
