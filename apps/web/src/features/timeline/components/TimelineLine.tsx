import { Panel, useViewport } from "@xyflow/react";

interface TimelineLineProps {
  canvasWidth?: number;
  yPosition?: number;
}

// Central horizontal timeline with arrow
export function TimelineLine({ canvasWidth = 1000, yPosition = 200 }: TimelineLineProps) {
  const { x, y, zoom } = useViewport();

  return (
    <Panel position="top-left" className="!pointer-events-none !m-0 !p-0">
      <div
        className="pointer-events-none absolute left-0 top-0 origin-top-left"
        style={{
          transform: `translate(${x}px, ${y}px) scale(${zoom})`,
        }}
      >
        {/* Main horizontal line */}
        <div
          className="absolute bg-foreground"
          style={{
            left: 0,
            top: yPosition,
            width: canvasWidth,
            height: 2,
          }}
        />

        {/* Arrow at end */}
        <div
          className="absolute"
          style={{
            left: canvasWidth - 8,
            top: yPosition - 6,
          }}
        >
          <svg width="16" height="14" viewBox="0 0 16 14" fill="none">
            <path
              d="M0 7H14M14 7L8 1M14 7L8 13"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="text-foreground"
            />
          </svg>
        </div>
      </div>
    </Panel>
  );
}
