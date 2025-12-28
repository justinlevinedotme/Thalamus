import { useMemo } from "react";
import { Panel, useViewport } from "@xyflow/react";
import type { TimelineTrack } from "../types";

interface TrackLanesProps {
  tracks: TimelineTrack[];
  trackHeight: number;
  canvasWidth?: number;
}

// Default colors for tracks without custom colors
const DEFAULT_TRACK_COLORS = [
  "rgba(59, 130, 246, 0.1)", // blue
  "rgba(34, 197, 94, 0.1)", // green
  "rgba(168, 85, 247, 0.1)", // purple
  "rgba(249, 115, 22, 0.1)", // orange
  "rgba(236, 72, 153, 0.1)", // pink
  "rgba(20, 184, 166, 0.1)", // teal
];

export function TrackLanes({ tracks, trackHeight, canvasWidth = 2000 }: TrackLanesProps) {
  const { x, y, zoom } = useViewport();

  // Calculate lane positions
  const lanes = useMemo(() => {
    return tracks.map((track, index) => ({
      track,
      index,
      yPosition: 100 + index * trackHeight,
      height: track.height ?? trackHeight,
      backgroundColor: track.color ?? DEFAULT_TRACK_COLORS[index % DEFAULT_TRACK_COLORS.length],
    }));
  }, [tracks, trackHeight]);

  if (tracks.length === 0) {
    return null;
  }

  return (
    <Panel position="top-left" className="!pointer-events-none !m-0 !p-0">
      <div
        className="pointer-events-none absolute left-0 top-0 origin-top-left"
        style={{
          transform: `translate(${x}px, ${y}px) scale(${zoom})`,
        }}
      >
        {lanes.map((lane) => (
          <div key={lane.track.id}>
            {/* Lane background */}
            <div
              className="absolute"
              style={{
                left: -100, // Extend left for label area
                top: lane.yPosition,
                width: canvasWidth + 200,
                height: lane.height,
                backgroundColor: lane.backgroundColor,
              }}
            />

            {/* Horizontal timeline line through center of track */}
            <div
              className="absolute bg-border"
              style={{
                left: 0,
                top: lane.yPosition + lane.height - 16, // Position near bottom where markers sit
                width: canvasWidth,
                height: 2,
                borderRadius: 1,
              }}
            />

            {/* Lane divider line */}
            <div
              className="absolute bg-border/30"
              style={{
                left: -100,
                top: lane.yPosition + lane.height,
                width: canvasWidth + 200,
                height: 1,
              }}
            />

            {/* Track label */}
            <div
              className="absolute flex items-center gap-2 text-sm font-medium"
              style={{
                left: -90,
                top: lane.yPosition,
                height: lane.height,
              }}
            >
              {/* Color indicator dot */}
              <div
                className="w-2 h-2 rounded-full"
                style={{
                  backgroundColor: lane.track.color ?? "#64748b",
                }}
              />
              <span className="text-muted-foreground truncate max-w-[60px]">
                {lane.track.label}
              </span>
            </div>
          </div>
        ))}

        {/* Empty state for no tracks */}
        {tracks.length === 0 && (
          <div
            className="absolute text-sm text-muted-foreground"
            style={{
              left: canvasWidth / 2 - 100,
              top: 200,
            }}
          >
            Add tracks to start placing events
          </div>
        )}
      </div>
    </Panel>
  );
}
