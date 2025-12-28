import { memo } from "react";
import { type Node, type NodeProps } from "@xyflow/react";
import type { TimelineEventData } from "../types";

type TimelineEventNodeType = Node<TimelineEventData, "timelineEvent">;

// Timeline event node - point-in-time marker
export const TimelineEventNode = memo(function TimelineEventNode({
  data,
  selected,
}: NodeProps<TimelineEventNodeType>) {
  return (
    <div
      className={`
        px-3 py-2 rounded-lg border-2 bg-background shadow-sm
        transition-all duration-150
        ${selected ? "border-primary ring-2 ring-primary/20" : "border-border"}
      `}
      style={{
        backgroundColor: data.color ?? undefined,
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
  );
});
