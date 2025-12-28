import { memo } from "react";
import { type Node, type NodeProps } from "@xyflow/react";
import type { TimelineEventData } from "../types";

type TimelineEventNodeType = Node<TimelineEventData, "timelineEvent">;

// Track height matches TRACK_HEIGHT in TimelineCanvas
const TRACK_HEIGHT = 80;
// Card is positioned in upper portion of track, stem extends to bottom
const CARD_TOP_MARGIN = 8;

// Timeline event node - point-in-time marker with stem connecting to track timeline
export const TimelineEventNode = memo(function TimelineEventNode({
  data,
  selected,
}: NodeProps<TimelineEventNodeType>) {
  const stemColor = selected ? "hsl(var(--primary))" : (data.color ?? "hsl(var(--border))");

  return (
    <div
      className="relative flex flex-col items-center"
      style={{ height: TRACK_HEIGHT - CARD_TOP_MARGIN }}
    >
      {/* Event card at top */}
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

      {/* Stem going DOWN to track timeline */}
      <div
        className="flex-1 w-0.5 transition-colors duration-150"
        style={{
          backgroundColor: stemColor,
          minHeight: 8,
        }}
      />

      {/* Dot at bottom of stem (on the track timeline) */}
      <div
        className="w-2.5 h-2.5 rounded-full transition-colors duration-150 flex-shrink-0"
        style={{
          backgroundColor: stemColor,
        }}
      />
    </div>
  );
});
