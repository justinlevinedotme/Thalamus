import { memo } from "react";
import { type Node, type NodeProps } from "@xyflow/react";
import type { TimelineEventData } from "../types";

type TimelineEventNodeType = Node<TimelineEventData, "timelineEvent">;

// Height of event card + stem to reach axis
const STEM_HEIGHT = 40;

// Timeline event node - point-in-time marker with stem connecting to axis
export const TimelineEventNode = memo(function TimelineEventNode({
  data,
  selected,
}: NodeProps<TimelineEventNodeType>) {
  const borderColor = selected ? "hsl(var(--primary))" : (data.color ?? "hsl(var(--border))");

  return (
    <div className="relative flex flex-col items-center">
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

      {/* Stem/connector line to axis */}
      <div
        className="w-0.5 transition-colors duration-150"
        style={{
          height: STEM_HEIGHT,
          backgroundColor: borderColor,
        }}
      />

      {/* Dot at the bottom of stem */}
      <div
        className="w-2 h-2 rounded-full transition-colors duration-150"
        style={{
          backgroundColor: borderColor,
        }}
      />
    </div>
  );
});
