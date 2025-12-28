import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { type Node, type NodeProps, useReactFlow } from "@xyflow/react";
import type { TimelineSpanData } from "../types";
import { useTimelineStore } from "../timelineStore";

type TimelineSpanNodeType = Node<TimelineSpanData, "timelineSpan">;

const CANVAS_WIDTH = 1000;
const MIN_SPAN_WIDTH = 40;
const MARKER_SIZE = 10;
const BAR_HEIGHT = 2;

// Timeline span node - two lollipop markers connected by a bar
export const TimelineSpanNode = memo(function TimelineSpanNode({
  id,
  data,
  selected,
  positionAbsoluteY,
}: NodeProps<TimelineSpanNodeType>) {
  const { updateNodeData, pushHistory, onNodesChange } = useTimelineStore();
  const { screenToFlowPosition } = useReactFlow();

  const [resizing, setResizing] = useState<"left" | "right" | null>(null);
  const startDataRef = useRef<{
    startPosition: number;
    endPosition: number;
    startX: number;
  } | null>(null);

  const markerColor = data.color ?? (selected ? "hsl(var(--primary))" : "hsl(var(--foreground))");

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
        const minStart = 0;
        const maxStart = startDataRef.current.endPosition - MIN_SPAN_WIDTH / CANVAS_WIDTH;
        const clampedStart = Math.max(minStart, Math.min(maxStart, newAxisPosition));

        updateNodeData(id, { startPosition: clampedStart });

        const newX = clampedStart * CANVAS_WIDTH;
        onNodesChange([
          {
            type: "position",
            id,
            position: { x: newX, y: positionAbsoluteY },
          },
        ]);
      } else {
        const minEnd = startDataRef.current.startPosition + MIN_SPAN_WIDTH / CANVAS_WIDTH;
        const maxEnd = 1;
        const clampedEnd = Math.max(minEnd, Math.min(maxEnd, newAxisPosition));

        updateNodeData(id, { endPosition: clampedEnd });
      }
    },
    [resizing, id, updateNodeData, screenToFlowPosition, onNodesChange, positionAbsoluteY]
  );

  const handleMouseUp = useCallback(() => {
    setResizing(null);
    startDataRef.current = null;
  }, []);

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

  const handleLeftMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
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

  const handleRightMouseDown = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
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
    <div className="relative flex items-center" style={{ width, height: MARKER_SIZE }}>
      {/* Left lollipop marker */}
      <div
        className={`
          nodrag nopan
          absolute left-0 rounded-full cursor-ew-resize z-10
          transition-all duration-150
          ${selected ? "ring-2 ring-primary/20" : ""}
          ${resizing === "left" ? "scale-125" : "hover:scale-110"}
        `}
        style={{
          width: MARKER_SIZE,
          height: MARKER_SIZE,
          backgroundColor: markerColor,
          transform: `translateX(-${MARKER_SIZE / 2}px)`,
        }}
        onMouseDown={handleLeftMouseDown}
      />

      {/* Connecting bar */}
      <div
        className="absolute left-0 right-0 transition-colors duration-150"
        style={{
          height: BAR_HEIGHT,
          backgroundColor: markerColor,
          top: (MARKER_SIZE - BAR_HEIGHT) / 2,
        }}
      />

      {/* Right lollipop marker */}
      <div
        className={`
          nodrag nopan
          absolute right-0 rounded-full cursor-ew-resize z-10
          transition-all duration-150
          ${selected ? "ring-2 ring-primary/20" : ""}
          ${resizing === "right" ? "scale-125" : "hover:scale-110"}
        `}
        style={{
          width: MARKER_SIZE,
          height: MARKER_SIZE,
          backgroundColor: markerColor,
          transform: `translateX(${MARKER_SIZE / 2}px)`,
        }}
        onMouseDown={handleRightMouseDown}
      />

      {/* Label (centered above the bar) */}
      {data.label && (
        <div
          className="absolute left-1/2 -translate-x-1/2 whitespace-nowrap pointer-events-none"
          style={{ bottom: MARKER_SIZE + 4 }}
        >
          <div
            className={`
              px-2 py-1 rounded border border-dashed bg-background text-xs font-medium
              ${selected ? "border-primary" : "border-border"}
            `}
            style={{
              borderColor: data.color ? markerColor : undefined,
              borderStyle: data.color ? "solid" : "dashed",
            }}
          >
            {data.label}
          </div>
        </div>
      )}

      {/* Start date label */}
      {data.rawStartValue && (
        <div
          className="absolute text-xs font-medium whitespace-nowrap pointer-events-none"
          style={{
            left: 0,
            top: MARKER_SIZE + 4,
            transform: `translateX(-${MARKER_SIZE / 2}px)`,
            color: markerColor,
          }}
        >
          {String(data.rawStartValue)}
        </div>
      )}

      {/* End date label */}
      {data.rawEndValue && (
        <div
          className="absolute text-xs font-medium whitespace-nowrap pointer-events-none"
          style={{
            right: 0,
            top: MARKER_SIZE + 4,
            transform: `translateX(${MARKER_SIZE / 2}px)`,
            color: markerColor,
          }}
        >
          {String(data.rawEndValue)}
        </div>
      )}
    </div>
  );
});
