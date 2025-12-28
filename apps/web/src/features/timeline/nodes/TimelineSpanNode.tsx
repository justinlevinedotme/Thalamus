import { memo, useMemo } from "react";
import { Handle, Position, type Node, type NodeProps } from "@xyflow/react";
import type { TimelineSpanData } from "../types";

type TimelineSpanNodeType = Node<TimelineSpanData, "timelineSpan">;

// Timeline span node - duration bar from start to end position
export const TimelineSpanNode = memo(function TimelineSpanNode({
  data,
  selected,
}: NodeProps<TimelineSpanNodeType>) {
  // Calculate width based on start/end positions
  // Using 1000px as the reference canvas width
  const width = useMemo(() => {
    const duration = data.endPosition - data.startPosition;
    return Math.max(80, duration * 1000);
  }, [data.startPosition, data.endPosition]);

  return (
    <div
      className={`
        relative h-12 rounded-md border-2 bg-background shadow-sm
        transition-all duration-150
        ${selected ? "border-primary ring-2 ring-primary/20" : "border-border"}
      `}
      style={{
        width,
        backgroundColor: data.color ?? "rgba(59, 130, 246, 0.1)",
        borderColor: data.color ?? undefined,
      }}
    >
      {/* Source handle (right edge) */}
      <Handle
        type="source"
        position={Position.Right}
        className="!w-2 !h-2 !bg-primary !border-background"
      />

      {/* Target handle (left edge) */}
      <Handle
        type="target"
        position={Position.Left}
        className="!w-2 !h-2 !bg-primary !border-background"
      />

      {/* Left resize handle indicator */}
      <div className="absolute left-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-primary/50 rounded-l" />

      {/* Right resize handle indicator */}
      <div className="absolute right-0 top-0 bottom-0 w-1 cursor-ew-resize hover:bg-primary/50 rounded-r" />

      {/* Content */}
      <div className="h-full flex items-center px-3">
        {/* Icon if present */}
        {data.icon && (
          <div className="text-lg mr-2">{data.icon.type === "emoji" && data.icon.value}</div>
        )}

        {/* Label */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-foreground truncate">{data.label}</div>
          {data.description && (
            <div className="text-xs text-muted-foreground truncate">{data.description}</div>
          )}
        </div>
      </div>
    </div>
  );
});
