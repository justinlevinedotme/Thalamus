import { useMemo } from "react";
import { Panel, useViewport } from "@xyflow/react";
import type { AxisConfig, TimelineTrack } from "../types";

interface AxisRendererProps {
  config: AxisConfig;
  tracks: TimelineTrack[];
  trackHeight: number;
  canvasWidth: number;
}

// Format axis value based on type
function formatAxisValue(config: AxisConfig, position: number, tickIndex: number): string {
  switch (config.type) {
    case "time": {
      if (!config.startDate || !config.endDate) return `T${tickIndex}`;
      const start = new Date(config.startDate).getTime();
      const end = new Date(config.endDate).getTime();
      const value = start + (end - start) * position;
      const date = new Date(value);

      // Format based on time unit
      switch (config.timeUnit) {
        case "year":
          return date.getFullYear().toString();
        case "month":
          return date.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
        case "day":
          return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
        case "hour":
          return date.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit" });
        default:
          return date.toLocaleDateString();
      }
    }

    case "number": {
      const start = config.startValue ?? 0;
      const end = config.endValue ?? 100;
      const value = start + (end - start) * position;
      const step = config.step ?? 1;
      return (Math.round(value / step) * step).toString();
    }

    case "milestone":
    case "custom": {
      if (config.labels && config.labels[tickIndex]) {
        return config.labels[tickIndex].label;
      }
      return `M${tickIndex + 1}`;
    }

    default:
      return `${Math.round(position * 100)}%`;
  }
}

export function AxisRenderer({ config, tracks, trackHeight, canvasWidth }: AxisRendererProps) {
  const { x, y, zoom } = useViewport();
  const tickCount = config.tickCount ?? 10;

  // Generate tick marks
  const ticks = useMemo(() => {
    const result = [];
    for (let i = 0; i <= tickCount; i++) {
      const position = i / tickCount;
      const xPos = position * canvasWidth;
      const label = formatAxisValue(config, position, i);
      result.push({ position, xPos, label, index: i });
    }
    return result;
  }, [config, tickCount, canvasWidth]);

  // Calculate total height for axis background
  const totalHeight = 100 + tracks.length * trackHeight + 50;

  return (
    <Panel position="top-left" className="!pointer-events-none !m-0 !p-0">
      <div
        className="pointer-events-none absolute left-0 top-0 origin-top-left"
        style={{
          transform: `translate(${x}px, ${y}px) scale(${zoom})`,
        }}
      >
        {/* Axis line at top */}
        <div
          className="absolute bg-border"
          style={{
            left: 0,
            top: 80,
            width: canvasWidth,
            height: 1,
          }}
        />

        {/* Tick marks and labels */}
        {ticks.map((tick) => (
          <div key={tick.index}>
            {/* Vertical tick mark */}
            <div
              className="absolute bg-border"
              style={{
                left: tick.xPos,
                top: 80,
                width: 1,
                height: 8,
              }}
            />

            {/* Tick label */}
            <span
              className="absolute text-xs text-muted-foreground whitespace-nowrap"
              style={{
                left: tick.xPos,
                top: 60,
                transform: "translateX(-50%)",
              }}
            >
              {tick.label}
            </span>

            {/* Grid line (optional) */}
            {config.showGrid && (
              <div
                className="absolute bg-border/30"
                style={{
                  left: tick.xPos,
                  top: 88,
                  width: 1,
                  height: totalHeight - 88,
                }}
              />
            )}
          </div>
        ))}

        {/* Axis type indicator */}
        <div
          className="absolute text-xs font-medium text-muted-foreground"
          style={{
            left: -50,
            top: 70,
          }}
        >
          {config.type === "time" && "📅"}
          {config.type === "number" && "#"}
          {config.type === "milestone" && "◆"}
          {config.type === "custom" && "⚙"}
        </div>
      </div>
    </Panel>
  );
}
