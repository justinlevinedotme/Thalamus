import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type Node, type NodeProps, useReactFlow } from "@xyflow/react";
import type { TimelineSpanData } from "../types";
import { useTimelineStore } from "../timelineStore";

type TimelineSpanNodeType = Node<TimelineSpanData, "timelineSpan">;

const CANVAS_WIDTH = 1000;
const MIN_SPAN_WIDTH = 40; // Minimum width in pixels

// Timeline span node - duration bar from start to end position
export const TimelineSpanNode = memo(function TimelineSpanNode({
  id,
  data,
  selected,
  positionAbsoluteX,
  positionAbsoluteY,
}: NodeProps<TimelineSpanNodeType>) {
  const { updateNodeData, pushHistory, onNodesChange } = useTimelineStore();
  const { screenToFlowPosition } = useReactFlow();

  // Track which edge is being dragged
  const [resizing, setResizing] = useState<"left" | "right" | null>(null);
  const startDataRef = useRef<{
    startPosition: number;
    endPosition: number;
    startX: number;
  } | null>(null);

  // Calculate width based on start/end positions
  const width = useMemo(() => {
    const duration = data.endPosition - data.startPosition;
    return Math.max(MIN_SPAN_WIDTH, duration * CANVAS_WIDTH);
  }, [data.startPosition, data.endPosition]);

  // Handle mouse move during resize
  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (!resizing || !startDataRef.current) return;

      const flowPos = screenToFlowPosition({ x: e.clientX, y: e.clientY });
      const newAxisPosition = Math.max(0, Math.min(1, flowPos.x / CANVAS_WIDTH));

      if (resizing === "left") {
        // Resize from left - update startPosition and move node position
        const minStart = 0;
        const maxStart = startDataRef.current.endPosition - MIN_SPAN_WIDTH / CANVAS_WIDTH;
        const clampedStart = Math.max(minStart, Math.min(maxStart, newAxisPosition));

        // Update both the data and the node position
        updateNodeData(id, { startPosition: clampedStart });

        // Move the node's X position to match the new start
        const newX = clampedStart * CANVAS_WIDTH;
        onNodesChange([
          {
            type: "position",
            id,
            position: { x: newX, y: positionAbsoluteY },
          },
        ]);
      } else {
        // Resize from right - update endPosition, keep startPosition fixed
        const minEnd = startDataRef.current.startPosition + MIN_SPAN_WIDTH / CANVAS_WIDTH;
        const maxEnd = 1;
        const clampedEnd = Math.max(minEnd, Math.min(maxEnd, newAxisPosition));

        updateNodeData(id, { endPosition: clampedEnd });
      }
    },
    [resizing, id, updateNodeData, screenToFlowPosition, onNodesChange, positionAbsoluteY]
  );

  // Handle mouse up to end resize
  const handleMouseUp = useCallback(() => {
    setResizing(null);
    startDataRef.current = null;
  }, []);

  // Add/remove global event listeners during resize
  useEffect(() => {
    if (resizing) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => {
        window.removeEventListener("mousemove", handleMouseMove);
        window.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [resizing, handleMouseMove, handleMouseUp]);

  // Start resizing from left edge
  const handleLeftMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent node drag
      pushHistory();
      startDataRef.current = {
        startPosition: data.startPosition,
        endPosition: data.endPosition,
        startX: e.clientX,
      };
      setResizing("left");
    },
    [data.startPosition, data.endPosition, pushHistory]
  );

  // Start resizing from right edge
  const handleRightMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation(); // Prevent node drag
      pushHistory();
      startDataRef.current = {
        startPosition: data.startPosition,
        endPosition: data.endPosition,
        startX: e.clientX,
      };
      setResizing("right");
    },
    [data.startPosition, data.endPosition, pushHistory]
  );

  return (
    <div
      className={`
        relative h-12 rounded-md border-2 bg-background shadow-sm
        transition-colors duration-150
        ${selected ? "border-primary ring-2 ring-primary/20" : "border-border"}
        ${resizing ? "cursor-ew-resize" : ""}
      `}
      style={{
        width,
        backgroundColor: data.color ?? "rgba(59, 130, 246, 0.1)",
        borderColor: data.color ?? undefined,
      }}
    >
      {/* Left resize handle - nodrag class prevents React Flow from dragging */}
      <div
        className={`
          nodrag nopan
          absolute left-0 top-0 bottom-0 w-3 cursor-ew-resize z-10
          hover:bg-primary/30 active:bg-primary/50
          ${resizing === "left" ? "bg-primary/50" : ""}
        `}
        onMouseDown={handleLeftMouseDown}
      />

      {/* Right resize handle - nodrag class prevents React Flow from dragging */}
      <div
        className={`
          nodrag nopan
          absolute right-0 top-0 bottom-0 w-3 cursor-ew-resize z-10
          hover:bg-primary/30 active:bg-primary/50
          ${resizing === "right" ? "bg-primary/50" : ""}
        `}
        onMouseDown={handleRightMouseDown}
      />

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
