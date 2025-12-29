/**
 * @file HelperLinesRenderer.tsx
 * @description React component that renders alignment helper lines on canvas during node dragging
 */

import { useReactFlow, useViewport } from "@xyflow/react";
import type { HelperLinesState } from "./types";
import { getLineExtent } from "./utils";

type HelperLinesRendererProps = {
  helperLines: HelperLinesState;
};

const LINE_COLOR = "#3B82F6"; // blue-500

export function HelperLinesRenderer({ helperLines }: HelperLinesRendererProps) {
  const { getNodes } = useReactFlow();
  const { x, y, zoom } = useViewport();

  if (!helperLines.horizontal && !helperLines.vertical) {
    return null;
  }

  const nodes = getNodes();

  // Find the dragged node
  const draggedNodes = nodes.filter((n) => n.selected || n.dragging);
  const draggedNode = draggedNodes[0];

  return (
    <svg
      className="react-flow__helper-lines pointer-events-none"
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 1000,
      }}
    >
      <g transform={`translate(${x}, ${y}) scale(${zoom})`}>
        {helperLines.horizontal &&
          draggedNode &&
          (() => {
            const line = helperLines.horizontal;
            const extent = getLineExtent(line, nodes, draggedNode);

            return (
              <line
                x1={extent.start}
                y1={line.position}
                x2={extent.end}
                y2={line.position}
                stroke={LINE_COLOR}
                strokeWidth={1 / zoom}
                strokeDasharray={`${4 / zoom} ${2 / zoom}`}
              />
            );
          })()}

        {helperLines.vertical &&
          draggedNode &&
          (() => {
            const line = helperLines.vertical;
            const extent = getLineExtent(line, nodes, draggedNode);

            return (
              <line
                x1={line.position}
                y1={extent.start}
                x2={line.position}
                y2={extent.end}
                stroke={LINE_COLOR}
                strokeWidth={1 / zoom}
                strokeDasharray={`${4 / zoom} ${2 / zoom}`}
              />
            );
          })()}
      </g>
    </svg>
  );
}
