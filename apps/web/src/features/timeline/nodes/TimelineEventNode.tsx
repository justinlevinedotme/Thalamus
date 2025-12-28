import { memo } from "react";
import { type Node, type NodeProps } from "@xyflow/react";
import type { TimelineEventData } from "../types";

type TimelineEventNodeType = Node<TimelineEventData, "timelineEvent">;

const MARKER_SIZE = 10;
const STEM_HEIGHT = 40;
const TICK_HEIGHT = 8;

// Timeline event node - marker on timeline with card above or below
export const TimelineEventNode = memo(function TimelineEventNode({
  data,
  selected,
}: NodeProps<TimelineEventNodeType>) {
  const isAbove = data.position !== "below";
  const markerColor = data.color ?? (selected ? "hsl(var(--primary))" : "hsl(var(--foreground))");
  const isHighlighted = !!data.color;

  // Content card component (reused for above/below)
  const Card = (
    <div
      className={`
        px-3 py-2 rounded border border-dashed bg-background
        transition-all duration-150 min-w-[80px]
        ${selected ? "border-primary ring-2 ring-primary/20" : "border-border"}
        ${isHighlighted ? "border-solid" : ""}
      `}
      style={{
        borderColor: isHighlighted ? markerColor : undefined,
      }}
    >
      {data.icon && (
        <div className="text-sm mb-1 text-center">
          {data.icon.type === "emoji" && data.icon.value}
        </div>
      )}
      <div className="text-xs font-medium text-foreground text-center">{data.label}</div>
      {data.description && (
        <div className="text-xs text-muted-foreground text-center truncate mt-0.5">
          {data.description}
        </div>
      )}
    </div>
  );

  // Stem component
  const Stem = (
    <div
      className="transition-colors duration-150"
      style={{
        width: 2,
        height: STEM_HEIGHT,
        backgroundColor: markerColor,
      }}
    />
  );

  // Marker component (dot on the line)
  const Marker = (
    <div
      className="rounded-full transition-all duration-150 flex-shrink-0"
      style={{
        width: MARKER_SIZE,
        height: MARKER_SIZE,
        backgroundColor: markerColor,
      }}
    />
  );

  // Tick mark component (vertical line extending from marker)
  const Tick = (
    <div
      className="transition-colors duration-150"
      style={{
        width: 2,
        height: TICK_HEIGHT,
        backgroundColor: markerColor,
      }}
    />
  );

  // Date label component
  const DateLabel = data.dateLabel ? (
    <div
      className="text-xs font-medium text-foreground whitespace-nowrap"
      style={{ color: isHighlighted ? markerColor : undefined }}
    >
      {data.dateLabel}
    </div>
  ) : null;

  if (isAbove) {
    // Card above timeline: Card -> Stem -> Marker -> Tick -> DateLabel
    return (
      <div className="relative flex flex-col items-center">
        {Card}
        {Stem}
        {Marker}
        {DateLabel && (
          <>
            {Tick}
            <div className="mt-0.5">{DateLabel}</div>
          </>
        )}
      </div>
    );
  } else {
    // Card below timeline: DateLabel -> Tick -> Marker -> Stem -> Card
    return (
      <div className="relative flex flex-col items-center">
        {DateLabel && (
          <>
            <div className="mb-0.5">{DateLabel}</div>
            {Tick}
          </>
        )}
        {Marker}
        {Stem}
        {Card}
      </div>
    );
  }
});
