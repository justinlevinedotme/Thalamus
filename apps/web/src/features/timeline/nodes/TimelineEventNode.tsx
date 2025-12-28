import { memo } from "react";
import { type Node, type NodeProps } from "@xyflow/react";
import type { TimelineEventData } from "../types";

type TimelineEventNodeType = Node<TimelineEventData, "timelineEvent">;

// Distance from track position up to the axis line
// Axis is at Y=80, tracks start at Y=100, so we need to go UP 20px from track position
// But the node is placed at track Y, so stem goes UP (negative direction)
const STEM_HEIGHT = 20;

// Timeline event node - point-in-time marker with stem connecting to axis
export const TimelineEventNode = memo(function TimelineEventNode({
  data,
  selected,
}: NodeProps<TimelineEventNodeType>) {
  const stemColor = selected ? "hsl(var(--primary))" : (data.color ?? "hsl(var(--border))");

  return (
    <div className="relative flex flex-col items-center">
      {/* Stem going UP to axis - positioned above the card */}
      <div
        className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center"
        style={{
          bottom: "100%",
        }}
      >
        {/* Dot at top of stem (on the axis) */}
        <div
          className="w-2.5 h-2.5 rounded-full transition-colors duration-150"
          style={{
            backgroundColor: stemColor,
          }}
        />
        {/* Vertical stem line */}
        <div
          className="w-0.5 transition-colors duration-150"
          style={{
            height: STEM_HEIGHT,
            backgroundColor: stemColor,
          }}
        />
      </div>

      {/* Event card */}
      <div
        className={`
          px-3 py-2 rounded-lg border-2 bg-background shadow-sm
          transition-all duration-150
          ${selected ? "border-primary ring-2 ring-primary/20" : "border-border"}
        `}
        style={{
          backgroundColor: data.color ?? undefined,
          borderColor: data.color ?? undefined,
          minWidth: 80,
        }}
      >
        {/* Icon if present */}
        {data.icon && (
          <div className="text-lg mb-1">{data.icon.type === "emoji" && data.icon.value}</div>
        )}

        {/* Label */}
        <div className="text-sm font-medium text-foreground truncate">{data.label}</div>

        {/* Description preview */}
        {data.description && (
          <div className="text-xs text-muted-foreground truncate mt-0.5">{data.description}</div>
        )}
      </div>
    </div>
  );
});
